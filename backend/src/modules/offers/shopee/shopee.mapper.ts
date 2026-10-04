import type { Offer } from '../offer.js';
import type { ShopeeProductOffer } from './shopee.types.js';

function numberOrNull(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const normalized = value.trim().replace(/^R\$\s*/, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function percentage(value: unknown): number {
  const parsed = numberOrNull(value) ?? 0;
  const percent = parsed > 0 && parsed <= 1 ? parsed * 100 : parsed;
  return Math.min(100, Math.max(0, percent));
}

function isoFromTimestamp(value: unknown): string | null {
  const timestamp = numberOrNull(value);
  if (!timestamp) return null;
  const date = new Date(timestamp < 10_000_000_000 ? timestamp * 1_000 : timestamp);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normalizeShopeeOffer(raw: ShopeeProductOffer, fetchedAt = new Date()): Offer {
  const currentPrice = numberOrNull(raw.priceMin) ?? 0;
  const discountPercentage = percentage(raw.priceDiscountRate);
  // Shopee's list endpoint does not expose an old-price field. This is an estimate from its rounded discount rate.
  const originalPrice = discountPercentage > 0 && discountPercentage < 100
    ? Number((currentPrice / (1 - discountPercentage / 100)).toFixed(2))
    : null;

  return {
    source: 'shopee',
    externalId: String(raw.itemId),
    title: raw.productName,
    currentPrice,
    originalPrice,
    discountPercentage,
    category: null,
    imageUrl: raw.imageUrl ?? null,
    productUrl: raw.productLink,
    affiliateUrl: raw.offerLink,
    shop: { externalId: raw.shopId == null ? null : String(raw.shopId), name: raw.shopName ?? null },
    sales: numberOrNull(raw.sales),
    rating: numberOrNull(raw.ratingStar),
    commissionRate: numberOrNull(raw.commissionRate),
    estimatedCommission: numberOrNull(raw.commission),
    validFrom: isoFromTimestamp(raw.periodStartTime),
    validUntil: isoFromTimestamp(raw.periodEndTime),
    coupon: null,
    fetchedAt: fetchedAt.toISOString(),
  };
}
