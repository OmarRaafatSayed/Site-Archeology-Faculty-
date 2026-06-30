/**
 * Dynamic Sitemap — Phase 9: SEO
 * يولّد sitemap.xml ديناميكي من البيانات الحقيقية
 * يُستدعى تلقائياً بـ Next.js على /sitemap.xml
 */
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const LOCALES = ['ar', 'en'] as const;

/** Fetch wrapper — يُستخدم في static generation فقط */
async function sitemapFetch<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_URL}/api${path}?limit=500`, {
      next: { revalidate: 3600 }, // إعادة التوليد كل ساعة
    });
    if (!res.ok) return [] as unknown as T;
    const json = await res.json();
    return (json.data?.items ?? json.data ?? []) as T;
  } catch {
    return [] as unknown as T;
  }
}

/** Static pages — موجودة دائماً */
const STATIC_ROUTES = [
  '',                        // الصفحة الرئيسية
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

/** الأقسام الأربعة الثابتة */
const DEPT_SLUGS = ['egyptology', 'islamic', 'conservation', 'greco-roman'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // 1. الصفحات الثابتة — لكل locale
  for (const locale of LOCALES) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: now,
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route.startsWith('/about') ? 0.8 : 0.7,
        alternates: {
          languages: {
            ar: `${BASE_URL}/ar${route}`,
            en: `${BASE_URL}/en${route}`,
          },
        },
      });
    }

    // 2. صفحات الأقسام
    for (const slug of DEPT_SLUGS) {
      entries.push({
        url: `${BASE_URL}/${locale}/departments/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: {
            ar: `${BASE_URL}/ar/departments/${slug}`,
            en: `${BASE_URL}/en/departments/${slug}`,
          },
        },
      });
    }
  }

  // 3. صفحات الأخبار الديناميكية
  try {
    const news = await sitemapFetch<Array<{ id: string; updatedAt?: string; publishedAt?: string }>>('/news?published=true');
    for (const article of news) {
      const lastMod = article.updatedAt ?? article.publishedAt ?? now.toISOString();
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/news/${article.id}`,
          lastModified: new Date(lastMod),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: {
              ar: `${BASE_URL}/ar/news/${article.id}`,
              en: `${BASE_URL}/en/news/${article.id}`,
            },
          },
        });
      }
    }
  } catch { /* تجاهل خطأ الـ fetch — الـ static pages تبقى */ }

  // 4. صفحات أعضاء هيئة التدريس
  try {
    const faculty = await sitemapFetch<Array<{ id: string; updatedAt?: string }>>('/faculty');
    for (const member of faculty) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/faculty/${member.id}`,
          lastModified: member.updatedAt ? new Date(member.updatedAt) : now,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: {
              ar: `${BASE_URL}/ar/faculty/${member.id}`,
              en: `${BASE_URL}/en/faculty/${member.id}`,
            },
          },
        });
      }
    }
  } catch { /* تجاهل */ }

  // 5. صفحات المؤتمرات
  try {
    const conferences = await sitemapFetch<Array<{ slug: string; updatedAt?: string }>>('/conferences');
    for (const conf of conferences) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/conferences/${conf.slug}`,
          lastModified: conf.updatedAt ? new Date(conf.updatedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: {
              ar: `${BASE_URL}/ar/conferences/${conf.slug}`,
              en: `${BASE_URL}/en/conferences/${conf.slug}`,
            },
          },
        });
      }
    }
  } catch { /* تجاهل */ }

  return entries;
}
