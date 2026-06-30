import type { Metadata } from 'next';
import Image from 'next/image';
import { getCommunityProjects } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';
import { buildMetadata } from '@/lib/utils/seo';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return buildMetadata({
    locale,
    path: '/community',
    titleAr: 'خدمة المجتمع',
    titleEn: 'Community Service',
    descriptionAr: 'مشاريع وأنشطة خدمة المجتمع بكلية الآثار جامعة القاهرة',
    descriptionEn: 'Community service projects and activities at Faculty of Archaeology, Cairo University',
  });
}

export default async function CommunityPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';

  const projectsData = await getCommunityProjects({ limit: 50 })
    .catch(() => ({ items: [], total: 0, page: 1, limit: 50, totalPages: 0 }));

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 md:p-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 text-green-700">
              <span className="text-2xl">🤝</span>
              <span className="text-sm font-medium tracking-wider uppercase">
                {isAr ? 'المسؤولية المجتمعية' : 'Social Responsibility'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isAr ? 'مشاريع خدمة المجتمع' : 'Community Service Projects'}
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl leading-relaxed">
              {isAr
                ? 'نساهم في خدمة المجتمع من خلال مشاريع وأنشطة تهدف إلى نشر الوعي الأثري والثقافي والحفاظ على التراث'
                : 'We contribute to community service through projects and activities aimed at spreading archaeological and cultural awareness and preserving heritage'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-200/20 rounded-full blur-3xl" />
        </div>

        {/* Projects Grid */}
        {projectsData.items.length === 0 ? (
          <div className="card-stone text-center py-16">
            <div className="text-6xl mb-4 opacity-20">🤝</div>
            <p className="text-gray-500">
              {isAr ? 'لا توجد مشاريع متاحة حالياً' : 'No projects available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsData.items.map((project: any) => (
              <div
                key={project.id}
                className="card-stone group hover:shadow-lg hover:border-green-500/30 transition-all duration-300"
              >
                {project.coverImageUrl && (
                  <div className="relative h-48 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl bg-gray-100">
                    <Image
                      src={project.coverImageUrl}
                      alt={localize(project.titleAr, project.titleEn, locale)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors text-lg">
                    {localize(project.titleAr, project.titleEn, locale)}
                  </h3>

                  {project.descriptionAr || project.descriptionEn ? (
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {localize(project.descriptionAr, project.descriptionEn, locale)}
                    </p>
                  ) : null}

                  {(project.partnerAr || project.partnerEn) && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-xs text-green-700 font-medium flex items-center gap-2">
                        <span>🤝</span>
                        <span>{isAr ? 'بالشراكة مع: ' : 'In partnership with: '}</span>
                        <span>{localize(project.partnerAr, project.partnerEn, locale)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
