import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getQualityBoardMembers, getQualityDocuments } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';
import { buildMetadata } from '@/lib/utils/seo';

type Props = { params: { locale: string }; searchParams: { type?: string; page?: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return buildMetadata({
    locale,
    path: '/quality',
    titleAr: 'وحدة ضمان الجودة',
    titleEn: 'Quality Assurance Unit',
    descriptionAr: 'وحدة ضمان الجودة والاعتماد بكلية الآثار جامعة القاهرة',
    descriptionEn: 'Quality Assurance and Accreditation Unit at Faculty of Archaeology, Cairo University',
  });
}

export default async function QualityPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;
  const page = Number(searchParams.page ?? 1);
  const docType = searchParams.type;

  // Fetch board members and documents
  const [boardData, documentsData] = await Promise.all([
    getQualityBoardMembers().catch(() => ({ items: [], total: 0, page: 1, limit: 100, totalPages: 0 })),
    getQualityDocuments({ page, limit: 12, ...(docType ? { type: docType } : {}) })
      .catch(() => ({ items: [], total: 0, page: 1, limit: 12, totalPages: 0 })),
  ]);

  const documentTypes = [
    { key: 'report', labelAr: 'التقارير', labelEn: 'Reports', icon: '📊' },
    { key: 'policy', labelAr: 'السياسات', labelEn: 'Policies', icon: '📋' },
    { key: 'accreditation', labelAr: 'الاعتماد', labelEn: 'Accreditation', icon: '🏆' },
    { key: 'meeting_minutes', labelAr: 'محاضر الاجتماعات', labelEn: 'Meeting Minutes', icon: '📝' },
    { key: 'improvement_plan', labelAr: 'خطط التحسين', labelEn: 'Improvement Plans', icon: '📈' },
    { key: 'other', labelAr: 'أخرى', labelEn: 'Other', icon: '📄' },
  ];

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        {/* ─── Hero Section ─── */}
        <div className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-gold-50 via-amber-50 to-yellow-50 p-8 md:p-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 text-gold-700">
              <span className="text-2xl">🏛️</span>
              <span className="text-sm font-medium tracking-wider uppercase">
                {isAr ? 'الجودة والتميز' : 'Quality & Excellence'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isAr ? 'وحدة ضمان الجودة' : 'Quality Assurance Unit'}
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl leading-relaxed">
              {isAr
                ? 'تعمل وحدة ضمان الجودة على تطوير وتحسين الأداء المؤسسي والأكاديمي للكلية وفقاً لمعايير الجودة المحلية والدولية'
                : 'The Quality Assurance Unit works to develop and improve the institutional and academic performance of the faculty according to local and international quality standards'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl" />
        </div>

        {/* ─── Board Members Section ─── */}
        {boardData.items.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl">👥</span>
              <h2 className="text-2xl font-bold text-gray-900">
                {isAr ? 'أعضاء مجلس وحدة الجودة' : 'Quality Board Members'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boardData.items.map((member: any) => (
                <div
                  key={member.id}
                  className="card-stone group hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Photo */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0">
                      {member.photoUrl ? (
                        <Image
                          src={member.photoUrl}
                          alt={localize(member.nameAr, member.nameEn, locale)}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
                          👤
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-gold-700 transition-colors">
                        {localize(member.nameAr, member.nameEn, locale)}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {localize(member.positionAr, member.positionEn, locale)}
                      </p>
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="text-xs text-gold-700 hover:text-gold-600 transition-colors inline-flex items-center gap-1"
                        >
                          <span>✉️</span>
                          <span className="truncate">{member.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Documents Section ─── */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">📚</span>
            <h2 className="text-2xl font-bold text-gray-900">
              {isAr ? 'وثائق وتقارير الجودة' : 'Quality Documents & Reports'}
            </h2>
          </div>

          {/* Document Type Filters */}
          <div className="flex gap-2 flex-wrap mb-8">
            <Link
              href={`${base}/quality`}
              className={`px-4 py-2 text-sm rounded-full border transition-all inline-flex items-center gap-2 ${
                !docType
                  ? 'bg-gold-600 text-white border-gold-600 font-semibold shadow-md'
                  : 'border-gray-200 text-gray-600 hover:border-gold-500/50 hover:text-gold-700 bg-white'
              }`}
            >
              <span>📂</span>
              <span>{isAr ? 'الكل' : 'All'}</span>
            </Link>
            {documentTypes.map((type) => (
              <Link
                key={type.key}
                href={`${base}/quality?type=${type.key}`}
                className={`px-4 py-2 text-sm rounded-full border transition-all inline-flex items-center gap-2 ${
                  docType === type.key
                    ? 'bg-gold-600 text-white border-gold-600 font-semibold shadow-md'
                    : 'border-gray-200 text-gray-600 hover:border-gold-500/50 hover:text-gold-700 bg-white'
                }`}
              >
                <span>{type.icon}</span>
                <span>{isAr ? type.labelAr : type.labelEn}</span>
              </Link>
            ))}
          </div>

          {/* Documents Grid */}
          {documentsData.items.length === 0 ? (
            <div className="card-stone text-center py-16">
              <div className="text-6xl mb-4 opacity-20">📄</div>
              <p className="text-gray-500">
                {isAr ? 'لا توجد وثائق متاحة حالياً' : 'No documents available at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentsData.items.map((doc: any) => {
                const docTypeData = documentTypes.find((t) => t.key === doc.documentType);
                return (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-stone group hover:shadow-lg hover:border-gold-500/30 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl shrink-0">{docTypeData?.icon || '📄'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gold-700 font-medium mb-1">
                          {isAr ? docTypeData?.labelAr : docTypeData?.labelEn}
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-gold-700 transition-colors line-clamp-2 text-sm mb-1">
                          {localize(doc.titleAr, doc.titleEn, locale)}
                        </h3>
                        {doc.publishYear && (
                          <div className="text-xs text-gray-400">{doc.publishYear}</div>
                        )}
                      </div>
                    </div>

                    {doc.descriptionAr || doc.descriptionEn ? (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {localize(doc.descriptionAr, doc.descriptionEn, locale)}
                      </p>
                    ) : null}

                    <div className="flex items-center gap-2 text-xs text-gold-700 font-medium group-hover:gap-3 transition-all">
                      <span>{isAr ? 'تحميل الوثيقة' : 'Download Document'}</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        {isAr ? '←' : '→'}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {documentsData.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: documentsData.totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`${base}/quality?page=${p}${docType ? `&type=${docType}` : ''}`}
                  className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg border transition-colors ${
                    p === page
                      ? 'bg-gold-600 text-white border-gold-600 font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gold-500/50'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
