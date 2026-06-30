import type { Metadata } from 'next';
import Image from 'next/image';
import { getSpecialPrograms } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';
import { buildMetadata } from '@/lib/utils/seo';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return buildMetadata({
    locale,
    path: '/special-programs',
    titleAr: 'البرامج الخاصة',
    titleEn: 'Special Programs',
    descriptionAr: 'البرامج والدبلومات الخاصة بكلية الآثار جامعة القاهرة',
    descriptionEn: 'Special programs and diplomas at Faculty of Archaeology, Cairo University',
  });
}

export default async function SpecialProgramsPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';

  const programsData = await getSpecialPrograms({ limit: 50 })
    .catch(() => ({ items: [], total: 0, page: 1, limit: 50, totalPages: 0 }));

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-8 md:p-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 text-purple-700">
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-medium tracking-wider uppercase">
                {isAr ? 'تعليم متميز' : 'Distinguished Education'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isAr ? 'البرامج الخاصة والدبلومات' : 'Special Programs & Diplomas'}
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl leading-relaxed">
              {isAr
                ? 'نقدم برامج ودبلومات متخصصة في مجالات الآثار والترميم ونظم المعلومات الأثرية والإرشاد السياحي'
                : 'We offer specialized programs and diplomas in archaeology, conservation, archaeological information systems, and tour guiding'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl" />
        </div>

        {programsData.items.length === 0 ? (
          <div className="card-stone text-center py-16">
            <div className="text-6xl mb-4 opacity-20">🎓</div>
            <p className="text-gray-500">
              {isAr ? 'لا توجد برامج متاحة حالياً' : 'No programs available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programsData.items.map((program: any) => (
              <div key={program.id} className="card-stone group hover:shadow-lg transition-all">
                {program.coverImageUrl && (
                  <div className="relative h-48 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl">
                    <Image src={program.coverImageUrl} alt={localize(program.nameAr, program.nameEn, locale)} fill className="object-cover" sizes="50vw" />
                  </div>
                )}
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-purple-700 transition-colors mb-2">
                  {localize(program.nameAr, program.nameEn, locale)}
                </h3>
                {(program.descriptionAr || program.descriptionEn) && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {localize(program.descriptionAr, program.descriptionEn, locale)}
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
