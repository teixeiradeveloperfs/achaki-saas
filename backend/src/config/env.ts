import { z } from 'zod';

const optionalSecret = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }).default('redis://localhost:6379'),
  /** Comma-separated list of browser origins allowed to call the API with cookies. */
  CORS_ORIGINS: z
    .string()
    .min(1)
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(12),
  /** Enable only when the API sits behind a reverse proxy that sets X-Forwarded-For. */
  TRUST_PROXY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  /** Encrypts integration secrets stored in Postgres; required before saving credentials in Admin. */
  SETTINGS_ENCRYPTION_KEY: optionalSecret,
  SHOPEE_AFFILIATE_API_URL: z.url().default('https://open-api.affiliate.shopee.com.br/graphql'),
  SHOPEE_AFFILIATE_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(15_000),
  /** Background refresh cadence for each enabled user integration. */
  OFFERS_SYNC_INTERVAL_MINUTES: z.coerce.number().int().min(5).max(1_440).default(15),
});

export type Env = z.infer<typeof envSchema>;

/** Validates the environment once and fails fast with a readable message. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment configuration:\n${issues.join('\n')}`);
  }
  return result.data;
}
