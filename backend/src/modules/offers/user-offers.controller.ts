import { Body, Controller, Get, HttpCode, Inject, Post, Query, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AuthContext } from '../../common/auth-context.js';
import { CurrentAuth } from '../../common/decorators/current-auth.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { AuditService } from '../audit/audit.service.js';
import { searchOffersSchema } from './dto/search-offers.dto.js';
import type { SearchOffersDto } from './dto/search-offers.dto.js';
import { userOffersQuerySchema } from './dto/user-offers.dto.js';
import type { UserOffersQueryDto } from './dto/user-offers.dto.js';
import { OffersService } from './offers.service.js';

@Controller('my/offers')
export class UserOffersController {
  constructor(
    @Inject(OffersService) private readonly offers: OffersService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Query(new ZodValidationPipe(userOffersQuerySchema)) query: UserOffersQueryDto, @CurrentAuth() auth: AuthContext) {
    return this.offers.listForUser(auth.user.id, query);
  }

  @Post('sync/shopee')
  @HttpCode(200)
  async syncShopee(
    @Body(new ZodValidationPipe(searchOffersSchema)) body: SearchOffersDto,
    @CurrentAuth() auth: AuthContext,
    @Req() request: FastifyRequest,
  ) {
    const result = await this.offers.syncAllUserShopee(auth.user.id, body);
    await this.audit.record({
      action: 'user.offers.shopee.synced',
      userId: auth.user.id,
      ip: request.ip,
      userAgent: request.headers['user-agent']?.slice(0, 300),
      metadata: { count: result.imported, pages: result.pagesFetched, completed: result.completed },
    });
    return result;
  }
}
