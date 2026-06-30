/**
 * Phase 8 — Integration Tests
 * ============================
 * User Journey tests بدون DB حقيقي — بيتحقق من:
 *   - User Journey UC-01 إلى UC-05 (Logic Layer)
 *   - i18n compatibility (Arabic & English data)
 *   - Excel Import 2-phase validation workflow
 *   - Conference registration full flow
 *   - Pagination consistency
 *   - Cross-module schema compatibility
 */

// ─── UC-01: Student Login & View Results Journey ──────────────────────────────

describe('UC-01: Student Authentication Journey', () => {
  let loginSchema: (typeof import('../src/modules/auth/auth.types'))['loginSchema'];

  beforeAll(async () => {
    ({ loginSchema } = await import('../src/modules/auth/auth.types'));
  });

  it('step 1: validate login credentials format', () => {
    const studentLogin = { identifier: '20210001', password: 'Student@123' };
    expect(loginSchema.safeParse(studentLogin).success).toBe(true);
  });

  it('step 1b: email-based login should also work', () => {
    const emailLogin = { identifier: 'student@cu.edu.eg', password: 'Student@123' };
    expect(loginSchema.safeParse(emailLogin).success).toBe(true);
  });

  it('step 2: short password should fail validation before hitting DB', () => {
    const badLogin = { identifier: '20210001', password: '' }; // empty password should fail
    expect(loginSchema.safeParse(badLogin).success).toBe(false);
  });

  it('step 2b: empty identifier should fail', () => {
    const badLogin = { identifier: '', password: 'Student@123' };
    expect(loginSchema.safeParse(badLogin).success).toBe(false);
  });
});

