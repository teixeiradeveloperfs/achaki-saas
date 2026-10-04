import { Global, Inject, Logger, Module } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ENV } from '../config/config.module.js';
import type { Env } from '../config/env.js';
import { RedisLockService } from './redis-lock.service.js';
import { REDIS } from './redis.constants.js';

export { REDIS } from './redis.constants.js';

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ENV],
      useFactory: async (env: Env) => {
        const logger = new Logger('Redis');
        const client = new Redis(env.REDIS_URL, {
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
        });
        client.on('error', (error: Error) => logger.error(error.message));
        await client.connect();
        return client;
      },
    },
    RedisLockService,
  ],
  exports: [REDIS, RedisLockService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onApplicationShutdown() {
    if (this.redis.status === 'ready') await this.redis.quit();
    else this.redis.disconnect();
  }
}
