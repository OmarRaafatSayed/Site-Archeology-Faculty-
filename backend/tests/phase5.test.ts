/**
 * Phase 5 Unit Tests
 * Conferences | Search | Email | Registration
 */

import { ConferenceStatus, RegStatus } from '@prisma/client';

// ─── Conferences Schemas ──────────────────────────────────────────────────────

describe('Conferences Schemas', () => {
  let createConferenceSchema: (typeof import('../src/modules/conferences/conferences.types'))['createConferenceSchema'];
  let updateConferenceSchema: (typeof import('../src/modules/conferences/conferences.types'))['updateConferenceSchema'];
  let listConferencesQuerySchema: (typeof import('../src/modules/conferences/conferences.types'))['listConferencesQuerySchema'];
  let registerConferenceSchema: (typeof import('../src/modules/conferences/conferences.types'))['registerConferenceSchema'];
  let updateRegistrationSchema: (typeof import('../src/modules/conferences/conferences.types'))['updateRegistrationSchema'];
  let listRegistrationsQuerySchema: (typeof import('../src/modules/conferences/conferences.types'))['listRegistrationsQuerySchema'];

  beforeAll(async () => {
    ({
      createConferenceSchema,
      updateConferenceSchema,
      listConferencesQuerySchema,
      registerConferenceSchema,
      updateRegistrationSchema,
      listRegistrationsQuerySchema,
    } = await import('../src/modules/conferences/conferences.types'));
  });

  const validConf = {
    number: 7,
    titleAr: 'المؤتمر الدولي السابع للآثار',
    titleEn: 'The Seventh International Conference on Archaeology',
    status: ConferenceStatus.upcoming,
  };

  describe('createConferenceSchema', () => {
    it('should accept valid conference', () => {
      expect(createConferenceSchema.safeParse(validConf).success).toBe(true);
    });

    it('should default status to upcoming', () => {
      const r = createConferenceSchema.safeParse({ number: 8, titleAr: 'مؤتمر ثامن للآثار المصرية' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.status).toBe(ConferenceStatus.upcoming);
    });

    it('should reject number < 1', () => {
      expect(createConferenceSchema.safeParse({ ...validConf, number: 0 }).success).toBe(false);
    });

    it('should reject titleAr shorter than 5', () => {
      expect(createConferenceSchema.safeParse({ ...validConf, titleAr: 'مؤتم' }).success).toBe(false);
    });

    it('should accept all ConferenceStatus values', () => {
      Object.values(ConferenceStatus).forEach((s) => {
        expect(createConferenceSchema.safeParse({ ...validConf, status: s }).success).toBe(true);
      });
    });

    it('should accept valid YYYY-MM-DD dates', () => {
      expect(createConferenceSchema.safeParse({ ...validConf, startDate: '2025-10-15', endDate: '2025-10-17' }).success).toBe(true);
    });

    it('should reject invalid date format', () => {
      expect(createConferenceSchema.safeParse({ ...validConf, startDate: '15/10/2025' }).success).toBe(false);
    });

    it('should accept null bannerArUrl (clearing)', () => {
      expect(createConferenceSchema.safeParse({ ...validConf, bannerArUrl: null }).success).toBe(true);
    });

    it('should reject invalid bannerArUrl', () => {
      expect(createConferenceSchema.safeParse({ ...validConf, bannerArUrl: 'not-a-url' }).success).toBe(false);
    });
  });

  describe('updateConferenceSchema', () => {
    it('should accept partial updates', () => {
      expect(updateConferenceSchema.safeParse({ status: ConferenceStatus.ongoing }).success).toBe(true);
    });

    it('should accept empty object', () => {
      expect(updateConferenceSchema.safeParse({}).success).toBe(true);
    });
  });

  describe('listConferencesQuerySchema', () => {
    it('should default page=1 limit=10', () => {
      const r = listConferencesQuerySchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(1);
        expect(r.data.limit).toBe(10);
      }
    });

    it('should filter by status', () => {
      expect(listConferencesQuerySchema.safeParse({ status: ConferenceStatus.upcoming }).success).toBe(true);
    });
  });

  describe('registerConferenceSchema', () => {
    const validReg = {
      fullName: 'د. أحمد محمد علي',
      email: 'ahmed@example.com',
      participationType: 'presenter',
    };

    it('should accept valid registration', () => {
      expect(registerConferenceSchema.safeParse(validReg).success).toBe(true);
    });

    it('should default participationType to attendee', () => {
      const r = registerConferenceSchema.safeParse({
        fullName: validReg.fullName,
        email: validReg.email,
      });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.participationType).toBe('attendee');
    });

    it('should reject invalid email', () => {
      expect(registerConferenceSchema.safeParse({ ...validReg, email: 'bad-email' }).success).toBe(false);
    });

    it('should reject fullName shorter than 3', () => {
      expect(registerConferenceSchema.safeParse({ ...validReg, fullName: 'أح' }).success).toBe(false);
    });

    it('should reject invalid participationType', () => {
      expect(registerConferenceSchema.safeParse({ ...validReg, participationType: 'organizer' }).success).toBe(false);
    });

    it('should accept both participation types', () => {
      ['presenter', 'attendee'].forEach((t) => {
        expect(registerConferenceSchema.safeParse({ ...validReg, participationType: t }).success).toBe(true);
      });
    });

    it('should accept optional abstract', () => {
      expect(registerConferenceSchema.safeParse({ ...validReg, abstract: 'ملخص البحث المقدم' }).success).toBe(true);
    });
  });

  describe('updateRegistrationSchema', () => {
    it('should accept all RegStatus values', () => {
      Object.values(RegStatus).forEach((s) => {
        expect(updateRegistrationSchema.safeParse({ status: s }).success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      expect(updateRegistrationSchema.safeParse({ status: 'approved' }).success).toBe(false);
    });

    it('should require status field', () => {
      expect(updateRegistrationSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('listRegistrationsQuerySchema', () => {
    it('should use defaults', () => {
      const r = listRegistrationsQuerySchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(1);
        expect(r.data.limit).toBe(20);
      }
    });

    it('should filter by status', () => {
      expect(listRegistrationsQuerySchema.safeParse({ status: RegStatus.pending }).success).toBe(true);
    });

    it('should filter by participationType', () => {
      expect(listRegistrationsQuerySchema.safeParse({ participationType: 'presenter' }).success).toBe(true);
    });

    it('should accept search query', () => {
      expect(listRegistrationsQuerySchema.safeParse({ search: 'ahmed' }).success).toBe(true);
    });
  });
});

// ─── Search Schemas ───────────────────────────────────────────────────────────

describe('Search Schemas', () => {
  let searchQuerySchema: (typeof import('../src/modules/search/search.types'))['searchQuerySchema'];
  let SEARCH_TYPES: (typeof import('../src/modules/search/search.types'))['SEARCH_TYPES'];

  beforeAll(async () => {
    ({ searchQuerySchema, SEARCH_TYPES } = await import('../src/modules/search/search.types'));
  });

  it('should accept minimal valid search', () => {
    const r = searchQuerySchema.safeParse({ q: 'آثار' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe('all');
      expect(r.data.lang).toBe('ar');
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it('should reject q shorter than 2 chars', () => {
    expect(searchQuerySchema.safeParse({ q: 'أ' }).success).toBe(false);
  });

  it('should reject q longer than 200 chars', () => {
    expect(searchQuerySchema.safeParse({ q: 'أ'.repeat(201) }).success).toBe(false);
  });

  it('should trim whitespace from q', () => {
    const r = searchQuerySchema.safeParse({ q: '  آثار  ' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.q).toBe('آثار');
  });

  it('should accept all valid search types', () => {
    SEARCH_TYPES.forEach((type) => {
      expect(searchQuerySchema.safeParse({ q: 'آثار', type }).success).toBe(true);
    });
  });

  it('should reject invalid type', () => {
    expect(searchQuerySchema.safeParse({ q: 'آثار', type: 'event' }).success).toBe(false);
  });

  it('should accept both languages', () => {
    expect(searchQuerySchema.safeParse({ q: 'archaeology', lang: 'en' }).success).toBe(true);
    expect(searchQuerySchema.safeParse({ q: 'آثار', lang: 'ar' }).success).toBe(true);
  });

  it('should reject invalid lang', () => {
    expect(searchQuerySchema.safeParse({ q: 'آثار', lang: 'fr' }).success).toBe(false);
  });

  it('should cap limit at 50', () => {
    const r = searchQuerySchema.safeParse({ q: 'آثار', limit: '100' });
    expect(r.success).toBe(false); // > 50 rejected
  });

  it('should accept limit = 50', () => {
    expect(searchQuerySchema.safeParse({ q: 'آثار', limit: '50' }).success).toBe(true);
  });

  it('should coerce page and limit from string', () => {
    const r = searchQuerySchema.safeParse({ q: 'آثار', page: '3', limit: '10' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(10);
    }
  });
});

// ─── Registration Code Format ─────────────────────────────────────────────────

describe('Registration Code Generation', () => {
  // Mirror the logic from conferences.service.ts
  function generateRegistrationCode(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CONF-${year}${random}`;
  }

  it('should start with CONF-', () => {
    const code = generateRegistrationCode();
    expect(code).toMatch(/^CONF-/);
  });

  it('should contain current year', () => {
    const code = generateRegistrationCode();
    expect(code).toContain(String(new Date().getFullYear()));
  });

  it('should be unique across calls', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateRegistrationCode()));
    // With 9000 possible random values, 100 codes should almost certainly be unique
    expect(codes.size).toBeGreaterThan(90);
  });

  it('should have length of 13 chars (CONF-YYYY####)', () => {
    const code = generateRegistrationCode();
    expect(code).toMatch(/^CONF-\d{8}$/);
  });
});

// ─── Slug Generation Logic ────────────────────────────────────────────────────

describe('Conference Slug Generation', () => {
  // Mirror the transliteration logic
  function generateSlug(titleAr: string, number: number): string {
    const map: Record<string, string> = {
      'ا': 'a', 'ب': 'b', 'ت': 't', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
      'د': 'd', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's',
      'ض': 'd', 'ط': 't', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
      'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
      'ي': 'y', 'ة': 'a', 'ى': 'a', 'إ': 'i', 'أ': 'a', 'آ': 'aa',
    };

    const normalized = titleAr
      .replace(/[\u0600-\u06FF]/g, (c) => map[c] ?? '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .slice(0, 40);

    return `conference-${number}-${normalized}`.toLowerCase();
  }

  it('should start with conference-{number}-', () => {
    const slug = generateSlug('المؤتمر الدولي السابع', 7);
    expect(slug).toMatch(/^conference-7-/);
  });

  it('should not contain Arabic characters', () => {
    const slug = generateSlug('المؤتمر الدولي السابع', 7);
    expect(slug).not.toMatch(/[\u0600-\u06FF]/);
  });

  it('should be lowercase', () => {
    const slug = generateSlug('المؤتمر الخامس', 5);
    expect(slug).toBe(slug.toLowerCase());
  });

  it('should not contain spaces', () => {
    const slug = generateSlug('المؤتمر الدولي', 6);
    expect(slug).not.toContain(' ');
  });

  it('should use hyphens as separators', () => {
    const slug = generateSlug('مؤتمر', 1);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
});
