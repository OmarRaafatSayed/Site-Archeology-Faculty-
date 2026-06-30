import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsArticle } from '@/lib/api/endpoints';
import { localize, formatDate, categoryLabel } from '@/lib/utils/locale';
import { buildMetadata, buildNewsArticleSchema, buildBreadcrumbSchema } from '@/lib/utils/seo';
import JsonLd from '@/components/seo/JsonLd';

type Props = { params: { locale: string; id: string } };

export async function generateMetadata({ params: { locale, id } }: Props): Promise<Metadata> {
  const article = await getNewsArticle(id).catch(() => null);
  if (!article) return { title: 'News' };

  return buildMetadata({
    locale,
    path: `/news/${id}`,
    titleAr: article.titleAr,
    titleEn: article.titleEn ?? article.titleAr,
    descriptionAr: article.bodyAr?.slice(0, 160),
    descriptionEn: article.bodyEn?.slice(0, 160),
    image: article.coverImage ?? undefined,
    type: 'article',
    publishedAt: article.publishedAt ?? undefined,
    modifiedAt: article.updatedAt ?? undefined,
  });
}

export default async function NewsArticlePage({ params: { locale, id } }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg';

  const article = await getNewsArticle(id).catch(() => null);
  if (!article) notFound();

  const articleTitle = localize(article.titleAr, article.titleEn, locale);

  // JSON-LD
  const articleSchema = buildNewsArticleSchema({
    id,
    titleAr: article.titleAr,
    titleEn: article.titleEn ?? null,
    bodyAr: article.bodyAr ?? null,
    bodyEn: article.bodyEn ?? null,
    publishedAt: article.publishedAt ?? null,
    updatedAt: article.updatedAt ?? null,
    coverImage: article.coverImage ?? null,
    category: article.category,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: isAr ? 'الرئيسية' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isAr ? 'الأخبار' : 'News', url: `${BASE_URL}/${locale}/news` },
    { name: articleTitle, url: `${BASE_URL}/${locale}/news/${id}` },
  ]);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <article
        className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16"
        dir={isAr ? 'rtl' : 'ltr'}
        aria-labelledby="article-title"
      >
        {/* Breadcrumb */}
        <nav aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'} className="text-sm text-gray-500 mb-6">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><Link href={base} className="hover:text-gray-700">{isAr ? 'الرئيسية' : 'Home'}</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`${base}/news`} className="hover:text-gray-700">{isAr ? 'الأخبار' : 'News'}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-gray-900 truncate max-w-xs">{articleTitle}</li>
          </ol>
        </nav>

        {/* Category + Date */}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full">
            {categoryLabel(article.category, locale)}
          </span>
          <time
            dateTime={article.publishedAt ?? undefined}
            className="text-sm text-gray-400"
          >
            {formatDate(article.publishedAt, locale)}
          </time>
        </div>

        {/* Title */}
        <h1 id="article-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {articleTitle}
        </h1>

        {/* Cover image */}
        {article.coverImage && (
          <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden mb-8 bg-gray-100">
            <Image
              src={article.coverImage}
              alt={articleTitle}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
        )}

        {/* Body */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {localize(article.bodyAr, article.bodyEn, locale)?.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Back */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            href={`${base}/news`}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
          >
            <svg
              className={`w-4 h-4 ${isAr ? '' : 'rotate-180'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            {isAr ? 'العودة إلى الأخبار' : 'Back to News'}
          </Link>
        </div>
      </article>
    </>
  );
}
