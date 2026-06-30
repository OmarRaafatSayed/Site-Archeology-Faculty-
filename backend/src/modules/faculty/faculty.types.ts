import { z } from 'zod';
import { FacultyDegree } from '@prisma/client';

/**
 * Schema لإضافة عضو تدريس جديد (Admin)
 */
export const createFacultySchema = z.object({
  departmentId: z.string().uuid('Invalid department ID'),
  nameAr: z.string().min(3, 'Arabic name required').max(255),
  nameEn: z.string().min(3, 'English name required').max(255),
  degree: z.nativeEnum(FacultyDegree),
  specializationAr: z.string().max(500).optional(),
  specializationEn: z.string().max(500).optional(),
  email: z.string().email('Invalid email').optional(),
  bioAr: z.string().max(5000).optional(),
  bioEn: z.string().max(5000).optional(),
  adminRole: z.string().max(100).optional(),
  orderIndex: z.number().int().min(0).default(0),
  // ربط بحساب user موجود (اختياري)
  userId: z.string().uuid().optional(),
});

export type CreateFacultyInput = z.infer<typeof createFacultySchema>;

/**
 * Schema لتعديل عضو (Admin)
 */
export const updateFacultySchema = z.object({
  departmentId: z.string().uuid().optional(),
  nameAr: z.string().min(3).max(255).optional(),
  nameEn: z.string().min(3).max(255).optional(),
  degree: z.nativeEnum(FacultyDegree).optional(),
  specializationAr: z.string().max(500).optional().nullable(),
  specializationEn: z.string().max(500).optional().nullable(),
  email: z.string().email().optional().nullable(),
  bioAr: z.string().max(5000).optional().nullable(),
  bioEn: z.string().max(5000).optional().nullable(),
  adminRole: z.string().max(100).optional().nullable(),
  orderIndex: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;

/**
 * Schema لتعديل بيانات المحاضر الشخصية (Faculty — يعدل بياناته فقط)
 */
export const updateMyProfileSchema = z.object({
  bioAr: z.string().max(5000).optional().nullable(),
  bioEn: z.string().max(5000).optional().nullable(),
  specializationAr: z.string().max(500).optional().nullable(),
  specializationEn: z.string().max(500).optional().nullable(),
  email: z.string().email().optional(),
});

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;

/**
 * Schema لقائمة أعضاء التدريس
 */
export const listFacultyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  departmentId: z.string().uuid().optional(),
  degree: z.nativeEnum(FacultyDegree).optional(),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export type ListFacultyQuery = z.infer<typeof listFacultyQuerySchema>;
