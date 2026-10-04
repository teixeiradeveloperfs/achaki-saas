import { Controller, Get, Inject } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { toUserDto } from './dto/user.dto.js';
import type { UserListDto } from './dto/user.dto.js';
import { UsersRepository } from './users.repository.js';

@Controller('admin/users')
@RequirePermissions('admin:access')
export class AdminUsersController {
  constructor(@Inject(UsersRepository) private readonly users: UsersRepository) {}

  @Get()
  @RequirePermissions('users:read')
  async list(): Promise<UserListDto> {
    return { users: (await this.users.list()).map(toUserDto) };
  }
}
