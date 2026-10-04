import { z } from 'zod';

const offerCategory = z.enum(['eletronicos', 'casa', 'moda', 'beleza', 'esportes', 'infantil', 'pet', 'automotivo', 'supermercado', 'livros', 'outros']);

export const adminOffersQuerySchema = z.object({
  scope: z.enum(['all', 'platform', 'users']).default('all'),
  source: z.enum(['shopee', 'mercado_livre', 'amazon']).optional(),
  category: offerCategory.optional(),
  query: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type AdminOffersQueryDto = z.infer<typeof adminOffersQuerySchema>;
