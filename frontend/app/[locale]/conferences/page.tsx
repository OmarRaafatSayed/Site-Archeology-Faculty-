import type { Metadata } from 'next';
import Link from 'next/link';
import { getConferences } from '@/lib/api/endpoints';
import { localize, formatDate, conferenceStatusLabel } from '@/lib/utils/locale';

type Props = { params: { locale: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'المؤتمرات' : 'Conferences' };
}

export default async function ConferencesPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;

  const data = await getConferences().catch(() => ({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 }));

  const statusColors: Record<string, string> = {
    upcoming: 'bg-nile-50 text-nile-700',
    ongoing: 'bg-blue-50 text-blue-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-50 text-red-600',
  };

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'المؤتمرات الدولية' : 'International Conferences'}</h1>

        {data.items.length === 0
          ? <p className="text-gray-500">{isAr ? 'لا توجد مؤتمرات.' : 'No conferences.'}</p>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.items.map((conf) => (
                <Link key={conf.id} href={`${base}/conferences/${conf.slug}`}
                  className="group block bg-white rounded-2xl border border-gray-100 hover:border-gold-500/30 hover:shadow-md transition-all p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full mb-3 ${statusColors[conf.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {conferenceStatusLabel(conf.status, locale)}
                      </span>
                      <h2 className="font-bold text-gray-900 group-hover:text-gold-700 transition-colors text-lg">
                        {localize(conf.titleAr, conf.titleEn, locale)}
                      </h2>
                      {conf.themeAr && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {localize(conf.themeAr, conf.themeEn, locale)}
                        </p>
                      )}
                      {conf.startDate && (
                        <p className="text-sm text-gray-400 mt-3 flex items-center gap-1.5">
                          📅 {formatDate(conf.startDate, locale)}
                          {conf.endDate && ` — ${formatDate(conf.endDate, locale)}`}
                        </p>
                      )}
                      {conf.status === 'upcoming' && (
                        <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-gold-700 group-hover:gap-2 transition-all">
                          {isAr ? 'سجّل الآن' : 'Register Now'}
                          <svg className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-200 group-hover:text-gold-500/60 transition-colors shrink-0">
                      {conf.number}
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
