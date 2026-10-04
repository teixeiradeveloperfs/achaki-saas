import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post, BadRequestException } from '@nestjs/common';
import { RouteConfig } from '@nestjs/platform-fastify';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Api, TelegramClient } from 'teleproto';
import { StringSession } from 'teleproto/sessions';
import { LogLevel } from 'teleproto/extensions/Logger';
import { DB } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import { telegramConnections } from '../../database/schema.js';
import { CurrentAuth } from '../../common/decorators/current-auth.decorator.js';
import type { AuthContext } from '../../common/auth-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { SecretVault } from './secret-vault.js';

export const telegramSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('bot'), token: z.string().trim().regex(/^\d{5,20}:[A-Za-z0-9_-]{20,100}$/) }),
  z.object({ kind: z.literal('account'), apiId: z.number().int().positive().max(2147483647), apiHash: z.string().trim().regex(/^[a-fA-F0-9]{32}$/), session: z.string().trim().min(100).max(2048) }),
]);
type Credentials = z.infer<typeof telegramSchema>;
const publicFields = { id: telegramConnections.id, kind: telegramConnections.kind, telegramId: telegramConnections.telegramId, name: telegramConnections.name, username: telegramConnections.username, verifiedAt: telegramConnections.verifiedAt };
// Never trust the host embedded in an imported session: use the library's production DCs.
const DC: Record<number, string> = { 1: '149.154.175.50', 2: '149.154.167.51', 3: '149.154.175.100', 4: '149.154.167.91', 5: '149.154.171.5' };

@Controller('integrations/telegram')
export class TelegramController {
  constructor(@Inject(DB) private readonly db: Database, @Inject(SecretVault) private readonly vault: SecretVault) {}

  @Get()
  list(@CurrentAuth() auth: AuthContext) {
    return this.db.select(publicFields).from(telegramConnections).where(eq(telegramConnections.userId, auth.user.id));
  }

  private async verify(input: Credentials) {
    if (input.kind === 'bot') {
      try {
        const response = await fetch(`https://api.telegram.org/bot${input.token}/getMe`, { signal: AbortSignal.timeout(15000), redirect: 'error' });
        const body = await response.json() as { ok: boolean; result?: { id: number; is_bot: boolean; first_name: string; username?: string } };
        if (!response.ok || !body.ok || !body.result?.is_bot) throw new Error();
        return { telegramId: String(body.result.id), name: body.result.first_name, username: body.result.username ?? null };
      } catch {
        throw new BadRequestException('Não foi possível validar o bot. Confira o token e tente novamente.');
      }
    }
    let client: TelegramClient | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const session = new StringSession(input.session);
      if (!DC[session.dcId] || !session.authKey) throw new Error();
      session.setDC(session.dcId, DC[session.dcId], 443);
      client = new TelegramClient(session, input.apiId, input.apiHash, { connectionRetries: 1, requestRetries: 1, autoReconnect: false, floodSleepThreshold: 0 });
      client.setLogLevel(LogLevel.NONE);
      const active = client;
      const me = await Promise.race([
        (async () => { await active.connect(); return active.getMe(); })(),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 20000); }),
      ]);
      if (!(me instanceof Api.User) || me.bot || me.deleted) throw new Error();
      input.session = session.save();
      return { telegramId: me.id.toString(), name: [me.firstName, me.lastName].filter(Boolean).join(' ') || 'Conta Telegram', username: me.username ?? null };
    } catch {
      throw new BadRequestException('Não foi possível validar a conta. Use uma StringSession ativa e o API ID/Hash correspondentes.');
    } finally {
      if (timer) clearTimeout(timer);
      await client?.destroy().catch(() => undefined);
    }
  }

  @Post()
  @RouteConfig({ rateLimit: { max: 5, timeWindow: '1 minute' } })
  async save(@CurrentAuth() auth: AuthContext, @Body(new ZodValidationPipe(telegramSchema)) input: Credentials) {
    // Validate the encryption configuration before accessing Telegram.
    this.vault.encrypt('check');
    const identity = await this.verify(input);
    const values = { userId: auth.user.id, kind: input.kind, ...identity, encryptedCredentials: this.vault.encrypt(JSON.stringify(input)), verifiedAt: new Date() };
    const [row] = await this.db.insert(telegramConnections).values(values).onConflictDoUpdate({ target: [telegramConnections.userId, telegramConnections.telegramId], set: values }).returning(publicFields);
    return row;
  }

  @Delete(':id')
  async remove(@CurrentAuth() auth: AuthContext, @Param('id', ParseUUIDPipe) id: string) {
    await this.db.delete(telegramConnections).where(and(eq(telegramConnections.id, id), eq(telegramConnections.userId, auth.user.id)));
    return { ok: true };
  }
}
