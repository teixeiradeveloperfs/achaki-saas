import { Inject, Injectable } from '@nestjs/common';
import { DB } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import { auditLogs } from '../../database/schema.js';

export type RequestOrigin = { ip?: string; userAgent?: string };

export type AuditEntry = RequestOrigin & {
  action: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

/** Append-only trail of security-relevant events. Never store secrets in metadata. */
@Injectable()
export class AuditService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async record(entry: AuditEntry) {
    await this.db.insert(auditLogs).values(entry);
  }
}