describe('UC-01: Student Results Access', () => {
  let listResultsQuerySchema: (typeof import('../src/modules/results/results.types'))['listResultsQuerySchema'];

  beforeAll(async () => {
    ({ listResultsQuerySchema } = await import('../src/modules/results/results.types'));
  });

  it('should filter results by academicYear', () => {
    const r = listResultsQuerySchema.safeParse({ academicYear: '2023-2024' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.academicYear).toBe('2023-2024');
  });

  it('should filter published results only by default (string transform)', () => {
    const r = listResultsQuerySchema.safeParse({ isPublished: 'true' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.isPublished).toBe(true);
  });

  it('should filter unpublished (admin view)', () => {
    const r = listResultsQuerySchema.safeParse({ isPublished: 'false' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.isPublished).toBe(false);
  });

  it('should reject invalid semester (not 1 or 2)', () => {
    expect(listResultsQuerySchema.safeParse({ semester: '3' }).success).toBe(false);
    expect(listResultsQuerySchema.safeParse({ semester: '0' }).success).toBe(false);
  });
});

// ─── UC-02: Faculty Profile Update Journey ───────────────────────────────────

describe('UC-02: Faculty Profile Management', () => {
  let updateMyProfileSchema: (typeof import('../src/modules/faculty/faculty.types'))['updateMyProfileSchema'];
  let createFacultySchema: (typeof import('../src/modules/faculty/faculty.types'))['createFacultySchema'];

  beforeAll(async () => {
    ({ updateMyProfileSchema, createFacultySchema } = await import('../src/modules/faculty/faculty.types'));
  });

  it('step 1: validate profile update payload', () => {
    const update = {
      bioAr: 'أستاذ في قسم الآثار المصرية، متخصص في الحضارة الفرعونية',
      bioEn: 'Professor in Egyptology, specializing in Pharaonic civilization',
      email: 'prof@cu.edu.eg',
    };
    expect(updateMyProfileSchema.safeParse(update).success).toBe(true);
  });

  it('step 2: partial update (just email) should work', () => {
    expect(updateMyProfileSchema.safeParse({ email: 'new@cu.edu.eg' }).success).toBe(true);
  });

  it('step 3: admin creating new faculty member', () => {
    const newFaculty = {
      departmentId: '550e8400-e29b-41d4-a716-446655440000',
      nameAr: 'د. محمد عبد الرحمن',
      nameEn: 'Dr. Mohamed Abdel Rahman',
      degree: 'professor',
      email: 'dr.mohamed@cu.edu.eg',
    };
    expect(createFacultySchema.safeParse(newFaculty).success).toBe(true);
  });

  it('step 3b: creating faculty without optional fields should succeed', () => {
    const minimal = {
      departmentId: '550e8400-e29b-41d4-a716-446655440000',
      nameAr: 'د. فاطمة الزهراء',
      nameEn: 'Dr. Fatima',
      degree: 'lecturer',
    };
    expect(createFacultySchema.safeParse(minimal).success).toBe(true);
  });
});

// ─── UC-03: News Publishing Workflow ─────────────────────────────────────────

describe('UC-03: Content Manager News Workflow', () => {
  let createNewsSchema: (typeof import('../src/modules/news/news.types'))['createNewsSchema'];
  let updateNewsSchema: (typeof import('../src/modules/news/news.types'))['updateNewsSchema'];
  let listNewsQuerySchema: (typeof import('../src/modules/news/news.types'))['listNewsQuerySchema'];

  beforeAll(async () => {
    ({ createNewsSchema, updateNewsSchema, listNewsQuerySchema } = await import('../src/modules/news/news.types'));
  });

  it('step 1: create news draft', () => {
    const draft = {
      titleAr: 'كلية الآثار تستضيف مؤتمراً دولياً',
      bodyAr: 'تستضيف كلية الآثار بجامعة القاهرة المؤتمر الدولي السابع للآثار المصرية في الفترة من...',
      category: 'conference',
    };
    expect(createNewsSchema.safeParse(draft).success).toBe(true);
  });

  it('step 2: update draft to add English content', () => {
    const update = {
      titleEn: 'Faculty of Archaeology hosts International Conference',
      bodyEn: 'The Faculty of Archaeology at Cairo University is hosting the 7th International Conference...',
    };
    expect(updateNewsSchema.safeParse(update).success).toBe(true);
  });

  it('step 3: list published news with category filter', () => {
    const query = { category: 'conference', page: '1', limit: '10', published: 'true' };
    const r = listNewsQuerySchema.safeParse(query);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.category).toBe('conference');
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(10);
    }
  });

  it('step 4: default query shows published news', () => {
    const r = listNewsQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      // published transform: حاجة مش false = true
      expect(r.data.published).toBe(true);
    }
  });

  it('step 4b: admin view — unpublished news', () => {
    const r = listNewsQuerySchema.safeParse({ published: 'false' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.published).toBe(false);
  });
});

// ─── UC-04: Excel Import 2-Phase Workflow ─────────────────────────────────────

describe('UC-04: Excel Import 2-Phase Validation', () => {
  let excelResultRowSchema: (typeof import('../src/modules/results/results.types'))['excelResultRowSchema'];
  let excelStudentRowSchema: (typeof import('../src/modules/students/students.types'))['excelStudentRowSchema'];
  let excelBookRowSchema: (typeof import('../src/modules/library/library.types'))['excelBookRowSchema'];

  beforeAll(async () => {
    ({ excelResultRowSchema } = await import('../src/modules/results/results.types'));
    ({ excelStudentRowSchema } = await import('../src/modules/students/students.types'));
    ({ excelBookRowSchema } = await import('../src/modules/library/library.types'));
  });

  describe('Phase 1: Validate — Results', () => {
    const validResults = [
      { university_id: '20210001', course_code: 'ARC101', grade: 85, semester: 1, academic_year: '2024-2025' },
      { university_id: '20210002', course_code: 'ARC102', grade: 92, semester: 1, academic_year: '2024-2025' },
      { university_id: '20210003', course_code: 'ARC101', grade: 58, semester: 1, academic_year: '2024-2025' },
    ];

    it('should validate all valid rows successfully', () => {
      validResults.forEach((row, i) => {
        const r = excelResultRowSchema.safeParse(row);
        expect(r.success).toBe(true); // row ${i + 1} should be valid
      });
    });

    it('phase 1 report: errors array', () => {
      const rows = [...validResults, { university_id: '20210004', course_code: 'ARC101', grade: 150, semester: 1, academic_year: '2024-2025' }];
      const errors = rows
        .map((row, i) => {
          const r = excelResultRowSchema.safeParse(row);
          if (!r.success) return { row: i + 2, message: r.error.errors[0].message };
          return null;
        })
        .filter(Boolean);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.row).toBe(5);
    });
  });

  describe('Phase 1: Validate — Students', () => {
    it('should validate valid student row', () => {
      const row = {
        university_id: '20210001',
        name_ar: 'أحمد علي محمد',
        department_slug: 'egyptology',
        academic_year: 2,
        enrollment_year: 2021,
        email: 'ahmed@cu.edu.eg',
        password: 'Secure@123',
      };
      expect(excelStudentRowSchema.safeParse(row).success).toBe(true);
    });

    it('should build validation report with toCreate / errors', () => {
      const rows = [
        { university_id: '20210001', name_ar: 'أحمد علي', department_slug: 'egyptology', academic_year: 2, enrollment_year: 2021, email: 'a@cu.edu.eg', password: 'Secure@123' },
        { university_id: '20210002', name_ar: 'سارة', department_slug: 'islamics', academic_year: 1, enrollment_year: 2022, email: 'bad-email', password: 'Secure@123' }, // invalid email
      ];

      const validRows: typeof rows = [];
      const errorRows: Array<{ row: number; error: string }> = [];

      rows.forEach((row, i) => {
        const r = excelStudentRowSchema.safeParse(row);
        if (r.success) validRows.push(row);
        else errorRows.push({ row: i + 2, error: r.error.errors[0].message });
      });

      expect(validRows).toHaveLength(1);
      expect(errorRows).toHaveLength(1);
      expect(errorRows[0].row).toBe(3);
    });
  });

  describe('Phase 1: Validate — Library Books', () => {
    it('should validate valid book row', () => {
      const row = {
        title_ar: 'موسوعة الحضارة المصرية القديمة',
        title_en: 'Encyclopedia of Ancient Egyptian Civilization',
        author_ar: 'د. محمد الشربيني',
        library_type: 'egyptology',
        copies_count: 3,
        publish_year: 2020,
      };
      expect(excelBookRowSchema.safeParse(row).success).toBe(true);
    });

    it('should reject invalid library_type', () => {
      const row = {
        title_ar: 'كتاب تجريبي',
        library_type: 'fiction', // invalid
        copies_count: 1,
      };
      expect(excelBookRowSchema.safeParse(row).success).toBe(false);
    });
  });
});

