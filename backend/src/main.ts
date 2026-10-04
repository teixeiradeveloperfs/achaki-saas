import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { loadEnv } from './config/env.js';
import { createAdapter, setupApp } from './setup.js';

async function bootstrap() {
  const env = loadEnv();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, createAdapter(env));
  await setupApp(app, env);
  await app.listen(env.PORT, env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');
}
await bootstrap();
