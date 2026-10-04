import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { OfferPage } from './offer.js';
import { OffersRepository } from './offers.repository.js';
import type { OfferListQuery } from './offers.repository.js';
import { ShopeeAffiliateClient } from './shopee/shopee.client.js';
import type { ShopeeSearch } from './shopee/shopee.client.js';
import { RedisLockService } from '../../redis/redis-lock.service.js';

const MAX_MANUAL_SYNC_PAGES = 200;

export type FullSyncResult = {
  imported: number;
  newOffers: number;
  updatedOffers: number;
  pagesFetched: number;
  completed: boolean;
};

@Injectable()
export class OffersService {
  constructor(
    @Inject(ShopeeAffiliateClient) private readonly shopee: ShopeeAffiliateClient,
    @Inject(OffersRepository) private readonly repository: OffersRepository,
    @Inject(RedisLockService) private readonly locks: RedisLockService,
  ) {}

  async fetchDefaultShopee(input: ShopeeSearch): Promise<OfferPage & { changes: { created: number; updated: number } }> {
    const page = await this.shopee.search(input);
    const changes = await this.repository.save(page.offers);
    return { ...page, changes };
  }

  async fetchUserShopee(userId: string, input: ShopeeSearch): Promise<OfferPage & { changes: { created: number; updated: number } }> {
    const page = await this.shopee.searchForUser(userId, input);
    const changes = await this.repository.save(page.offers, userId);
    return { ...page, changes };
  }

  private async fullSync(
    key: string,
    input: ShopeeSearch,
    fetchPage: (page: number) => Promise<OfferPage>,
    ownerUserId: string | null,
  ): Promise<FullSyncResult> {
    const result = await this.locks.runExclusive(`offers:sync:${key}`, async () => {
      let currentPage = 1;
      let imported = 0;
      let newOffers = 0;
      let updatedOffers = 0;
      let pagesFetched = 0;
      let hasNextPage = true;
      const seen = new Set<string>();

      while (hasNextPage && pagesFetched < MAX_MANUAL_SYNC_PAGES) {
        const result = await fetchPage(currentPage);
        const changes = await this.repository.save(result.offers, ownerUserId);
        const unseen = result.offers.filter((offer) => !seen.has(`${offer.source}:${offer.externalId}`));
        result.offers.forEach((offer) => seen.add(`${offer.source}:${offer.externalId}`));

        imported += result.offers.length;
        newOffers += changes.created;
        updatedOffers += changes.updated;
        pagesFetched += 1;
        hasNextPage = result.hasNextPage && result.offers.length > 0 && unseen.length > 0;
        currentPage += 1;
      }

      return { imported, newOffers, updatedOffers, pagesFetched, completed: !hasNextPage };
    }, 120_000);
    if (!result) throw new ConflictException('Já existe uma busca completa em andamento.');
    return result;
  }

  syncAllDefaultShopee(input: ShopeeSearch) {
    return this.fullSync(
      'platform',
      input,
      (page) => this.shopee.search({ ...input, page }),
      null,
    );
  }

  syncAllUserShopee(userId: string, input: ShopeeSearch) {
    return this.fullSync(
      `user:${userId}`,
      input,
      (page) => this.shopee.searchForUser(userId, { ...input, page }),
      userId,
    );
  }

  list(input: OfferListQuery) {
    return this.repository.list(input);
  }

  async listForUser(userId: string, input: Omit<OfferListQuery, 'scope' | 'ownerUserId'>) {
    const result = await this.repository.list({ ...input, scope: 'all', ownerUserId: userId });
    return { offers: result.offers, page: result.page, limit: result.limit, total: result.total, categories: result.categories };
  }
}
