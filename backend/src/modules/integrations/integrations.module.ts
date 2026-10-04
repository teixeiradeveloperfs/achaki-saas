import { Module } from '@nestjs/common';
import { IntegrationSettingsService } from './integration-settings.service.js';
import { SecretVault } from './secret-vault.js';

@Module({
  providers: [IntegrationSettingsService, SecretVault],
  exports: [IntegrationSettingsService],
})
export class IntegrationsModule {}
