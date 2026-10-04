import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { UsersModule } from '../users/users.module.js';
import { AdminAuthController } from './admin-auth.controller.js';
import { AuthService } from './auth.service.js';
import { SessionsService } from './sessions.service.js';
import { UserAuthController } from './user-auth.controller.js';

@Module({
  imports: [UsersModule, RbacModule, AuditModule],
  controllers: [AdminAuthController, UserAuthController],
  providers: [AuthService, SessionsService],
  exports: [SessionsService],
})
export class AuthModule {}
