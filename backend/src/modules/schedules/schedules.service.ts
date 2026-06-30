import * as XLSX from 'xlsx';
import fs from 'fs';
import { prisma } from '../../config/database';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import {
  CreateScheduleInput,
  UpdateScheduleInput,
  ListSchedulesQuery,
  CreateExamScheduleInput,
  UpdateExamScheduleInput,
  ListExamSchedulesQuery,
  ExcelScheduleRow,
  ExcelExamRow,
  excelScheduleRowSchema,
  excelExamRowSchema,
} from './schedules.types';
import { ExcelImportReport } from '../students/students.types';

// ─── Helper: "09:00" → Date(1970,0,1,9,0) ────────────────────────────────────
function parseTime(t: string): Date {
  const [h, m] = t.split(':').map(Number);
  return new Date(1970, 0, 1, h, m, 0, 0);
}

const SCHEDULE_INCLUDE = {
  course: { select: { id: true, code: true, nameAr: true, nameEn: true, creditHours: true } },
  faculty: { select: { id: true, nameAr: true, nameEn: true } },
} as const;

const EXAM_INCLUDE = {
  course: {
    select: {
      id: true, code: true, nameAr: true, nameEn: true,
      department: { select: { id: true, slug: true, nameAr: true } },
    },
  },
} as const;

export class SchedulesService {

  // ══════════════════════════════════════════════════════════════════════════
  //  CLASS SCHEDULES
  // ══════════════════════════════════════════════════════════════════════════

