import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { eq, inArray } from 'drizzle-orm';
import { AppModule } from '../src/app.module.js';
import { hashPassword } from '../src/common/security/password.js';
import { loadEnv } from '../src/config/env.js';
import { DB } from '../src/database/database.module.js';
import type { Database } from '../src/database/database.module.js';
import { roles, userRoles, users } from '../src/database/schema.js';
import { createAdapter, setupApp } from '../src/setup.js';

// Runs against the development database (migrated and seeded); it only touches the users it creates.
const env = loadEnv();
const origin = env.CORS_ORIGINS[0];
const password = 'e2e-password-long-enough';
const run = randomUUID();
const support = { email: `support-${run}@e2e.test`, name: 'Support' };
const customer = { email: `customer-${run}@e2e.test`, name: 'Customer' };

describe('Admin auth (e2e)', () => {
  let app: NestFastifyApplication;
  let db: Database;

  const login = (email: string, pass = password, from = origin) =>
    app.inject({ method: 'POST', url: '/admin/auth/login', headers: { origin: from }, payload: { email, password: pass } });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(createAdapter(env));
    await setupApp(app, env);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    db = app.get<Database>(DB);
    const passwordHash = await hashPassword(password);
    const created = await db
      .insert(users)
      .values([
        { ...support, passwordHash },
        { ...customer, passwordHash },
      ])
      .returning({ id: users.id, email: users.email });
    const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.key, 'support'));
    await db.insert(userRoles).values({ userId: created.find((user) => user.email === support.email)!.id, roleId: role.id });
  });

  afterAll(async () => {
    await db.delete(users).where(inArray(users.email, [support.email, customer.email]));
    await app.close();
  });

  it('reports health without authentication', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
  });

  it('protects routes by default', async () => {
    expect((await app.inject({ method: 'GET', url: '/admin/auth/me' })).statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/admin/users' })).statusCode).toBe(401);
  });

  it('rejects logins from an origin outside the allow-list', async () => {
    expect((await login(support.email, password, 'http://evil.test')).statusCode).toBe(403);
  });

  it('rejects valid credentials that have no admin access', async () => {
    expect((await login(customer.email)).statusCode).toBe(401);
  });

  it('signs in, authorizes by permission and signs out', async () => {
    const response = await login(support.email);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ user: { email: support.email }, roles: ['support'] });

    const [cookie] = response.cookies;
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Strict', path: '/' });
    const cookies = { [cookie.name]: cookie.value };

    const me = await app.inject({ method: 'GET', url: '/admin/auth/me', cookies });
    expect(me.json().permissions).toEqual(expect.arrayContaining(['admin:access', 'users:read']));

    const list = await app.inject({ method: 'GET', url: '/admin/users', cookies });
    expect(list.statusCode).toBe(200);
    expect(JSON.stringify(list.json())).not.toContain('argon2');

    const logout = await app.inject({ method: 'POST', url: '/admin/auth/logout', headers: { origin }, cookies });
    expect(logout.statusCode).toBe(204);
    expect((await app.inject({ method: 'GET', url: '/admin/auth/me', cookies })).statusCode).toBe(401);
  });

  it('limits repeated login attempts from one address', async () => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 6; attempt++) statuses.push((await login(`ghost-${run}@e2e.test`)).statusCode);
    expect(statuses).toContain(429);
  });
});
