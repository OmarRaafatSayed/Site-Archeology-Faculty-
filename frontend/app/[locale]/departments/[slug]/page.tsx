import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDepartment, getDepartmentFaculty, getDepartmentPrograms } from '@/lib/api/endpoints';
import { localize, degreeLabel, programLevelLabel } from '@/lib/utils/locale';
import { buildMetadata, buildDepartmentSchema, buildBreadcrumbSchema } from '@/lib/utils/seo';
import JsonLd from '@/components/seo/JsonLd';

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const dept = await getDepartment(slug).catch(() => null);
  if (!dept) return { title: 'Department' };

  return buildMetadata({
    locale,
    path: `/departments/${slug}`,
    titleAr: localize(dept.nameAr, dept.nameEn, 'ar'),
    titleEn: localize(dept.nameAr, dept.nameEn, 'en'),
    descriptionAr: dept.descriptionAr ?? undefined,
    descriptionEn: dept.descriptionEn ?? undefined,
  });
}

export default async function DepartmentPage({ params: { locale, slug } }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;

  const [dept, faculty, programs] = await Promise.all([
    getDepartment(slug).catch(() => null),
    getDepartmentFaculty(slug).catch(() => []),
    getDepartmentPrograms(slug).catch(() => []),
  ]);

  if (!dept) notFound();

  const accentColor = dept.accentColor ?? '#6B7280';
  const deptName = localize(dept.nameAr, dept.nameEn, locale);

  // JSON-LD schemas
  const deptSchema = buildDepartmentSchema({
    nameAr: dept.nameAr,
    nameEn: dept.nameEn ?? null,
    descriptionAr: dept.descriptionAr ?? null,
    descriptionEn: dept.descriptionEn ?? null,
    slug,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: isAr ? 'الرئيسية' : 'Home', url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg'}/${locale}` },
    { name: isAr ? 'الأقسام' : 'Departments', url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg'}/${locale}/departments` },
    { name: deptName, url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg'}/${locale}/departments/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={deptSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div dir={isAr ? 'rtl' : 'ltr'}>
        {/* Header Banner */}
        <div className="relative h-64 md:h-80 overflow-hidden" style={{ backgroundColor: `${accentColor}33` }}>
          {dept.coverImageUrl && (
            <Image
              src={dept.coverImageUrl}
              alt={deptName}
              fill
              className="object-cover opacity-30"
              sizes="100vw"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-8">
              {/* Breadcrumb visible */}
              <nav aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'} className="text-sm text-white/80 mb-3">
                <ol className="flex items-center gap-1.5 flex-wrap">
                  <li><Link href={`${base}`} className="hover:text-white transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link></li>
                  <li aria-hidden="true" className="text-white/40">/</li>
                  <li><Link href={`${base}/departments`} className="hover:text-white transition-colors">{isAr ? 'الأقسام' : 'Departments'}</Link></li>
                  <li aria-hidden="true" className="text-white/40">/</li>
                  <li aria-current="page" className="text-white font-medium">{deptName}</li>
                </ol>
              </nav>
              <div className="w-12 h-1 rounded-full mb-4" style={{ backgroundColor: accentColor }} />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {deptName}
              </h1>
              {dept.facultyCount !== undefined && (
                <p className="text-white/80 mt-1">
                  {dept.facultyCount} {isAr ? 'عضو تدريس' : 'faculty members'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Description */}
          {(dept.descriptionAr || dept.descriptionEn) && (
            <section aria-label={isAr ? 'نبذة عن القسم' : 'About the department'} className="mb-12 prose-pharaoh">
              <p>{localize(dept.descriptionAr, dept.descriptionEn, locale)}</p>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Programs */}
            {programs.length > 0 && (
              <section aria-labelledby="programs-heading">
                <h2 id="programs-heading" className="text-xl font-bold text-gray-900 mb-5">
                  {isAr ? 'البرامج الدراسية' : 'Programs'}
                </h2>
                <div className="space-y-3">
                  {programs.map((p) => (
                    <div key={p.id} className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gold-500/30 transition-all">
                      <p className="font-semibold text-gray-900 text-sm">{localize(p.nameAr, p.nameEn, locale)}</p>
                      <p className="text-xs text-gray-500 mt-1">{programLevelLabel(p.level, locale)}</p>
                      {p.creditHours && (
                        <p className="text-xs text-gray-400">
                          {p.creditHours} {isAr ? 'ساعة معتمدة' : 'credit hours'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Faculty Members */}
            <section className="lg:col-span-2" aria-labelledby="faculty-heading">
              <h2 id="faculty-heading" className="text-xl font-bold text-gray-900 mb-5">
                {isAr ? 'أعضاء هيئة التدريس' : 'Faculty Members'}
              </h2>
              {faculty.length === 0
                ? <p className="text-gray-500 text-sm">{isAr ? 'لا توجد بيانات.' : 'No data available.'}</p>
                : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {faculty.map((member) => {
                      const memberName = localize(member.nameAr, member.nameEn, locale);
                      return (
                        <Link
                          key={member.id}
                          href={`${base}/faculty/${member.id}`}
                          className="group flex gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gold-500/30 hover:shadow-sm transition-all"
                          aria-label={memberName}
                        >
                          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 shrink-0">
                            {member.photoUrl
                              ? (
                                <Image src={member.photoUrl} alt={memberName} fill className="object-cover" sizes="56px" />
                              )
                              : (
                                <div className="w-full h-full flex items-center justify-center text-xl text-gray-400" aria-hidden="true">
                                  👤
                                </div>
                              )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-gold-700 transition-colors">
                              {memberName}
                            </p>
                            <p className="text-xs text-gray-500">{degreeLabel(member.degree, locale)}</p>
                            {member.adminRole && (
                              <p className="text-xs text-gold-700">{member.adminRole}</p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
            </section>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
