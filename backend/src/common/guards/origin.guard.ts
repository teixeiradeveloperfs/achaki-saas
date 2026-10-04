import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ENV } from '../../config/config.module.js';
import type { Env } from '../../config/env.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence in depth: browsers always send Origin on state-changing requests,
 * so one that comes from a page outside the allow-list is rejected.
 */
@Injectable()
export class OriginGuard implements CanActivate {
  constructor(@Inject(ENV) private readonly env: Env) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (SAFE_METHODS.has(request.method)) return true;

    const origin = request.headers.origin;
    if (origin && !this.env.CORS_ORIGINS.includes(origin)) throw new ForbiddenException('Origem não permitida.');
    return true;
  }
}
