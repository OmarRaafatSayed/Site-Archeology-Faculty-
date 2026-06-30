import Link from 'next/link';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const isAr = locale === 'ar';
  const base = `/${locale}`;

  return (
    <footer
      dir={isAr ? 'rtl' : 'ltr'}
      className="bg-gray-900"
    >
      {/* خط ذهبي علوي */}
      <div
        className="h-0.5"
        style={{ background: 'linear-gradient(90deg, transparent, #C9A84C 20%, #E0B020 50%, #C9A84C 80%, transparent)' }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* ─── العلامة التجارية ─── */}
          <div className="md:col-span-1">
            <Link href={base} className="flex items-center gap-3 mb-5 group">
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center text-xl font-hieroglyph text-yellow-950 group-hover:shadow-gold transition-shadow duration-300"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #E0B020)' }}
                aria-hidden="true"
              >
                𓂀
              </div>
              <div>
                <p className="font-bold text-white text-sm group-hover:text-gold-400 transition-colors">
                  {isAr ? 'كلية الآثار' : 'Faculty of Archaeology'}
                </p>
                <p className="text-xs text-gray-400">
                  {isAr ? 'جامعة القاهرة' : 'Cairo University'}
                </p>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              {isAr
                ? 'أول كلية متخصصة في دراسة الآثار في العالم العربي، تأسست عام ١٩٧٠.'
                : 'The first specialized archaeology faculty in the Arab world, founded in 1970.'}
            </p>

            {/* رموز هيروغليفية زخرفية */}
            <div className="flex items-center gap-2 text-gold-500/40 font-hieroglyph text-lg select-none" aria-hidden="true">
              <span>𓂀</span>
              <span className="text-gold-500/20">·</span>
              <span>𓃭</span>
              <span className="text-gold-500/20">·</span>
              <span>𓆣</span>
              <span className="text-gold-500/20">·</span>
              <span>𓅓</span>
            </div>
          </div>

          {/* ─── روابط سريعة ─── */}
          <div>
            <h3 className="text-gold-400 font-semibold mb-5 text-sm tracking-wide uppercase">
              {isAr ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: `${base}/about/history`,   ar: 'تاريخ الكلية',     en: 'History' },
                { href: `${base}/about/mission`,   ar: 'الرسالة والرؤية',  en: 'Mission & Vision' },
                { href: `${base}/about/leadership`,ar: 'القيادات',          en: 'Leadership' },
                { href: `${base}/faculty`,          ar: 'هيئة التدريس',     en: 'Faculty Members' },
                { href: `${base}/journal`,          ar: 'المجلة العلمية',   en: 'Scientific Journal' },
              ].map(({ href, ar, en }) => (
                <li key={href}>
                  <Link href={href}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold-400 transition-colors group">
                    <span className="w-1 h-1 rounded-full bg-gold-500/40 group-hover:bg-gold-400 transition-colors flex-shrink-0" />
                    {isAr ? ar : en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── الأقسام ─── */}
          <div>
            <h3 className="text-gold-400 font-semibold mb-5 text-sm tracking-wide uppercase">
              {isAr ? 'الأقسام العلمية' : 'Departments'}
            </h3>
            <ul className="space-y-2.5">
              {[
                { slug: 'egyptology',   ar: 'الآثار المصرية',           en: 'Egyptology',         icon: '𓂀', color: '#C9A84C' },
                { slug: 'islamic',      ar: 'الآثار الإسلامية',          en: 'Islamic Archaeology', icon: '𓅓', color: '#1A7A55' },
                { slug: 'conservation', ar: 'ترميم الآثار',              en: 'Conservation',        icon: '𓊪', color: '#C4522A' },
                { slug: 'greco-roman',  ar: 'الآثار اليونانية الرومانية', en: 'Greco-Roman',        icon: '𓆣', color: '#1B4F8A' },
              ].map(({ slug, ar, en, icon, color }) => (
                <li key={slug}>
                  <Link href={`${base}/departments/${slug}`}
                    className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gray-200 transition-colors group">
                    <span
                      className="font-hieroglyph text-base w-5 text-center transition-transform group-hover:scale-110"
                      style={{ color: `${color}bb` }}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    {isAr ? ar : en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── تواصل معنا ─── */}
          <div>
            <h3 className="text-gold-400 font-semibold mb-5 text-sm tracking-wide uppercase">
              {isAr ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <svg className="w-4 h-4 text-gold-500/60 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isAr ? 'شارع النيل — الجيزة، مصر' : 'Nile Street — Giza, Egypt'}
              </li>
              <li>
                <a
                  href="mailto:archaeology@cu.edu.eg"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gold-400 transition-colors group"
                >
                  <svg className="w-4 h-4 text-gold-500/60 group-hover:text-gold-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  archaeology@cu.edu.eg
                </a>
              </li>
              <li>
                <a
                  href="https://fa-arch.cu.edu.eg"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gold-400 transition-colors group"
                >
                  <svg className="w-4 h-4 text-gold-500/60 group-hover:text-gold-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                  fa-arch.cu.edu.eg
                </a>
              </li>
            </ul>

            <div className="mt-5">
              <Link
                href={`${base}/contact`}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs border border-gold-500/30 text-gold-400 rounded-cartouche
                           hover:border-gold-400/60 hover:text-gold-300 transition-all duration-200"
              >
                {isAr ? 'نموذج التواصل' : 'Contact Form'}
                <svg className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── الشريط السفلي ─── */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500" suppressHydrationWarning>
            {isAr
              ? `© ${new Date().getFullYear()} كلية الآثار — جامعة القاهرة. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} Faculty of Archaeology — Cairo University. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://cu.edu.eg" target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gold-400 transition-colors">
              {isAr ? 'جامعة القاهرة' : 'Cairo University'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
