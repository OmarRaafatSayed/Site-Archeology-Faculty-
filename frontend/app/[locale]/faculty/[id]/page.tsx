import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFacultyMember, getFacultyPublications } from '@/lib/api/endpoints';
import { localize, degreeLabel } from '@/lib/utils/locale';
import { buildMetadata, buildPersonSchema, buildBreadcrumbSchema } from '@/lib/utils/seo';
import JsonLd from '@/components/seo/JsonLd';

type Props = { params: { locale: string; id: string } };

export async function generateMetadata({ params: { locale, id } }: Props): Promise<Metadata> {
  const member = await getFacultyMember(id).catch(() => null);
  if (!member) return { title: 'Faculty Member' };

  return buildMetadata({
    locale,
    path: `/faculty/${id}`,
    titleAr: member.nameAr,
    titleEn: member.nameEn ?? member.nameAr,
    descriptionAr: member.bioAr
      ?? `${member.nameAr} — ${degreeLabel(member.degree, 'ar')} في كلية الآثار بجامعة القاهرة`,
    descriptionEn: member.bioEn
      ?? `${member.nameEn ?? member.nameAr} — ${degreeLabel(member.degree, 'en')} at Faculty of Archaeology, Cairo University`,
    image: member.photoUrl ?? undefined,
    type: 'profile',
  });
}

export default async function FacultyMemberPage({ params: { locale, id } }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;

  const [member, pubs] = await Promise.all([
    getFacultyMember(id).catch(() => null),
    getFacultyPublications(id).catch(() => ({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 })),
  ]);

  if (!member) notFound();

  const memberName = localize(member.nameAr, member.nameEn, locale);
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg';

  // JSON-LD
  const personSchema = buildPersonSchema({
    id,
    nameAr: member.nameAr,
    nameEn: member.nameEn ?? null,
    degree: degreeLabel(member.degree, 'en'),
    email: member.email ?? null,
    bioAr: member.bioAr ?? null,
    bioEn: member.bioEn ?? null,
    photoUrl: member.photoUrl ?? null,
    departmentNameAr: member.department?.nameAr,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: isAr ? 'الرئيسية' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isAr ? 'هيئة التدريس' : 'Faculty', url: `${BASE_URL}/${locale}/faculty` },
    { name: memberName, url: `${BASE_URL}/${locale}/faculty/${id}` },
  ]);

  return (
    <>
      <JsonLd data={personSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Breadcrumb */}
        <nav aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'} className="text-sm text-gray-500 mb-8">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link href={`${base}`} className="hover:text-gray-900">{isAr ? 'الرئيسية' : 'Home'}</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`${base}/faculty`} className="hover:text-gray-900">{isAr ? 'هيئة التدريس' : 'Faculty'}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-gray-900 font-medium">{memberName}</li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Photo */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-gray-100 shadow">
              {member.photoUrl
                ? (
                  <Image
                    src={member.photoUrl}
                    alt={memberName}
                    fill
                    className="object-cover"
                    sizes="192px"
                    priority
                  />
                )
                : (
                  <div
                    className="w-full h-full flex items-center justify-center text-7xl text-gray-300"
                    role="img"
                    aria-label={isAr ? 'لا توجد صورة' : 'No photo available'}
                  >
                    👤
                  </div>
                )}
            </div>
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="text-sm text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
                aria-label={isAr ? `مراسلة ${memberName}` : `Email ${memberName}`}
              >
                {member.email}
              </a>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{memberName}</h1>
            <p className="text-primary-600 font-medium mt-1">{degreeLabel(member.degree, locale)}</p>
            {member.adminRole && <p className="text-gray-600 text-sm mt-0.5">{member.adminRole}</p>}
            {member.department && (
              <p className="text-sm text-gray-500 mt-1">
                {localize(member.department.nameAr, member.department.nameEn, locale)}
              </p>
            )}
            {(member.specializationAr || member.specializationEn) && (
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-1">
                  {isAr ? 'التخصص' : 'Specialization'}
                </h2>
                <p className="text-gray-600">
                  {localize(member.specializationAr, member.specializationEn, locale)}
                </p>
              </div>
            )}
            {(member.bioAr || member.bioEn) && (
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-1">
                  {isAr ? 'السيرة الذاتية' : 'Biography'}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {localize(member.bioAr as string, member.bioEn as string, locale)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Publications */}
        {pubs.items.length > 0 && (
          <section className="mt-12" aria-labelledby="publications-heading">
            <h2 id="publications-heading" className="text-xl font-bold text-gray-900 mb-5">
              {isAr ? 'الأبحاث والمنشورات' : 'Publications'}
            </h2>
            <div className="space-y-4">
              {pubs.items.map((pub) => (
                <article key={pub.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="font-semibold text-gray-900">
                    {localize(pub.titleAr, pub.titleEn, locale)}
                  </p>
                  {pub.journalName && (
                    <p className="text-sm text-gray-500 mt-1">{pub.journalName}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {pub.publishYear && (
                      <span className="text-xs text-gray-400">{pub.publishYear}</span>
                    )}
                    {pub.doi && (
                      <a
                        href={`https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline focus:outline-none focus:ring-1 focus:ring-primary-400 rounded"
                        aria-label={`DOI: ${pub.doi}`}
                      >
                        DOI: {pub.doi}
                      </a>
                    )}
                    {pub.fileUrl && (
                      <a
                        href={pub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline focus:outline-none focus:ring-1 focus:ring-primary-400 rounded"
                        aria-label={isAr ? `تحميل بحث: ${localize(pub.titleAr, pub.titleEn, locale)}` : `Download: ${localize(pub.titleAr, pub.titleEn, locale)}`}
                      >
                        {isAr ? 'تحميل' : 'Download'}
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
