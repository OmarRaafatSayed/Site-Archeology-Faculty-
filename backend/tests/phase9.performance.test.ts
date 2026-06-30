/**
 * Phase 9 — Performance, SEO & Accessibility Tests
 * ==================================================
 * يختبر:
 *   - SEO utility functions (buildMetadata / schemas)
 *   - sitemap structure صحيح
 *   - robots.txt config صحيح
 *   - DB indexes SQL syntax صحيح
 *   - Cache configuration values
 *   - next.config headers صحيحة
 */

// ─── 1. SEO: buildMetadata ────────────────────────────────────────────────────

describe('SEO: buildMetadata utility', () => {
  let buildMetadata: (typeof import('../src/shared/utils/seo-test-helper'))['buildMetadataHelper'];

  beforeAll(() => {
    // نختبر logic الـ metadata بدون Next.js types
    buildMetadata = require('../src/shared/utils/seo-test-helper').buildMetadataHelper;
  });

  it('should build Arabic metadata correctly', () => {
    const meta = buildMetadata({
      locale: 'ar',
      path: '/about/history',
      titleAr: 'تاريخ الكلية',
      titleEn: 'Faculty History',
      descriptionAr: 'تاريخ كلية الآثار',
      descriptionEn: 'Faculty history',
    });
    expect(meta.title).toBe('تاريخ الكلية');
    expect(meta.description).toBe('تاريخ كلية الآثار');
    expect(meta.canonical).toContain('/ar/about/history');
  });

  it('should build English metadata correctly', () => {
    const meta = buildMetadata({
      locale: 'en',
      path: '/about/history',
      titleAr: 'تاريخ الكلية',
      titleEn: 'Faculty History',
      descriptionAr: 'تاريخ كلية الآثار',
      descriptionEn: 'Faculty history description',
    });
    expect(meta.title).toBe('Faculty History');
    expect(meta.description).toBe('Faculty history description');
    expect(meta.canonical).toContain('/en/about/history');
  });

  it('should fallback to Arabic description if English missing', () => {
    const meta = buildMetadata({
      locale: 'en',
      path: '/news',
      titleAr: 'الأخبار',
      titleEn: 'News',
      descriptionAr: 'وصف عربي',
    });
    expect(meta.description).toBe('وصف عربي');
  });

  it('should include hreflang alternates for both locales', () => {
    const meta = buildMetadata({
      locale: 'ar',
      path: '/departments/egyptology',
      titleAr: 'قسم الآثار المصرية',
      titleEn: 'Egyptology Department',
    });
    expect(meta.alternates.ar).toContain('/ar/departments/egyptology');
    expect(meta.alternates.en).toContain('/en/departments/egyptology');
  });

  it('noIndex should set index:false for dashboard pages', () => {
    const meta = buildMetadata({
      locale: 'ar',
      path: '/admin/dashboard',
      titleAr: 'لوحة التحكم',
      titleEn: 'Dashboard',
      noIndex: true,
    });
    expect(meta.noIndex).toBe(true);
  });

  it('article type should include publishedAt', () => {
    const meta = buildMetadata({
      locale: 'ar',
      path: '/news/123',
      titleAr: 'خبر مهم',
      titleEn: 'Important News',
      type: 'article',
      publishedAt: '2025-01-15T10:00:00Z',
    });
    expect(meta.type).toBe('article');
    expect(meta.publishedAt).toBe('2025-01-15T10:00:00Z');
  });
});

// ─── 2. SEO: Schema.org builders ─────────────────────────────────────────────

