import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getNews } from '@/lib/api/endpoints';
import { localize, formatDate, categoryLabel } from '@/lib/utils/locale';
import { buildMetadata } from '@/lib/utils/seo';

type Props = { params: { locale: string }; searchParams: { page?: string; category?: string } };

export async function generateMetadata({ params: { locale }, searchParams }: Props): Promise<Metadata> {
  const category = searchParams.category;
  const titleAr = category ? `أخبار — ${categoryLabel(category, 'ar')}` : 'الأخبار والإعلانات';
  const titleEn = category ? `News — ${categoryLabel(category, 'en')}` : 'News & Announcements';

  return buildMetadata({
    locale,
    path: `/news${category ? `?category=${category}` : ''}`,
    titleAr,
    titleEn,
    descriptionAr: 'آخر أخبار وإعلانات كلية الآثار بجامعة القاهرة',
    descriptionEn: 'Latest news and announcements from the Faculty of Archaeology, Cairo University',
  });
}

export default async function NewsPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;
  const page = Number(searchParams.page ?? 1);
  const category = searchParams.category;

  const data = await getNews({ page, limit: 12, ...(category ? { category } : {}) })
    .catch(() => ({ items: [], total: 0, page: 1, limit: 12, totalPages: 0 }));

  const categories = ['general', 'academic', 'student', 'conference', 'research'];

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'الأخبار والإعلانات' : 'News & Announcements'}</h1>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          <Link href={`${base}/news`}
            className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${!category ? 'bg-gold-600 text-white border-gold-600 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gold-500/50 hover:text-gold-700 bg-white'}`}>
            {isAr ? 'الكل' : 'All'}
          </Link>
          {categories.map((cat) => (
            <Link key={cat} href={`${base}/news?category=${cat}`}
              className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${category === cat ? 'bg-gold-600 text-white border-gold-600 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gold-500/50 hover:text-gold-700 bg-white'}`}>
              {categoryLabel(cat, locale)}
            </Link>
          ))}
        </div>

        {data.items.length === 0
          ? <p className="text-gray-500 text-center py-20">{isAr ? 'لا توجد أخبار.' : 'No news available.'}</p>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((article) => (
                <Link key={article.id} href={`${base}/news/${article.id}`}
                  className="group block bg-white rounded-xl border border-gray-100 hover:border-gold-500/30 hover:shadow-md transition-all overflow-hidden">
                  {article.coverImage && (
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <Image src={article.coverImage} alt={localize(article.titleAr, article.titleEn, locale)} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, 33vw" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gold-700 font-medium">{categoryLabel(article.category, locale)}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDate(article.publishedAt, locale)}</span>
                    </div>
                    <h2 className="font-semibold text-gray-900 group-hover:text-gold-700 transition-colors line-clamp-2 text-sm">
                      {localize(article.titleAr, article.titleEn, locale)}
                    </h2>
                  </div>
                </Link>
              ))}
            </div>
          )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={`${base}/news?page=${p}${category ? `&category=${category}` : ''}`}
                className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg border transition-colors ${p === page ? 'bg-gold-600 text-white border-gold-600 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gold-500/50'}`}>
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
