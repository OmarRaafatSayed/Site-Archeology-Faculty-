import { z } from 'zod';
import { ProgramLevel } from '@prisma/client';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createProgramSchema = z.object({
  departmentId: z.string().uuid('Invalid department ID'),
  nameAr: z.string().min(3).max(255),
  nameEn: z.string().min(3).max(255),
  level: z.nativeEnum(ProgramLevel),
  descriptionAr: z.string().max(5000).optional(),
  descriptionEn: z.string().max(5000).optional(),
  creditHours: z.coerce.number().int().min(1).max(300).optional(),
  durationYears: z.coerce.number().int().min(1).max(10).optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateProgramSchema = createProgramSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

// ─── List Query ───────────────────────────────────────────────────────────────

export const listProgramsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  departmentId: z.string().uuid().optional(),
  level: z.nativeEnum(ProgramLevel).optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export type ListProgramsQuery = z.infer<typeof listProgramsQuerySchema>;
