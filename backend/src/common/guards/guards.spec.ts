import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Env } from '../../config/env.js';
import type { Permission } from '../../modules/rbac/permissions.js';
import { RequirePermissions } from '../decorators/permissions.decorator.js';
import { OriginGuard } from './origin.guard.js';
import { PermissionsGuard } from './permissions.guard.js';

@RequirePermissions('admin:access')
class Routes {
  @RequirePermissions('users:read')
  list(this: void) {}

  open(this: void) {}
}

const contextFor = (handler: () => void, request: object) =>
  ({
    getClass: () => Routes,
    getHandler: () => handler,
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('PermissionsGuard', () => {
  const guard = new PermissionsGuard(new Reflector());
  const check = (handler: () => void, permissions: Permission[]) => guard.canActivate(contextFor(handler, { auth: { permissions } }));

  it('requires the controller and the route permissions together', () => {
    expect(check(Routes.prototype.list, ['admin:access', 'users:read'])).toBe(true);
    expect(() => check(Routes.prototype.list, ['admin:access'])).toThrow(ForbiddenException);
    expect(() => check(Routes.prototype.list, ['users:read'])).toThrow(ForbiddenException);
  });

  it('applies the controller permission to routes without their own', () => {
    expect(check(Routes.prototype.open, ['admin:access'])).toBe(true);
    expect(() => check(Routes.prototype.open, [])).toThrow(ForbiddenException);
  });
});

describe('OriginGuard', () => {
  const guard = new OriginGuard({ CORS_ORIGINS: ['http://admin.test'] } as Env);
  const check = (method: string, origin?: string) => guard.canActivate(contextFor(Routes.prototype.open, { method, headers: { origin } }));

  it('rejects state-changing requests from unknown origins', () => {
    expect(() => check('POST', 'http://evil.test')).toThrow(ForbiddenException);
  });

  it('allows known origins, safe methods and non-browser clients', () => {
    expect(check('POST', 'http://admin.test')).toBe(true);
    expect(check('GET', 'http://evil.test')).toBe(true);
    expect(check('POST')).toBe(true);
  });
});
