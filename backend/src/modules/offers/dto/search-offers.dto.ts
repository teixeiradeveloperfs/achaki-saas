import { z } from 'zod';

export const searchOffersSchema = z.object({
  keyword: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  listType: z.coerce.number().int().min(0).max(2).transform((value) => value as 0 | 1 | 2).default(0),
  sortType: z.coerce.number().int().min(1).max(5).transform((value) => value as 1 | 2 | 3 | 4 | 5).default(1),
});

export type SearchOffersDto = z.infer<typeof searchOffersSchema>;
