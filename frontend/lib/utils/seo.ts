/**
 * SEO Utilities — Phase 9
 * ========================
 * Helper functions لبناء Metadata موحد على كل الصفحات:
 *   - canonical URL
 *   - Open Graph (OG) tags
 *   - Twitter Card
 *   - hreflang alternates
 */
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg';

const SITE_NAME_AR = 'كلية الآثار — جامعة القاهرة';
const SITE_NAME_EN = 'Faculty of Archaeology — Cairo University';

export interface BuildMetadataOptions {
  locale: string;
  path: string;              // المسار بعد الـ locale مثال: '/departments/egyptology'
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;            // URL الصورة للـ OG
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;         // للصفحات المحمية
  publishedAt?: string;      // للمقالات
  modifiedAt?: string;
}

/**
 * بناء Metadata كامل — يُستخدم في generateMetadata لكل صفحة
 */
export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const {
    locale,
    path,
    titleAr,
    titleEn,
    descriptionAr,
    descriptionEn,
    image,
    type = 'website',
    noIndex = false,
    publishedAt,
    modifiedAt,
  } = opts;

  const isAr = locale === 'ar';
  const title = isAr ? titleAr : titleEn;
  const description = isAr ? (descriptionAr ?? descriptionEn) : (descriptionEn ?? descriptionAr);
  const siteName = isAr ? SITE_NAME_AR : SITE_NAME_EN;
  const ogLocale = isAr ? 'ar_EG' : 'en_US';
  const ogLocaleAlt = isAr ? 'en_US' : 'ar_EG';

  const canonicalUrl = `${BASE_URL}/${locale}${path}`;
  const arUrl = `${BASE_URL}/ar${path}`;
  const enUrl = `${BASE_URL}/en${path}`;

  const ogImage = image ?? `${BASE_URL}/og-default.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ar: arUrl,
        en: enUrl,
        'x-default': enUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: ogLocale,
      alternateLocale: ogLocaleAlt,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && publishedAt ? { publishedTime: publishedAt } : {}),
      ...(type === 'article' && modifiedAt ? { modifiedTime: modifiedAt } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/**
 * إنشاء JSON-LD للكلية (Organization Schema)
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: SITE_NAME_AR,
    alternateName: SITE_NAME_EN,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    foundingDate: '1952',
    description: 'أول كلية متخصصة في دراسة الآثار في العالم العربي — جامعة القاهرة',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Giza',
      addressCountry: 'EG',
    },
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Cairo University',
      url: 'https://cu.edu.eg',
    },
    sameAs: ['https://cu.edu.eg'],
  };
}

/**
 * إنشاء JSON-LD لقسم أكاديمي (Department Schema)
 */
export function buildDepartmentSchema(opts: {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Department',
    name: opts.nameAr,
    alternateName: opts.nameEn,
    description: opts.descriptionAr ?? opts.descriptionEn,
    url: `${BASE_URL}/ar/departments/${opts.slug}`,
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: SITE_NAME_AR,
      url: BASE_URL,
    },
  };
}

/**
 * إنشاء JSON-LD لعضو هيئة التدريس (Person Schema)
 */
export function buildPersonSchema(opts: {
  nameAr: string;
  nameEn?: string | null;
  degree: string;
  email?: string | null;
  bioAr?: string | null;
  bioEn?: string | null;
  photoUrl?: string | null;
  departmentNameAr?: string;
  id: string;
}) {
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
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: SITE_NAME_AR,
      url: BASE_URL,
    },
    worksFor: opts.departmentNameAr
      ? { '@type': 'Department', name: opts.departmentNameAr }
      : undefined,
  };
}

/**
 * إنشاء JSON-LD لمقال خبري (NewsArticle Schema)
 */
export function buildNewsArticleSchema(opts: {
  titleAr: string;
  titleEn?: string | null;
  bodyAr?: string | null;
  bodyEn?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  coverImage?: string | null;
  category: string;
  id: string;
}) {
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
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME_AR,
      url: BASE_URL,
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME_AR,
    },
  };
}

/**
 * إنشاء JSON-LD لمؤتمر (Event Schema)
 */
export function buildConferenceSchema(opts: {
  titleAr: string;
  titleEn?: string | null;
  descriptionAr?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  slug: string;
}) {
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
      : { '@type': 'Place', name: 'كلية الآثار — جامعة القاهرة' },
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME_AR,
      url: BASE_URL,
    },
  };
}

/**
 * إنشاء JSON-LD لمسار breadcrumb
 */
export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
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
