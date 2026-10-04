import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DB } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import { platformIntegrations, userIntegrations } from '../../database/schema.js';
import { SecretVault } from './secret-vault.js';

const SHOPEE = 'shopee';

export type SaveShopeeSettings = { appId: string; secret?: string; enabled: boolean };

@Injectable()
export class IntegrationSettingsService {
  constructor(
    @Inject(DB) private readonly db: Database,
    @Inject(SecretVault) private readonly vault: SecretVault,
  ) {}

  private async shopeeRow() {
    const [row] = await this.db.select().from(platformIntegrations).where(eq(platformIntegrations.provider, SHOPEE)).limit(1);
    return row;
  }

  async shopeeStatus() {
    const row = await this.shopeeRow();
    return {
      provider: SHOPEE,
      configured: Boolean(row?.appId && row.encryptedSecret),
      enabled: row?.enabled ?? false,
      appId: row?.appId ?? '',
      hasSecret: Boolean(row?.encryptedSecret),
      updatedAt: row?.updatedAt.toISOString() ?? null,
    };
  }

  async saveShopee(input: SaveShopeeSettings, userId: string) {
    const existing = await this.shopeeRow();
    if (existing && existing.appId !== input.appId && !input.secret) {
      throw new BadRequestException('Informe o Secret novamente ao trocar o App ID.');
    }
    const encryptedSecret = input.secret ? this.vault.encrypt(input.secret) : existing?.encryptedSecret;
    if (!encryptedSecret) throw new BadRequestException('Informe o Secret da Shopee.');

    const now = new Date();
    await this.db
      .insert(platformIntegrations)
      .values({ provider: SHOPEE, appId: input.appId, encryptedSecret, enabled: input.enabled, updatedBy: userId, updatedAt: now })
      .onConflictDoUpdate({
        target: platformIntegrations.provider,
        set: { appId: input.appId, encryptedSecret, enabled: input.enabled, updatedBy: userId, updatedAt: now },
      });
    return this.shopeeStatus();
  }

  async shopeeCredentials(includeDisabled = false) {
    const row = await this.shopeeRow();
    if (!row || (!includeDisabled && !row.enabled)) return null;
    return { appId: row.appId, secret: this.vault.decrypt(row.encryptedSecret) };
  }

  private async userShopeeRow(userId: string) {
    const [row] = await this.db
      .select()
      .from(userIntegrations)
      .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.provider, SHOPEE)))
      .limit(1);
    return row;
  }

  async userShopeeStatus(userId: string) {
    const row = await this.userShopeeRow(userId);
    return {
      provider: SHOPEE,
      configured: Boolean(row?.appId && row.encryptedSecret),
      enabled: row?.enabled ?? true,
      appId: row?.appId ?? '',
      hasSecret: Boolean(row?.encryptedSecret),
      updatedAt: row?.updatedAt.toISOString() ?? null,
    };
  }

  async saveUserShopee(input: SaveShopeeSettings, userId: string) {
    const existing = await this.userShopeeRow(userId);
    if (existing && existing.appId !== input.appId && !input.secret) {
      throw new BadRequestException('Informe o Secret novamente ao trocar o App ID.');
    }
    const encryptedSecret = input.secret ? this.vault.encrypt(input.secret) : existing?.encryptedSecret;
    if (!encryptedSecret) throw new BadRequestException('Informe o Secret da Shopee.');

    const now = new Date();
    await this.db
      .insert(userIntegrations)
      .values({ userId, provider: SHOPEE, appId: input.appId, encryptedSecret, enabled: input.enabled, updatedAt: now })
      .onConflictDoUpdate({
        target: [userIntegrations.userId, userIntegrations.provider],
        set: { appId: input.appId, encryptedSecret, enabled: input.enabled, updatedAt: now },
      });
    return this.userShopeeStatus(userId);
  }

  async userShopeeCredentials(userId: string, includeDisabled = false) {
    const row = await this.userShopeeRow(userId);
    if (!row || (!includeDisabled && !row.enabled)) return null;
    return { appId: row.appId, secret: this.vault.decrypt(row.encryptedSecret) };
  }

  async enabledUserShopeeCredentials() {
    const rows = await this.db
      .select({ userId: userIntegrations.userId, appId: userIntegrations.appId, encryptedSecret: userIntegrations.encryptedSecret })
      .from(userIntegrations)
      .where(and(eq(userIntegrations.provider, SHOPEE), eq(userIntegrations.enabled, true)));
    return rows.flatMap((row) => {
      try {
        return [{ userId: row.userId, appId: row.appId, secret: this.vault.decrypt(row.encryptedSecret) }];
      } catch {
        return [];
      }
    });
  }
}
