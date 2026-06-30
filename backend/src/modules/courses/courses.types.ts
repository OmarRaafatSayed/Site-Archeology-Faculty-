import { z } from 'zod';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createCourseSchema = z.object({
  departmentId: z.string().uuid('Invalid department ID'),
  programId: z.string().uuid().optional(),
  facultyId: z.string().uuid().optional(),
  code: z.string().min(2).max(20).toUpperCase(),
  nameAr: z.string().min(3).max(255),
  nameEn: z.string().min(3).max(255),
  descriptionAr: z.string().max(3000).optional(),
  descriptionEn: z.string().max(3000).optional(),
  creditHours: z.coerce.number().int().min(1).max(10),
  semester: z.coerce.number().int().min(1).max(2),
  academicYear: z.coerce.number().int().min(1).max(4),
  prerequisiteId: z.string().uuid().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateCourseSchema = createCourseSchema
  .partial()
  .extend({ isActive: z.boolean().optional() });

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// ─── List Query ───────────────────────────────────────────────────────────────

export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  departmentId: z.string().uuid().optional(),
  programId: z.string().uuid().optional(),
  facultyId: z.string().uuid().optional(),
  semester: z.coerce.number().int().min(1).max(2).optional(),
  academicYear: z.coerce.number().int().min(1).max(4).optional(),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
