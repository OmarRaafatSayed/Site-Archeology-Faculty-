import { z } from 'zod';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createPublicationSchema = z.object({
  titleAr: z.string().min(5).max(1000),
  titleEn: z.string().min(5).max(1000).optional(),
  abstractAr: z.string().max(5000).optional(),
  abstractEn: z.string().max(5000).optional(),
  journalName: z.string().max(500).optional(),
  publishYear: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  doi: z.string().max(255).optional().nullable(),
  fileUrl: z.string().url().max(500).optional().nullable(),
  isPublished: z.boolean().default(true),
});

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;

// ─── Update ───────────────────────────────────────────────────────────────────

export const updatePublicationSchema = createPublicationSchema.partial();
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;

// ─── List Query ───────────────────────────────────────────────────────────────

export const listPublicationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  facultyId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  year: z.coerce.number().int().min(1900).optional(),
  search: z.string().optional(),
  isPublished: z
    .string()
    .optional()
    .transform((v) => (v === 'false' ? false : true)),
});

export type ListPublicationsQuery = z.infer<typeof listPublicationsQuerySchema>;
