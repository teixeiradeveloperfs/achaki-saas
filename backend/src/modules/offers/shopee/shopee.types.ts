export type ShopeeProductOffer = {
  itemId: string | number;
  productName: string;
  productLink: string;
  offerLink: string;
  imageUrl?: string | null;
  priceMin: string | number;
  priceMax?: string | number | null;
  priceDiscountRate?: string | number | null;
  sales?: string | number | null;
  ratingStar?: string | number | null;
  commissionRate?: string | number | null;
  sellerCommissionRate?: string | number | null;
  shopeeCommissionRate?: string | number | null;
  commission?: string | number | null;
  shopId?: string | number | null;
  shopName?: string | null;
  shopType?: string | number | null;
  periodStartTime?: string | number | null;
  periodEndTime?: string | number | null;
};

export type ShopeeResponse = {
  data?: {
    productOfferV2?: {
      nodes?: ShopeeProductOffer[];
      pageInfo?: { page?: number; limit?: number; hasNextPage?: boolean };
    };
  };
  errors?: Array<{ message?: string; extensions?: { code?: number; message?: string } }>;
};
