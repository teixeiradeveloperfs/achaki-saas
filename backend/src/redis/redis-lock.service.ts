import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS } from './redis.constants.js';

const RELEASE_SCRIPT = `
  if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
  end
  return 0
`;

const RENEW_SCRIPT = `
  if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('pexpire', KEYS[1], ARGV[2])
  end
  return 0
`;

@Injectable()
export class RedisLockService {
  private readonly logger = new Logger(RedisLockService.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  /** Executes work while this process owns a renewable distributed lock. Null means another worker owns it. */
  async runExclusive<T>(key: string, work: () => Promise<T>, ttlMs = 120_000): Promise<T | null> {
    const redisKey = `achaki:lock:${key}`;
    const token = randomUUID();
    const acquired = await this.redis.set(redisKey, token, 'PX', ttlMs, 'NX');
    if (acquired !== 'OK') return null;

    const renewal = setInterval(() => {
      void this.redis.eval(RENEW_SCRIPT, 1, redisKey, token, String(ttlMs)).catch((error: unknown) => {
        this.logger.error(`Falha ao renovar ${redisKey}: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
      });
    }, Math.max(1_000, Math.floor(ttlMs / 3)));
    renewal.unref();

    try {
      return await work();
    } finally {
      clearInterval(renewal);
      await this.redis.eval(RELEASE_SCRIPT, 1, redisKey, token).catch((error: unknown) => {
        this.logger.error(`Falha ao liberar ${redisKey}: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
      });
    }
  }
}
