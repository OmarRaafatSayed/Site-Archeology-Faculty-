import { z } from 'zod';
import { StudentStatus } from '@prisma/client';

/**
 * Schema لتعديل بيانات الاتصال الخاصة بالطالب (Student فقط)
 */
export const updateMyProfileSchema = z.object({
  nameEn: z.string().min(3).max(255).optional(),
  // الطالب يغير فقط بيانات الاتصال — لا القسم ولا الفرقة
});

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;

/**
 * Schema لقائمة الطلاب (Admin)
 */
export const listStudentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  departmentId: z.string().uuid().optional(),
  academicYear: z.coerce.number().min(1).max(4).optional(),
  status: z.nativeEnum(StudentStatus).optional(),
  search: z.string().optional(),
});

export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;

/**
 * Schema لصف واحد في ملف Excel الاستيراد
 * يُستخدم فقط داخل الـ service للتحقق من البيانات
 */
export const excelStudentRowSchema = z.object({
  university_id: z.string().min(5).max(20),
  name_ar: z.string().min(3).max(255),
  name_en: z.string().max(255).optional(),
  department_slug: z.string().min(3).max(100),
  academic_year: z.coerce.number().min(1).max(4),
  enrollment_year: z.coerce.number().min(2000).max(2100),
  email: z.string().email(),
  password: z.string().min(8),
});

export type ExcelStudentRow = z.infer<typeof excelStudentRowSchema>;

/**
 * نتيجة الـ Excel Validation Report
 */
export interface ExcelImportReport<T> {
  totalRows: number;
  validRows: number;
  errorCount: number;
  errors: Array<{ row: number; message: string }>;
  preview: T[];
  readyToImport: boolean;
}
