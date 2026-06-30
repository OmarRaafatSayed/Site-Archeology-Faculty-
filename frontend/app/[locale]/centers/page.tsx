import type { Metadata } from 'next';
import Image from 'next/image';
import { getResearchCenters } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';
import { buildMetadata } from '@/lib/utils/seo';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return buildMetadata({
    locale,
    path: '/centers',
    titleAr: 'مراكز البحوث',
    titleEn: 'Research Centers',
    descriptionAr: 'مراكز البحوث والدراسات التابعة لكلية الآثار جامعة القاهرة',
    descriptionEn: 'Research and study centers affiliated with Faculty of Archaeology, Cairo University',
  });
}

export default async function CentersPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';

  const centersData = await getResearchCenters({ limit: 50 })
    .catch(() => ({ items: [], total: 0, page: 1, limit: 50, totalPages: 0 }));

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-8 md:p-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 text-indigo-700">
              <span className="text-2xl">🔬</span>
              <span className="text-sm font-medium tracking-wider uppercase">
                {isAr ? 'البحث العلمي' : 'Scientific Research'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isAr ? 'مراكز البحوث والدراسات' : 'Research & Study Centers'}
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl leading-relaxed">
              {isAr
                ? 'تضم الكلية عدة مراكز بحثية متخصصة تساهم في تطوير البحث العلمي في مجالات الآثار والترميم'
                : 'The faculty includes several specialized research centers that contribute to scientific research development in archaeology and conservation'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl" />
        </div>

        {centersData.items.length === 0 ? (
          <div className="card-stone text-center py-16">
            <div className="text-6xl mb-4 opacity-20">🔬</div>
            <p className="text-gray-500">
              {isAr ? 'لا توجد مراكز متاحة' : 'No centers available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {centersData.items.map((center: any) => (
              <div key={center.id} className="card-stone hover:shadow-lg transition-all">
                {center.logoUrl && (
                  <div className="relative h-32 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl bg-gray-50 flex items-center justify-center">
                    <Image src={center.logoUrl} alt={localize(center.nameAr, center.nameEn, locale)} width={200} height={80} className="object-contain" />
                  </div>
                )}
                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  {localize(center.nameAr, center.nameEn, locale)}
                </h3>
                {(center.descriptionAr || center.descriptionEn) && (
                  <p className="text-sm text-gray-600 line-clamp-4 mb-3">
                    {localize(center.descriptionAr, center.descriptionEn, locale)}
                  </p>
                )}
                {center.websiteUrl && (
                  <a href={center.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-700 hover:text-indigo-600 inline-flex items-center gap-2">
                    <span>{isAr ? 'زيارة الموقع' : 'Visit Website'}</span>
                    <span>→</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
