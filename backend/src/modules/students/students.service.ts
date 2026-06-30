import * as XLSX from 'xlsx';
import { prisma } from '../../config/database';
import { hashPassword } from '../../shared/utils/password';
import { NotFoundError } from '../../shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '../../shared/utils/pagination';
import {
  UpdateMyProfileInput,
  ListStudentsQuery,
  ExcelStudentRow,
  ExcelImportReport,
  excelStudentRowSchema,
} from './students.types';

/** الحقول العامة للطالب (بدون بيانات حساسة) */
const STUDENT_SELECT = {
  id: true,
  universityId: true,
  nameAr: true,
  nameEn: true,
  academicYear: true,
  enrollmentYear: true,
  status: true,
  createdAt: true,
  department: {
    select: { id: true, slug: true, nameAr: true, nameEn: true, accentColor: true },
  },
} as const;

export class StudentsService {
  /**
   * GET /api/students/me (Student)
   * بيانات الطالب الحالي من الـ JWT
   */
  async getMyProfile(userId: string) {
    const student = await prisma.student.findFirst({
      where: { userId },
      include: {
        department: {
          select: { id: true, slug: true, nameAr: true, nameEn: true, accentColor: true },
        },
      },
    });

    if (!student) throw new NotFoundError('Student profile');
    return student;
  }

  /**
   * PUT /api/students/me (Student)
   * الطالب يعدل بياناته المسموح بها فقط
   */
  async updateMyProfile(userId: string, input: UpdateMyProfileInput) {
    const student = await prisma.student.findFirst({ where: { userId } });
    if (!student) throw new NotFoundError('Student profile');

    return prisma.student.update({
      where: { id: student.id },
      data: {
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
      },
      include: {
        department: {
          select: { id: true, slug: true, nameAr: true, nameEn: true },
        },
      },
    });
  }

