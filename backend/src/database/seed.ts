import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { z } from 'zod';
import { hashPassword, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../common/security/password.js';
import { loadEnv } from '../config/env.js';
import { PERMISSIONS, ROLES } from '../modules/rbac/permissions.js';
import { permissions, rolePermissions, roles, userRoles, users } from './schema.js';

// Syncs the permission catalog and built-in roles, and creates the first super admin.
// Run with `npm run db:seed`. Safe to run again: it never changes an existing user.

const adminSchema = z.object({
  ADMIN_EMAIL: z.email().transform((email) => email.trim().toLowerCase()),
  ADMIN_NAME: z.string().min(1).default('Administrador'),
  ADMIN_PASSWORD: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).optional(),
});

const env = loadEnv();
const pool = new Pool({ connectionString: env.DATABASE_URL, max: 1 });
const db = drizzle(pool);

try {
  await db.transaction(async (tx) => {
    for (const [key, description] of Object.entries(PERMISSIONS)) {
      await tx.insert(permissions).values({ key, description }).onConflictDoUpdate({ target: permissions.key, set: { description } });
    }

    for (const [key, role] of Object.entries(ROLES)) {
      const [row] = await tx
        .insert(roles)
        .values({ key, name: role.name })
        .onConflictDoUpdate({ target: roles.key, set: { name: role.name } })
        .returning({ id: roles.id });
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, row.id));
      await tx.insert(rolePermissions).values(role.permissions.map((permissionKey) => ({ roleId: row.id, permissionKey })));
    }
  });
  console.log('Permissions and roles synced.');

  if (process.env.ADMIN_EMAIL) {
    const admin = adminSchema.parse(process.env);
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, admin.ADMIN_EMAIL)).limit(1);

    if (existing) {
      console.log(`User ${admin.ADMIN_EMAIL} already exists; left unchanged.`);
    } else {
      const password = admin.ADMIN_PASSWORD ?? randomBytes(18).toString('base64url');
      const passwordHash = await hashPassword(password);
      await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({ email: admin.ADMIN_EMAIL, name: admin.ADMIN_NAME, passwordHash })
          .returning({ id: users.id });
        const [role] = await tx.select({ id: roles.id }).from(roles).where(eq(roles.key, 'super_admin')).limit(1);
        await tx.insert(userRoles).values({ userId: user.id, roleId: role.id });
      });
      console.log(`Super admin created: ${admin.ADMIN_EMAIL}`);
      if (!admin.ADMIN_PASSWORD) console.log(`Generated password (shown only once): ${password}`);
    }
  } else {
    console.log('ADMIN_EMAIL not set; no user created.');
  }
} finally {
  await pool.end();
}
