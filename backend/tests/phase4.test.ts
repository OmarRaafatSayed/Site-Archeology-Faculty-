/**
 * Phase 4 Unit Tests
 * News | Pages | Publications | Library | Admin Stats
 */

import { NewsCategory, LibraryType } from '@prisma/client';

// ─── News Schemas ─────────────────────────────────────────────────────────────

describe('News Schemas', () => {
  let createNewsSchema: (typeof import('../src/modules/news/news.types'))['createNewsSchema'];
  let updateNewsSchema: (typeof import('../src/modules/news/news.types'))['updateNewsSchema'];
  let listNewsQuerySchema: (typeof import('../src/modules/news/news.types'))['listNewsQuerySchema'];

  beforeAll(async () => {
    ({ createNewsSchema, updateNewsSchema, listNewsQuerySchema } =
      await import('../src/modules/news/news.types'));
  });

  const validCreate = {
    titleAr: 'إعلان هام من كلية الآثار',
    bodyAr: 'نص الإعلان التفصيلي يجب أن يكون أكثر من عشرين حرفاً على الأقل',
    category: NewsCategory.general,
  };

  it('should accept valid news', () => {
    expect(createNewsSchema.safeParse(validCreate).success).toBe(true);
  });

  it('should default category to general', () => {
    const r = createNewsSchema.safeParse({ titleAr: validCreate.titleAr, bodyAr: validCreate.bodyAr });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.category).toBe(NewsCategory.general);
  });

  it('should reject titleAr shorter than 5 chars', () => {
    expect(createNewsSchema.safeParse({ ...validCreate, titleAr: 'قصر' }).success).toBe(false);
  });

  it('should reject bodyAr shorter than 20 chars', () => {
    expect(createNewsSchema.safeParse({ ...validCreate, bodyAr: 'نص قصير' }).success).toBe(false);
  });

  it('should accept all NewsCategory values', () => {
    Object.values(NewsCategory).forEach((cat) => {
      expect(createNewsSchema.safeParse({ ...validCreate, category: cat }).success).toBe(true);
    });
  });

  it('should reject invalid category', () => {
    expect(createNewsSchema.safeParse({ ...validCreate, category: 'sports' }).success).toBe(false);
  });

  it('should accept optional coverImage URL', () => {
    expect(createNewsSchema.safeParse({ ...validCreate, coverImage: 'https://example.com/img.jpg' }).success).toBe(true);
  });

  it('should reject invalid coverImage URL', () => {
    expect(createNewsSchema.safeParse({ ...validCreate, coverImage: 'not-a-url' }).success).toBe(false);
  });

  it('should accept null coverImage (clearing)', () => {
    expect(createNewsSchema.safeParse({ ...validCreate, coverImage: null }).success).toBe(true);
  });

  it('updateNewsSchema should accept empty object', () => {
    expect(updateNewsSchema.safeParse({}).success).toBe(true);
  });

  it('listQuery should default published=true and page=1', () => {
    const r = listNewsQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.published).toBe(true);
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(10);
      expect(r.data.lang).toBe('ar');
    }
  });

  it('listQuery published=false should work for admin view', () => {
    const r = listNewsQuerySchema.safeParse({ published: 'false' });
    if (r.success) expect(r.data.published).toBe(false);
  });

  it('listQuery should accept valid category filter', () => {
    expect(listNewsQuerySchema.safeParse({ category: NewsCategory.academic }).success).toBe(true);
  });
});

// ─── Pages Schemas ────────────────────────────────────────────────────────────

describe('Pages Schemas', () => {
  let updatePageSchema: (typeof import('../src/modules/pages/pages.types'))['updatePageSchema'];

  beforeAll(async () => {
    ({ updatePageSchema } = await import('../src/modules/pages/pages.types'));
  });

  it('should accept valid page update', () => {
    expect(updatePageSchema.safeParse({ contentAr: 'محتوى الصفحة', titleAr: 'عنوان الصفحة' }).success).toBe(true);
  });

  it('should accept empty object (no field required)', () => {
    expect(updatePageSchema.safeParse({}).success).toBe(true);
  });

  it('should accept null for nullable fields', () => {
    expect(updatePageSchema.safeParse({ contentAr: null, contentEn: null }).success).toBe(true);
  });

  it('should reject titleAr shorter than 3 chars', () => {
    expect(updatePageSchema.safeParse({ titleAr: 'أب' }).success).toBe(false);
  });

  it('should reject metaDescription longer than 500 chars', () => {
    expect(updatePageSchema.safeParse({ metaDescriptionAr: 'أ'.repeat(501) }).success).toBe(false);
  });
});