  /**
   * GET /api/students/me/results (Student)
   * نتائج الطالب الحالي — فقط المنشورة
   */
  async getMyResults(userId: string, page = 1, limit = 20) {
    const student = await prisma.student.findFirst({ where: { userId } });
    if (!student) throw new NotFoundError('Student profile');

    const { skip, take } = parsePagination({ page, limit });

    const [items, total] = await prisma.$transaction([
      prisma.examResult.findMany({
        where: { studentId: student.id, isPublished: true },
        select: {
          id: true,
          semester: true,
          academicYear: true,
          grade: true,
          gradeLetter: true,
          course: { select: { id: true, code: true, nameAr: true, nameEn: true, creditHours: true } },
        },
        skip,
        take,
        orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }],
      }),
      prisma.examResult.count({ where: { studentId: student.id, isPublished: true } }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  /**
   * GET /api/students/me/schedule (Student)
   * جدول الطالب الدراسي الأسبوعي للفصل الحالي
   * يُجلب بناءً على القسم والفرقة
   */
  async getMySchedule(userId: string) {
    const student = await prisma.student.findFirst({
      where: { userId },
      include: { department: true },
    });
    if (!student) throw new NotFoundError('Student profile');

    // حساب السنة الأكاديمية الحالية (تبدأ في سبتمبر)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    // السنة الأكاديمية تبدأ في سبتمبر (شهر 9)
    const academicYear = currentMonth >= 9 
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;

    return prisma.classSchedule.findMany({
      where: {
        course: {
          departmentId: student.departmentId,
          academicYear: student.academicYear,
        },
        academicYear,
      },
      include: {
        course: { select: { id: true, code: true, nameAr: true, nameEn: true } },
        faculty: { select: { id: true, nameAr: true, nameEn: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * GET /api/students/me/exams (Student)
   * جدول امتحانات الطالب الحالي
   */
  async getMyExams(userId: string) {
    const student = await prisma.student.findFirst({
      where: { userId },
      include: { department: true },
    });
    if (!student) throw new NotFoundError('Student profile');

    // حساب السنة الأكاديمية الحالية (تبدأ في سبتمبر)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    // السنة الأكاديمية تبدأ في سبتمبر (شهر 9)
    const academicYear = currentMonth >= 9 
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;

    return prisma.examSchedule.findMany({
      where: {
        course: {
          departmentId: student.departmentId,
          academicYear: student.academicYear,
        },
        academicYear,
        examDate: { gte: new Date() }, // الامتحانات القادمة فقط
      },
      include: {
        course: { select: { id: true, code: true, nameAr: true, nameEn: true } },
      },
      orderBy: { examDate: 'asc' },
    });
  }

  /**
   * GET /api/students (Admin)
   * قائمة الطلاب مع pagination + فلترة
   */
  async listStudents(query: ListStudentsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {
      ...(query.departmentId && { departmentId: query.departmentId }),
      ...(query.academicYear && { academicYear: query.academicYear }),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { nameAr: { contains: query.search, mode: 'insensitive' as const } },
          { nameEn: { contains: query.search, mode: 'insensitive' as const } },
          { universityId: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        select: STUDENT_SELECT,
        skip,
        take,
        orderBy: [{ academicYear: 'asc' }, { nameAr: 'asc' }],
      }),
      prisma.student.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  /**
   * POST /api/students/import (Admin)
   * المرحلة 1 — Validate Excel وإرجاع تقرير
   *
   * يُنشئ user + student لكل صف صحيح بعد الموافقة
   */
  async validateStudentsExcel(buffer: Buffer): Promise<ExcelImportReport<ExcelStudentRow>> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

    const errors: Array<{ row: number; message: string }> = [];
    const validRows: ExcelStudentRow[] = [];

    // جلب الأقسام مرة واحدة للكفاءة
    const departments = await prisma.department.findMany({
      select: { id: true, slug: true },
    });
    const deptMap = new Map(departments.map((d) => [d.slug, d.id]));

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const parsed = excelStudentRowSchema.safeParse(rows[i]);

      if (!parsed.success) {
        errors.push({ row: rowNum, message: parsed.error.errors[0].message });
        continue;
      }

      const row = parsed.data as ExcelStudentRow;

      // التحقق من القسم
      if (!deptMap.has(row.department_slug)) {
        errors.push({ row: rowNum, message: `القسم "${row.department_slug}" غير موجود` });
        continue;
      }

      // التحقق من عدم تكرار رقم الجامعة
      const existsStudent = await prisma.student.findUnique({
        where: { universityId: row.university_id },
      });
      if (existsStudent) {
        errors.push({ row: rowNum, message: `رقم الجامعة ${row.university_id} موجود بالفعل` });
        continue;
      }

      // التحقق من عدم تكرار البريد الإلكتروني (critical fix)
      const existsEmail = await prisma.user.findUnique({
        where: { email: row.email },
      });
      if (existsEmail) {
        errors.push({ row: rowNum, message: `البريد الإلكتروني ${row.email} موجود بالفعل` });
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

  /**
   * POST /api/students/import/confirm (Admin)
   * المرحلة 2 — تنفيذ الاستيراد بعد الموافقة
   */
  async importStudentsFromExcel(buffer: Buffer): Promise<{ imported: number; failed: number }> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

    const departments = await prisma.department.findMany({
      select: { id: true, slug: true },
    });
    const deptMap = new Map(departments.map((d) => [d.slug, d.id]));

    let imported = 0;
    let failed = 0;

    for (const rawRow of rows) {
      try {
      const parsed = excelStudentRowSchema.safeParse(rawRow);
        if (!parsed.success) { 
          console.error(`[Student Import] Validation failed for row:`, parsed.error.errors[0].message);
          failed++; 
          continue; 
        }

        const row = parsed.data;
        const departmentId = deptMap.get(row.department_slug);
        if (!departmentId) { 
          console.error(`[Student Import] Department not found: ${row.department_slug}`);
          failed++; 
          continue; 
        }

        const passwordHash = await hashPassword(row.password);

        // إنشاء user + student في transaction واحدة
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email: row.email,
              universityId: row.university_id,
              passwordHash,
              role: 'student',
            },
          });

          await tx.student.create({
            data: {
              userId: user.id,
              universityId: row.university_id,
              nameAr: row.name_ar,
              nameEn: row.name_en ?? null,
              departmentId,
              academicYear: row.academic_year,
              enrollmentYear: row.enrollment_year,
            },
          });
        });

        imported++;
      } catch (error) {
        console.error(`[Student Import] Failed to import student:`, {
          email: (rawRow as any).email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failed++;
      }
    }

    console.log(`[Student Import] Completed: ${imported} imported, ${failed} failed`);
    return { imported, failed };
  }
}

export const studentsService = new StudentsService();
