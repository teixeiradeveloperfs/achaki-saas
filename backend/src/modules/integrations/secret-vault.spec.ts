import { decryptSecret, encryptSecret } from './secret-vault.js';

describe('Secret vault', () => {
  it('round-trips a secret without storing it as plaintext', () => {
    const encrypted = encryptSecret('shopee-secret-value', 'a-development-key-with-at-least-32-characters');
    expect(encrypted).not.toContain('shopee-secret-value');
    expect(decryptSecret(encrypted, 'a-development-key-with-at-least-32-characters')).toBe('shopee-secret-value');
  });

  it('rejects decryption with another key', () => {
    const encrypted = encryptSecret('secret', 'first-development-key-with-at-least-32-characters');
    expect(() => decryptSecret(encrypted, 'other-development-key-with-at-least-32-characters')).toThrow();
  });
});
