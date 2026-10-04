import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { searchOffersSchema } from './dto/search-offers.dto.js';
import type { SearchOffersDto } from './dto/search-offers.dto.js';
import { ShopeeAffiliateClient } from './shopee/shopee.client.js';
import { OffersService } from './offers.service.js';

@Controller('offers')
export class OffersController {
  constructor(
    @Inject(ShopeeAffiliateClient) private readonly shopee: ShopeeAffiliateClient,
    @Inject(OffersService) private readonly offers: OffersService,
  ) {}

  @Get('sources')
  async sources() {
    return {
      sources: [
        { id: 'shopee', enabled: await this.shopee.isConfigured() },
        { id: 'mercado_livre', enabled: false },
        { id: 'amazon', enabled: false },
      ],
    };
  }

  @Get('shopee')
  searchShopee(@Query(new ZodValidationPipe(searchOffersSchema)) query: SearchOffersDto) {
    return this.offers.fetchDefaultShopee(query);
  }
}
