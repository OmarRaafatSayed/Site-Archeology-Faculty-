import { z } from 'zod';

// ─── Excel Import Row ─────────────────────────────────────────────────────────

export const excelResultRowSchema = z.object({
  university_id: z.string().min(5).max(20),
  course_code: z.string().min(2).max(20),
  grade: z.coerce
    .number()
    .min(0, 'Grade must be ≥ 0')
    .max(100, 'Grade must be ≤ 100'),
  semester: z.coerce.number().int().min(1).max(2),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY (e.g. 2024-2025)'),
  grade_letter: z.string().max(2).optional(),
});

export type ExcelResultRow = z.infer<typeof excelResultRowSchema>;

// ─── Query for Admin View ─────────────────────────────────────────────────────

export const listResultsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  studentId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/).optional(),
  semester: z.coerce.number().int().min(1).max(2).optional(),
  isPublished: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  departmentId: z.string().uuid().optional(),
});

export type ListResultsQuery = z.infer<typeof listResultsQuerySchema>;

// ─── Publish Batch ────────────────────────────────────────────────────────────

export const publishBatchSchema = z.object({
  /**
   * نشر نتائج مجموعة من المقررات لعام ودراسي محدد.
   * أو نشر كل شيء لفصل دراسي معين.
   */
  courseIds: z.array(z.string().uuid()).optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/),
  semester: z.coerce.number().int().min(1).max(2),
  departmentId: z.string().uuid().optional(),
});

export type PublishBatchInput = z.infer<typeof publishBatchSchema>;

// ─── Validation Report ────────────────────────────────────────────────────────

export interface ResultImportReport {
  totalRows: number;
  validRows: number;
  errorCount: number;
  errors: Array<{ row: number; university_id?: string; course_code?: string; message: string }>;
  preview: ExcelResultRow[];
  readyToImport: boolean;
  /** عدد النتائج التي ستُحدَّث (موجودة مسبقاً) */
  toUpdate: number;
  /** عدد النتائج الجديدة */
  toCreate: number;
}
