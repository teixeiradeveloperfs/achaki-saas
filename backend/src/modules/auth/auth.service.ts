import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { hashPassword, verifyDummyPassword, verifyPassword } from '../../common/security/password.js';
import { AuditService } from '../audit/audit.service.js';
import type { RequestOrigin } from '../audit/audit.service.js';
import { RbacService } from '../rbac/rbac.service.js';
import { normalizeEmail, UsersRepository } from '../users/users.repository.js';
import { SessionsService } from './sessions.service.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersRepository) private readonly users: UsersRepository,
    @Inject(RbacService) private readonly rbac: RbacService,
    @Inject(SessionsService) private readonly sessions: SessionsService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  async registerUser(name: string, email: string, password: string, origin: RequestOrigin) {
    const passwordHash = await hashPassword(password);
    const user = await this.users.create({ name, email, passwordHash });
    if (!user) throw new ConflictException('Já existe uma conta com este e-mail.');

    const token = await this.sessions.create(user.id, origin);
    const access = await this.rbac.getAccess(user.id);
    await this.audit.record({ action: 'user.registered', userId: user.id, ...origin });
    return { token, user: { id: user.id, email: user.email, name: user.name }, ...access };
  }

  async loginUser(email: string, password: string, origin: RequestOrigin) {
    const fail = async (reason: string, userId?: string): Promise<never> => {
      await this.audit.record({ action: 'user.login.failed', userId, metadata: { reason, email: normalizeEmail(email) }, ...origin });
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    };

    const user = await this.users.findByEmail(email);
    if (!user) {
      await verifyDummyPassword(password);
      return fail('unknown_email');
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await verifyDummyPassword(password);
      return fail('locked', user.id);
    }
    if (!(await verifyPassword(user.passwordHash, password))) {
      await this.users.recordLoginFailure(user.id);
      return fail('wrong_password', user.id);
    }
    if (user.status !== 'active') return fail('blocked', user.id);

    await this.users.recordLoginSuccess(user.id);
    const token = await this.sessions.create(user.id, origin);
    const access = await this.rbac.getAccess(user.id);
    await this.audit.record({ action: 'user.login.succeeded', userId: user.id, ...origin });
    return { token, user: { id: user.id, email: user.email, name: user.name }, ...access };
  }

  async updateProfile(
    userId: string,
    sessionId: string,
    input: { name: string; email: string; currentPassword?: string; newPassword?: string },
    origin: RequestOrigin,
  ) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('Sessão inválida.');

    const email = normalizeEmail(input.email);
    const sensitiveChange = email !== user.email || Boolean(input.newPassword);
    if (sensitiveChange && (!input.currentPassword || !(await verifyPassword(user.passwordHash, input.currentPassword)))) {
      throw new UnauthorizedException('A senha atual está incorreta.');
    }
    if (email !== user.email) {
      const existing = await this.users.findByEmail(email);
      if (existing && existing.id !== userId) throw new ConflictException('Já existe uma conta com este e-mail.');
    }

    const passwordHash = input.newPassword ? await hashPassword(input.newPassword) : undefined;
    const updated = await this.users.updateProfile(userId, { name: input.name, email, passwordHash });
    if (passwordHash) await this.sessions.revokeOthers(userId, sessionId);
    await this.audit.record({
      action: 'user.profile.updated',
      userId,
      metadata: { emailChanged: email !== user.email, passwordChanged: Boolean(passwordHash) },
      ...origin,
    });
    return { id: updated.id, name: updated.name, email: updated.email };
  }

  /**
   * Signs a user into the admin panel. Every failure returns the same error so
   * the response never reveals whether the e-mail exists, is locked or lacks access.
   */
  async loginAdmin(email: string, password: string, origin: RequestOrigin) {
    const fail = async (reason: string, userId?: string): Promise<never> => {
      await this.audit.record({ action: 'admin.login.failed', userId, metadata: { reason, email: normalizeEmail(email) }, ...origin });
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    };

    const user = await this.users.findByEmail(email);
    if (!user) {
      await verifyDummyPassword(password);
      return fail('unknown_email');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await verifyDummyPassword(password);
      return fail('locked', user.id);
    }

    if (!(await verifyPassword(user.passwordHash, password))) {
      await this.users.recordLoginFailure(user.id);
      return fail('wrong_password', user.id);
    }

    if (user.status !== 'active') return fail('blocked', user.id);

    const access = await this.rbac.getAccess(user.id);
    if (!access.permissions.includes('admin:access')) return fail('no_admin_access', user.id);

    await this.users.recordLoginSuccess(user.id);
    const token = await this.sessions.create(user.id, origin);
    await this.audit.record({ action: 'admin.login.succeeded', userId: user.id, ...origin });

    return { token, user: { id: user.id, email: user.email, name: user.name }, ...access };
  }

  async logout(sessionId: string, userId: string, origin: RequestOrigin, action = 'admin.logout') {
    await this.sessions.revoke(sessionId);
    await this.audit.record({ action, userId, ...origin });
  }
}
