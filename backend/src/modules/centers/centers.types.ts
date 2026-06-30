import { z } from 'zod';

export const createCenterSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  nameAr: z.string().min(3).max(255),
  nameEn: z.string().min(3).max(255).optional(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  directorName: z.string().max(255).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  externalUrl: z.string().url().max(500).optional().nullable(),
  coverImageUrl: z.string().url().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().min(0).default(0),
});

export type CreateCenterInput = z.infer<typeof createCenterSchema>;

export const updateCenterSchema = createCenterSchema.partial().omit({ slug: true });
export type UpdateCenterInput = z.infer<typeof updateCenterSchema>;

export const listCentersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  isActive: z.string().optional().transform((v) => v === 'false' ? false : true),
});

export type ListCentersQuery = z.infer<typeof listCentersQuerySchema>;
