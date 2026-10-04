import { Module } from '@nestjs/common';
import { IntegrationSettingsService } from './integration-settings.service.js';
import { SecretVault } from './secret-vault.js';
import { TelegramController } from './telegram.controller.js';

@Module({
  controllers: [TelegramController],
  providers: [IntegrationSettingsService, SecretVault],
  exports: [IntegrationSettingsService],
})
export class IntegrationsModule {}
