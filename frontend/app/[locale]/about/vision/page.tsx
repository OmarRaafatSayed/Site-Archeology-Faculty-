import type { Metadata } from 'next';
import { getPage } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';

type Props = { params: { locale: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'رؤية الكلية' : 'Faculty Vision' };
}
export default async function VisionPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';
  const page = await getPage('about-vision').catch(() => null);
  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'رؤية الكلية' : 'Faculty Vision'}</h1>
        <div className="prose-pharaoh">
          {page?.contentAr
            ? <div dangerouslySetInnerHTML={{ __html: localize(page.contentAr, page.contentEn, locale) ?? '' }} />
            : <p>{isAr
                ? 'أن تكون كلية الآثار مرجعاً أكاديمياً رائداً إقليمياً ودولياً في مجالات الدراسات الأثرية.'
                : 'To be a leading regional and international academic reference in the fields of archaeological studies.'
              }</p>
          }
        </div>
      </div>
    </div>
  );
}