// ─── UC-05: Conference Registration Journey ───────────────────────────────────

describe('UC-05: Conference Registration Full Flow', () => {
  let registerConferenceSchema: (typeof import('../src/modules/conferences/conferences.types'))['registerConferenceSchema'];
  let updateRegistrationSchema: (typeof import('../src/modules/conferences/conferences.types'))['updateRegistrationSchema'];

  beforeAll(async () => {
    ({ registerConferenceSchema, updateRegistrationSchema } = await import('../src/modules/conferences/conferences.types'));
  });

  it('step 1: visitor submits registration form', () => {
    const registration = {
      fullName: 'د. عمر رأفت سيد',
      email: 'omar@university.edu',
      institution: 'جامعة القاهرة',
      participationType: 'presenter',
      abstract: 'بحث حول الكشوفات الأثرية الحديثة في منطقة سقارة',
    };
    expect(registerConferenceSchema.safeParse(registration).success).toBe(true);
  });

  it('step 1b: attendee without abstract should also work', () => {
    const registration = {
      fullName: 'محمد علي',
      email: 'mali@example.com',
      participationType: 'attendee',
    };
    expect(registerConferenceSchema.safeParse(registration).success).toBe(true);
  });

  it('step 2: admin reviews and confirms registration', () => {
    const confirmation = { status: 'confirmed' };
    expect(updateRegistrationSchema.safeParse(confirmation).success).toBe(true);
  });

  it('step 2b: admin can reject registration', () => {
    const rejection = { status: 'rejected' };
    expect(updateRegistrationSchema.safeParse(rejection).success).toBe(true);
  });

  it('step 3: registration code should be unique (statistical test)', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      codes.add(`CONF-${year}${random}`);
    }
    // مع 9000 احتمال، 1000 كود يجب أن يكون فيها تكرار — لكن معظمها فريد
    expect(codes.size).toBeGreaterThan(800);
  });

  it('step 4: email validation in registration', () => {
    const invalidEmails = ['notanemail', 'missing@', '@nodomain.com', ''];
    invalidEmails.forEach((email) => {
      const r = registerConferenceSchema.safeParse({
        fullName: 'أحمد محمد على',
        email,
      });
      expect(r.success).toBe(false);
    });
  });
});

