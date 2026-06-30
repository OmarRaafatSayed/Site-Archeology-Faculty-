import { z } from 'zod';

// ─── Helper: time string "HH:MM" ──────────────────────────────────────────────
const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format (e.g. 09:00)');

// يحوّل "09:00" إلى Date object بقيمة تمثل الـ time فقط
const timeToDate = (t: string): Date => {
  const [h, m] = t.split(':').map(Number);
  const d = new Date(1970, 0, 1, h, m, 0, 0);
  return d;
};

// ─── Class Schedule ───────────────────────────────────────────────────────────

const createScheduleBaseSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  facultyId: z.string().uuid().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6), // 0=الأحد...6=السبت
  startTime: timeString,
  endTime: timeString,
  location: z.string().max(255).optional(),
  semester: z.coerce.number().int().min(1).max(2),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY (e.g. 2024-2025)'),
});

export const createScheduleSchema = createScheduleBaseSchema.refine(
  (d) => timeToDate(d.endTime) > timeToDate(d.startTime),
  { message: 'End time must be after start time', path: ['endTime'] },
);

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

export const updateScheduleSchema = createScheduleBaseSchema
  .partial()
  .refine(
    (d) => {
      if (d.startTime && d.endTime) return timeToDate(d.endTime) > timeToDate(d.startTime);
      return true;
    },
    { message: 'End time must be after start time', path: ['endTime'] },
  );

export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

/** Query params لـ GET /api/schedules */
export const listSchedulesQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  departmentSlug: z.string().optional(),
  academicYear: z.coerce.number().int().min(1).max(4).optional(), // سنة الدراسة (1-4)
  semester: z.coerce.number().int().min(1).max(2).optional(),
  year: z.string().regex(/^\d{4}-\d{4}$/).optional(), // السنة الأكاديمية "2024-2025"
  facultyId: z.string().uuid().optional(),
});

export type ListSchedulesQuery = z.infer<typeof listSchedulesQuerySchema>;

// ─── Excel Import Row ─────────────────────────────────────────────────────────

export const excelScheduleRowSchema = z.object({
  course_code: z.string().min(2).max(20),
  day_of_week: z.coerce.number().int().min(0).max(6),
  start_time: timeString,
  end_time: timeString,
  location: z.string().max(255).optional(),
  semester: z.coerce.number().int().min(1).max(2),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/),
  faculty_email: z.string().email().optional(),
});

export type ExcelScheduleRow = z.infer<typeof excelScheduleRowSchema>;

// ─── Exam Schedule ────────────────────────────────────────────────────────────

const createExamScheduleBaseSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format: YYYY-MM-DD'),
  startTime: timeString,
  endTime: timeString,
  location: z.string().max(255).optional(),
  examType: z.enum(['midterm', 'final', 'makeup']).optional(),
  semester: z.coerce.number().int().min(1).max(2),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY'),
});

export const createExamScheduleSchema = createExamScheduleBaseSchema.refine(
  (d) => timeToDate(d.endTime) > timeToDate(d.startTime),
  { message: 'End time must be after start time', path: ['endTime'] },
);

export type CreateExamScheduleInput = z.infer<typeof createExamScheduleSchema>;

export const updateExamScheduleSchema = createExamScheduleBaseSchema.partial();
export type UpdateExamScheduleInput = z.infer<typeof updateExamScheduleSchema>;

/** Query params لـ GET /api/exam-schedules */
export const listExamSchedulesQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  departmentSlug: z.string().optional(),
  academicYear: z.coerce.number().int().min(1).max(4).optional(),
  semester: z.coerce.number().int().min(1).max(2).optional(),
  year: z.string().regex(/^\d{4}-\d{4}$/).optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  upcoming: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export type ListExamSchedulesQuery = z.infer<typeof listExamSchedulesQuerySchema>;

// ─── Excel Exam Import Row ────────────────────────────────────────────────────

export const excelExamRowSchema = z.object({
  course_code: z.string().min(2).max(20),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: timeString,
  end_time: timeString,
  location: z.string().max(255).optional(),
  exam_type: z.enum(['midterm', 'final', 'makeup']).optional(),
  semester: z.coerce.number().int().min(1).max(2),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/),
});

export type ExcelExamRow = z.infer<typeof excelExamRowSchema>;
