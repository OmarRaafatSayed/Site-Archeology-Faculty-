import type { Metadata } from 'next';
import { getAgreements } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';
import { buildMetadata } from '@/lib/utils/seo';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return buildMetadata({
    locale,
    path: '/agreements',
    titleAr: 'الاتفاقيات الدولية',
    titleEn: 'International Agreements',
    descriptionAr: 'الاتفاقيات والشراكات الدولية لكلية الآثار جامعة القاهرة',
    descriptionEn: 'International agreements and partnerships of Faculty of Archaeology, Cairo University',
  });
}

export default async function AgreementsPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';

  const agreementsData = await getAgreements({ limit: 50 })
    .catch(() => ({ items: [], total: 0, page: 1, limit: 50, totalPages: 0 }));

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 p-8 md:p-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 text-cyan-700">
              <span className="text-2xl">🌍</span>
              <span className="text-sm font-medium tracking-wider uppercase">
                {isAr ? 'تعاون دولي' : 'International Cooperation'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isAr ? 'الاتفاقيات والشراكات الدولية' : 'International Agreements & Partnerships'}
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl leading-relaxed">
              {isAr
                ? 'نحرص على بناء شراكات دولية قوية مع جامعات ومؤسسات بحثية عالمية لتبادل الخبرات والمعرفة'
                : 'We are committed to building strong international partnerships with universities and research institutions worldwide for knowledge exchange'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl" />
        </div>

        {agreementsData.items.length === 0 ? (
          <div className="card-stone text-center py-16">
            <div className="text-6xl mb-4 opacity-20">🌍</div>
            <p className="text-gray-500">
              {isAr ? 'لا توجد اتفاقيات متاحة' : 'No agreements available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agreementsData.items.map((agreement: any) => (
              <div key={agreement.id} className="card-stone hover:shadow-lg transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">🌍</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {localize(agreement.partnerNameAr, agreement.partnerNameEn, locale)}
                    </h3>
                    {agreement.country && (
                      <div className="text-xs text-cyan-700">📍 {agreement.country}</div>
                    )}
                  </div>
                </div>
                {(agreement.descriptionAr || agreement.descriptionEn) && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {localize(agreement.descriptionAr, agreement.descriptionEn, locale)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
