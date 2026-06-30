import type { Metadata } from 'next';
import { getPage } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';

type Props = { params: { locale: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'رسالة الكلية' : 'Faculty Mission' };
}
export default async function MissionPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';
  const page = await getPage('about-mission').catch(() => null);
  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'رسالة الكلية' : 'Faculty Mission'}</h1>
        <div className="prose-pharaoh">
          {page?.contentAr
            ? <div dangerouslySetInnerHTML={{ __html: localize(page.contentAr, page.contentEn, locale) ?? '' }} />
            : <p>{isAr
                ? 'إعداد كوادر علمية وأكاديمية متخصصة في مجالات الآثار وترميمها والحفاظ على التراث الحضاري.'
                : 'Preparing specialized scientific and academic cadres in the fields of archaeology, conservation, and cultural heritage preservation.'
              }</p>
          }
        </div>
      </div>
    </div>
  );
}