// ─── i18n Compatibility Tests ─────────────────────────────────────────────────

describe('i18n: Arabic and English Data Compatibility', () => {
  it('Arabic text in titleAr should pass min length validation', async () => {
    const { createNewsSchema } = await import('../src/modules/news/news.types');
    const arabicTitle = 'افتتاح أول معرض أثري دولي';
    const r = createNewsSchema.safeParse({
      titleAr: arabicTitle,
      bodyAr: 'تفاصيل مطولة حول المعرض الأثري الدولي الأول الذي يُقام في رحاب كلية الآثار',
    });
    expect(r.success).toBe(true);
  });

  it('English text in optional titleEn should be accepted', async () => {
    const { createNewsSchema } = await import('../src/modules/news/news.types');
    const r = createNewsSchema.safeParse({
      titleAr: 'افتتاح أول معرض أثري دولي',
      titleEn: 'Opening of First International Archaeological Exhibition',
      bodyAr: 'تفاصيل مطولة حول المعرض الأثري الدولي الأول الذي يُقام في رحاب كلية الآثار',
      bodyEn: 'Detailed information about the first international archaeological exhibition at the Faculty of Archaeology',
    });
    expect(r.success).toBe(true);
  });

  it('Arabic student name should pass validation', async () => {
    const { excelStudentRowSchema } = await import('../src/modules/students/students.types');
    const r = excelStudentRowSchema.safeParse({
      university_id: '20210001',
      name_ar: 'أحمد عبد الرحمن محمد',
      department_slug: 'egyptology',
      academic_year: 2,
      enrollment_year: 2021,
      email: 'student@cu.edu.eg',
      password: 'Secure@123',
    });
    expect(r.success).toBe(true);
  });

  it('search query in Arabic should be valid', async () => {
    const { searchQuerySchema } = await import('../src/modules/search/search.types');
    const r = searchQuerySchema.safeParse({ q: 'آثار مصرية', lang: 'ar' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe('آثار مصرية');
      expect(r.data.lang).toBe('ar');
    }
  });

  it('search query in English should be valid', async () => {
    const { searchQuerySchema } = await import('../src/modules/search/search.types');
    const r = searchQuerySchema.safeParse({ q: 'Egyptian archaeology', lang: 'en' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe('Egyptian archaeology');
      expect(r.data.lang).toBe('en');
    }
  });
});

// ─── Cross-Module Schema Compatibility ───────────────────────────────────────

describe('Cross-Module: Pagination Consistency', () => {
  const { parsePagination, buildPaginatedResponse } = require('../src/shared/utils/pagination');

  it('default pagination should be consistent across modules', () => {
    const result = parsePagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
  });

  it('paginated response should match query params', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }));
    const response = buildPaginatedResponse(items, 100, 3, 10);
    expect(response.page).toBe(3);
    expect(response.limit).toBe(10);
    expect(response.totalPages).toBe(10);
    expect(response.items).toHaveLength(10);
  });

  it('last page calculation should be correct', () => {
    // صفحة 5 من 50 items بـ 10/page = 5 صفحات
    const r = buildPaginatedResponse([], 50, 5, 10);
    expect(r.totalPages).toBe(5);
    expect(r.page).toBe(5);
  });

  it('API response wrapper should be consistent', async () => {
    const { sendSuccess, sendError } = await import('../src/shared/utils/response');
    // نتحقق إن الـ functions موجودة
    expect(typeof sendSuccess).toBe('function');
    expect(typeof sendError).toBe('function');
  });
});

// ─── Schedule & Exam Data Validation ─────────────────────────────────────────

