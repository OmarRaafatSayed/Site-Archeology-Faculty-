/**
 * Phase 2 Unit Tests
 * Departments | Faculty | Students
 * كل الـ tests هنا independent — بتختبر logic بدون DB أو Redis
 */

import { parsePagination, buildPaginatedResponse } from '../src/shared/utils/pagination';
import { FacultyDegree, StudentStatus, UserRole } from '@prisma/client';

// ─── Zod Schemas Validation ───────────────────────────────────────────────────

describe('Department Schemas', () => {
  // dynamic import عشان نتجنب تحميل الـ env validation في الـ config
  let updateDepartmentSchema: (typeof import('../src/modules/departments/departments.types'))['updateDepartmentSchema'];

  beforeAll(async () => {
    ({ updateDepartmentSchema } = await import('../src/modules/departments/departments.types'));
  });

  it('should accept valid department update', () => {
    const result = updateDepartmentSchema.safeParse({
      nameAr: 'قسم الآثار المصرية',
      nameEn: 'Department of Egyptology',
      accentColor: '#C9A84C',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid hex color', () => {
    const result = updateDepartmentSchema.safeParse({ accentColor: 'red' });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toContain('hex color');
  });

  it('should accept valid URL for coverImageUrl', () => {
    const result = updateDepartmentSchema.safeParse({
      coverImageUrl: 'https://example.com/image.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('should accept null for coverImageUrl (clearing the image)', () => {
    const result = updateDepartmentSchema.safeParse({ coverImageUrl: null });
    expect(result.success).toBe(true);
  });

  it('should reject invalid URL for coverImageUrl', () => {
    const result = updateDepartmentSchema.safeParse({ coverImageUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('should accept empty object (no fields required)', () => {
    const result = updateDepartmentSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ─── Faculty Schemas ──────────────────────────────────────────────────────────

describe('Faculty Schemas', () => {
  let createFacultySchema: (typeof import('../src/modules/faculty/faculty.types'))['createFacultySchema'];
  let updateFacultySchema: (typeof import('../src/modules/faculty/faculty.types'))['updateFacultySchema'];
  let updateMyProfileSchema: (typeof import('../src/modules/faculty/faculty.types'))['updateMyProfileSchema'];
  let listFacultyQuerySchema: (typeof import('../src/modules/faculty/faculty.types'))['listFacultyQuerySchema'];

  beforeAll(async () => {
    ({
      createFacultySchema,
      updateFacultySchema,
      updateMyProfileSchema,
      listFacultyQuerySchema,
    } = await import('../src/modules/faculty/faculty.types'));
  });

  describe('createFacultySchema', () => {
    const validPayload = {
      departmentId: '550e8400-e29b-41d4-a716-446655440000',
      nameAr: 'د. أحمد محمد',
      nameEn: 'Dr. Ahmed Mohamed',
      degree: FacultyDegree.lecturer,
    };

    it('should accept valid faculty data', () => {
      const result = createFacultySchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for departmentId', () => {
      const result = createFacultySchema.safeParse({ ...validPayload, departmentId: 'not-uuid' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid degree enum', () => {
      const result = createFacultySchema.safeParse({ ...validPayload, degree: 'director' });
      expect(result.success).toBe(false);
    });

    it('should require nameAr min 3 chars', () => {
      const result = createFacultySchema.safeParse({ ...validPayload, nameAr: 'أح' });
      expect(result.success).toBe(false);
    });

    it('should accept all valid degree values', () => {
      const degrees = Object.values(FacultyDegree);
      degrees.forEach((degree) => {
        const result = createFacultySchema.safeParse({ ...validPayload, degree });
        expect(result.success).toBe(true);
      });
    });

    it('should default orderIndex to 0', () => {
      const result = createFacultySchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.orderIndex).toBe(0);
    });
  });

  describe('updateFacultySchema', () => {
    it('should accept partial updates', () => {
      const result = updateFacultySchema.safeParse({ degree: FacultyDegree.professor });
      expect(result.success).toBe(true);
    });

    it('should accept null for nullable fields', () => {
      const result = updateFacultySchema.safeParse({
        adminRole: null,
        email: null,
        bioAr: null,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = updateFacultySchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
    });

    it('should accept isActive boolean', () => {
      const result = updateFacultySchema.safeParse({ isActive: false });
      expect(result.success).toBe(true);
    });
  });

  describe('updateMyProfileSchema (Faculty self-update)', () => {
    it('should accept valid profile update', () => {
      const result = updateMyProfileSchema.safeParse({
        bioAr: 'سيرة ذاتية تفصيلية',
        bioEn: 'Detailed biography',
        email: 'faculty@cu.edu.eg',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = updateMyProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = updateMyProfileSchema.safeParse({ email: 'bad-email' });
      expect(result.success).toBe(false);
    });
  });

  describe('listFacultyQuerySchema', () => {
    it('should use defaults for empty query', () => {
      const result = listFacultyQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should coerce string numbers', () => {
      const result = listFacultyQuerySchema.safeParse({ page: '3', limit: '10' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should transform isActive string to boolean', () => {
      const trueResult = listFacultyQuerySchema.safeParse({ isActive: 'true' });
      const falseResult = listFacultyQuerySchema.safeParse({ isActive: 'false' });
      if (trueResult.success) expect(trueResult.data.isActive).toBe(true);
      if (falseResult.success) expect(falseResult.data.isActive).toBe(false);
    });

    it('should accept valid degree filter', () => {
      const result = listFacultyQuerySchema.safeParse({ degree: FacultyDegree.professor });
      expect(result.success).toBe(true);
    });
  });
});

// ─── Student Schemas ──────────────────────────────────────────────────────────

describe('Student Schemas', () => {
  let updateMyProfileSchema: (typeof import('../src/modules/students/students.types'))['updateMyProfileSchema'];
  let listStudentsQuerySchema: (typeof import('../src/modules/students/students.types'))['listStudentsQuerySchema'];
  let excelStudentRowSchema: (typeof import('../src/modules/students/students.types'))['excelStudentRowSchema'];

  beforeAll(async () => {
    ({
      updateMyProfileSchema,
      listStudentsQuerySchema,
      excelStudentRowSchema,
    } = await import('../src/modules/students/students.types'));
  });

  describe('updateMyProfileSchema (Student self-update)', () => {
    it('should accept nameEn update', () => {
      const result = updateMyProfileSchema.safeParse({ nameEn: 'John Smith' });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = updateMyProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('listStudentsQuerySchema', () => {
    it('should use defaults', () => {
      const result = listStudentsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should accept valid status filter', () => {
      const result = listStudentsQuerySchema.safeParse({ status: StudentStatus.active });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = listStudentsQuerySchema.safeParse({ status: 'unknown' });
      expect(result.success).toBe(false);
    });

    it('should reject academicYear out of range', () => {
      const result = listStudentsQuerySchema.safeParse({ academicYear: '5' });
      expect(result.success).toBe(false);
    });

    it('should accept academicYear 1-4', () => {
      for (let y = 1; y <= 4; y++) {
        const result = listStudentsQuerySchema.safeParse({ academicYear: String(y) });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('excelStudentRowSchema (Excel Import Validation)', () => {
    const validRow = {
      university_id: '20210001',
      name_ar: 'أحمد علي محمد',
      department_slug: 'egyptology',
      academic_year: 2,
      enrollment_year: 2021,
      email: 'student@cu.edu.eg',
      password: 'Secure@123',
    };

    it('should accept valid student row', () => {
      const result = excelStudentRowSchema.safeParse(validRow);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = excelStudentRowSchema.safeParse({ ...validRow, email: 'bad' });
      expect(result.success).toBe(false);
    });

    it('should reject weak password (less than 8 chars)', () => {
      const result = excelStudentRowSchema.safeParse({ ...validRow, password: '123' });
      expect(result.success).toBe(false);
    });

    it('should coerce string academic_year', () => {
      const result = excelStudentRowSchema.safeParse({ ...validRow, academic_year: '3' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.academic_year).toBe(3);
    });

    it('should reject invalid university_id (too short)', () => {
      const result = excelStudentRowSchema.safeParse({ ...validRow, university_id: '123' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid enrollment_year (before 2000)', () => {
      const result = excelStudentRowSchema.safeParse({ ...validRow, enrollment_year: 1999 });
      expect(result.success).toBe(false);
    });

    it('name_en should be optional', () => {
      const { name_en: _, ...rowWithoutNameEn } = validRow as typeof validRow & { name_en?: string };
      const result = excelStudentRowSchema.safeParse(rowWithoutNameEn);
      expect(result.success).toBe(true);
    });
  });
});

// ─── Pagination (re-verify with Phase 2 use cases) ────────────────────────────

describe('Pagination — Phase 2 use cases', () => {
  it('should handle large faculty list pagination', () => {
    const result = parsePagination({ page: 5, limit: 10 });
    expect(result.skip).toBe(40); // (5-1) * 10
    expect(result.take).toBe(10);
  });

  it('should build response with correct totalPages for 150 students over 20/page', () => {
    const result = buildPaginatedResponse([], 150, 1, 20);
    expect(result.totalPages).toBe(8); // ceil(150/20)
  });

  it('should handle single page result', () => {
    const items = [{ id: '1' }, { id: '2' }];
    const result = buildPaginatedResponse(items, 2, 1, 20);
    expect(result.totalPages).toBe(1);
    expect(result.items.length).toBe(2);
  });
});
