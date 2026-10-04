import type { Permission } from '../modules/rbac/permissions.js';

/** What the session guard attaches to every authenticated request. */
export type AuthContext = {
  sessionId: string;
  user: { id: string; email: string; name: string };
  roles: string[];
  permissions: Permission[];
};

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}