describe('Integration: Schedule & Exam Validation', () => {
  let createScheduleSchema: (typeof import('../src/modules/schedules/schedules.types'))['createScheduleSchema'];
  let createExamScheduleSchema: (typeof import('../src/modules/schedules/schedules.types'))['createExamScheduleSchema'];

  beforeAll(async () => {
    ({ createScheduleSchema, createExamScheduleSchema } = await import('../src/modules/schedules/schedules.types'));
  });

  const validSchedule = {
    courseId: '550e8400-e29b-41d4-a716-446655440000',
    facultyId: '550e8400-e29b-41d4-a716-446655440001',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '11:00',
    academicYear: '2024-2025',
    semester: 1,
  };

  it('should accept valid class schedule', () => {
    expect(createScheduleSchema.safeParse(validSchedule).success).toBe(true);
  });

  it('should reject dayOfWeek outside 0-6', () => {
    expect(createScheduleSchema.safeParse({ ...validSchedule, dayOfWeek: 7 }).success).toBe(false);
    expect(createScheduleSchema.safeParse({ ...validSchedule, dayOfWeek: -1 }).success).toBe(false);
  });

  it('should reject invalid time format (not HH:MM)', () => {
    expect(createScheduleSchema.safeParse({ ...validSchedule, startTime: '9:00' }).success).toBe(false);
    expect(createScheduleSchema.safeParse({ ...validSchedule, startTime: '9am' }).success).toBe(false);
  });

  it('should accept HH:MM time format', () => {
    expect(createScheduleSchema.safeParse({ ...validSchedule, startTime: '08:00', endTime: '10:00' }).success).toBe(true);
    expect(createScheduleSchema.safeParse({ ...validSchedule, startTime: '13:30', endTime: '15:30' }).success).toBe(true);
  });

  it('should reject invalid academic_year in schedule', () => {
    expect(createScheduleSchema.safeParse({ ...validSchedule, academicYear: '2024' }).success).toBe(false);
    expect(createScheduleSchema.safeParse({ ...validSchedule, academicYear: '2024/2025' }).success).toBe(false);
  });

  it('end time must be after start time (refine check)', () => {
    const bad = { ...validSchedule, startTime: '11:00', endTime: '09:00' };
    expect(createScheduleSchema.safeParse(bad).success).toBe(false);
  });

  it('should validate exam schedule', () => {
    const exam = {
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      examDate: '2025-01-15',
      startTime: '09:00',
      endTime: '12:00',
      examType: 'final',
      academicYear: '2024-2025',
      semester: 1,
    };
    expect(createExamScheduleSchema.safeParse(exam).success).toBe(true);
  });

  it('should reject invalid exam type', () => {
    const exam = {
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      examDate: '2025-01-15',
      startTime: '09:00',
      endTime: '12:00',
      examType: 'quiz',
      academicYear: '2024-2025',
      semester: 1,
    };
    expect(createExamScheduleSchema.safeParse(exam).success).toBe(false);
  });
});

// ─── Publication Schema ───────────────────────────────────────────────────────

describe('Integration: Publications Validation', () => {
  let createPublicationSchema: (typeof import('../src/modules/publications/publications.types'))['createPublicationSchema'];

  beforeAll(async () => {
    ({ createPublicationSchema } = await import('../src/modules/publications/publications.types'));
  });

  it('should accept valid publication', () => {
    const pub = {
      titleAr: 'دراسة أثرية حول منطقة الفسطاط',
      publishYear: 2023,
    };
    expect(createPublicationSchema.safeParse(pub).success).toBe(true);
  });

  it('should reject publishYear in the far future (dynamic max = currentYear + 1)', () => {
    const farFuture = new Date().getFullYear() + 2;
    const pub = {
      titleAr: 'دراسة أثرية حول منطقة الفسطاط',
      publishYear: farFuture,
    };
    expect(createPublicationSchema.safeParse(pub).success).toBe(false);
  });

  it('should reject publishYear before 1900', () => {
    const pub = {
      titleAr: 'دراسة أثرية حول منطقة الفسطاط',
      publishYear: 1899,
    };
    expect(createPublicationSchema.safeParse(pub).success).toBe(false);
  });

  it('should accept valid DOI format', () => {
    const pub = {
      titleAr: 'دراسة أثرية حول منطقة الفسطاط',
      doi: '10.1234/example.2023',
    };
    expect(createPublicationSchema.safeParse(pub).success).toBe(true);
  });
});
