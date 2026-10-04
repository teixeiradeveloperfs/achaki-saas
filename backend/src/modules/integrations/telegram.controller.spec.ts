import { afterEach, describe, expect, it, vi } from 'vitest';
import { TelegramController, telegramSchema } from './telegram.controller.js';

describe('Telegram connection registration', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('rejects a refused bot without persisting credentials or leaking its token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ ok: false }) }));
    const db = { insert: vi.fn() };
    const vault = { encrypt: vi.fn() };
    const controller = new TelegramController(db as never, vault as never);
    await expect(controller.save({ user: { id: 'owner' } } as never, { kind: 'bot', token: '123456:private-token' })).rejects.toThrow('Não foi possível validar o bot');
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('persists only encrypted credentials and uses the authenticated owner', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, result: { id: 123, is_bot: true, first_name: 'My bot' } }) }));
    const returning = vi.fn().mockResolvedValue([{ id: 'connection', name: 'My bot' }]);
    const values = vi.fn().mockReturnValue({ onConflictDoUpdate: () => ({ returning }) });
    const db = { insert: () => ({ values }) };
    const controller = new TelegramController(db as never, { encrypt: () => 'ciphertext' } as never);
    const result = await controller.save({ user: { id: 'owner' } } as never, { kind: 'bot', token: '123456:private-token' });
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ userId: 'owner', encryptedCredentials: 'ciphertext', telegramId: '123' }));
    expect(JSON.stringify(result)).not.toContain('private-token');
    expect(returning.mock.calls[0][0]).not.toHaveProperty('encryptedCredentials');
  });

  it('rejects invalid API credentials and tokens before remote calls', () => {
    expect(telegramSchema.safeParse({ kind: 'bot', token: '../evil' }).success).toBe(false);
    expect(telegramSchema.safeParse({ kind: 'account', apiId: -1, apiHash: 'bad', session: 'bad' }).success).toBe(false);
  });
});
