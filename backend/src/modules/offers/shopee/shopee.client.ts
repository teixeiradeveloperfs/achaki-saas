import { createHash } from 'node:crypto';
import { BadGatewayException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ENV } from '../../../config/config.module.js';
import type { Env } from '../../../config/env.js';
import { IntegrationSettingsService } from '../../integrations/integration-settings.service.js';
import type { OfferPage } from '../offer.js';
import { normalizeShopeeOffer } from './shopee.mapper.js';
import type { ShopeeResponse } from './shopee.types.js';

export type ShopeeSearch = {
  keyword?: string;
  page: number;
  limit: number;
  listType: 0 | 1 | 2;
  sortType: 1 | 2 | 3 | 4 | 5;
};

export type ShopeeCredentials = { appId: string; secret: string };

export function signShopeeRequest(appId: string, timestamp: number, payload: string, secret: string) {
  return createHash('sha256').update(`${appId}${timestamp}${payload}${secret}`, 'utf8').digest('hex');
}

function graphqlString(value: string) {
  return JSON.stringify(value);
}

@Injectable()
export class ShopeeAffiliateClient {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(IntegrationSettingsService) private readonly settings: IntegrationSettingsService,
  ) {}

  async isConfigured() {
    const status = await this.settings.shopeeStatus();
    return status.configured && status.enabled;
  }

  async search(input: ShopeeSearch, includeDisabled = false): Promise<OfferPage> {
    const credentials = await this.settings.shopeeCredentials(includeDisabled);
    if (!credentials) {
      throw new ServiceUnavailableException('A integração Shopee ainda não possui App ID e Secret.');
    }
    return this.searchWithCredentials(input, credentials);
  }

  async searchWithCredentials(input: ShopeeSearch, credentials: ShopeeCredentials): Promise<OfferPage> {
    const { appId, secret } = credentials;

    const keyword = input.keyword ? `keyword: ${graphqlString(input.keyword)},` : '';
    const query = `query AchakiProductOffers {
      productOfferV2(
        ${keyword}
        listType: ${input.listType},
        sortType: ${input.sortType},
        page: ${input.page},
        limit: ${input.limit}
      ) {
        nodes {
          itemId productName productLink offerLink imageUrl
          priceMin priceMax priceDiscountRate sales ratingStar
          commissionRate sellerCommissionRate shopeeCommissionRate commission
          shopId shopName shopType periodStartTime periodEndTime
        }
        pageInfo { page limit hasNextPage }
      }
    }`;
    const payload = JSON.stringify({ query });
    const timestamp = Math.floor(Date.now() / 1_000);
    const signature = signShopeeRequest(appId, timestamp, payload, secret);

    let response: Response;
    try {
      response = await fetch(this.env.SHOPEE_AFFILIATE_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
        },
        body: payload,
        signal: AbortSignal.timeout(this.env.SHOPEE_AFFILIATE_TIMEOUT_MS),
      });
    } catch (error) {
      const message = error instanceof Error && error.name === 'TimeoutError'
        ? 'A Shopee demorou demais para responder.'
        : 'Não foi possível acessar a API da Shopee.';
      throw new BadGatewayException(message);
    }

    if (!response.ok) throw new BadGatewayException(`A Shopee respondeu com HTTP ${response.status}.`);
    const result = (await response.json()) as ShopeeResponse;
    if (result.errors?.length) {
      const first = result.errors[0];
      const code = first.extensions?.code;
      const detail = first.extensions?.message ?? first.message ?? 'Erro desconhecido';
      throw new BadGatewayException(`Shopee Open API${code ? ` (${code})` : ''}: ${detail}`);
    }

    const page = result.data?.productOfferV2;
    if (!page) throw new BadGatewayException('A Shopee retornou uma resposta sem a lista de ofertas.');
    const fetchedAt = new Date();
    return {
      offers: (page.nodes ?? []).map((offer) => normalizeShopeeOffer(offer, fetchedAt)),
      page: page.pageInfo?.page ?? input.page,
      limit: page.pageInfo?.limit ?? input.limit,
      hasNextPage: page.pageInfo?.hasNextPage ?? false,
    };
  }

  async testConnection() {
    const page = await this.search({ page: 1, limit: 1, listType: 0, sortType: 1 }, true);
    return { ok: true, offersReturned: page.offers.length };
  }

  async testUserConnection(userId: string) {
    const credentials = await this.settings.userShopeeCredentials(userId, true);
    if (!credentials) throw new ServiceUnavailableException('Salve o App ID e o Secret da Shopee antes de testar.');
    const page = await this.searchWithCredentials({ page: 1, limit: 1, listType: 0, sortType: 1 }, credentials);
    return { ok: true, offersReturned: page.offers.length };
  }

  async searchForUser(userId: string, input: ShopeeSearch) {
    const credentials = await this.settings.userShopeeCredentials(userId);
    if (!credentials) {
      throw new ServiceUnavailableException('Configure e ative sua integração da Shopee antes de buscar ofertas.');
    }
    return this.searchWithCredentials(input, credentials);
  }
}
