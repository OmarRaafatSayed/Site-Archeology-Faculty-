import { z } from 'zod';
import { LinkCategory } from '@prisma/client';

export const createLinkSchema = z.object({
  category: z.nativeEnum(LinkCategory),
  nameAr: z.string().min(3).max(255),
  nameEn: z.string().min(3).max(255).optional(),
  url: z.string().url().max(500),
  iconName: z.string().max(100).optional().nullable(),
  openNewTab: z.boolean().default(true),
  orderIndex: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export const updateLinkSchema = createLinkSchema.partial();
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

export const listLinksQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  category: z.nativeEnum(LinkCategory).optional(),
  isActive: z.string().optional().transform((v) => v === 'false' ? false : true),
});

export type ListLinksQuery = z.infer<typeof listLinksQuerySchema>;
