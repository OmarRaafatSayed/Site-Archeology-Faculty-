/**
 * SEO Test Helper — Phase 9
 * ==========================
 * يُعيد إنتاج نفس logic الـ seo.ts في الـ frontend
 * لكن بدون Next.js types — للاختبار فقط في backend Jest.
 *
 * يضمن أن الـ SEO schemas صحيحة structurally قبل الـ deployment.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg';
const SITE_NAME_AR = 'كلية الآثار — جامعة القاهرة';
const SITE_NAME_EN = 'Faculty of Archaeology — Cairo University';

export interface BuildMetadataTestResult {
  title: string;
  description: string | undefined;
  canonical: string;
  alternates: { ar: string; en: string };
  type: string;
  noIndex: boolean;
  publishedAt?: string;
}

export interface BuildMetadataOptions {
  locale: string;
  path: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type?: string;
  noIndex?: boolean;
  publishedAt?: string;
}

export function buildMetadataHelper(opts: BuildMetadataOptions): BuildMetadataTestResult {
  const { locale, path, titleAr, titleEn, descriptionAr, descriptionEn, type = 'website', noIndex = false, publishedAt } = opts;
  const isAr = locale === 'ar';

  return {
    title: isAr ? titleAr : titleEn,
    description: isAr ? (descriptionAr ?? descriptionEn) : (descriptionEn ?? descriptionAr),
    canonical: `${BASE_URL}/${locale}${path}`,
    alternates: {
      ar: `${BASE_URL}/ar${path}`,
      en: `${BASE_URL}/en${path}`,
    },
    type,
    noIndex,
    publishedAt,
  };
}

export function buildOrganizationSchemaHelper(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: SITE_NAME_AR,
    alternateName: SITE_NAME_EN,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    foundingDate: '1952',
    description: 'أول كلية متخصصة في دراسة الآثار في العالم العربي — جامعة القاهرة',
    address: { '@type': 'PostalAddress', addressLocality: 'Giza', addressCountry: 'EG' },
    parentOrganization: { '@type': 'CollegeOrUniversity', name: 'Cairo University', url: 'https://cu.edu.eg' },
    sameAs: ['https://cu.edu.eg'],
  };
}

export function buildDepartmentSchemaHelper(opts: {
  nameAr: string;
  nameEn: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  slug: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Department',
    name: opts.nameAr,
    alternateName: opts.nameEn,
    description: opts.descriptionAr ?? opts.descriptionEn,
    url: `${BASE_URL}/ar/departments/${opts.slug}`,
    parentOrganization: { '@type': 'CollegeOrUniversity', name: SITE_NAME_AR, url: BASE_URL },
  };
}

export function buildPersonSchemaHelper(opts: {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  degree: string;
  email?: string | null;
  bioAr?: string | null;
  bioEn?: string | null;
  photoUrl?: string | null;
  departmentNameAr?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: opts.nameAr,
    alternateName: opts.nameEn,
    jobTitle: opts.degree,
    description: opts.bioAr ?? opts.bioEn,
    image: opts.photoUrl,
    email: opts.email,
    url: `${BASE_URL}/ar/faculty/${opts.id}`,
    affiliation: { '@type': 'CollegeOrUniversity', name: SITE_NAME_AR, url: BASE_URL },
    worksFor: opts.departmentNameAr ? { '@type': 'Department', name: opts.departmentNameAr } : undefined,
  };
}

export function buildNewsArticleSchemaHelper(opts: {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  bodyAr?: string | null;
  bodyEn?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  coverImage?: string | null;
  category: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: opts.titleAr,
    alternativeHeadline: opts.titleEn,
    description: opts.bodyAr?.substring(0, 160) ?? opts.bodyEn?.substring(0, 160),
    datePublished: opts.publishedAt,
    dateModified: opts.updatedAt ?? opts.publishedAt,
    image: opts.coverImage,
    url: `${BASE_URL}/ar/news/${opts.id}`,
    articleSection: opts.category,
    publisher: { '@type': 'Organization', name: SITE_NAME_AR, url: BASE_URL },
    author: { '@type': 'Organization', name: SITE_NAME_AR },
  };
}

export function buildConferenceSchemaHelper(opts: {
  titleAr: string;
  titleEn?: string | null;
  descriptionAr?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  slug: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: opts.titleAr,
    alternateName: opts.titleEn,
    description: opts.descriptionAr,
    startDate: opts.startDate,
    endDate: opts.endDate,
    url: `${BASE_URL}/ar/conferences/${opts.slug}`,
    location: opts.location
      ? { '@type': 'Place', name: opts.location }
      : { '@type': 'Place', name: SITE_NAME_AR },
    organizer: { '@type': 'Organization', name: SITE_NAME_AR, url: BASE_URL },
  };
}

export function buildBreadcrumbSchemaHelper(items: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
