import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { DB } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import { users } from '../../database/schema.js';

export const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

@Injectable()
export class UsersRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  async findByEmail(email: string) {
    const [user] = await this.db.select().from(users).where(eq(users.email, normalizeEmail(email))).limit(1);
    return user;
  }

  async findById(userId: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user;
  }

  async create(input: { name: string; email: string; passwordHash: string }) {
    const [user] = await this.db
      .insert(users)
      .values({ name: input.name.trim(), email: normalizeEmail(input.email), passwordHash: input.passwordHash })
      .onConflictDoNothing({ target: users.email })
      .returning();
    return user ?? null;
  }

  async updateProfile(userId: string, input: { name: string; email: string; passwordHash?: string }) {
    const [user] = await this.db
      .update(users)
      .set({
        name: input.name.trim(),
        email: normalizeEmail(input.email),
        ...(input.passwordHash ? { passwordHash: input.passwordHash } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  /** Counts the failure and locks the account for a while once the limit is reached. */
  async recordLoginFailure(userId: string) {
    await this.db
      .update(users)
      .set({
        failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
        lockedUntil: sql`case when ${users.failedLoginAttempts} + 1 >= ${MAX_FAILED_LOGINS}
          then now() + make_interval(mins => ${LOCK_MINUTES}) else ${users.lockedUntil} end`,
      })
      .where(eq(users.id, userId));
  }

  async recordLoginSuccess(userId: string) {
    await this.db.update(users).set({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() }).where(eq(users.id, userId));
  }

  /** Never selects the password hash. */
  list() {
    return this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        status: users.status,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100);
  }
}
