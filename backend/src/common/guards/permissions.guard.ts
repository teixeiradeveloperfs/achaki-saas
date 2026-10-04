import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import type { Permission } from '../../modules/rbac/permissions.js';
import { REQUIRED_PERMISSIONS } from '../decorators/permissions.decorator.js';

/** Enforces @RequirePermissions(); runs after the session guard. */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndMerge<Permission[]>(REQUIRED_PERMISSIONS, [context.getClass(), context.getHandler()]);
    if (required.length === 0) return true;

    const granted = context.switchToHttp().getRequest<FastifyRequest>().auth?.permissions ?? [];
    if (!required.every((permission) => granted.includes(permission))) throw new ForbiddenException('Permissão insuficiente.');
    return true;
  }
}
