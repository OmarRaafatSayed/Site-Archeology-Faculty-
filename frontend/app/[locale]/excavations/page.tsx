import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getExcavationSites } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';
import { buildMetadata } from '@/lib/utils/seo';

type Props = { params: { locale: string }; searchParams: { status?: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return buildMetadata({
    locale,
    path: '/excavations',
    titleAr: 'مواقع الحفائر',
    titleEn: 'Excavation Sites',
    descriptionAr: 'مواقع الحفائر الأثرية التي تعمل بها كلية الآثار جامعة القاهرة',
    descriptionEn: 'Archaeological excavation sites conducted by Faculty of Archaeology, Cairo University',
  });
}

export default async function ExcavationsPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;
  const status = searchParams.status;

  const sitesData = await getExcavationSites({ limit: 50, ...(status ? { status } : {}) })
    .catch(() => ({ items: [], total: 0, page: 1, limit: 50, totalPages: 0 }));

  const statuses = [
    { key: 'active', labelAr: 'نشط', labelEn: 'Active', icon: '🔄', color: 'green' },
    { key: 'completed', labelAr: 'مكتمل', labelEn: 'Completed', icon: '✅', color: 'blue' },
    { key: 'on_hold', labelAr: 'متوقف مؤقتاً', labelEn: 'On Hold', icon: '⏸️', color: 'orange' },
  ];

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        {/* ─── Hero Section ─── */}
        <div className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-8 md:p-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 text-amber-700">
              <span className="text-2xl">⛏️</span>
              <span className="text-sm font-medium tracking-wider uppercase">
                {isAr ? 'اكتشافات أثرية' : 'Archaeological Discoveries'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isAr ? 'مواقع الحفائر الأثرية' : 'Archaeological Excavation Sites'}
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl leading-relaxed">
              {isAr
                ? 'تشارك كلية الآثار في العديد من مواقع الحفائر الأثرية المهمة في مصر، مساهمة في الكشف عن كنوز التاريخ المصري العظيم'
                : 'The Faculty of Archaeology participates in numerous important archaeological excavation sites in Egypt, contributing to uncovering the treasures of great Egyptian history'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl" />
        </div>

        {/* ─── Status Filters ─── */}
        <div className="flex gap-2 flex-wrap mb-12">
          <Link
            href={`${base}/excavations`}
            className={`px-4 py-2 text-sm rounded-full border transition-all inline-flex items-center gap-2 ${
              !status
                ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-md'
                : 'border-gray-200 text-gray-600 hover:border-amber-500/50 hover:text-amber-700 bg-white'
            }`}
          >
            <span>🗺️</span>
            <span>{isAr ? 'جميع المواقع' : 'All Sites'}</span>
          </Link>
          {statuses.map((st) => (
            <Link
              key={st.key}
              href={`${base}/excavations?status=${st.key}`}
              className={`px-4 py-2 text-sm rounded-full border transition-all inline-flex items-center gap-2 ${
                status === st.key
                  ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-md'
                  : 'border-gray-200 text-gray-600 hover:border-amber-500/50 hover:text-amber-700 bg-white'
              }`}
            >
              <span>{st.icon}</span>
              <span>{isAr ? st.labelAr : st.labelEn}</span>
            </Link>
          ))}
        </div>

        {/* ─── Sites Grid ─── */}
        {sitesData.items.length === 0 ? (
          <div className="card-stone text-center py-16">
            <div className="text-6xl mb-4 opacity-20">⛏️</div>
            <p className="text-gray-500">
              {isAr ? 'لا توجد مواقع حفائر متاحة حالياً' : 'No excavation sites available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sitesData.items.map((site: any) => {
              const statusData = statuses.find((s) => s.key === site.status);
              return (
                <Link
                  key={site.id}
                  href={`${base}/excavations/${site.slug}`}
                  className="card-stone group hover:shadow-lg hover:border-amber-500/30 transition-all duration-300"
                >
                  {/* Cover Image */}
                  {site.coverImageUrl && (
                    <div className="relative h-48 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl bg-gray-100">
                      <Image
                        src={site.coverImageUrl}
                        alt={localize(site.nameAr, site.nameEn, locale)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium flex items-center gap-1.5">
                        <span>{statusData?.icon}</span>
                        <span>{isAr ? statusData?.labelAr : statusData?.labelEn}</span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors text-lg mb-1">
                        {localize(site.nameAr, site.nameEn, locale)}
                      </h3>
                      {site.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>📍</span>
                          <span>{site.location}</span>
                        </div>
                      )}
                    </div>

                    {site.descriptionAr || site.descriptionEn ? (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {localize(site.descriptionAr, site.descriptionEn, locale)}
                      </p>
                    ) : null}

                    {/* Metadata */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      {site.startYear && (
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>📅</span>
                          <span>
                            {isAr ? 'بدأ عام' : 'Started in'} {site.startYear}
                          </span>
                        </div>
                      )}
                      {(site.teamLeaderAr || site.teamLeaderEn) && (
                        <div className="text-xs text-amber-700 font-medium flex items-center gap-2">
                          <span>👤</span>
                          <span>{localize(site.teamLeaderAr, site.teamLeaderEn, locale)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-amber-700 font-medium group-hover:gap-3 transition-all pt-2">
                      <span>{isAr ? 'استكشف الموقع' : 'Explore Site'}</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        {isAr ? '←' : '→'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
