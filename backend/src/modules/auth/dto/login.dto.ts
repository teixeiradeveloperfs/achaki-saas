import { z } from 'zod';
import { MAX_PASSWORD_LENGTH } from '../../../common/security/password.js';

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

export type LoginDto = z.infer<typeof loginSchema>;
