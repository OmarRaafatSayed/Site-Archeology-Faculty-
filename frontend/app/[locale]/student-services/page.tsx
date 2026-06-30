import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getStudentServices, getStudentEvents } from '@/lib/api/endpoints';
import { localize, formatDate } from '@/lib/utils/locale';
import { buildMetadata } from '@/lib/utils/seo';

type Props = { params: { locale: string }; searchParams: { category?: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return buildMetadata({
    locale,
    path: '/student-services',
    titleAr: 'خدمات الطلاب',
    titleEn: 'Student Services',
    descriptionAr: 'الخدمات والأنشطة المقدمة للطلاب بكلية الآثار جامعة القاهرة',
    descriptionEn: 'Services and activities offered to students at Faculty of Archaeology, Cairo University',
  });
}

export default async function StudentServicesPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;
  const category = searchParams.category;

  // Fetch services and upcoming events
  const [servicesData, eventsData] = await Promise.all([
    getStudentServices({ limit: 50, ...(category ? { category } : {}) })
      .catch(() => ({ items: [], total: 0, page: 1, limit: 50, totalPages: 0 })),
    getStudentEvents({ upcoming: true, limit: 6 })
      .catch(() => ({ items: [], total: 0, page: 1, limit: 6, totalPages: 0 })),
  ]);

  const categories = [
    { key: 'bookstore', labelAr: 'المكتبة', labelEn: 'Bookstore', icon: '📚', color: 'blue' },
    { key: 'youth_care', labelAr: 'رعاية الشباب', labelEn: 'Youth Care', icon: '🎯', color: 'green' },
    { key: 'training', labelAr: 'التدريب', labelEn: 'Training', icon: '🎓', color: 'purple' },
    { key: 'cultural', labelAr: 'الثقافي', labelEn: 'Cultural', icon: '🎭', color: 'pink' },
    { key: 'sports', labelAr: 'الرياضة', labelEn: 'Sports', icon: '⚽', color: 'orange' },
    { key: 'clubs', labelAr: 'الأندية', labelEn: 'Clubs', icon: '🎪', color: 'teal' },
    { key: 'other', labelAr: 'أخرى', labelEn: 'Other', icon: '📋', color: 'gray' },
  ];

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        {/* ─── Hero Section ─── */}
        <div className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 md:p-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 text-blue-700">
              <span className="text-2xl">🎓</span>
              <span className="text-sm font-medium tracking-wider uppercase">
                {isAr ? 'دعم ورعاية الطلاب' : 'Student Support & Care'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isAr ? 'خدمات الطلاب' : 'Student Services'}
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl leading-relaxed">
              {isAr
                ? 'نوفر مجموعة شاملة من الخدمات والأنشطة لدعم الطلاب وتنمية مهاراتهم الأكاديمية والاجتماعية والرياضية'
                : 'We provide a comprehensive range of services and activities to support students and develop their academic, social, and athletic skills'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl" />
        </div>

        {/* ─── Category Filters ─── */}
        <div className="flex gap-2 flex-wrap mb-12">
          <Link
            href={`${base}/student-services`}
            className={`px-4 py-2 text-sm rounded-full border transition-all inline-flex items-center gap-2 ${
              !category
                ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-md'
                : 'border-gray-200 text-gray-600 hover:border-blue-500/50 hover:text-blue-700 bg-white'
            }`}
          >
            <span>🎯</span>
            <span>{isAr ? 'جميع الخدمات' : 'All Services'}</span>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`${base}/student-services?category=${cat.key}`}
              className={`px-4 py-2 text-sm rounded-full border transition-all inline-flex items-center gap-2 ${
                category === cat.key
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-md'
                  : 'border-gray-200 text-gray-600 hover:border-blue-500/50 hover:text-blue-700 bg-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{isAr ? cat.labelAr : cat.labelEn}</span>
            </Link>
          ))}
        </div>

        {/* ─── Services Grid ─── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">🎯</span>
            <h2 className="text-2xl font-bold text-gray-900">
              {isAr ? 'الخدمات المتاحة' : 'Available Services'}
            </h2>
          </div>

          {servicesData.items.length === 0 ? (
            <div className="card-stone text-center py-16">
              <div className="text-6xl mb-4 opacity-20">🎓</div>
              <p className="text-gray-500">
                {isAr ? 'لا توجد خدمات متاحة حالياً' : 'No services available at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesData.items.map((service: any) => {
                const catData = categories.find((c) => c.key === service.category);
                return (
                  <div
                    key={service.id}
                    className="card-stone group hover:shadow-lg hover:border-blue-500/30 transition-all duration-300"
                  >
                    {/* Cover Image */}
                    {service.coverImageUrl && (
                      <div className="relative h-40 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl bg-gray-100">
                        <Image
                          src={service.coverImageUrl}
                          alt={localize(service.titleAr, service.titleEn, locale)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl shrink-0">{service.iconName || catData?.icon || '🎯'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-blue-700 font-medium mb-1">
                          {isAr ? catData?.labelAr : catData?.labelEn}
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 text-base mb-1">
                          {localize(service.titleAr, service.titleEn, locale)}
                        </h3>
                      </div>
                    </div>

                    {service.descriptionAr || service.descriptionEn ? (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {localize(service.descriptionAr, service.descriptionEn, locale)}
                      </p>
                    ) : null}

                    {/* Contact Info */}
                    <div className="space-y-2 pt-3 border-t border-gray-100">
                      {service.contactEmail && (
                        <a
                          href={`mailto:${service.contactEmail}`}
                          className="text-xs text-blue-700 hover:text-blue-600 transition-colors inline-flex items-center gap-2"
                        >
                          <span>✉️</span>
                          <span className="truncate">{service.contactEmail}</span>
                        </a>
                      )}
                      {service.contactPhone && (
                        <a
                          href={`tel:${service.contactPhone}`}
                          className="text-xs text-blue-700 hover:text-blue-600 transition-colors inline-flex items-center gap-2"
                        >
                          <span>📞</span>
                          <span>{service.contactPhone}</span>
                        </a>
                      )}
                      {service.externalUrl && (
                        <a
                          href={service.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-700 hover:text-blue-600 transition-colors inline-flex items-center gap-2 font-medium"
                        >
                          <span>{isAr ? 'زيارة الموقع' : 'Visit Website'}</span>
                          <span>→</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── Upcoming Events ─── */}
        {eventsData.items.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl">📅</span>
              <h2 className="text-2xl font-bold text-gray-900">
                {isAr ? 'الفعاليات القادمة' : 'Upcoming Events'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsData.items.map((event: any) => (
                <div
                  key={event.id}
                  className="card-stone group hover:shadow-lg hover:border-purple-500/30 transition-all duration-300"
                >
                  {event.coverImageUrl && (
                    <div className="relative h-40 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl bg-gray-100">
                      <Image
                        src={event.coverImageUrl}
                        alt={localize(event.titleAr, event.titleEn, locale)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3 text-sm text-purple-700">
                    <span>📅</span>
                    <span>{formatDate(event.eventDate, locale)}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 text-base mb-2">
                    {localize(event.titleAr, event.titleEn, locale)}
                  </h3>

                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.descriptionAr || event.descriptionEn ? (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {localize(event.descriptionAr, event.descriptionEn, locale)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
