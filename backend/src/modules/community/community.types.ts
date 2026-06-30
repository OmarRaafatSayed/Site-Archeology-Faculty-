import { z } from 'zod';
import { CommunityProjectStatus } from '@prisma/client';

export const createProjectSchema = z.object({
  titleAr: z.string().min(5).max(500),
  titleEn: z.string().min(5).max(500).optional(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  status: z.nativeEnum(CommunityProjectStatus).default(CommunityProjectStatus.planning),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  coverImageUrl: z.string().url().max(500).optional().nullable(),
  isPublished: z.boolean().default(false),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(CommunityProjectStatus).optional(),
  published: z.string().optional().transform((v) => v === 'false' ? false : true),
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
