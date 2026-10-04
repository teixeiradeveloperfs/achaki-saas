import { describe, expect, it, vi } from 'vitest';
import type { Offer } from './offer.js';
import { OffersService } from './offers.service.js';

const offer = (externalId: string): Offer => ({
  source: 'shopee',
  externalId,
  title: `Oferta ${externalId}`,
  currentPrice: 10,
  originalPrice: 20,
  discountPercentage: 50,
  category: null,
  imageUrl: null,
  productUrl: 'https://example.com/product',
  affiliateUrl: 'https://example.com/affiliate',
  shop: { externalId: null, name: 'Loja' },
  sales: null,
  rating: null,
  commissionRate: null,
  estimatedCommission: null,
  validFrom: null,
  validUntil: null,
  coupon: null,
  fetchedAt: new Date().toISOString(),
});

describe('OffersService full sync', () => {
  it('percorre todas as páginas com um único comando', async () => {
    const shopee = {
      searchForUser: vi.fn(async (_userId: string, input: { page: number }) => ({
        offers: [offer(String(input.page))],
        page: input.page,
        limit: 50,
        hasNextPage: input.page < 3,
      })),
    };
    const repository = { save: vi.fn(async () => ({ created: 1, updated: 0 })) };
    const locks = { runExclusive: vi.fn(async (_key: string, work: () => Promise<unknown>) => work()) };
    const service = new OffersService(shopee as never, repository as never, locks as never);

    const result = await service.syncAllUserShopee('user-1', { page: 1, limit: 50, listType: 0, sortType: 2 });

    expect(result).toEqual({ imported: 3, newOffers: 3, updatedOffers: 0, pagesFetched: 3, completed: true });
    expect(shopee.searchForUser).toHaveBeenCalledTimes(3);
    expect(repository.save).toHaveBeenCalledTimes(3);
  });

  it('interrompe se a API repetir a mesma página', async () => {
    const shopee = {
      searchForUser: vi.fn(async (_userId: string, input: { page: number }) => ({
        offers: [offer('repetida')],
        page: input.page,
        limit: 50,
        hasNextPage: true,
      })),
    };
    const repository = { save: vi.fn(async () => ({ created: 0, updated: 1 })) };
    const locks = { runExclusive: vi.fn(async (_key: string, work: () => Promise<unknown>) => work()) };
    const service = new OffersService(shopee as never, repository as never, locks as never);

    const result = await service.syncAllUserShopee('user-1', { page: 1, limit: 50, listType: 0, sortType: 2 });

    expect(result.pagesFetched).toBe(2);
    expect(result.completed).toBe(true);
  });
});
