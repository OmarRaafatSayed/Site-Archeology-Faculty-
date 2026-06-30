import { z } from 'zod';

/**
 * Schema لتحديث بيانات قسم (Admin فقط — لا يُنشأ قسم جديد من API)
 * الأقسام الأربعة ثابتة وتُنشأ عبر الـ seed
 */
export const updateDepartmentSchema = z.object({
  nameAr: z.string().min(3).max(255).optional(),
  nameEn: z.string().min(3).max(255).optional(),
  descriptionAr: z.string().max(5000).optional(),
  descriptionEn: z.string().max(5000).optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (#RRGGBB)')
    .optional(),
  coverImageUrl: z.string().url().max(500).optional().nullable(),
  orderIndex: z.number().int().min(0).optional(),
});

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

/**
 * بيانات القسم المُرجعة في الـ API
 */
export interface DepartmentPublic {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  accentColor: string | null;
  coverImageUrl: string | null;
  orderIndex: number;
  facultyCount?: number;
}
