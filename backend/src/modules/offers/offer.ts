export type OfferSource = 'shopee' | 'mercado_livre' | 'amazon';

/** Store-independent shape consumed later by filtering, persistence and delivery modules. */
export type Offer = {
  source: OfferSource;
  externalId: string;
  title: string;
  currentPrice: number;
  originalPrice: number | null;
  discountPercentage: number;
  category: string | null;
  imageUrl: string | null;
  productUrl: string;
  affiliateUrl: string;
  shop: { externalId: string | null; name: string | null };
  sales: number | null;
  rating: number | null;
  commissionRate: number | null;
  estimatedCommission: number | null;
  validFrom: string | null;
  validUntil: string | null;
  coupon: string | null;
  fetchedAt: string;
};

export type OfferPage = {
  offers: Offer[];
  page: number;
  limit: number;
  hasNextPage: boolean;
};
