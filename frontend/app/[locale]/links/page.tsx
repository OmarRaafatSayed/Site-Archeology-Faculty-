import type { Metadata } from 'next';
import { getExternalLinks } from '@/lib/api/endpoints';
import { localize } from '@/lib/utils/locale';
import { buildMetadata } from '@/lib/utils/seo';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return buildMetadata({
    locale,
    path: '/links',
    titleAr: 'روابط مهمة',
    titleEn: 'Important Links',
    descriptionAr: 'روابط خارجية مهمة للطلاب وأعضاء هيئة التدريس',
    descriptionEn: 'Important external links for students and faculty members',
  });
}

export default async function LinksPage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';

  const linksData = await getExternalLinks({ limit: 100 })
    .catch(() => ({ items: [], total: 0, page: 1, limit: 100, totalPages: 0 }));

  const categories = [
    { key: 'academic', icon: '🎓', labelAr: 'أكاديمي', labelEn: 'Academic' },
    { key: 'administrative', icon: '📋', labelAr: 'إداري', labelEn: 'Administrative' },
    { key: 'library', icon: '📚', labelAr: 'مكتبات', labelEn: 'Libraries' },
    { key: 'research', icon: '🔬', labelAr: 'بحثي', labelEn: 'Research' },
    { key: 'other', icon: '🔗', labelAr: 'أخرى', labelEn: 'Other' },
  ];

  // Group by category
  const grouped = categories.map(cat => ({
    ...cat,
    links: linksData.items.filter((link: any) => link.category === cat.key)
  })).filter(cat => cat.links.length > 0);

  return (
    <div className="page-content">
      <div className="page-inner" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-8 md:p-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 text-slate-700">
              <span className="text-2xl">🔗</span>
              <span className="text-sm font-medium tracking-wider uppercase">
                {isAr ? 'وصول سريع' : 'Quick Access'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isAr ? 'روابط مهمة' : 'Important Links'}
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl leading-relaxed">
              {isAr
                ? 'روابط مهمة للخدمات الإلكترونية والأنظمة الأكاديمية والإدارية'
                : 'Important links for electronic services and academic and administrative systems'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/20 rounded-full blur-3xl" />
        </div>

        {grouped.length === 0 ? (
          <div className="card-stone text-center py-16">
            <div className="text-6xl mb-4 opacity-20">🔗</div>
            <p className="text-gray-500">
              {isAr ? 'لا توجد روابط متاحة' : 'No links available'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(cat => (
              <section key={cat.key}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{cat.icon}</span>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isAr ? cat.labelAr : cat.labelEn}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.links.map((link: any) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-stone group hover:shadow-md hover:border-blue-500/30 transition-all flex items-center gap-3"
                    >
                      <div className="text-2xl">{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                          {localize(link.titleAr, link.titleEn, locale)}
                        </h3>
                        {(link.descriptionAr || link.descriptionEn) && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {localize(link.descriptionAr, link.descriptionEn, locale)}
                          </p>
                        )}
                      </div>
                      <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
