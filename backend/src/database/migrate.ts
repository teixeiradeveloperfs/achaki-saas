import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { loadEnv } from '../config/env.js';

// Applies the SQL migrations in backend/drizzle. Run with `npm run db:migrate`.
const env = loadEnv();
const pool = new Pool({ connectionString: env.DATABASE_URL, max: 1 });

try {
  await migrate(drizzle(pool), { migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)) });
  console.log('Migrations applied.');
} finally {
  await pool.end();
}
