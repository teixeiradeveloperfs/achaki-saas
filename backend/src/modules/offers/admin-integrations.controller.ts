import { Body, Controller, Get, HttpCode, Inject, Post, Put, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AuthContext } from '../../common/auth-context.js';
import { CurrentAuth } from '../../common/decorators/current-auth.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { AuditService } from '../audit/audit.service.js';
import { IntegrationSettingsService } from '../integrations/integration-settings.service.js';
import { shopeeSettingsSchema } from './dto/shopee-settings.dto.js';
import type { ShopeeSettingsDto } from './dto/shopee-settings.dto.js';
import { ShopeeAffiliateClient } from './shopee/shopee.client.js';

@Controller('admin/integrations/shopee')
@RequirePermissions('admin:access', 'integrations:manage')
export class AdminIntegrationsController {
  constructor(
    @Inject(IntegrationSettingsService) private readonly settings: IntegrationSettingsService,
    @Inject(ShopeeAffiliateClient) private readonly shopee: ShopeeAffiliateClient,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  @Get()
  get() {
    return this.settings.shopeeStatus();
  }

  @Put()
  async update(
    @Body(new ZodValidationPipe(shopeeSettingsSchema)) body: ShopeeSettingsDto,
    @CurrentAuth() auth: AuthContext,
    @Req() request: FastifyRequest,
  ) {
    const status = await this.settings.saveShopee(body, auth.user.id);
    await this.audit.record({
      action: 'integration.shopee.updated',
      userId: auth.user.id,
      ip: request.ip,
      userAgent: request.headers['user-agent']?.slice(0, 300),
      metadata: { appId: body.appId, enabled: body.enabled, secretChanged: Boolean(body.secret) },
    });
    return status;
  }

  @Post('test')
  @HttpCode(200)
  async test(@CurrentAuth() auth: AuthContext, @Req() request: FastifyRequest) {
    const result = await this.shopee.testConnection();
    await this.audit.record({
      action: 'integration.shopee.tested',
      userId: auth.user.id,
      ip: request.ip,
      userAgent: request.headers['user-agent']?.slice(0, 300),
      metadata: { success: true },
    });
    return result;
  }
}
