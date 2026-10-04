import { loadEnv } from './env.js';

const valid = { DATABASE_URL: 'postgres://user:pass@localhost:5432/db', CORS_ORIGINS: 'http://a.test, http://b.test' };

describe('loadEnv', () => {
  it('applies defaults and splits the origin list', () => {
    const env = loadEnv(valid);
    expect(env.CORS_ORIGINS).toEqual(['http://a.test', 'http://b.test']);
    expect(env.SESSION_TTL_HOURS).toBe(12);
    expect(env.TRUST_PROXY).toBe(false);
  });

  it('fails fast when a required variable is missing', () => {
    expect(() => loadEnv({ CORS_ORIGINS: 'http://a.test' })).toThrow(/DATABASE_URL/);
  });

  it('rejects a database url that is not postgres', () => {
    expect(() => loadEnv({ ...valid, DATABASE_URL: 'mysql://localhost/db' })).toThrow(/DATABASE_URL/);
  });

  it('treats an empty settings encryption key as absent', () => {
    expect(loadEnv({ ...valid, SETTINGS_ENCRYPTION_KEY: '' }).SETTINGS_ENCRYPTION_KEY).toBeUndefined();
  });
});
