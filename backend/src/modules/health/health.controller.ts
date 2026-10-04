import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { Public } from '../../common/decorators/public.decorator.js';
import { DB } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import type { Redis } from 'ioredis';
import { REDIS } from '../../redis/redis.constants.js';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DB) private readonly db: Database,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  @Public()
  @Get()
  async check() {
    try {
      await this.db.execute(sql`select 1`);
      await this.redis.ping();
    } catch {
      throw new ServiceUnavailableException();
    }
    return { status: 'ok', postgres: 'ok', redis: 'ok' };
  }
}