  /** GET /api/schedules — مصفى بالقسم / الفرقة / الفصل / السنة الأكاديمية */
  async listSchedules(query: ListSchedulesQuery) {
    // نبني الـ where بناءً على query params
    let departmentId = query.departmentId;

    // لو جاء slug بدل UUID — نحله
    if (!departmentId && query.departmentSlug) {
      const dept = await prisma.department.findUnique({ where: { slug: query.departmentSlug } });
      if (!dept) throw new NotFoundError('Department');
      departmentId = dept.id;
    }

    const where = {
      ...(query.year && { academicYear: query.year }),
      ...(query.semester && { semester: query.semester }),
      ...(query.facultyId && { facultyId: query.facultyId }),
      ...(departmentId && {
        course: {
          departmentId,
          ...(query.academicYear && { academicYear: query.academicYear }),
        },
      }),
      ...(!departmentId && query.academicYear && {
        course: { academicYear: query.academicYear },
      }),
    };

    return prisma.classSchedule.findMany({
      where,
      include: SCHEDULE_INCLUDE,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  /** POST /api/schedules */
  async createSchedule(input: CreateScheduleInput) {
    const course = await prisma.course.findUnique({ where: { id: input.courseId } });
    if (!course) throw new NotFoundError('Course');

    if (input.facultyId) {
      const fm = await prisma.facultyMember.findUnique({ where: { id: input.facultyId } });
      if (!fm) throw new NotFoundError('Faculty member');
    }

    return prisma.classSchedule.create({
      data: {
        courseId: input.courseId,
        facultyId: input.facultyId ?? null,
        dayOfWeek: input.dayOfWeek,
        startTime: parseTime(input.startTime),
        endTime: parseTime(input.endTime),
        location: input.location ?? null,
        semester: input.semester,
        academicYear: input.academicYear,
      },
      include: SCHEDULE_INCLUDE,
    });
  }

  /** PUT /api/schedules/:id */
  async updateSchedule(id: string, input: UpdateScheduleInput) {
    const existing = await prisma.classSchedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Schedule entry');

    return prisma.classSchedule.update({
      where: { id },
      data: {
        ...(input.courseId !== undefined && { courseId: input.courseId }),
        ...(input.facultyId !== undefined && { facultyId: input.facultyId }),
        ...(input.dayOfWeek !== undefined && { dayOfWeek: input.dayOfWeek }),
        ...(input.startTime !== undefined && { startTime: parseTime(input.startTime) }),
        ...(input.endTime !== undefined && { endTime: parseTime(input.endTime) }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.semester !== undefined && { semester: input.semester }),
        ...(input.academicYear !== undefined && { academicYear: input.academicYear }),
      },
      include: SCHEDULE_INCLUDE,
    });
  }

  /** DELETE /api/schedules/:id */
  async deleteSchedule(id: string): Promise<void> {
    const existing = await prisma.classSchedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Schedule entry');
    await prisma.classSchedule.delete({ where: { id } });
  }

  // ─── Excel Import (2-phase) ────────────────────────────────────────────────

  /** Phase 1 — Validate */
  async validateScheduleExcel(buffer: Buffer): Promise<ExcelImportReport<ExcelScheduleRow>> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<string, unknown>[];

    const errors: Array<{ row: number; message: string }> = [];
    const validRows: ExcelScheduleRow[] = [];

    // جلب كل course codes مرة واحدة
    const courses = await prisma.course.findMany({ select: { id: true, code: true } });
    const courseMap = new Map(courses.map((c) => [c.code.toUpperCase(), c.id]));

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const parsed = excelScheduleRowSchema.safeParse(rows[i]);

      if (!parsed.success) {
        errors.push({ row: rowNum, message: parsed.error.errors[0].message });
        continue;
      }

      const row = parsed.data;
      if (!courseMap.has(row.course_code.toUpperCase())) {
        errors.push({ row: rowNum, message: `كود المقرر "${row.course_code}" غير موجود` });
        continue;
      }

      validRows.push(row);
    }

    return {
      totalRows: rows.length,
      validRows: validRows.length,
      errorCount: errors.length,
      errors,
      preview: validRows.slice(0, 5),
      readyToImport: errors.length === 0,
    };
  }

  /** Phase 2 — Confirm Import */
  async importScheduleFromExcel(buffer: Buffer): Promise<{ imported: number; failed: number }> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<string, unknown>[];

    const courses = await prisma.course.findMany({ select: { id: true, code: true } });
    const courseMap = new Map(courses.map((c) => [c.code.toUpperCase(), c.id]));

    const faculty = await prisma.facultyMember.findMany({ select: { id: true, email: true } });
    const facultyMap = new Map(faculty.filter(f => f.email).map((f) => [f.email!, f.id]));

    let imported = 0;
    let failed = 0;

    for (const rawRow of rows) {
      try {
        const parsed = excelScheduleRowSchema.safeParse(rawRow);
        if (!parsed.success) { failed++; continue; }

        const row = parsed.data;
        const courseId = courseMap.get(row.course_code.toUpperCase());
        if (!courseId) { failed++; continue; }

        const facultyId = row.faculty_email ? facultyMap.get(row.faculty_email) ?? null : null;

        await prisma.classSchedule.create({
          data: {
            courseId,
            facultyId,
            dayOfWeek: row.day_of_week,
            startTime: parseTime(row.start_time),
            endTime: parseTime(row.end_time),
            location: row.location ?? null,
            semester: row.semester,
            academicYear: row.academic_year,
          },
        });
        imported++;
      } catch {
        failed++;
      }
    }

    return { imported, failed };
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAM SCHEDULES
  // ══════════════════════════════════════════════════════════════════════════

  /** GET /api/exam-schedules — مصفى بالقسم / الفصل / الامتحانات القادمة */
  async listExamSchedules(query: ListExamSchedulesQuery) {
    let departmentId = query.departmentId;

    if (!departmentId && query.departmentSlug) {
      const dept = await prisma.department.findUnique({ where: { slug: query.departmentSlug } });
      if (!dept) throw new NotFoundError('Department');
      departmentId = dept.id;
    }

    const courseWhere = {
      ...(departmentId && { departmentId }),
      ...(query.academicYear && { academicYear: query.academicYear }),
    };

    const where = {
      ...(query.year && { academicYear: query.year }),
      ...(query.semester && { semester: query.semester }),
      ...(query.upcoming && { examDate: { gte: new Date() } }),
      ...(query.fromDate && { examDate: { gte: new Date(query.fromDate) } }),
      ...(Object.keys(courseWhere).length > 0 && { course: courseWhere }),
    };

    return prisma.examSchedule.findMany({
      where,
      include: EXAM_INCLUDE,
      orderBy: [{ examDate: 'asc' }, { startTime: 'asc' }],
    });
  }

  /** POST /api/exam-schedules */
  async createExamSchedule(input: CreateExamScheduleInput) {
    const course = await prisma.course.findUnique({ where: { id: input.courseId } });
    if (!course) throw new NotFoundError('Course');

    return prisma.examSchedule.create({
      data: {
        courseId: input.courseId,
        examDate: new Date(input.examDate),
        startTime: parseTime(input.startTime),
        endTime: parseTime(input.endTime),
        location: input.location ?? null,
        examType: input.examType ?? null,
        semester: input.semester,
        academicYear: input.academicYear,
      },
      include: EXAM_INCLUDE,
    });
  }

  /** PUT /api/exam-schedules/:id */
  async updateExamSchedule(id: string, input: UpdateExamScheduleInput) {
    const existing = await prisma.examSchedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Exam schedule');

    return prisma.examSchedule.update({
      where: { id },
      data: {
        ...(input.courseId !== undefined && { courseId: input.courseId }),
        ...(input.examDate !== undefined && { examDate: new Date(input.examDate) }),
        ...(input.startTime !== undefined && { startTime: parseTime(input.startTime) }),
        ...(input.endTime !== undefined && { endTime: parseTime(input.endTime) }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.examType !== undefined && { examType: input.examType }),
        ...(input.semester !== undefined && { semester: input.semester }),
        ...(input.academicYear !== undefined && { academicYear: input.academicYear }),
      },
      include: EXAM_INCLUDE,
    });
  }

  /** DELETE /api/exam-schedules/:id */
  async deleteExamSchedule(id: string): Promise<void> {
    const existing = await prisma.examSchedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Exam schedule');
    await prisma.examSchedule.delete({ where: { id } });
  }

  /** Phase 1 — Validate Exam Excel */
  async validateExamExcel(buffer: Buffer): Promise<ExcelImportReport<ExcelExamRow>> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<string, unknown>[];

    const errors: Array<{ row: number; message: string }> = [];
    const validRows: ExcelExamRow[] = [];

    const courses = await prisma.course.findMany({ select: { id: true, code: true } });
    const courseMap = new Map(courses.map((c) => [c.code.toUpperCase(), c.id]));

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const parsed = excelExamRowSchema.safeParse(rows[i]);

      if (!parsed.success) {
        errors.push({ row: rowNum, message: parsed.error.errors[0].message });
        continue;
      }

      const row = parsed.data;
      if (!courseMap.has(row.course_code.toUpperCase())) {
        errors.push({ row: rowNum, message: `كود المقرر "${row.course_code}" غير موجود` });
        continue;
      }

      // التحقق من أن التاريخ في المستقبل
      if (new Date(row.exam_date) < new Date()) {
        errors.push({ row: rowNum, message: `تاريخ الامتحان ${row.exam_date} في الماضي` });
        continue;
      }

      validRows.push(row);
    }

