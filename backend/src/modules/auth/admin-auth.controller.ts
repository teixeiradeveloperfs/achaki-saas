import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res } from '@nestjs/common';
import { RouteConfig } from '@nestjs/platform-fastify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthContext } from '../../common/auth-context.js';
import { CurrentAuth } from '../../common/decorators/current-auth.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import type { RequestOrigin } from '../audit/audit.service.js';
import { AuthService } from './auth.service.js';
import { loginSchema } from './dto/login.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import { toSessionDto } from './dto/session.dto.js';
import type { SessionDto } from './dto/session.dto.js';
import { SessionsService } from './sessions.service.js';

const originOf = (request: FastifyRequest): RequestOrigin => ({
  ip: request.ip,
  userAgent: request.headers['user-agent']?.slice(0, 300),
});

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(SessionsService) private readonly sessions: SessionsService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  // Much stricter than the global limit: slows down password guessing from one address.
  @RouteConfig({ rateLimit: { max: 5, timeWindow: '1 minute' } })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<SessionDto> {
    const { token, ...session } = await this.auth.loginAdmin(body.email, body.password, originOf(request));
    reply.setCookie(this.sessions.cookieName, token, { ...this.sessions.cookieOptions, maxAge: this.sessions.ttlSeconds });
    return toSessionDto(session);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@CurrentAuth() auth: AuthContext, @Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.auth.logout(auth.sessionId, auth.user.id, originOf(request));
    reply.clearCookie(this.sessions.cookieName, this.sessions.cookieOptions);
  }

  @Get('me')
  @RequirePermissions('admin:access')
  me(@CurrentAuth() auth: AuthContext): SessionDto {
    return toSessionDto(auth);
  }
}
