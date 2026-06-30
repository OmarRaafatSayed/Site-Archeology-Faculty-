import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getFaculty } from '@/lib/api/endpoints';
import { localize, degreeLabel } from '@/lib/utils/locale';

type Props = { params: { locale: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: locale === 'ar' ? 'هيئة التدريس' : 'Faculty Members' };
}

export default async function FacultyPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;
  const data = await getFaculty({ limit: 50 }).catch(() => ({ items: [], total: 0, page: 1, limit: 50, totalPages: 0 }));

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <h1 className="page-title">{isAr ? 'هيئة التدريس' : 'Faculty Members'}</h1>
        <p className="page-subtitle">{data.total} {isAr ? 'عضو' : 'members'}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data.items.map((member) => (
            <Link key={member.id} href={`${base}/faculty/${member.id}`}
              className="group card-stone overflow-hidden block hover:-translate-y-1">
              <div className="relative h-52 bg-gray-100 overflow-hidden">
                {member.photoUrl
                  ? <Image src={member.photoUrl} alt={localize(member.nameAr, member.nameEn, locale)} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 25vw" />
                  : <div className="w-full h-full flex items-center justify-center text-6xl text-gold-500/30 font-hieroglyph">𓂀</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="p-4">
                <p className="font-bold text-gray-900 group-hover:text-gold-700 transition-colors text-sm leading-snug">
                  {localize(member.nameAr, member.nameEn, locale)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{degreeLabel(member.degree, locale)}</p>
                {member.adminRole && (
                  <p className="text-xs text-gold-700 mt-0.5">{member.adminRole}</p>
                )}
                {member.specializationAr && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {localize(member.specializationAr, member.specializationEn, locale)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
