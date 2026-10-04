import { z } from 'zod';

export const shopeeSettingsSchema = z.object({
  appId: z.string().trim().min(1).max(200),
  secret: z.string().trim().min(8).max(1_000).optional(),
  enabled: z.boolean(),
});

export type ShopeeSettingsDto = z.infer<typeof shopeeSettingsSchema>;
