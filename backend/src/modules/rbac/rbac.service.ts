import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import { rolePermissions, roles, userRoles } from '../../database/schema.js';
import type { Permission } from './permissions.js';

@Injectable()
export class RbacService {
  constructor(@Inject(DB) private readonly db: Database) {}

  /** Roles of a user and the union of the permissions those roles grant. */
  async getAccess(userId: string): Promise<{ roles: string[]; permissions: Permission[] }> {
    const rows = await this.db
      .select({ role: roles.key, permission: rolePermissions.permissionKey })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    const permissions = rows.map((row) => row.permission).filter((permission) => permission !== null);
    return {
      roles: [...new Set(rows.map((row) => row.role))],
      permissions: [...new Set(permissions)] as Permission[],
    };
  }
}
