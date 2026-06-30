import { z } from 'zod';

export const createProgramSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  nameAr: z.string().min(3).max(255),
  nameEn: z.string().min(3).max(255).optional(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  programType: z.string().max(100),
  durationYears: z.number().int().min(1).max(10).optional().nullable(),
  creditHours: z.number().int().min(1).max(500).optional().nullable(),
  admissionInfoAr: z.string().optional().nullable(),
  admissionInfoEn: z.string().optional().nullable(),
  externalUrl: z.string().url().max(500).optional().nullable(),
  brochureUrl: z.string().url().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().min(0).default(0),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;

export const updateProgramSchema = createProgramSchema.partial().omit({ slug: true });
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

export const listProgramsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  isActive: z.string().optional().transform((v) => v === 'false' ? false : true),
});

export type ListProgramsQuery = z.infer<typeof listProgramsQuerySchema>;
