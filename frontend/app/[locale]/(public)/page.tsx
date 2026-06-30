import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getDepartments, getNews, getConferences } from '@/lib/api/endpoints';
import DepartmentsGrid from '@/components/features/DepartmentsGrid';
import { localize, formatDate } from '@/lib/utils/locale';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'الرئيسية' : 'Home',
    description: locale === 'ar'
      ? 'الموقع الرسمي لكلية الآثار بجامعة القاهرة'
      : 'Official website of the Faculty of Archaeology, Cairo University',
  };
}

/* ─── رموز هيروغليفية للزخرفة ─── */
const HIEROGLYPHS = ['𓂀', '𓃭', '𓆣', '𓅓', '𓇯', '𓈖', '𓊪', '𓏏', '𓁹', '𓂋'];

export default async function HomePage({ params: { locale } }: Props) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;

  const [departments, newsData, conferencesData] = await Promise.all([
    getDepartments().catch(() => []),
    getNews({ limit: 5 }).catch(() => ({ items: [], total: 0, page: 1, limit: 5, totalPages: 0 })),
    getConferences('upcoming').catch(() => ({ items: [], total: 0, page: 1, limit: 3, totalPages: 0 })),
  ]);

  const latestNews = newsData.items;
  const upcomingConferences = conferencesData.items.slice(0, 3);

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          Hero — الصحراء تحت النجوم
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        aria-label={isAr ? 'القسم الرئيسي' : 'Hero section'}
        style={{ background: 'linear-gradient(180deg, #fdf9f0 0%, #faf4e4 55%, #f5ecce 100%)' }}
      >
        {/* خلفية نمط الهيروغليف */}
        <div className="absolute inset-0 bg-hieroglyph opacity-[0.85] pointer-events-none" />

        {/* هالة ذهبية مركزية */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* خط علوي ذهبي */}
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, #C9A84C 30%, #E0B020 50%, #C9A84C 70%, transparent)' }} />

        {/* رموز هيروغليفية عائمة في الخلفية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
          {HIEROGLYPHS.map((h, i) => (
            <span
              key={i}
              className="absolute text-gold-600/30 font-hieroglyph animate-float"
              style={{
                fontSize: `${2 + (i % 3) * 1.5}rem`,
                left: `${(i * 11 + 5) % 95}%`,
                top: `${(i * 17 + 8) % 85}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${6 + i * 0.5}s`,
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* المحتوى الرئيسي */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">

          {/* شارة التأسيس — مصممة كـ cartouche */}
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="text-gold-500/40 text-xl font-hieroglyph" aria-hidden="true">𓂀</span>
            <span className="badge-hieroglyph text-sm tracking-widest uppercase">
              {isAr ? 'منذ عام ١٩٧٠' : 'Est. 1970 CE'}
            </span>
            <span className="text-gold-500/40 text-xl font-hieroglyph" aria-hidden="true">𓁹</span>
          </div>

          {/* العنوان الرئيسي */}
          <h1 className="font-bold leading-tight">
            {isAr ? (
              <span
                className="block text-5xl md:text-7xl lg:text-8xl mb-3 font-arabic"
                style={{
                  color: '#a8882a',
                  fontFamily: "'Cairo', 'Tajawal', sans-serif",
                  fontWeight: 900,
                  lineHeight: 1.3,
                }}
              >
                كلية الآثار
              </span>
            ) : (
              <span className="block text-5xl md:text-7xl lg:text-8xl text-gradient-gold mb-3">
                Faculty of Archaeology
              </span>
            )}
            <span className="block text-2xl md:text-3xl text-gray-600 font-normal tracking-wider">
              {isAr ? 'جامعة القاهرة' : 'Cairo University'}
            </span>
          </h1>

          {/* فاصل هيروغليفي */}
          <div className="flex items-center justify-center gap-4 my-8">
            <div className="h-px flex-1 max-w-24"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4))' }} />
            <span className="text-gold-400 text-2xl font-hieroglyph tracking-widest" aria-hidden="true">
              𓆣 𓅓 𓇯
            </span>
            <div className="h-px flex-1 max-w-24"
              style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }} />
          </div>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {isAr
              ? 'أول كلية متخصصة في دراسة الآثار في العالم العربي — نحافظ على التراث الحضاري ونُعلّم أجيال المستقبل'
              : 'The first specialized archaeology faculty in the Arab world — preserving cultural heritage and educating future generations'}
          </p>

          {/* أزرار CTA */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href={`${base}/departments`} className="btn-gold text-sm md:text-base">
              <span className="font-hieroglyph text-lg" aria-hidden="true">𓏏</span>
              {isAr ? 'استكشف الأقسام' : 'Explore Departments'}
            </Link>
            <Link href={`${base}/about/history`} className="btn-outline-gold text-sm md:text-base">
              {isAr ? 'تاريخ الكلية' : 'Our History'}
            </Link>
          </div>

          {/* إحصاءات — داخل بطاقات حجرية */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: isAr ? '١٩٧٠' : '1970', label: isAr ? 'سنة التأسيس' : 'Founded', icon: '𓇯' },
              { num: '4',                     label: isAr ? 'أقسام علمية' : 'Departments', icon: '𓊪' },
              { num: isAr ? '+٢٠٠' : '200+', label: isAr ? 'عضو تدريس' : 'Faculty Members', icon: '𓂋' },
              { num: isAr ? '+٥٠٠٠' : '5000+', label: isAr ? 'طالب' : 'Students', icon: '𓈖' },
            ].map(({ num, label, icon }) => (
              <div key={label} className="card-stone p-5 text-center group cursor-default">
                <div className="text-gold-600/60 text-2xl font-hieroglyph mb-2 group-hover:text-gold-600 transition-colors" aria-hidden="true">
                  {icon}
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gradient-gold">{num}</p>
                <p className="text-xs text-gray-500 mt-1 tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* مؤشر التمرير */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-1 animate-bounce">
            <div className="w-0.5 h-8 rounded-full"
              style={{ background: 'linear-gradient(180deg, rgba(201,168,76,0.6), transparent)' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400/60" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          الأقسام العلمية
      ═══════════════════════════════════════════════════ */}
      {departments.length > 0 && (
        <DepartmentsGrid departments={departments} locale={locale} />
      )}

      {/* ═══════════════════════════════════════════════════
          آخر الأخبار
      ═══════════════════════════════════════════════════ */}
      {latestNews.length > 0 && (
        <section
          className="py-20 relative overflow-hidden bg-gray-50"
          aria-labelledby="news-heading"
        >
          {/* نمط خلفية خفيف */}
          <div className="absolute inset-0 bg-hieroglyph opacity-30 pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* رأس القسم */}
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gold-600 text-xl font-hieroglyph" aria-hidden="true">𓅓</span>
                  <span className="text-xs tracking-widest uppercase text-gold-600/60">
                    {isAr ? 'أحدث المستجدات' : 'Latest Updates'}
                  </span>
                </div>
                <h2 id="news-heading" className="text-3xl md:text-4xl font-bold text-gray-900">
                  {isAr ? 'آخر الأخبار' : 'Latest News'}
                </h2>
              </div>
              <Link
                href={`${base}/news`}
                className="hidden sm:flex items-center gap-2 text-sm text-gold-700 hover:text-gold-600 transition-colors group"
              >
                {isAr ? 'كل الأخبار' : 'All News'}
                <svg
                  className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.slice(0, 3).map((article, idx) => (
                <Link
                  key={article.id}
                  href={`${base}/news/${article.id}`}
                  className="card-stone group flex flex-col overflow-hidden"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {/* صورة المقالة — تظهر فقط لو موجودة */}
                  {article.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={article.coverImage}
                        alt={localize(article.titleAr, article.titleEn, locale)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {/* طبقة ذهبية على الصورة عند hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* الفئة */}
                    <span className="badge-hieroglyph text-xs mb-3 self-start">
                      {article.category}
                    </span>
                    {/* العنوان */}
                    <h3 className="font-semibold text-gray-900 group-hover:text-gold-700 transition-colors line-clamp-2 leading-snug flex-1">
                      {localize(article.titleAr, article.titleEn, locale)}
                    </h3>
                    {/* التاريخ */}
                    <p className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="font-hieroglyph text-gold-500/50" aria-hidden="true">𓇯</span>
                      {formatDate(article.publishedAt, locale)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* رابط كل الأخبار — موبايل */}
            <div className="mt-8 text-center sm:hidden">
              <Link href={`${base}/news`} className="btn-outline-gold text-sm">
                {isAr ? 'كل الأخبار' : 'All News'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          المؤتمرات القادمة
      ═══════════════════════════════════════════════════ */}
      {upcomingConferences.length > 0 && (
        <section
          className="py-20 relative overflow-hidden bg-white"
          aria-labelledby="conf-heading"
        >
          {/* هالة خضراء نيلية خفيفة */}
          <div
            className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(26,122,85,0.06) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          {/* هالة زرقاء لازوردية خفيفة */}
          <div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(27,79,138,0.06) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-nile-500 text-xl font-hieroglyph" aria-hidden="true">𓆣</span>
                  <span className="text-xs tracking-widest uppercase text-nile-500/60">
                    {isAr ? 'الفعاليات القادمة' : 'Upcoming Events'}
                  </span>
                </div>
                <h2 id="conf-heading" className="text-3xl md:text-4xl font-bold text-gray-900">
                  {isAr ? 'المؤتمرات القادمة' : 'Upcoming Conferences'}
                </h2>
              </div>
              <Link
                href={`${base}/conferences`}
                className="hidden sm:flex items-center gap-2 text-sm text-nile-600 hover:text-nile-700 transition-colors group"
              >
                {isAr ? 'كل المؤتمرات' : 'All Conferences'}
                <svg
                  className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingConferences.map((conf, idx) => (
                <Link
                  key={conf.id}
                  href={`${base}/conferences/${conf.slug}`}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-white border border-nile-500/20 transition-all duration-300 hover:border-nile-500/40 hover:shadow-md hover:-translate-y-1"
                >
                  {/* رقم المؤتمر */}
                  <div className="absolute top-4 end-4 w-10 h-10 rounded-full border border-nile-500/20 bg-nile-50 flex items-center justify-center">
                    <span className="text-xs font-bold text-nile-600">#{conf.number}</span>
                  </div>

                  {/* شارة الحالة */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border border-nile-500/20 text-nile-700 bg-nile-50 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-nile-500 animate-pulse" />
                    {isAr ? 'قادم' : 'Upcoming'}
                  </span>

                  <h3 className="font-semibold text-gray-900 group-hover:text-nile-700 transition-colors line-clamp-2 leading-snug">
                    {localize(conf.titleAr, conf.titleEn, locale)}
                  </h3>

                  {conf.startDate && (
                    <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                      <span className="font-hieroglyph text-nile-500/60" aria-hidden="true">𓇯</span>
                      {formatDate(conf.startDate, locale)}
                    </p>
                  )}

                  {conf.location && (
                    <p className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-nile-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {conf.location}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          روابط سريعة — على شكل لوحات حجرية
      ═══════════════════════════════════════════════════ */}
      <section
        className="py-20 relative overflow-hidden bg-gray-50"
        aria-labelledby="links-heading"
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }} />
              <span className="text-gold-600 text-2xl font-hieroglyph" aria-hidden="true">𓏏</span>
              <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }} />
            </div>
            <h2 id="links-heading" className="text-3xl md:text-4xl font-bold text-gray-900">
              {isAr ? 'بوابات الكلية' : 'Faculty Portals'}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              {
                href: `${base}/programs/undergraduate`,
                ar: 'برامج البكالوريوس', en: 'Undergraduate',
                icon: '𓂋', color: '#a8882a',
              },
              {
                href: `${base}/programs/postgraduate`,
                ar: 'الدراسات العليا', en: 'Postgraduate',
                icon: '𓈖', color: '#1B4F8A',
              },
              {
                href: `${base}/library`,
                ar: 'المكتبة الرقمية', en: 'Digital Library',
                icon: '𓊪', color: '#1A7A55',
              },
              {
                href: `${base}/journal`,
                ar: 'المجلة العلمية', en: 'Scientific Journal',
                icon: '𓅓', color: '#C4522A',
              },
            ].map(({ href, ar, en, icon, color }) => (
              <Link
                key={href}
                href={href}
                className="group relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-md border bg-white"
                style={{ borderColor: `${color}30` }}
              >
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <span
                    className="text-4xl font-hieroglyph transition-transform duration-300 group-hover:scale-110"
                    style={{ color: color }}
                    aria-hidden="true"
                  >
                    {icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {isAr ? ar : en}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
