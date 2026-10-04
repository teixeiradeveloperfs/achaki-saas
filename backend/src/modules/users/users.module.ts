import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin-users.controller.js';
import { UsersRepository } from './users.repository.js';

@Module({
  controllers: [AdminUsersController],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
