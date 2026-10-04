import { z } from 'zod';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../../../common/security/password.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export type RegisterDto = z.infer<typeof registerSchema>;