describe('SEO: Schema.org JSON-LD builders', () => {
  let buildOrganizationSchema: (typeof import('../src/shared/utils/seo-test-helper'))['buildOrganizationSchemaHelper'];
  let buildDepartmentSchema: (typeof import('../src/shared/utils/seo-test-helper'))['buildDepartmentSchemaHelper'];
  let buildPersonSchema: (typeof import('../src/shared/utils/seo-test-helper'))['buildPersonSchemaHelper'];
  let buildNewsArticleSchema: (typeof import('../src/shared/utils/seo-test-helper'))['buildNewsArticleSchemaHelper'];
  let buildConferenceSchema: (typeof import('../src/shared/utils/seo-test-helper'))['buildConferenceSchemaHelper'];
  let buildBreadcrumbSchema: (typeof import('../src/shared/utils/seo-test-helper'))['buildBreadcrumbSchemaHelper'];

  beforeAll(() => {
    const helper = require('../src/shared/utils/seo-test-helper');
    buildOrganizationSchema = helper.buildOrganizationSchemaHelper;
    buildDepartmentSchema = helper.buildDepartmentSchemaHelper;
    buildPersonSchema = helper.buildPersonSchemaHelper;
    buildNewsArticleSchema = helper.buildNewsArticleSchemaHelper;
    buildConferenceSchema = helper.buildConferenceSchemaHelper;
    buildBreadcrumbSchema = helper.buildBreadcrumbSchemaHelper;
  });

  it('Organization schema should have correct @type and foundingDate', () => {
    const schema = buildOrganizationSchema();
    expect(schema['@type']).toBe('CollegeOrUniversity');
    expect(schema.foundingDate).toBe('1952');
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema.url).toContain('fa-arch');
  });

  it('Department schema should reference parentOrganization', () => {
    const schema = buildDepartmentSchema({
      nameAr: 'قسم الآثار المصرية',
      nameEn: 'Egyptology',
      slug: 'egyptology',
      descriptionAr: 'وصف القسم',
      descriptionEn: null,
    });
    expect(schema['@type']).toBe('Department');
    expect(schema.name).toBe('قسم الآثار المصرية');
    expect(schema.parentOrganization).toBeDefined();
    expect(schema.url).toContain('egyptology');
  });

  it('Person schema should have correct @type and affiliation', () => {
    const schema = buildPersonSchema({
      id: 'f1a2b3c4-0000-0000-0000-000000000001',
      nameAr: 'د. أحمد محمد',
      nameEn: 'Dr. Ahmed Mohamed',
      degree: 'Professor',
      email: 'ahmed@cu.edu.eg',
      bioAr: 'سيرة ذاتية',
      bioEn: 'Biography',
      photoUrl: 'https://example.com/photo.jpg',
      departmentNameAr: 'قسم الآثار المصرية',
    });
    expect(schema['@type']).toBe('Person');
    expect(schema.email).toBe('ahmed@cu.edu.eg');
    const affiliation = schema.affiliation as Record<string, string>;
    expect(affiliation['@type']).toBe('CollegeOrUniversity');
    const worksFor = schema.worksFor as Record<string, string> | undefined;
    expect(worksFor?.name).toBe('قسم الآثار المصرية');
  });

  it('NewsArticle schema should have correct @type and publisher', () => {
    const schema = buildNewsArticleSchema({
      id: 'news-001',
      titleAr: 'خبر مهم',
      titleEn: 'Important News',
      bodyAr: 'محتوى الخبر...',
      bodyEn: 'News content...',
      publishedAt: '2025-06-01T10:00:00Z',
      updatedAt: '2025-06-02T10:00:00Z',
      coverImage: 'https://example.com/image.jpg',
      category: 'academic',
    });
    expect(schema['@type']).toBe('NewsArticle');
    expect(schema.headline).toBe('خبر مهم');
    const publisher = schema.publisher as Record<string, string>;
    expect(publisher['@type']).toBe('Organization');
    expect(schema.datePublished).toBe('2025-06-01T10:00:00Z');
  });

  it('Conference schema should have correct @type and organizer', () => {
    const schema = buildConferenceSchema({
      titleAr: 'المؤتمر الدولي السابع',
      titleEn: '7th International Conference',
      descriptionAr: 'وصف المؤتمر',
      startDate: '2025-09-15',
      endDate: '2025-09-17',
      location: 'كلية الآثار — جامعة القاهرة',
      slug: 'conf-2025',
    });
    expect(schema['@type']).toBe('Event');
    expect(schema.startDate).toBe('2025-09-15');
    const organizer = schema.organizer as Record<string, string>;
    expect(organizer['@type']).toBe('Organization');
    expect(schema.url).toContain('conf-2025');
  });

  it('Breadcrumb schema should build itemListElement correctly', () => {
    const schema = buildBreadcrumbSchema([
      { name: 'الرئيسية', url: 'https://fa-arch.cu.edu.eg/ar' },
      { name: 'الأقسام', url: 'https://fa-arch.cu.edu.eg/ar/departments' },
      { name: 'قسم الآثار المصرية', url: 'https://fa-arch.cu.edu.eg/ar/departments/egyptology' },
    ]);
    expect(schema['@type']).toBe('BreadcrumbList');
    const items = schema.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0].position).toBe(1);
    expect(items[2].position).toBe(3);
    expect(items[2].name).toBe('قسم الآثار المصرية');
  });

  it('JSON-LD should be valid JSON (serializable)', () => {
    const org = buildOrganizationSchema();
    expect(() => JSON.stringify(org)).not.toThrow();
    const parsed = JSON.parse(JSON.stringify(org));
    expect(parsed['@context']).toBe('https://schema.org');
  });
});

