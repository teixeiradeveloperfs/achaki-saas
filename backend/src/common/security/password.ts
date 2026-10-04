import { hash, verify } from '@node-rs/argon2';

/** Argon2id (the library default) with the OWASP-recommended minimum cost. */
const OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

export const MIN_PASSWORD_LENGTH = 12;
/** Upper bound so a huge body cannot be used to burn CPU in the hash. */
export const MAX_PASSWORD_LENGTH = 200;

export function hashPassword(password: string) {
  return hash(password, OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string) {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

let dummyHash: Promise<string> | undefined;

/** Spends the same time as a real verification, so unknown e-mails are not detectable by timing. */
export async function verifyDummyPassword(password: string) {
  dummyHash ??= hashPassword('dummy-password-for-timing');
  await verifyPassword(await dummyHash, password);
}
