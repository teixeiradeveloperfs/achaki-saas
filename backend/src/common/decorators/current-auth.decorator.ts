import { createParamDecorator, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AuthContext } from '../auth-context.js';

/** The authenticated session and user of the current request. */
export const CurrentAuth = createParamDecorator((_data: unknown, context: ExecutionContext): AuthContext => {
  const auth = context.switchToHttp().getRequest<FastifyRequest>().auth;
  if (!auth) throw new UnauthorizedException();
  return auth;
});