    return {
      totalRows: rows.length,
      validRows: validRows.length,
      errorCount: errors.length,
      errors,
      preview: validRows.slice(0, 5),
      readyToImport: errors.length === 0,
    };
  }

  /** Phase 2 — Confirm Exam Import */
  async importExamFromExcel(buffer: Buffer): Promise<{ imported: number; failed: number }> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<string, unknown>[];

    const courses = await prisma.course.findMany({ select: { id: true, code: true } });
    const courseMap = new Map(courses.map((c) => [c.code.toUpperCase(), c.id]));

    let imported = 0;
    let failed = 0;

    for (const rawRow of rows) {
      try {
        const parsed = excelExamRowSchema.safeParse(rawRow);
        if (!parsed.success) { failed++; continue; }

        const row = parsed.data;
        const courseId = courseMap.get(row.course_code.toUpperCase());
        if (!courseId) { failed++; continue; }

        await prisma.examSchedule.create({
          data: {
            courseId,
            examDate: new Date(row.exam_date),
            startTime: parseTime(row.start_time),
            endTime: parseTime(row.end_time),
            location: row.location ?? null,
            examType: row.exam_type ?? null,
            semester: row.semester,
            academicYear: row.academic_year,
          },
        });
        imported++;
      } catch {
        failed++;
      }
    }

    return { imported, failed };
  }
}

export const schedulesService = new SchedulesService();
