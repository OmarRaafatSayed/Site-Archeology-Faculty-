import type { Metadata } from 'next';
import { getPrograms } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';

type Props = { params: { locale: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'برامج البكالوريوس' : 'Undergraduate Programs' };
}
export default async function UndergraduatePage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';
  const data = await getPrograms('undergraduate').catch(() => ({ items: [], total: 0, page: 1, limit: 100, totalPages: 0 }));
  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'برامج البكالوريوس' : 'Undergraduate Programs'}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.items.map((p) => (
            <div key={p.id} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gold-500/30 hover:shadow-md transition-all">
              <h2 className="font-bold text-gray-900">{localize(p.nameAr, p.nameEn, locale)}</h2>
              {p.descriptionAr && <p className="text-gray-600 text-sm mt-2 line-clamp-3">{localize(p.descriptionAr, p.descriptionEn, locale)}</p>}
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                {p.creditHours && <span>{p.creditHours} {isAr ? 'ساعة' : 'hours'}</span>}
                {p.durationYears && <span>{p.durationYears} {isAr ? 'سنوات' : 'years'}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
