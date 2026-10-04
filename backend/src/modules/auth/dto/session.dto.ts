import type { AuthContext } from '../../../common/auth-context.js';
import type { Permission } from '../../rbac/permissions.js';

/** What the API tells the front-end about the signed-in user. */
export type SessionDto = {
  user: { id: string; email: string; name: string };
  roles: string[];
  permissions: Permission[];
};

/** Explicit mapping, so internal fields (session id, token) can never leak into a response. */
export function toSessionDto(source: Pick<AuthContext, 'user' | 'roles' | 'permissions'>): SessionDto {
  return {
    user: { id: source.user.id, email: source.user.email, name: source.user.name },
    roles: source.roles,
    permissions: source.permissions,
  };
}
