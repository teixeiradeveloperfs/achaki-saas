import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../../modules/rbac/permissions.js';

export const REQUIRED_PERMISSIONS = 'requiredPermissions';

/** All listed permissions are required. On a controller it applies to every route and adds to the route's own. */
export const RequirePermissions = (...permissions: Permission[]) => SetMetadata(REQUIRED_PERMISSIONS, permissions);
