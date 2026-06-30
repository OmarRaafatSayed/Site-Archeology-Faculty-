import type { Metadata } from 'next';
import Link from 'next/link';
import { searchAll } from '@/lib/api/endpoints';

type Props = { params: { locale: string }; searchParams: { q?: string; type?: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'البحث' : 'Search' };
}

export default async function SearchPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;
  const q = searchParams.q?.trim() ?? '';
  const type = searchParams.type ?? 'all';

  const data = q.length >= 2
    ? await searchAll(q, type, locale).catch(() => ({ query: q, total: 0, results: [], byType: {} }))
    : null;

  const typeLabels: Record<string, { ar: string; en: string }> = {
    all: { ar: 'الكل', en: 'All' },
    news: { ar: 'أخبار', en: 'News' },
    faculty: { ar: 'تدريس', en: 'Faculty' },
    publication: { ar: 'أبحاث', en: 'Research' },
    course: { ar: 'مقررات', en: 'Courses' },
    library: { ar: 'مكتبة', en: 'Library' },
    conference: { ar: 'مؤتمرات', en: 'Conferences' },
  };

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'البحث في الموقع' : 'Search'}</h1>

        {/* Search form */}
        <form className="flex gap-3 mb-8">
          <input name="q" defaultValue={q} placeholder={isAr ? 'ابحث في كل محتوى الموقع...' : 'Search across all content...'}
            className="flex-1 px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 text-base shadow-sm" autoFocus />
          <button type="submit" className="px-8 py-3 bg-gold-600 text-white font-semibold rounded-xl hover:bg-gold-700 transition-colors shadow-sm">
            {isAr ? 'بحث' : 'Search'}
          </button>
        </form>

        {/* Type filters */}
        {data && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(typeLabels).map(([t, labels]) => {
              const count = t === 'all' ? data.total : (data.byType[t as keyof typeof data.byType] ?? 0);
              return (
                <Link key={t} href={`${base}/search?q=${encodeURIComponent(q)}&type=${t}`}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1.5
                    ${type === t
                      ? 'bg-gold-600 text-white border-gold-600 font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gold-500/50 hover:text-gold-700 bg-white'}`}>
                  {labels[isAr ? 'ar' : 'en']}
                  <span className={`text-xs ${type === t ? 'text-gold-100' : 'text-gray-400'}`}>{count}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Results */}
        {!q && (
          <p className="text-gray-500 text-center py-16">{isAr ? 'أدخل كلمة للبحث...' : 'Enter a search term...'}</p>
        )}
        {q && q.length < 2 && (
          <p className="text-gray-500">{isAr ? 'يرجى إدخال حرفين على الأقل.' : 'Please enter at least 2 characters.'}</p>
        )}
        {data && data.results.length === 0 && (
          <p className="text-gray-500 text-center py-16">{isAr ? 'لا توجد نتائج.' : 'No results found.'}</p>
        )}
        {data && data.results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{data.total} {isAr ? 'نتيجة' : 'results'}</p>
            {data.results.map((result, i) => (
              <Link key={`${result.id}-${i}`} href={`${base}${result.url}`}
                className="block p-5 bg-white rounded-xl border border-gray-100 hover:border-gold-500/40 hover:shadow-sm transition-all group">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 mt-0.5">
                    {typeLabels[result.type]?.[isAr ? 'ar' : 'en'] ?? result.type}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-gold-700 truncate transition-colors">
                      {isAr ? result.titleAr : (result.titleEn ?? result.titleAr)}
                    </p>
                    {result.excerpt && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{result.excerpt}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