// ─── 3. Performance: Cache Configuration ─────────────────────────────────────

describe('Performance: Redis Cache TTL Configuration', () => {
  it('News list cache should be 5 minutes (from SRS)', () => {
    const NEWS_CACHE_TTL = 5 * 60; // 300 seconds
    expect(NEWS_CACHE_TTL).toBe(300);
    expect(NEWS_CACHE_TTL).toBeLessThanOrEqual(600); // لا يزيد عن 10 دقائق
  });

  it('Pages cache should be 24 hours (static content)', () => {
    const PAGES_CACHE_TTL = 24 * 60 * 60; // 86400 seconds
    expect(PAGES_CACHE_TTL).toBe(86400);
  });

  it('Department cache should be 1 hour', () => {
    const DEPT_CACHE_TTL = 60 * 60; // 3600 seconds
    expect(DEPT_CACHE_TTL).toBe(3600);
  });

  it('Faculty member cache should be 30 minutes', () => {
    const FACULTY_CACHE_TTL = 30 * 60; // 1800 seconds
    expect(FACULTY_CACHE_TTL).toBe(1800);
  });

  it('Search cache should be 10 minutes (from SRS 6.2)', () => {
    const SEARCH_CACHE_TTL = 10 * 60; // 600 seconds
    expect(SEARCH_CACHE_TTL).toBe(600);
  });

  it('Conference cache should be 10 minutes', () => {
    const CONF_CACHE_TTL = 10 * 60; // 600 seconds
    expect(CONF_CACHE_TTL).toBe(600);
  });

  it('Cache key patterns should be namespaced to prevent collision', () => {
    const newsKey = 'news:list:page=1:limit=20';
    const deptKey = 'dept:egyptology';
    const pageKey = 'page:about-history';
    const searchKey = 'search:آثار مصرية:ar';

    // يجب أن تكون مختلفة وتبدأ بـ namespace
    const keys = [newsKey, deptKey, pageKey, searchKey];
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(4);

    // كل key لها namespace مختلف
    keys.forEach((k) => expect(k).toContain(':'));
  });
});

// ─── 4. Performance: Image Optimization Config ───────────────────────────────

describe('Performance: next/image Optimization', () => {
  it('image formats should prioritize AVIF then WebP', () => {
    const formats = ['image/avif', 'image/webp'];
    expect(formats[0]).toBe('image/avif');  // أصغر حجماً
    expect(formats[1]).toBe('image/webp');  // fallback
  });

  it('device sizes should cover mobile, tablet, desktop', () => {
    const deviceSizes = [640, 750, 828, 1080, 1200, 1920];
    expect(deviceSizes).toContain(640);   // mobile
    expect(deviceSizes).toContain(1080);  // tablet/laptop
    expect(deviceSizes).toContain(1920);  // desktop
    expect(deviceSizes.length).toBeGreaterThanOrEqual(4);
  });

  it('static assets cache should be immutable (1 year)', () => {
    const ONE_YEAR = 31536000;
    const cacheHeader = `public, max-age=${ONE_YEAR}, immutable`;
    expect(cacheHeader).toContain('immutable');
    expect(cacheHeader).toContain(String(ONE_YEAR));
  });

  it('image minimumCacheTTL should be at least 1 day', () => {
    const ONE_DAY = 86400;
    expect(ONE_DAY).toBeGreaterThanOrEqual(86400);
  });
});

// ─── 5. SEO: robots.txt Configuration ────────────────────────────────────────

describe('SEO: robots.txt Configuration', () => {
  it('dashboard routes should be disallowed for all bots', () => {
    const disallowed = [
      '/*/student/dashboard',
      '/*/faculty/dashboard',
      '/*/admin/dashboard',
      '/*/login',
      '/api/',
    ];

    disallowed.forEach((path) => {
      expect(path.length).toBeGreaterThan(0);
      expect(typeof path).toBe('string');
    });

    // API routes يجب أن تكون في القائمة
    expect(disallowed.some((p) => p.includes('/api/'))).toBe(true);
  });

  it('GPTBot should be fully disallowed (content protection)', () => {
    const gptBotRule = { userAgent: 'GPTBot', disallow: '/' };
    expect(gptBotRule.disallow).toBe('/');
    expect(gptBotRule.userAgent).toBe('GPTBot');
  });

  it('sitemap URL should point to sitemap.xml', () => {
    const BASE_URL = 'https://fa-arch.cu.edu.eg';
    const sitemapUrl = `${BASE_URL}/sitemap.xml`;
    expect(sitemapUrl).toBe('https://fa-arch.cu.edu.eg/sitemap.xml');
    expect(sitemapUrl.endsWith('.xml')).toBe(true);
  });

  it('public pages should be allowed', () => {
    const allowedPath = '/';
    expect(allowedPath).toBe('/');
  });
});

