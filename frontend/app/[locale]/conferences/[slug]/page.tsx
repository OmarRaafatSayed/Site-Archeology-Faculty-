import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConference } from '@/lib/api/endpoints';
import { localize, formatDate, conferenceStatusLabel } from '@/lib/utils/locale';
import { buildMetadata, buildConferenceSchema, buildBreadcrumbSchema } from '@/lib/utils/seo';
import JsonLd from '@/components/seo/JsonLd';

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const conf = await getConference(slug).catch(() => null);
  if (!conf) return { title: 'Conference' };

  return buildMetadata({
    locale,
    path: `/conferences/${slug}`,
    titleAr: conf.titleAr,
    titleEn: conf.titleEn ?? conf.titleAr,
    descriptionAr: conf.themeAr ?? conf.descriptionAr ?? undefined,
    descriptionEn: conf.themeEn ?? conf.descriptionEn ?? undefined,
    type: 'website',
  });
}

export default async function ConferencePage({ params: { locale, slug } }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg';

  const conf = await getConference(slug).catch(() => null);
  if (!conf) notFound();

  const confTitle = localize(conf.titleAr, conf.titleEn, locale);

  // JSON-LD
  const confSchema = buildConferenceSchema({
    titleAr: conf.titleAr,
    titleEn: conf.titleEn ?? null,
    descriptionAr: conf.themeAr ?? conf.descriptionAr ?? null,
    startDate: conf.startDate ?? null,
    endDate: conf.endDate ?? null,
    location: conf.location ?? null,
    slug,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: isAr ? 'الرئيسية' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isAr ? 'المؤتمرات' : 'Conferences', url: `${BASE_URL}/${locale}/conferences` },
    { name: confTitle, url: `${BASE_URL}/${locale}/conferences/${slug}` },
  ]);

  const pages = [
    { suffix: 'abstracts', ar: 'الملخصات', en: 'Abstracts' },
    { suffix: 'topics', ar: 'المحاور العلمية', en: 'Topics' },
    { suffix: 'requirements', ar: 'متطلبات الأبحاث', en: 'Requirements' },
    { suffix: 'dates', ar: 'المواعيد', en: 'Dates' },
    { suffix: 'fees', ar: 'رسوم الاشتراك', en: 'Fees' },
    { suffix: 'program', ar: 'البرنامج', en: 'Program' },
    { suffix: 'papers', ar: 'الأبحاث المقدمة', en: 'Papers' },
  ];

  return (
    <>
      <JsonLd data={confSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div dir={isAr ? 'rtl' : 'ltr'}>
        {/* Banner */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <nav aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'} className="text-sm text-gray-400 mb-4">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li><Link href={`${base}`} className="hover:text-white">{isAr ? 'الرئيسية' : 'Home'}</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href={`${base}/conferences`} className="hover:text-white">{isAr ? 'المؤتمرات' : 'Conferences'}</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-white truncate max-w-xs">{confTitle}</li>
              </ol>
            </nav>

            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary-500/20 text-primary-300 rounded-full mb-4">
              {conferenceStatusLabel(conf.status, locale)}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {confTitle}
            </h1>
            {conf.themeAr && (
              <p className="text-gray-300 text-lg">{localize(conf.themeAr, conf.themeEn, locale)}</p>
            )}
            {conf.startDate && (
              <p className="text-gray-400 mt-3">
                <span aria-hidden="true">📅</span>{' '}
                <time dateTime={conf.startDate}>{formatDate(conf.startDate, locale)}</time>
                {conf.endDate && (
                  <> — <time dateTime={conf.endDate}>{formatDate(conf.endDate, locale)}</time></>
                )}
              </p>
            )}
            {conf.status === 'upcoming' && (
              <Link
                href={`${base}/conferences/${slug}/register`}
                className="inline-block mt-6 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {isAr ? 'التسجيل في المؤتمر' : 'Register for the Conference'}
              </Link>
            )}
          </div>
        </div>

        {/* Conference sub-pages nav */}
        <nav
          aria-label={isAr ? 'أقسام المؤتمر' : 'Conference sections'}
          className="border-b border-gray-200 bg-white sticky top-16 z-40"
        >
          <div className="mx-auto max-w-4xl px-4 overflow-x-auto">
            <div className="flex gap-0">
              {pages.map(({ suffix, ar, en }) => (
                <Link
                  key={suffix}
                  href={`${base}/pages/${slug}/${suffix}`}
                  className="px-4 py-4 text-sm font-medium text-gray-500 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-500 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {isAr ? ar : en}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600 text-lg leading-relaxed">
            {isAr
              ? 'يسعدنا الترحيب بمشاركتكم في هذا المؤتمر الدولي المميز. يرجى الاطلاع على الصفحات الفرعية للمزيد من التفاصيل.'
              : 'We are pleased to welcome your participation in this distinguished international conference. Please visit the sub-pages for more details.'}
          </p>
        </div>
      </div>
    </>
  );
}
