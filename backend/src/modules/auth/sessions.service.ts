import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNull, lt, ne } from 'drizzle-orm';
import type { AuthContext } from '../../common/auth-context.js';
import { generateToken, hashToken } from '../../common/security/tokens.js';
import { ENV } from '../../config/config.module.js';
import type { Env } from '../../config/env.js';
import { DB } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import { sessions, users } from '../../database/schema.js';
import type { RequestOrigin } from '../audit/audit.service.js';
import { RbacService } from '../rbac/rbac.service.js';

const TOUCH_INTERVAL_MS = 60_000;

/**
 * Server-side sessions: the browser only holds an opaque random token in an
 * httpOnly cookie, and the database holds its hash, so a session can be revoked
 * at any time and a database leak does not expose usable tokens.
 */
@Injectable()
export class SessionsService {
  constructor(
    @Inject(DB) private readonly db: Database,
    @Inject(ENV) private readonly env: Env,
    @Inject(RbacService) private readonly rbac: RbacService,
  ) {}

  private get secure() {
    return this.env.NODE_ENV === 'production';
  }

  /** The __Host- prefix makes browsers refuse the cookie unless it is Secure, host-only and Path=/. */
  get cookieName() {
    return this.secure ? '__Host-achaki_session' : 'achaki_session';
  }

  get cookieOptions() {
    return { httpOnly: true, secure: this.secure, sameSite: 'strict' as const, path: '/' };
  }

  get ttlSeconds() {
    return Math.round(this.env.SESSION_TTL_HOURS * 3600);
  }

  /** Returns the token for the cookie; it cannot be recovered later. */
  async create(userId: string, origin: RequestOrigin) {
    const token = generateToken();
    await this.db.insert(sessions).values({
      userId,
      tokenHash: hashToken(token),
      ip: origin.ip,
      userAgent: origin.userAgent,
      expiresAt: new Date(Date.now() + this.ttlSeconds * 1000),
    });
    return token;
  }

  /** Resolves a cookie token to the user and their current permissions, or null. */
  async authenticate(token: string): Promise<AuthContext | null> {
    const now = new Date();
    const [row] = await this.db
      .select({
        sessionId: sessions.id,
        lastUsedAt: sessions.lastUsedAt,
        userId: users.id,
        email: users.email,
        name: users.name,
        status: users.status,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, hashToken(token)), isNull(sessions.revokedAt), gt(sessions.expiresAt, now)))
      .limit(1);

    if (!row || row.status !== 'active') return null;

    if (now.getTime() - row.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
      await this.db.update(sessions).set({ lastUsedAt: now }).where(eq(sessions.id, row.sessionId));
    }

    // Permissions are read on every request, so revoking a role takes effect immediately.
    const access = await this.rbac.getAccess(row.userId);
    return { sessionId: row.sessionId, user: { id: row.userId, email: row.email, name: row.name }, ...access };
  }

  async revoke(sessionId: string) {
    await this.db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId));
  }

  async revokeOthers(userId: string, currentSessionId: string) {
    await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), ne(sessions.id, currentSessionId), isNull(sessions.revokedAt)));
  }

  /** Housekeeping: drops sessions that expired before the given date. */
  async deleteExpired(before = new Date()) {
    await this.db.delete(sessions).where(lt(sessions.expiresAt, before));
  }
}
