import { Inject, Injectable, Logger } from '@nestjs/common';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ENV } from '../../config/config.module.js';
import type { Env } from '../../config/env.js';
import { IntegrationSettingsService } from '../integrations/integration-settings.service.js';
import { RedisLockService } from '../../redis/redis-lock.service.js';
import { OffersRepository } from './offers.repository.js';
import { ShopeeAffiliateClient } from './shopee/shopee.client.js';

const START_DELAY_MS = 30_000;

/** Periodically refreshes every enabled customer catalog, with Redis locks for multi-instance safety. */
@Injectable()
export class OfferAutoSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OfferAutoSyncService.name);
  private startTimer?: ReturnType<typeof setTimeout>;
  private interval?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(RedisLockService) private readonly locks: RedisLockService,
    @Inject(IntegrationSettingsService) private readonly settings: IntegrationSettingsService,
    @Inject(ShopeeAffiliateClient) private readonly shopee: ShopeeAffiliateClient,
    @Inject(OffersRepository) private readonly offers: OffersRepository,
  ) {}

  onModuleInit() {
    const intervalMs = this.env.OFFERS_SYNC_INTERVAL_MINUTES * 60_000;
    this.startTimer = setTimeout(() => void this.run(), START_DELAY_MS);
    this.interval = setInterval(() => void this.run(), intervalMs);
    this.startTimer.unref();
    this.interval.unref();
    this.logger.log(`Atualização automática de ofertas ativa a cada ${this.env.OFFERS_SYNC_INTERVAL_MINUTES} minutos.`);
  }

  onModuleDestroy() {
    if (this.startTimer) clearTimeout(this.startTimer);
    if (this.interval) clearInterval(this.interval);
  }

  async run() {
    if (this.running) return;
    this.running = true;
    try {
      const platform = await this.settings.shopeeCredentials();
      if (platform) {
        await this.locks.runExclusive('offers:sync:platform', async () => {
          try {
            const page = await this.shopee.searchWithCredentials(
              { page: 1, limit: 50, listType: 0, sortType: 2 },
              platform,
            );
            const changes = await this.offers.save(page.offers);
            this.logger.log(`Shopee padrão: ${changes.created} novas, ${changes.updated} atualizadas.`);
          } catch (error) {
            this.logger.warn(`Falha ao atualizar a Shopee padrão: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
          }
        });
      }
      const integrations = await this.settings.enabledUserShopeeCredentials();
      for (const integration of integrations) {
        await this.locks.runExclusive(`offers:sync:user:${integration.userId}`, async () => {
          try {
            const page = await this.shopee.searchWithCredentials(
              { page: 1, limit: 50, listType: 0, sortType: 2 },
              { appId: integration.appId, secret: integration.secret },
            );
            const changes = await this.offers.save(page.offers, integration.userId);
            this.logger.log(`Shopee ${integration.userId}: ${changes.created} novas, ${changes.updated} atualizadas.`);
          } catch (error) {
            this.logger.warn(`Falha ao atualizar Shopee do usuário ${integration.userId}: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
          }
        });
      }
    } catch (error) {
      this.logger.error(`Falha no ciclo automático: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    } finally {
      this.running = false;
    }
  }
}
