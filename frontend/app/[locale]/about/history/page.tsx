import type { Metadata } from 'next';
import Link from 'next/link';
import { getPage } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';
import { buildMetadata, buildBreadcrumbSchema } from '@/lib/utils/seo';
import JsonLd from '@/components/seo/JsonLd';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return buildMetadata({
    locale, path: '/about/history',
    titleAr: 'تاريخ الكلية', titleEn: 'Faculty History',
    descriptionAr: 'تاريخ كلية الآثار بجامعة القاهرة منذ تأسيسها ككلية مستقلة عام ١٩٧٠',
    descriptionEn: 'History of the Faculty of Archaeology at Cairo University since its establishment as an independent faculty in 1970',
  });
}

export default async function HistoryPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg';
  const page = await getPage('about-history').catch(() => null);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: isAr ? 'الرئيسية' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isAr ? 'تاريخ الكلية' : 'History', url: `${BASE_URL}/${locale}/about/history` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16" dir={isAr ? 'rtl' : 'ltr'}>

          {/* Breadcrumb */}
          <nav aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'} className="text-sm mb-8">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link href={`/${locale}`} className="text-gray-500 hover:text-gold-700 transition-colors">
                  {isAr ? 'الرئيسية' : 'Home'}
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li aria-current="page" className="text-gray-700 font-medium">
                {isAr ? 'تاريخ الكلية' : 'History'}
              </li>
            </ol>
          </nav>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
            {page ? localize(page.titleAr, page.titleEn, locale) : (isAr ? 'تاريخ الكلية' : 'Faculty History')}
          </h1>

          {/* Content */}
          <div className="prose-pharaoh">
            {page?.contentAr ? (
              <div dangerouslySetInnerHTML={{ __html: localize(page.contentAr, page.contentEn, locale) ?? '' }} />
            ) : (
              <p>
                {isAr
                  ? 'تأسست كلية الآثار بجامعة القاهرة بشكلها الحالي ككلية مستقلة في عام 1970، لتكون أول كلية متخصصة في دراسة الآثار في العالم العربي، وعلى مدار أكثر من خمسة عقود أسهمت في تخريج مئات الأخصائيين والباحثين الذين حافظوا على التراث الحضاري لمصر والعالم العربي.'
                  : 'The Faculty of Archaeology at Cairo University was established in its current form as an independent faculty in 1970, becoming the first specialized archaeology faculty in the Arab world. Over more than five decades, it has graduated hundreds of specialists and researchers who have preserved the cultural heritage of Egypt and the Arab world.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
