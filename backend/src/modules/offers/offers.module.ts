import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { AdminIntegrationsController } from './admin-integrations.controller.js';
import { AdminOffersController } from './admin-offers.controller.js';
import { OffersRepository } from './offers.repository.js';
import { OffersService } from './offers.service.js';
import { OffersController } from './offers.controller.js';
import { ShopeeAffiliateClient } from './shopee/shopee.client.js';
import { UserIntegrationsController } from './user-integrations.controller.js';
import { UserOffersController } from './user-offers.controller.js';
import { OfferAutoSyncService } from './offer-auto-sync.service.js';

@Module({
  imports: [IntegrationsModule, AuditModule],
  controllers: [OffersController, AdminIntegrationsController, AdminOffersController, UserIntegrationsController, UserOffersController],
  providers: [ShopeeAffiliateClient, OffersRepository, OffersService, OfferAutoSyncService],
  exports: [ShopeeAffiliateClient, OffersService],
})
export class OffersModule {}
