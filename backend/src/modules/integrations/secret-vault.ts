import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ENV } from '../../config/config.module.js';
import type { Env } from '../../config/env.js';

const VERSION = 'v1';

export function encryptSecret(secret: string, material: string) {
  const key = createHash('sha256').update(material, 'utf8').digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join(':');
}

export function decryptSecret(value: string, material: string) {
  const [version, ivValue, tagValue, encryptedValue] = value.split(':');
  if (version !== VERSION || !ivValue || !tagValue || !encryptedValue) throw new Error('Formato de segredo inválido.');
  const key = createHash('sha256').update(material, 'utf8').digest();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivValue, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, 'base64url')), decipher.final()]).toString('utf8');
}

@Injectable()
export class SecretVault {
  constructor(@Inject(ENV) private readonly env: Env) {}

  private key() {
    if (!this.env.SETTINGS_ENCRYPTION_KEY || this.env.SETTINGS_ENCRYPTION_KEY.length < 32) {
      throw new ServiceUnavailableException('Configure SETTINGS_ENCRYPTION_KEY com pelo menos 32 caracteres.');
    }
    return this.env.SETTINGS_ENCRYPTION_KEY;
  }

  encrypt(secret: string) {
    return encryptSecret(secret, this.key());
  }

  decrypt(secret: string) {
    return decryptSecret(secret, this.key());
  }
}
