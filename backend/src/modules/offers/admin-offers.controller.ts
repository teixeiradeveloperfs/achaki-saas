import { Body, Controller, Get, HttpCode, Inject, Post, Query, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AuthContext } from '../../common/auth-context.js';
import { CurrentAuth } from '../../common/decorators/current-auth.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { AuditService } from '../audit/audit.service.js';
import { adminOffersQuerySchema } from './dto/admin-offers.dto.js';
import type { AdminOffersQueryDto } from './dto/admin-offers.dto.js';
import { searchOffersSchema } from './dto/search-offers.dto.js';
import type { SearchOffersDto } from './dto/search-offers.dto.js';
import { OffersService } from './offers.service.js';

@Controller('admin/offers')
@RequirePermissions('admin:access', 'offers:read')
export class AdminOffersController {
  constructor(
    @Inject(OffersService) private readonly offers: OffersService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Query(new ZodValidationPipe(adminOffersQuerySchema)) query: AdminOffersQueryDto) {
    return this.offers.list(query);
  }

  @Post('sync/shopee')
  @HttpCode(200)
  @RequirePermissions('offers:sync')
  async syncShopee(
    @Body(new ZodValidationPipe(searchOffersSchema)) body: SearchOffersDto,
    @CurrentAuth() auth: AuthContext,
    @Req() request: FastifyRequest,
  ) {
    const result = await this.offers.syncAllDefaultShopee(body);
    await this.audit.record({
      action: 'offers.shopee.synced',
      userId: auth.user.id,
      ip: request.ip,
      userAgent: request.headers['user-agent']?.slice(0, 300),
      metadata: { count: result.imported, pages: result.pagesFetched, completed: result.completed },
    });
    return result;
  }
}
