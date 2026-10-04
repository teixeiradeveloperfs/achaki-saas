import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { HttpException } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { Env } from './config/env.js';

/** JSON bodies only need to be small; this also caps the work a single request can cause. */
const BODY_LIMIT_BYTES = 100 * 1024;

export function createAdapter(env: Env) {
  return new FastifyAdapter({ trustProxy: env.TRUST_PROXY, bodyLimit: BODY_LIMIT_BYTES });
}

/** HTTP-level hardening shared by the server and the e2e tests. */
export async function setupApp(app: NestFastifyApplication, env: Env) {
  await app.register(helmet);
  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  await app.register(cookie);
  // In-memory counters: enough for a single instance; use a shared store when scaling out.
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    // Nest only maps HttpException to a status code; anything else becomes a 500.
    errorResponseBuilder: () => new HttpException('Muitas tentativas. Aguarde um instante e tente novamente.', 429),
  });
  app.enableShutdownHooks();
}