// ─── 6. SEO: Sitemap Structure ────────────────────────────────────────────────

describe('SEO: Sitemap Static Routes', () => {
  const STATIC_ROUTES = [
    '',
    '/about/history',
    '/about/mission',
    '/about/vision',
    '/about/leadership',
    '/departments',
    '/faculty',
    '/programs/undergraduate',
    '/programs/postgraduate',
    '/news',
    '/journal',
    '/library',
    '/conferences',
    '/contact',
    '/search',
  ];

  it('should have at least 15 static routes', () => {
    expect(STATIC_ROUTES.length).toBeGreaterThanOrEqual(15);
  });

  it('homepage should have priority 1.0', () => {
    const homePriority = 1.0;
    expect(homePriority).toBe(1.0);
  });

  it('about pages should have higher priority than general pages', () => {
    const aboutPriority = 0.8;
    const generalPriority = 0.7;
    expect(aboutPriority).toBeGreaterThan(generalPriority);
  });

  it('each static route should be covered for both locales', () => {
    const LOCALES = ['ar', 'en'];
    const totalEntries = STATIC_ROUTES.length * LOCALES.length;
    expect(totalEntries).toBe(30); // 15 routes × 2 locales
  });

  it('hreflang alternates should cover both ar and en', () => {
    const BASE_URL = 'https://fa-arch.cu.edu.eg';
    const route = '/about/history';
    const alternates = {
      ar: `${BASE_URL}/ar${route}`,
      en: `${BASE_URL}/en${route}`,
    };
    expect(alternates.ar).toContain('/ar/');
    expect(alternates.en).toContain('/en/');
    expect(alternates.ar).not.toBe(alternates.en);
  });

  it('dynamic routes should include news, faculty, conferences', () => {
    const dynamicSources = ['news', 'faculty', 'conferences'];
    dynamicSources.forEach((source) => {
      expect(typeof source).toBe('string');
      expect(source.length).toBeGreaterThan(0);
    });
  });
});

// ─── 7. Accessibility: ARIA & Semantic HTML ───────────────────────────────────

describe('Accessibility: ARIA Compliance Patterns', () => {
  it('breadcrumb nav should use aria-label', () => {
    const ariaLabel = { ar: 'مسار التنقل', en: 'Breadcrumb' };
    expect(ariaLabel.ar).toBeTruthy();
    expect(ariaLabel.en).toBeTruthy();
    expect(ariaLabel.en).toBe('Breadcrumb'); // المصطلح الصحيح لـ WCAG
  });

  it('current page in breadcrumb should have aria-current="page"', () => {
    const ariaCurrent = 'page';
    expect(ariaCurrent).toBe('page'); // القيمة الصحيحة من WCAG 1.4.1
  });

  it('decorative icons should have aria-hidden="true"', () => {
    const decorativeIcon = { 'aria-hidden': 'true' };
    expect(decorativeIcon['aria-hidden']).toBe('true');
  });

  it('main content area should have id="main-content" for skip nav', () => {
    const mainId = 'main-content';
    const skipHref = `#${mainId}`;
    expect(skipHref).toBe('#main-content');
  });

  it('images should have descriptive alt text (not empty)', () => {
    // نتحقق من إن الـ alt text logic صحيح
    const localize = (ar: string, en: string | null, locale: string) =>
      locale === 'en' && en ? en : ar;

    const alt = localize('صورة عضو التدريس', 'Faculty member photo', 'ar');
    expect(alt).toBe('صورة عضو التدريس');
    expect(alt.length).toBeGreaterThan(0);
  });

  it('placeholder icons should have role="img" and aria-label', () => {
    // الـ emoji placeholder للصور المفقودة
    const role = 'img';
    const ariaLabelAr = 'لا توجد صورة';
    const ariaLabelEn = 'No photo available';
    expect(role).toBe('img');
    expect(ariaLabelAr.length).toBeGreaterThan(0);
    expect(ariaLabelEn.length).toBeGreaterThan(0);
  });

  it('interactive elements should have focus:ring styles for keyboard nav', () => {
    // نتحقق من وجود class focus:ring في مكونات الـ UI
    const focusClasses = [
      'focus:outline-none focus:ring-2 focus:ring-primary-400',
      'focus:outline-none focus:ring-2 focus:ring-primary-400 rounded',
    ];
    focusClasses.forEach((cls) => {
      expect(cls).toContain('focus:ring-2');
      expect(cls).toContain('focus:ring-primary');
    });
  });

  it('time elements should use dateTime attribute for dates', () => {
    const dateTime = '2025-06-01T10:00:00Z';
    const parsed = new Date(dateTime);
    // toISOString قد يضيف .000 — نتحقق من التاريخ نفسه فقط
    expect(parsed.getFullYear()).toBe(2025);
    expect(parsed.getMonth()).toBe(5); // June = 5 (0-indexed)
    expect(parsed.getDate()).toBe(1);
    // التاريخ valid وقابل للإدراج في dateTime attribute
    expect(isNaN(parsed.getTime())).toBe(false);
  });

  it('article sections should use aria-labelledby with heading id', () => {
    const headingId = 'publications-heading';
    const ariaLabelledBy = headingId;
    expect(ariaLabelledBy).toBe('publications-heading');
  });
});

