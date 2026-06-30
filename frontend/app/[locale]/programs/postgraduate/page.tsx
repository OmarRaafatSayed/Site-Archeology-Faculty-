import type { Metadata } from 'next';
import { getPrograms } from '@/lib/api/endpoints';
import { localize, programLevelLabel } from '@/lib/utils/locale';

type Props = { params: { locale: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'الدراسات العليا' : 'Postgraduate Programs' };
}
export default async function PostgraduatePage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';
  const [masters, doctorate] = await Promise.all([
    getPrograms('masters').catch(() => ({ items: [], total: 0, page: 1, limit: 100, totalPages: 0 })),
    getPrograms('doctorate').catch(() => ({ items: [], total: 0, page: 1, limit: 100, totalPages: 0 })),
  ]);

  const groups = [
    { level: 'masters', label: isAr ? 'الماجستير' : "Master's", items: masters.items },
    { level: 'doctorate', label: isAr ? 'الدكتوراه' : 'Doctorate', items: doctorate.items },
  ];

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'برامج الدراسات العليا' : 'Postgraduate Programs'}</h1>
        {groups.map(({ level, label, items }) => (
          items.length > 0 && (
            <section key={level} className="mb-10">
              <h2 className="text-xl font-bold text-gold-700 mb-5 pb-2 border-b border-gold-500/20">{label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {items.map((p) => (
                  <div key={p.id} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gold-500/30 hover:shadow-md transition-all">
                    <h3 className="font-bold text-gray-900">{localize(p.nameAr, p.nameEn, locale)}</h3>
                    {p.descriptionAr && <p className="text-gray-600 text-sm mt-2 line-clamp-3">{localize(p.descriptionAr, p.descriptionEn, locale)}</p>}
                  </div>
                ))}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );
}
