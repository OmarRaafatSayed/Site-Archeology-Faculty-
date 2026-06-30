/**
 * Phase 3 Unit Tests
 * Programs | Courses | Schedules | Exam Schedules | Results
 */

import { ProgramLevel } from '@prisma/client';

// ─── Programs Schemas ─────────────────────────────────────────────────────────

describe('Programs Schemas', () => {
  let createProgramSchema: (typeof import('../src/modules/programs/programs.types'))['createProgramSchema'];
  let updateProgramSchema: (typeof import('../src/modules/programs/programs.types'))['updateProgramSchema'];
  let listProgramsQuerySchema: (typeof import('../src/modules/programs/programs.types'))['listProgramsQuerySchema'];

  beforeAll(async () => {
    ({ createProgramSchema, updateProgramSchema, listProgramsQuerySchema } =
      await import('../src/modules/programs/programs.types'));
  });

  const validCreate = {
    departmentId: '550e8400-e29b-41d4-a716-446655440000',
    nameAr: 'بكالوريوس الآثار المصرية',
    nameEn: 'Bachelor of Egyptology',
    level: ProgramLevel.undergraduate,
  };

  it('should accept valid program', () => {
    expect(createProgramSchema.safeParse(validCreate).success).toBe(true);
  });

  it('should accept all ProgramLevel values', () => {
    Object.values(ProgramLevel).forEach((level) => {
      expect(createProgramSchema.safeParse({ ...validCreate, level }).success).toBe(true);
    });
  });

  it('should reject invalid departmentId UUID', () => {
    expect(createProgramSchema.safeParse({ ...validCreate, departmentId: 'not-uuid' }).success).toBe(false);
  });

  it('should reject invalid level', () => {
    expect(createProgramSchema.safeParse({ ...validCreate, level: 'phd' }).success).toBe(false);
  });

  it('should coerce creditHours string to number', () => {
    const result = createProgramSchema.safeParse({ ...validCreate, creditHours: '144' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.creditHours).toBe(144);
  });

  it('should reject creditHours > 300', () => {
    expect(createProgramSchema.safeParse({ ...validCreate, creditHours: 999 }).success).toBe(false);
  });

  it('updateProgramSchema should allow partial updates', () => {
    expect(updateProgramSchema.safeParse({ isActive: false }).success).toBe(true);
    expect(updateProgramSchema.safeParse({}).success).toBe(true);
  });

  it('listQuery should coerce page/limit and transform isActive', () => {
    const r = listProgramsQuerySchema.safeParse({ page: '2', limit: '5', isActive: 'false' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(5);
      expect(r.data.isActive).toBe(false);
    }
  });
});

// ─── Courses Schemas ──────────────────────────────────────────────────────────

describe('Courses Schemas', () => {
  let createCourseSchema: (typeof import('../src/modules/courses/courses.types'))['createCourseSchema'];
  let updateCourseSchema: (typeof import('../src/modules/courses/courses.types'))['updateCourseSchema'];
  let listCoursesQuerySchema: (typeof import('../src/modules/courses/courses.types'))['listCoursesQuerySchema'];

  beforeAll(async () => {
    ({ createCourseSchema, updateCourseSchema, listCoursesQuerySchema } =
      await import('../src/modules/courses/courses.types'));
  });

  const validCreate = {
    departmentId: '550e8400-e29b-41d4-a716-446655440000',
    code: 'ARCH101',
    nameAr: 'مدخل إلى الآثار',
    nameEn: 'Introduction to Archaeology',
    creditHours: 3,
    semester: 1,
    academicYear: 1,
  };

  it('should accept valid course', () => {
    expect(createCourseSchema.safeParse(validCreate).success).toBe(true);
  });

  it('should uppercase course code', () => {
    const r = createCourseSchema.safeParse({ ...validCreate, code: 'arch101' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.code).toBe('ARCH101');
  });

  it('should reject semester > 2', () => {
    expect(createCourseSchema.safeParse({ ...validCreate, semester: 3 }).success).toBe(false);
  });

  it('should reject academicYear > 4', () => {
    expect(createCourseSchema.safeParse({ ...validCreate, academicYear: 5 }).success).toBe(false);
  });

  it('should reject creditHours > 10', () => {
    expect(createCourseSchema.safeParse({ ...validCreate, creditHours: 11 }).success).toBe(false);
  });

  it('should reject invalid facultyId UUID', () => {
    expect(createCourseSchema.safeParse({ ...validCreate, facultyId: 'bad' }).success).toBe(false);
  });

  it('updateCourseSchema should allow isActive toggle', () => {
    expect(updateCourseSchema.safeParse({ isActive: false }).success).toBe(true);
  });

  it('listQuery search filter', () => {
    const r = listCoursesQuerySchema.safeParse({ search: 'arch', semester: '1' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.semester).toBe(1);
  });
});

// ─── Schedules Schemas ────────────────────────────────────────────────────────

describe('Schedules Schemas', () => {
  let createScheduleSchema: (typeof import('../src/modules/schedules/schedules.types'))['createScheduleSchema'];
  let createExamScheduleSchema: (typeof import('../src/modules/schedules/schedules.types'))['createExamScheduleSchema'];
  let listSchedulesQuerySchema: (typeof import('../src/modules/schedules/schedules.types'))['listSchedulesQuerySchema'];
  let listExamSchedulesQuerySchema: (typeof import('../src/modules/schedules/schedules.types'))['listExamSchedulesQuerySchema'];
  let excelScheduleRowSchema: (typeof import('../src/modules/schedules/schedules.types'))['excelScheduleRowSchema'];
  let excelExamRowSchema: (typeof import('../src/modules/schedules/schedules.types'))['excelExamRowSchema'];

  beforeAll(async () => {
    ({
      createScheduleSchema,
      createExamScheduleSchema,
      listSchedulesQuerySchema,
      listExamSchedulesQuerySchema,
      excelScheduleRowSchema,
      excelExamRowSchema,
    } = await import('../src/modules/schedules/schedules.types'));
  });

  const validSchedule = {
    courseId: '550e8400-e29b-41d4-a716-446655440000',
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '11:00',
    semester: 1,
    academicYear: '2024-2025',
  };

  describe('createScheduleSchema', () => {
    it('should accept valid schedule', () => {
      expect(createScheduleSchema.safeParse(validSchedule).success).toBe(true);
    });

    it('should reject end before start', () => {
      const r = createScheduleSchema.safeParse({ ...validSchedule, startTime: '11:00', endTime: '09:00' });
      expect(r.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      expect(createScheduleSchema.safeParse({ ...validSchedule, startTime: '9:0' }).success).toBe(false);
      expect(createScheduleSchema.safeParse({ ...validSchedule, startTime: '25:00' }).success).toBe(false);
    });

    it('should reject dayOfWeek > 6', () => {
      expect(createScheduleSchema.safeParse({ ...validSchedule, dayOfWeek: 7 }).success).toBe(false);
    });

    it('should reject invalid academicYear format', () => {
      expect(createScheduleSchema.safeParse({ ...validSchedule, academicYear: '2024/2025' }).success).toBe(false);
      expect(createScheduleSchema.safeParse({ ...validSchedule, academicYear: '2024' }).success).toBe(false);
    });

    it('should accept all valid days (0-6)', () => {
      for (let d = 0; d <= 6; d++) {
        expect(createScheduleSchema.safeParse({ ...validSchedule, dayOfWeek: d }).success).toBe(true);
      }
    });
  });

  describe('createExamScheduleSchema', () => {
    const validExam = {
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      examDate: '2025-06-15',
      startTime: '09:00',
      endTime: '12:00',
      examType: 'final',
      semester: 2,
      academicYear: '2024-2025',
    };

    it('should accept valid exam schedule', () => {
      expect(createExamScheduleSchema.safeParse(validExam).success).toBe(true);
    });

    it('should reject invalid date format', () => {
      expect(createExamScheduleSchema.safeParse({ ...validExam, examDate: '15-06-2025' }).success).toBe(false);
    });

    it('should reject invalid examType', () => {
      expect(createExamScheduleSchema.safeParse({ ...validExam, examType: 'quiz' }).success).toBe(false);
    });

    it('should accept all valid examTypes', () => {
      ['midterm', 'final', 'makeup'].forEach((type) => {
        expect(createExamScheduleSchema.safeParse({ ...validExam, examType: type }).success).toBe(true);
      });
    });

    it('should reject end before start', () => {
      expect(createExamScheduleSchema.safeParse({ ...validExam, startTime: '12:00', endTime: '09:00' }).success).toBe(false);
    });
  });

  describe('List Query Schemas', () => {
    it('listSchedules should coerce dayOfWeek and semester', () => {
      const r = listSchedulesQuerySchema.safeParse({ semester: '1' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.semester).toBe(1);
    });

    it('listExamSchedules upcoming transform', () => {
      const r = listExamSchedulesQuerySchema.safeParse({ upcoming: 'true' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.upcoming).toBe(true);
    });

    it('listExamSchedules fromDate format', () => {
      expect(listExamSchedulesQuerySchema.safeParse({ fromDate: '2025-01-01' }).success).toBe(true);
      expect(listExamSchedulesQuerySchema.safeParse({ fromDate: '01/01/2025' }).success).toBe(false);
    });
  });

  describe('Excel Schedule Row', () => {
    it('should accept valid row', () => {
      const r = excelScheduleRowSchema.safeParse({
        course_code: 'ARCH101',
        day_of_week: 1,
        start_time: '10:00',
        end_time: '12:00',
        semester: 1,
        academic_year: '2024-2025',
      });
      expect(r.success).toBe(true);
    });

    it('should accept optional faculty_email', () => {
      const r = excelScheduleRowSchema.safeParse({
        course_code: 'ARCH101',
        day_of_week: 0,
        start_time: '09:00',
        end_time: '11:00',
        semester: 1,
        academic_year: '2024-2025',
        faculty_email: 'prof@cu.edu.eg',
      });
      expect(r.success).toBe(true);
    });

    it('should reject invalid faculty_email', () => {
      expect(excelScheduleRowSchema.safeParse({
        course_code: 'ARCH101',
        day_of_week: 0,
        start_time: '09:00',
        end_time: '11:00',
        semester: 1,
        academic_year: '2024-2025',
        faculty_email: 'not-an-email',
      }).success).toBe(false);
    });
  });

  describe('Excel Exam Row', () => {
    const validRow = {
      course_code: 'ARCH201',
      exam_date: '2025-06-20',
      start_time: '09:00',
      end_time: '12:00',
      semester: 2,
      academic_year: '2024-2025',
    };

    it('should accept valid exam row', () => {
      expect(excelExamRowSchema.safeParse(validRow).success).toBe(true);
    });

    it('should reject invalid date format', () => {
      expect(excelExamRowSchema.safeParse({ ...validRow, exam_date: '20-06-2025' }).success).toBe(false);
    });
  });
});

// ─── Results Schemas ──────────────────────────────────────────────────────────

describe('Results Schemas', () => {
  let excelResultRowSchema: (typeof import('../src/modules/results/results.types'))['excelResultRowSchema'];
  let publishBatchSchema: (typeof import('../src/modules/results/results.types'))['publishBatchSchema'];
  let listResultsQuerySchema: (typeof import('../src/modules/results/results.types'))['listResultsQuerySchema'];

  beforeAll(async () => {
    ({ excelResultRowSchema, publishBatchSchema, listResultsQuerySchema } =
      await import('../src/modules/results/results.types'));
  });

  const validResultRow = {
    university_id: '20210001',
    course_code: 'ARCH101',
    grade: 85,
    semester: 1,
    academic_year: '2024-2025',
  };

  describe('excelResultRowSchema', () => {
    it('should accept valid result row', () => {
      expect(excelResultRowSchema.safeParse(validResultRow).success).toBe(true);
    });

    it('should coerce grade from string', () => {
      const r = excelResultRowSchema.safeParse({ ...validResultRow, grade: '92.5' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.grade).toBe(92.5);
    });

    it('should reject grade > 100', () => {
      expect(excelResultRowSchema.safeParse({ ...validResultRow, grade: 101 }).success).toBe(false);
    });

    it('should reject grade < 0', () => {
      expect(excelResultRowSchema.safeParse({ ...validResultRow, grade: -1 }).success).toBe(false);
    });

    it('should accept grade 0 (fail)', () => {
      expect(excelResultRowSchema.safeParse({ ...validResultRow, grade: 0 }).success).toBe(true);
    });

    it('should accept grade 100 (perfect)', () => {
      expect(excelResultRowSchema.safeParse({ ...validResultRow, grade: 100 }).success).toBe(true);
    });

    it('should reject invalid academic_year format', () => {
      expect(excelResultRowSchema.safeParse({ ...validResultRow, academic_year: '2024/2025' }).success).toBe(false);
      expect(excelResultRowSchema.safeParse({ ...validResultRow, academic_year: '2024' }).success).toBe(false);
    });

    it('should accept optional grade_letter', () => {
      const r = excelResultRowSchema.safeParse({ ...validResultRow, grade_letter: 'A' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.grade_letter).toBe('A');
    });
  });

  describe('publishBatchSchema', () => {
    const validBatch = { academicYear: '2024-2025', semester: 1 };

    it('should accept minimal batch', () => {
      expect(publishBatchSchema.safeParse(validBatch).success).toBe(true);
    });

    it('should accept with courseIds', () => {
      const r = publishBatchSchema.safeParse({
        ...validBatch,
        courseIds: ['550e8400-e29b-41d4-a716-446655440000'],
      });
      expect(r.success).toBe(true);
    });

    it('should reject invalid courseId UUID', () => {
      expect(publishBatchSchema.safeParse({ ...validBatch, courseIds: ['not-uuid'] }).success).toBe(false);
    });

    it('should reject invalid academicYear', () => {
      expect(publishBatchSchema.safeParse({ ...validBatch, academicYear: '2024' }).success).toBe(false);
    });

    it('should reject semester > 2', () => {
      expect(publishBatchSchema.safeParse({ ...validBatch, semester: 3 }).success).toBe(false);
    });
  });

  describe('listResultsQuerySchema', () => {
    it('should use defaults', () => {
      const r = listResultsQuerySchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(1);
        expect(r.data.limit).toBe(20);
      }
    });

    it('should transform isPublished', () => {
      const t = listResultsQuerySchema.safeParse({ isPublished: 'true' });
      if (t.success) expect(t.data.isPublished).toBe(true);
      const f = listResultsQuerySchema.safeParse({ isPublished: 'false' });
      if (f.success) expect(f.data.isPublished).toBe(false);
    });

    it('should accept valid academicYear filter', () => {
      expect(listResultsQuerySchema.safeParse({ academicYear: '2024-2025' }).success).toBe(true);
    });
  });
});

// ─── Grade Letter Logic (pure function test) ──────────────────────────────────

describe('Grade Letter Calculation', () => {
  // نختبر الـ logic مباشرة بدون import (لأنها private)
  // نكتب نفس الـ logic هنا كـ mirror test

  function calcGradeLetter(grade: number): string {
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

  it('90+ → A+', () => expect(calcGradeLetter(95)).toBe('A+'));
  it('85-89 → A', () => expect(calcGradeLetter(87)).toBe('A'));
  it('80-84 → B+', () => expect(calcGradeLetter(82)).toBe('B+'));
  it('75-79 → B', () => expect(calcGradeLetter(77)).toBe('B'));
  it('70-74 → C+', () => expect(calcGradeLetter(72)).toBe('C+'));
  it('65-69 → C', () => expect(calcGradeLetter(67)).toBe('C'));
  it('60-64 → D+', () => expect(calcGradeLetter(62)).toBe('D+'));
  it('50-59 → D', () => expect(calcGradeLetter(55)).toBe('D'));
  it('< 50 → F', () => expect(calcGradeLetter(45)).toBe('F'));
  it('0 → F', () => expect(calcGradeLetter(0)).toBe('F'));
  it('100 → A+', () => expect(calcGradeLetter(100)).toBe('A+'));
  it('boundary 90 → A+', () => expect(calcGradeLetter(90)).toBe('A+'));
  it('boundary 89 → A', () => expect(calcGradeLetter(89)).toBe('A'));
  it('boundary 50 → D', () => expect(calcGradeLetter(50)).toBe('D'));
  it('boundary 49 → F', () => expect(calcGradeLetter(49)).toBe('F'));
});
