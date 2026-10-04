import { createHash } from 'node:crypto';
import { normalizeShopeeOffer } from './shopee.mapper.js';
import { signShopeeRequest } from './shopee.client.js';

describe('Shopee offer integration', () => {
  it('signs the exact payload in Shopee order', () => {
    const expected = createHash('sha256').update('app1700000000{"query":"test"}secret').digest('hex');
    expect(signShopeeRequest('app', 1_700_000_000, '{"query":"test"}', 'secret')).toBe(expected);
  });

  it('normalizes a product and estimates its old price', () => {
    const offer = normalizeShopeeOffer({
      itemId: 42,
      productName: 'Produto de teste',
      productLink: 'https://shopee.com.br/product/1/42',
      offerLink: 'https://s.shopee.com.br/example',
      priceMin: '75.00',
      priceDiscountRate: 25,
      shopId: 1,
      shopName: 'Loja',
      sales: '10',
    }, new Date('2026-10-04T12:00:00.000Z'));

    expect(offer).toMatchObject({
      source: 'shopee',
      externalId: '42',
      currentPrice: 75,
      originalPrice: 100,
      discountPercentage: 25,
      affiliateUrl: 'https://s.shopee.com.br/example',
      shop: { externalId: '1', name: 'Loja' },
      sales: 10,
    });
  });
});
