import * as XLSX from 'xlsx';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import {
  ExcelResultRow,
  ResultImportReport,
  ListResultsQuery,
  PublishBatchInput,
  excelResultRowSchema,
} from './results.types';

// ─── Helper: حساب grade_letter من الدرجة ──────────────────────────────────────
function calculateGradeLetter(grade: number): string {
  if (grade >= 90) return 'A+';
  if (grade >= 85) return 'A';
  if (grade >= 80) return 'B+';
  if (grade >= 75) return 'B';
  if (grade >= 70) return 'C+';
  if (grade >= 65) return 'C';
  if (grade >= 60) return 'D+';
  if (grade >= 50) return 'D';
  return 'F';
}

const RESULT_SELECT = {
  id: true,
  semester: true,
  academicYear: true,
  grade: true,
  gradeLetter: true,
  isPublished: true,
  updatedAt: true,
  student: {
    select: { id: true, universityId: true, nameAr: true, nameEn: true, academicYear: true },
  },
  course: {
    select: { id: true, code: true, nameAr: true, nameEn: true, creditHours: true },
  },
} as const;

export class ResultsService {

  // ─── GET /api/results (Admin) ─────────────────────────────────────────────
  async listResults(query: ListResultsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      ...(query.studentId && { studentId: query.studentId }),
      ...(query.courseId && { courseId: query.courseId }),
      ...(query.academicYear && { academicYear: query.academicYear }),
      ...(query.semester && { semester: query.semester }),
      ...(query.isPublished !== undefined && { isPublished: query.isPublished }),
      ...(query.departmentId && {
        course: { departmentId: query.departmentId },
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.examResult.findMany({
        where,
        select: RESULT_SELECT,
        skip,
        take,
        orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }],
      }),
      prisma.examResult.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  // ─── POST /api/results/import — Phase 1: Validate ─────────────────────────
  async validateResultsExcel(buffer: Buffer): Promise<ResultImportReport> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<string, unknown>[];

    const errors: ResultImportReport['errors'] = [];
    const validRows: ExcelResultRow[] = [];
    let toUpdate = 0;
    let toCreate = 0;

    // جلب lookup tables مرة واحدة للكفاءة
    const [students, courses] = await Promise.all([
      prisma.student.findMany({ select: { id: true, universityId: true } }),
      prisma.course.findMany({ select: { id: true, code: true } }),
    ]);
    const studentMap = new Map(students.map((s) => [s.universityId, s.id]));
    const courseMap = new Map(courses.map((c) => [c.code.toUpperCase(), c.id]));

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const parsed = excelResultRowSchema.safeParse(rows[i]);

      if (!parsed.success) {
        errors.push({
          row: rowNum,
          message: parsed.error.errors[0].message,
        });
        continue;
      }

      const row = parsed.data;

      // التحقق من وجود الطالب
      const studentId = studentMap.get(row.university_id);
      if (!studentId) {
        errors.push({
          row: rowNum,
          university_id: row.university_id,
          message: `رقم الجامعة "${row.university_id}" غير موجود`,
        });
        continue;
      }

      // التحقق من وجود المقرر
      const courseId = courseMap.get(row.course_code.toUpperCase());
      if (!courseId) {
        errors.push({
          row: rowNum,
          course_code: row.course_code,
          message: `كود المقرر "${row.course_code}" غير موجود`,
        });
        continue;
      }

      // هل النتيجة موجودة مسبقاً؟
      const existing = await prisma.examResult.findUnique({
        where: {
          studentId_courseId_semester_academicYear: {
            studentId,
            courseId,
            semester: row.semester,
            academicYear: row.academic_year,
          },
        },
      });
      existing ? toUpdate++ : toCreate++;

      validRows.push(row);
    }

    return {
      totalRows: rows.length,
      validRows: validRows.length,
      errorCount: errors.length,
      errors,
      preview: validRows.slice(0, 5),
      readyToImport: errors.length === 0,
      toUpdate,
      toCreate,
    };
  }

  // ─── POST /api/results/import/confirm — Phase 2: Execute ─────────────────
  async importResultsFromExcel(buffer: Buffer): Promise<{ imported: number; updated: number; failed: number }> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<string, unknown>[];

    const [students, courses] = await Promise.all([
      prisma.student.findMany({ select: { id: true, universityId: true } }),
      prisma.course.findMany({ select: { id: true, code: true } }),
    ]);
    const studentMap = new Map(students.map((s) => [s.universityId, s.id]));
    const courseMap = new Map(courses.map((c) => [c.code.toUpperCase(), c.id]));

    let imported = 0;
    let updated = 0;
    let failed = 0;

    for (const rawRow of rows) {
      try {
        const parsed = excelResultRowSchema.safeParse(rawRow);
        if (!parsed.success) { failed++; continue; }

        const row = parsed.data;
        const studentId = studentMap.get(row.university_id);
        const courseId = courseMap.get(row.course_code.toUpperCase());
        if (!studentId || !courseId) { failed++; continue; }

        const gradeLetter = row.grade_letter ?? calculateGradeLetter(row.grade);

        const uniqueKey = {
          studentId,
          courseId,
          semester: row.semester,
          academicYear: row.academic_year,
        };

        // upsert — يُحدِّث إن وُجد، يُنشئ إن لم يوجد
        const result = await prisma.examResult.upsert({
          where: { studentId_courseId_semester_academicYear: uniqueKey },
          update: { grade: row.grade, gradeLetter },
          create: { ...uniqueKey, grade: row.grade, gradeLetter, isPublished: false },
        });

        // نحسب هل كانت موجودة أم جديدة
        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          imported++;
        } else {
          updated++;
        }
      } catch {
        failed++;
      }
    }

    return { imported, updated, failed };
  }

  // ─── PUT /api/results/:id/publish — نشر نتيجة واحدة ─────────────────────
  async publishResult(id: string): Promise<void> {
    const result = await prisma.examResult.findUnique({ where: { id } });
    if (!result) throw new NotFoundError('Result');
    await prisma.examResult.update({ where: { id }, data: { isPublished: true } });
  }

  // ─── PUT /api/results/publish-batch — نشر مجموعة نتائج ──────────────────
  async publishBatch(input: PublishBatchInput): Promise<{ published: number }> {
    const where = {
      academicYear: input.academicYear,
      semester: input.semester,
      isPublished: false,
      ...(input.courseIds?.length && { courseId: { in: input.courseIds } }),
      ...(input.departmentId && { course: { departmentId: input.departmentId } }),
    };

    const { count } = await prisma.examResult.updateMany({
      where,
      data: { isPublished: true },
    });

    return { published: count };
  }

  // ─── PUT /api/results/unpublish-batch — سحب النشر ────────────────────────
  async unpublishBatch(input: PublishBatchInput): Promise<{ unpublished: number }> {
    const where = {
      academicYear: input.academicYear,
      semester: input.semester,
      isPublished: true,
      ...(input.courseIds?.length && { courseId: { in: input.courseIds } }),
      ...(input.departmentId && { course: { departmentId: input.departmentId } }),
    };

    const { count } = await prisma.examResult.updateMany({
      where,
      data: { isPublished: false },
    });

    return { unpublished: count };
  }
}

export const resultsService = new ResultsService();
