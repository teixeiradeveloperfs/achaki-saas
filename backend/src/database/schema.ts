import { boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const userStatus = pgEnum('user_status', ['active', 'blocked']);
export const telegramConnectionKind = pgEnum('telegram_connection_kind', ['bot', 'account']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Always stored trimmed and lowercased. */
    email: text('email').notNull(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
    status: userStatus('status').notNull().default('active'),
    failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
    lockedUntil: timestamptz('locked_until'),
    lastLoginAt: timestamptz('last_login_at'),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
    updatedAt: timestamptz('updated_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)],
);

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: text('key').notNull(),
    name: text('name').notNull(),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('roles_key_unique').on(table.key)],
);

export const telegramConnections = pgTable('telegram_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: telegramConnectionKind('kind').notNull(),
  telegramId: text('telegram_id').notNull(),
  name: text('name').notNull(),
  username: text('username'),
  encryptedCredentials: text('encrypted_credentials').notNull(),
  verifiedAt: timestamptz('verified_at').notNull().defaultNow(),
}, (table) => [uniqueIndex('telegram_connections_owner_identity').on(table.userId, table.telegramId)]);

export const permissions = pgTable('permissions', {
  key: text('key').primaryKey(),
  description: text('description').notNull(),
});

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionKey: text('permission_key')
      .notNull()
      .references(() => permissions.key, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionKey] })],
);

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** SHA-256 of the cookie token; the token itself is never stored. */
    tokenHash: text('token_hash').notNull(),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
    lastUsedAt: timestamptz('last_used_at').notNull().defaultNow(),
    expiresAt: timestamptz('expires_at').notNull(),
    revokedAt: timestamptz('revoked_at'),
  },
  (table) => [uniqueIndex('sessions_token_hash_unique').on(table.tokenHash), index('sessions_user_id_idx').on(table.userId)],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    ip: text('ip'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
  },
  (table) => [index('audit_logs_user_id_idx').on(table.userId), index('audit_logs_created_at_idx').on(table.createdAt)],
);

/** One platform-owned credential set per provider. Secrets are AES-GCM encrypted by the application. */
export const platformIntegrations = pgTable('platform_integrations', {
  provider: text('provider').primaryKey(),
  appId: text('app_id').notNull(),
  encryptedSecret: text('encrypted_secret').notNull(),
  enabled: boolean('enabled').notNull().default(false),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
});

/** Credentials owned by each customer. Secrets are AES-GCM encrypted by the application. */
export const userIntegrations = pgTable(
  'user_integrations',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    appId: text('app_id').notNull(),
    encryptedSecret: text('encrypted_secret').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
    updatedAt: timestamptz('updated_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.provider] })],
);

/** Normalized offer catalog. `scopeKey` is `platform` or `user:<uuid>`. */
export const offers = pgTable(
  'offers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scopeKey: text('scope_key').notNull(),
    ownerUserId: uuid('owner_user_id').references(() => users.id, { onDelete: 'cascade' }),
    source: text('source').notNull(),
    externalId: text('external_id').notNull(),
    title: text('title').notNull(),
    currentPriceCents: integer('current_price_cents').notNull(),
    originalPriceCents: integer('original_price_cents'),
    discountPercentage: integer('discount_percentage').notNull().default(0),
    category: text('category'),
    imageUrl: text('image_url'),
    productUrl: text('product_url').notNull(),
    affiliateUrl: text('affiliate_url').notNull(),
    shopName: text('shop_name'),
    validUntil: timestamptz('valid_until'),
    fetchedAt: timestamptz('fetched_at').notNull(),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
    updatedAt: timestamptz('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('offers_scope_source_external_unique').on(table.scopeKey, table.source, table.externalId),
    index('offers_owner_user_id_idx').on(table.ownerUserId),
    index('offers_fetched_at_idx').on(table.fetchedAt),
    index('offers_source_idx').on(table.source),
  ],
);
