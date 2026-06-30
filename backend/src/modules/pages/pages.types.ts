import { z } from 'zod';

export const updatePageSchema = z.object({
  titleAr: z.string().min(3).max(500).optional(),
  titleEn: z.string().min(3).max(500).optional(),
  contentAr: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  metaDescriptionAr: z.string().max(500).optional().nullable(),
  metaDescriptionEn: z.string().max(500).optional().nullable(),
});

export type UpdatePageInput = z.infer<typeof updatePageSchema>;
