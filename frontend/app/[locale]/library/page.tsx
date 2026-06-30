import type { Metadata } from 'next';
import { getLibraryBooks } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';

type Props = { params: { locale: string }; searchParams: { q?: string; type?: string; page?: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'المكتبة الرقمية' : 'Digital Library' };
}

export default async function LibraryPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const page = Number(searchParams.page ?? 1);
  const data = await getLibraryBooks({ q: searchParams.q, type: searchParams.type, page, limit: 20 })
    .catch(() => ({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 }));

  const libraryTypes = ['egyptology', 'islamic', 'conservation', 'postgraduate'];
  const typeLabels: Record<string, { ar: string; en: string }> = {
    egyptology: { ar: 'مكتبة الآثار المصرية', en: 'Egyptology Library' },
    islamic: { ar: 'مكتبة الآثار الإسلامية', en: 'Islamic Archaeology Library' },
    conservation: { ar: 'مكتبة الترميم', en: 'Conservation Library' },
    postgraduate: { ar: 'مكتبة الدراسات العليا', en: 'Postgraduate Library' },
  };

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'المكتبة الرقمية' : 'Digital Library'}</h1>
        <p className="page-subtitle">{data.total} {isAr ? 'كتاب' : 'books'}</p>

        {/* Search + filter */}
        <form className="flex flex-col sm:flex-row gap-3 mb-8">
          <input name="q" defaultValue={searchParams.q} placeholder={isAr ? 'ابحث عن كتاب...' : 'Search books...'}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 text-sm" />
          <select name="type" defaultValue={searchParams.type ?? ''}
            className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 text-sm">
            <option value="">{isAr ? 'كل المكتبات' : 'All Libraries'}</option>
            {libraryTypes.map((t) => (
              <option key={t} value={t}>{typeLabels[t][isAr ? 'ar' : 'en']}</option>
            ))}
          </select>
          <button type="submit" className="px-6 py-2.5 bg-gold-600 text-white font-semibold rounded-lg text-sm hover:bg-gold-700 transition-colors">
            {isAr ? 'بحث' : 'Search'}
          </button>
        </form>

        {data.items.length === 0
          ? <p className="text-gray-500 text-center py-16">{isAr ? 'لا توجد نتائج.' : 'No results found.'}</p>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.items.map((book) => (
                <div key={book.id} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gold-500/30 hover:shadow-md transition-all">
                  <h2 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {localize(book.titleAr, book.titleEn, locale)}
                  </h2>
                  {(book.authorAr || book.authorEn) && (
                    <p className="text-xs text-gray-500 mt-1">{localize(book.authorAr, book.authorEn, locale)}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {book.publishYear && <span>{book.publishYear}</span>}
                    <span>{typeLabels[book.libraryType][isAr ? 'ar' : 'en']}</span>
                    <span>{book.copiesCount} {isAr ? 'نسخة' : 'copies'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
