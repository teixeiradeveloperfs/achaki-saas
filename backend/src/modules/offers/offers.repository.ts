import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, inArray, isNotNull, or } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { DB } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import { offers, users } from '../../database/schema.js';
import type { Offer } from './offer.js';
import { inferOfferCategory, OFFER_CATEGORIES } from './offer-categories.js';
import type { OfferCategory } from './offer-categories.js';

export type OfferScope = 'all' | 'platform' | 'users';
export type OfferListQuery = { scope: OfferScope; source?: string; category?: OfferCategory; query?: string; page: number; limit: number; ownerUserId?: string };

const cents = (value: number | null) => value == null ? null : Math.round(value * 100);

@Injectable()
export class OffersRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  async save(offerList: Offer[], ownerUserId: string | null = null) {
    if (offerList.length === 0) return { created: 0, updated: 0 };
    const scopeKey = ownerUserId ? `user:${ownerUserId}` : 'platform';
    const now = new Date();
    return this.db.transaction(async (tx) => {
      const sources = [...new Set(offerList.map((offer) => offer.source))];
      const externalIds = [...new Set(offerList.map((offer) => offer.externalId))];
      const existing = await tx
        .select({ source: offers.source, externalId: offers.externalId })
        .from(offers)
        .where(and(eq(offers.scopeKey, scopeKey), inArray(offers.source, sources), inArray(offers.externalId, externalIds)));
      const known = new Set(existing.map((offer) => `${offer.source}:${offer.externalId}`));

      for (const offer of offerList) {
        const value = {
          scopeKey,
          ownerUserId,
          source: offer.source,
          externalId: offer.externalId,
          title: offer.title,
          currentPriceCents: cents(offer.currentPrice) ?? 0,
          originalPriceCents: cents(offer.originalPrice),
          discountPercentage: Math.round(offer.discountPercentage),
          category: inferOfferCategory(offer.title, offer.category),
          imageUrl: offer.imageUrl,
          productUrl: offer.productUrl,
          affiliateUrl: offer.affiliateUrl,
          shopName: offer.shop.name,
          validUntil: offer.validUntil ? new Date(offer.validUntil) : null,
          fetchedAt: new Date(offer.fetchedAt),
          updatedAt: now,
        };
        await tx
          .insert(offers)
          .values(value)
          .onConflictDoUpdate({
            target: [offers.scopeKey, offers.source, offers.externalId],
            set: {
              title: value.title,
              currentPriceCents: value.currentPriceCents,
              originalPriceCents: value.originalPriceCents,
              discountPercentage: value.discountPercentage,
              category: value.category,
              imageUrl: value.imageUrl,
              productUrl: value.productUrl,
              affiliateUrl: value.affiliateUrl,
              shopName: value.shopName,
              validUntil: value.validUntil,
              fetchedAt: value.fetchedAt,
              updatedAt: now,
            },
          });
      }
      const updated = offerList.filter((offer) => known.has(`${offer.source}:${offer.externalId}`)).length;
      return { created: offerList.length - updated, updated };
    });
  }

  private conditions(input: OfferListQuery) {
    const filters: SQL[] = [];
    if (input.ownerUserId) filters.push(eq(offers.ownerUserId, input.ownerUserId));
    else if (input.scope === 'platform') filters.push(eq(offers.scopeKey, 'platform'));
    else if (input.scope === 'users') filters.push(isNotNull(offers.ownerUserId));
    if (input.source) filters.push(eq(offers.source, input.source));
    if (input.category) filters.push(eq(offers.category, input.category));
    if (input.query) {
      const search = `%${input.query}%`;
      filters.push(or(ilike(offers.title, search), ilike(offers.shopName, search))!);
    }
    return filters.length ? and(...filters) : undefined;
  }

  async list(input: OfferListQuery) {
    const where = this.conditions(input);
    const rows = await this.db
      .select({
        id: offers.id,
        scopeKey: offers.scopeKey,
        ownerUserId: offers.ownerUserId,
        ownerName: users.name,
        source: offers.source,
        externalId: offers.externalId,
        title: offers.title,
        currentPriceCents: offers.currentPriceCents,
        originalPriceCents: offers.originalPriceCents,
        discountPercentage: offers.discountPercentage,
        category: offers.category,
        imageUrl: offers.imageUrl,
        productUrl: offers.productUrl,
        affiliateUrl: offers.affiliateUrl,
        shopName: offers.shopName,
        validUntil: offers.validUntil,
        fetchedAt: offers.fetchedAt,
      })
      .from(offers)
      .leftJoin(users, eq(users.id, offers.ownerUserId))
      .where(where)
      .orderBy(desc(offers.fetchedAt))
      .limit(input.limit)
      .offset((input.page - 1) * input.limit);
    const [{ total }] = await this.db.select({ total: count() }).from(offers).where(where);
    let summary = { all: total, platform: 0, users: total };
    if (!input.ownerUserId) {
      const [{ platform }] = await this.db.select({ platform: count() }).from(offers).where(eq(offers.scopeKey, 'platform'));
      const [{ userOffers }] = await this.db.select({ userOffers: count() }).from(offers).where(isNotNull(offers.ownerUserId));
      summary = { all: platform + userOffers, platform, users: userOffers };
    }

    return {
      offers: rows.map((row) => ({
        ...row,
        scope: row.ownerUserId ? 'user' as const : 'platform' as const,
        ownerName: row.ownerName ?? 'Achaki',
        currentPrice: row.currentPriceCents / 100,
        originalPrice: row.originalPriceCents == null ? null : row.originalPriceCents / 100,
        validUntil: row.validUntil?.toISOString() ?? null,
        fetchedAt: row.fetchedAt.toISOString(),
      })),
      page: input.page,
      limit: input.limit,
      total,
      summary,
      categories: OFFER_CATEGORIES,
    };
  }
}
