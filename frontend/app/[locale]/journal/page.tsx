import type { Metadata } from 'next';
import Link from 'next/link';
import { apiFetch } from '@/lib/api/client';
import type { PaginatedResponse, Publication } from '@/lib/api/types';
import { localize } from '@/lib/utils/locale';

type Props = { params: { locale: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'المجلة العلمية' : 'Scientific Journal' };
}

export default async function JournalPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  let publications: Publication[] = [];
  try {
    const res = await fetch(`${API}/api/publications?limit=30&isPublished=true`, { next: { revalidate: 300 } });
    const json = await res.json();
    publications = (json.data as PaginatedResponse<Publication>).items;
  } catch { /* */ }

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'المجلة العلمية للكلية' : 'Faculty Scientific Journal'}</h1>
        <p className="page-subtitle">{isAr ? 'أبحاث ومنشورات أعضاء هيئة التدريس' : 'Research and publications by faculty members'}</p>

        {publications.length === 0
          ? <p className="text-gray-500">{isAr ? 'لا توجد أبحاث منشورة.' : 'No publications available.'}</p>
          : (
            <div className="space-y-5">
              {publications.map((pub) => (
                <div key={pub.id} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gold-500/30 hover:shadow-md transition-all">
                  <h2 className="font-bold text-gray-900">{localize(pub.titleAr, pub.titleEn, locale)}</h2>
                  {pub.faculty && (
                    <p className="text-sm text-gold-700 mt-1">{localize(pub.faculty.nameAr, pub.faculty.nameEn, locale)}</p>
                  )}
                  {pub.abstractAr && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">{localize(pub.abstractAr, pub.abstractEn, locale)}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    {pub.journalName && <span className="text-xs text-gray-400">{pub.journalName}</span>}
                    {pub.publishYear && <span className="text-xs text-gray-400">{pub.publishYear}</span>}
                    {pub.doi && (
                      <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-gold-700 hover:text-gold-600 hover:underline">DOI</a>
                    )}
                    {pub.fileUrl && (
                      <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-gold-50 text-gold-700 px-3 py-1 rounded-full hover:bg-gold-100 transition-colors">
                        {isAr ? 'تحميل' : 'Download'}
                      </a>
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
