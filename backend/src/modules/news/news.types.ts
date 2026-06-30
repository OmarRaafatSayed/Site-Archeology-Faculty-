import { z } from 'zod';
import { NewsCategory } from '@prisma/client';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createNewsSchema = z.object({
  titleAr: z.string().min(5).max(500),
  titleEn: z.string().min(5).max(500).optional(),
  bodyAr: z.string().min(20),
  bodyEn: z.string().min(20).optional(),
  category: z.nativeEnum(NewsCategory).default(NewsCategory.general),
  coverImage: z.string().url().max(500).optional().nullable(),
  publishedAt: z.string().datetime({ offset: true }).optional(),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateNewsSchema = createNewsSchema.partial();

export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;

// ─── List Query ───────────────────────────────────────────────────────────────

export const listNewsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  category: z.nativeEnum(NewsCategory).optional(),
  published: z
    .string()
    .optional()
    .transform((v) => (v === 'false' ? false : true)), // default: published only
  search: z.string().optional(),
  lang: z.enum(['ar', 'en']).default('ar'),
});

export type ListNewsQuery = z.infer<typeof listNewsQuerySchema>;
