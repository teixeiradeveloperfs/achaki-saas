import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { SessionsService } from '../../modules/auth/sessions.service.js';
import { IS_PUBLIC } from '../decorators/public.decorator.js';

/** Authenticates every route that is not marked @Public() from the session cookie. */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(SessionsService) private readonly sessions: SessionsService,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = request.cookies[this.sessions.cookieName];
    const auth = token ? await this.sessions.authenticate(token) : null;
    if (!auth) throw new UnauthorizedException('Sessão inválida ou expirada.');

    request.auth = auth;
    return true;
  }
}
