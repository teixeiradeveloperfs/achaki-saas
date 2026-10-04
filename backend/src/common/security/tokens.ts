import { createHash, randomBytes } from 'node:crypto';

/** 256-bit random token, safe to put in a cookie. */
export function generateToken() {
  return randomBytes(32).toString('base64url');
}

/** Tokens are high-entropy, so a plain SHA-256 is enough to store them safely. */
export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
