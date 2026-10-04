import { z } from 'zod';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../../../common/security/password.js';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  currentPassword: z.string().min(1).max(MAX_PASSWORD_LENGTH).optional(),
  newPassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
