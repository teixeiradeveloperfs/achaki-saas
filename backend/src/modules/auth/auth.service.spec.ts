import { UnauthorizedException } from '@nestjs/common';
import { hashPassword } from '../../common/security/password.js';
import type { AuditService } from '../audit/audit.service.js';
import type { Permission } from '../rbac/permissions.js';
import type { RbacService } from '../rbac/rbac.service.js';
import type { UsersRepository } from '../users/users.repository.js';
import { AuthService } from './auth.service.js';
import type { SessionsService } from './sessions.service.js';

const PASSWORD = 'correct horse battery';

async function setup(overrides: Record<string, unknown> = {}, permissions: Permission[] = ['admin:access']) {
  const user = {
    id: 'user-1',
    email: 'admin@achaki.test',
    name: 'Admin',
    passwordHash: await hashPassword(PASSWORD),
    status: 'active',
    lockedUntil: null,
    ...overrides,
  };
  const users = {
    findByEmail: vi.fn(async (email: string) => (email === user.email ? user : undefined)),
    recordLoginFailure: vi.fn(),
    recordLoginSuccess: vi.fn(),
  };
  const sessions = { create: vi.fn(async () => 'token'), revoke: vi.fn() };
  const audit = { record: vi.fn() };
  const rbac = { getAccess: vi.fn(async () => ({ roles: ['admin'], permissions })) };
  const service = new AuthService(
    users as unknown as UsersRepository,
    rbac as unknown as RbacService,
    sessions as unknown as SessionsService,
    audit as unknown as AuditService,
  );
  const reason = () => audit.record.mock.calls.at(-1)?.[0].metadata?.reason;
  return { service, user, users, sessions, audit, reason };
}

describe('AuthService.loginAdmin', () => {
  it('creates a session for valid credentials with admin access', async () => {
    const { service, user, users, sessions } = await setup();
    const result = await service.loginAdmin(user.email, PASSWORD, {});
    expect(result.token).toBe('token');
    expect(result.permissions).toContain('admin:access');
    expect(users.recordLoginSuccess).toHaveBeenCalledWith(user.id);
    expect(sessions.create).toHaveBeenCalledOnce();
  });

  it('counts a wrong password and gives the generic error', async () => {
    const { service, user, users, sessions, reason } = await setup();
    await expect(service.loginAdmin(user.email, 'nope', {})).rejects.toThrow(UnauthorizedException);
    expect(users.recordLoginFailure).toHaveBeenCalledWith(user.id);
    expect(sessions.create).not.toHaveBeenCalled();
    expect(reason()).toBe('wrong_password');
  });

  it.each([
    ['an unknown e-mail', {}, ['admin:access'], 'ghost@achaki.test', 'unknown_email'],
    ['a locked account', { lockedUntil: new Date(Date.now() + 60_000) }, ['admin:access'], undefined, 'locked'],
    ['a blocked account', { status: 'blocked' }, ['admin:access'], undefined, 'blocked'],
    ['a user without admin access', {}, ['users:read'], undefined, 'no_admin_access'],
  ] as const)('rejects %s with the same error, even with the right password', async (_case, overrides, permissions, email, expected) => {
    const { service, user, sessions, reason } = await setup(overrides, [...permissions]);
    await expect(service.loginAdmin(email ?? user.email, PASSWORD, {})).rejects.toThrow('E-mail ou senha incorretos.');
    expect(sessions.create).not.toHaveBeenCalled();
    expect(reason()).toBe(expected);
  });
});