// ─── Publications Schemas ─────────────────────────────────────────────────────

describe('Publications Schemas', () => {
  let createPublicationSchema: (typeof import('../src/modules/publications/publications.types'))['createPublicationSchema'];
  let updatePublicationSchema: (typeof import('../src/modules/publications/publications.types'))['updatePublicationSchema'];
  let listPublicationsQuerySchema: (typeof import('../src/modules/publications/publications.types'))['listPublicationsQuerySchema'];

  beforeAll(async () => {
    ({ createPublicationSchema, updatePublicationSchema, listPublicationsQuerySchema } =
      await import('../src/modules/publications/publications.types'));
  });

  const validPub = {
    titleAr: 'دراسة في الآثار المصرية القديمة',
    publishYear: 2024,
    isPublished: true,
  };

  it('should accept valid publication', () => {
    expect(createPublicationSchema.safeParse(validPub).success).toBe(true);
  });

  it('should reject titleAr shorter than 5 chars', () => {
    expect(createPublicationSchema.safeParse({ ...validPub, titleAr: 'دراس' }).success).toBe(false);
  });

  it('should reject publishYear before 1900', () => {
    expect(createPublicationSchema.safeParse({ ...validPub, publishYear: 1899 }).success).toBe(false);
  });

  it('should reject publishYear more than one year in future', () => {
    expect(createPublicationSchema.safeParse({ ...validPub, publishYear: new Date().getFullYear() + 2 }).success).toBe(false);
  });

  it('should accept current year', () => {
    const r = createPublicationSchema.safeParse({ ...validPub, publishYear: new Date().getFullYear() });
    expect(r.success).toBe(true);
  });

  it('should default isPublished to true', () => {
    const r = createPublicationSchema.safeParse({ titleAr: validPub.titleAr });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.isPublished).toBe(true);
  });

  it('should accept null doi', () => {
    expect(createPublicationSchema.safeParse({ ...validPub, doi: null }).success).toBe(true);
  });

  it('should accept null fileUrl', () => {
    expect(createPublicationSchema.safeParse({ ...validPub, fileUrl: null }).success).toBe(true);
  });

  it('updatePublicationSchema should accept empty', () => {
    expect(updatePublicationSchema.safeParse({}).success).toBe(true);
  });

  it('listQuery should transform isPublished', () => {
    const t = listPublicationsQuerySchema.safeParse({ isPublished: 'true' });
    if (t.success) expect(t.data.isPublished).toBe(true);
    const f = listPublicationsQuerySchema.safeParse({ isPublished: 'false' });
    if (f.success) expect(f.data.isPublished).toBe(false);
  });

  it('listQuery should accept facultyId UUID', () => {
    expect(listPublicationsQuerySchema.safeParse({ facultyId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true);
  });

  it('listQuery should reject invalid facultyId', () => {
    expect(listPublicationsQuerySchema.safeParse({ facultyId: 'not-uuid' }).success).toBe(false);
  });
});

// ─── Library Schemas ──────────────────────────────────────────────────────────

describe('Library Schemas', () => {
  let createBookSchema: (typeof import('../src/modules/library/library.types'))['createBookSchema'];
  let updateBookSchema: (typeof import('../src/modules/library/library.types'))['updateBookSchema'];
  let listBooksQuerySchema: (typeof import('../src/modules/library/library.types'))['listBooksQuerySchema'];
  let excelBookRowSchema: (typeof import('../src/modules/library/library.types'))['excelBookRowSchema'];

  beforeAll(async () => {
    ({ createBookSchema, updateBookSchema, listBooksQuerySchema, excelBookRowSchema } =
      await import('../src/modules/library/library.types'));
  });

  const validBook = {
    libraryType: LibraryType.egyptology,
    titleAr: 'مدخل إلى الحضارة المصرية القديمة',
    copiesCount: 3,
  };

  describe('createBookSchema', () => {
    it('should accept valid book', () => {
      expect(createBookSchema.safeParse(validBook).success).toBe(true);
    });

    it('should accept all LibraryType values', () => {
      Object.values(LibraryType).forEach((type) => {
        expect(createBookSchema.safeParse({ ...validBook, libraryType: type }).success).toBe(true);
      });
    });

    it('should reject invalid LibraryType', () => {
      expect(createBookSchema.safeParse({ ...validBook, libraryType: 'digital' }).success).toBe(false);
    });

    it('should reject titleAr shorter than 3', () => {
      expect(createBookSchema.safeParse({ ...validBook, titleAr: 'كت' }).success).toBe(false);
    });

    it('should default copiesCount to 1', () => {
      const r = createBookSchema.safeParse({ libraryType: validBook.libraryType, titleAr: validBook.titleAr });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.copiesCount).toBe(1);
    });

    it('should coerce copiesCount string', () => {
      const r = createBookSchema.safeParse({ ...validBook, copiesCount: '5' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.copiesCount).toBe(5);
    });

    it('should reject publishYear before 1000', () => {
      expect(createBookSchema.safeParse({ ...validBook, publishYear: 999 }).success).toBe(false);
    });

    it('should accept null isbn', () => {
      expect(createBookSchema.safeParse({ ...validBook, isbn: null }).success).toBe(true);
    });
  });

  describe('listBooksQuerySchema', () => {
    it('should default page=1 limit=20', () => {
      const r = listBooksQuerySchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(1);
        expect(r.data.limit).toBe(20);
      }
    });

    it('should accept type filter', () => {
      expect(listBooksQuerySchema.safeParse({ type: LibraryType.islamic }).success).toBe(true);
    });

    it('should accept q (search) filter', () => {
      expect(listBooksQuerySchema.safeParse({ q: 'آثار' }).success).toBe(true);
    });
  });

  describe('excelBookRowSchema', () => {
    const validRow = {
      title_ar: 'كتاب الآثار المصرية',
      library_type: LibraryType.egyptology,
      copies_count: 2,
    };

    it('should accept valid Excel row', () => {
      expect(excelBookRowSchema.safeParse(validRow).success).toBe(true);
    });

    it('should reject invalid library_type', () => {
      expect(excelBookRowSchema.safeParse({ ...validRow, library_type: 'digital' }).success).toBe(false);
    });

    it('should coerce copies_count from string', () => {
      const r = excelBookRowSchema.safeParse({ ...validRow, copies_count: '3' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.copies_count).toBe(3);
    });

    it('department_slug should be optional', () => {
      expect(excelBookRowSchema.safeParse({ ...validRow }).success).toBe(true);
    });
  });
});

// ─── Admin Stats Query Schema ─────────────────────────────────────────────────

describe('Admin Stats — Audit Logs Query', () => {
  let auditLogsQuerySchema: (typeof import('../src/modules/admin/stats/stats.service'))['auditLogsQuerySchema'];

  beforeAll(async () => {
    ({ auditLogsQuerySchema } = await import('../src/modules/admin/stats/stats.service'));
  });

  it('should use defaults', () => {
    const r = auditLogsQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it('should accept date range filters', () => {
    expect(auditLogsQuerySchema.safeParse({ from: '2025-01-01', to: '2025-12-31' }).success).toBe(true);
  });

  it('should reject invalid date format', () => {
    expect(auditLogsQuerySchema.safeParse({ from: '01/01/2025' }).success).toBe(false);
  });

  it('should accept entityType and action filters', () => {
    expect(auditLogsQuerySchema.safeParse({ entityType: 'news', action: 'CREATE' }).success).toBe(true);
  });

  it('should accept userId UUID filter', () => {
    expect(auditLogsQuerySchema.safeParse({ userId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true);
  });

  it('should reject invalid userId', () => {
    expect(auditLogsQuerySchema.safeParse({ userId: 'not-uuid' }).success).toBe(false);
  });
});
