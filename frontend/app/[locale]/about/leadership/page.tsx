import type { Metadata } from 'next';
import Image from 'next/image';
import { getFaculty } from '@/lib/api/endpoints';
import { localize, degreeLabel } from '@/lib/utils/locale';

type Props = { params: { locale: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'قيادات الكلية' : 'Faculty Leadership' };
}

export default async function LeadershipPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';
  const facultyData = await getFaculty({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100, totalPages: 0 }));
  const leaders = facultyData.items.filter((f) => f.adminRole);

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'قيادات الكلية' : 'Faculty Leadership'}</h1>

        {leaders.length === 0 ? (
          <p className="text-gray-500 text-center py-16">
            {isAr ? 'لا توجد بيانات متاحة حالياً.' : 'No data available.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaders.map((member) => (
              <div key={member.id} className="card-stone flex gap-4 p-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  {member.photoUrl
                    ? <Image src={member.photoUrl} alt={localize(member.nameAr, member.nameEn, locale)} fill className="object-cover" sizes="80px" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl text-gold-500/40 font-hieroglyph">𓂀</div>}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{localize(member.nameAr, member.nameEn, locale)}</p>
                  <p className="text-sm text-gold-700 font-medium mt-0.5">{member.adminRole}</p>
                  <p className="text-xs text-gray-500 mt-1">{degreeLabel(member.degree, locale)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