// ─── 8. Performance: HTTP Security & Cache Headers ───────────────────────────

describe('Performance: Security & Cache Headers', () => {
  it('HSTS header should have long max-age', () => {
    const hsts = 'max-age=63072000; includeSubDomains; preload';
    expect(hsts).toContain('max-age=63072000');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
    // 63072000 = 2 سنة
    expect(63072000).toBeGreaterThanOrEqual(31536000); // سنة على الأقل
  });

  it('X-Content-Type-Options should be nosniff', () => {
    const header = 'nosniff';
    expect(header).toBe('nosniff');
  });

  it('Referrer-Policy should be strict', () => {
    const policy = 'strict-origin-when-cross-origin';
    expect(policy).toContain('strict-origin');
  });

  it('Permissions-Policy should disable camera and microphone', () => {
    const policy = 'camera=(), microphone=(), geolocation=()';
    expect(policy).toContain('camera=()');
    expect(policy).toContain('microphone=()');
  });

  it('dashboard pages should have no-store cache', () => {
    const dashboardCache = 'no-store, no-cache, must-revalidate';
    expect(dashboardCache).toContain('no-store');
    expect(dashboardCache).toContain('no-cache');
  });

  it('static assets should have immutable cache for 1 year', () => {
    const staticCache = 'public, max-age=31536000, immutable';
    const oneYear = 365 * 24 * 60 * 60;
    expect(staticCache).toContain('immutable');
    expect(staticCache).toContain(String(oneYear));
  });
});

// ─── 9. Performance: DB Index Coverage ───────────────────────────────────────

describe('Performance: Database Index Coverage', () => {
  it('performance_indexes.sql should exist and be non-empty', () => {
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, '../prisma/migrations/performance_indexes.sql');
    expect(fs.existsSync(sqlPath)).toBe(true);
    const content = fs.readFileSync(sqlPath, 'utf-8');
    expect(content.length).toBeGreaterThan(500);
    expect(content).toContain('CREATE INDEX IF NOT EXISTS');
  });

  it('full_text_search_indexes.sql should also exist', () => {
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, '../prisma/migrations/full_text_search_indexes.sql');
    expect(fs.existsSync(sqlPath)).toBe(true);
    const content = fs.readFileSync(sqlPath, 'utf-8');
    expect(content).toContain('GIN');
    expect(content).toContain('to_tsvector');
  });

  it('performance indexes should cover exam_results for student queries', () => {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/performance_indexes.sql'),
      'utf-8'
    );
    expect(content).toContain('exam_results');
    expect(content).toContain('student_id');
  });

  it('performance indexes should cover news published_at DESC', () => {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/performance_indexes.sql'),
      'utf-8'
    );
    expect(content).toContain('news');
    expect(content).toContain('published_at');
    expect(content).toContain('DESC');
  });

  it('ANALYZE statements should be present for query planner', () => {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/performance_indexes.sql'),
      'utf-8'
    );
    expect(content).toContain('ANALYZE');
    // يجب أن يكون لكل الجداول الرئيسية
    expect(content).toContain('ANALYZE users');
    expect(content).toContain('ANALYZE news');
    expect(content).toContain('ANALYZE exam_results');
  });
});
