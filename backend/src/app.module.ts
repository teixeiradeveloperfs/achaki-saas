import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { OriginGuard } from './common/guards/origin.guard.js';
import { PermissionsGuard } from './common/guards/permissions.guard.js';
import { SessionGuard } from './common/guards/session.guard.js';
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { IntegrationsModule } from './modules/integrations/integrations.module.js';
import { OffersModule } from './modules/offers/offers.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { RedisModule } from './redis/redis.module.js';

@Module({
  imports: [ConfigModule, DatabaseModule, RedisModule, AuthModule, UsersModule, HealthModule, IntegrationsModule, OffersModule],
  providers: [
    // Order matters: origin check, then authentication, then authorization.
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
