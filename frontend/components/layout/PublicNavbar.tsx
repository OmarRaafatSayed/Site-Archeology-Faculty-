'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

const DEPT_SLUGS = ['egyptology', 'islamic', 'conservation', 'greco-roman'] as const;

const DEPT_LABELS: Record<string, { ar: string; en: string; icon: string; color: string }> = {
  egyptology:   { ar: 'الآثار المصرية',          en: 'Egyptology',         icon: '𓂀', color: '#C9A84C' },
  islamic:      { ar: 'الآثار الإسلامية',         en: 'Islamic Archaeology', icon: '𓅓', color: '#1A7A55' },
  conservation: { ar: 'ترميم الآثار',             en: 'Conservation',        icon: '𓊪', color: '#C4522A' },
  'greco-roman':{ ar: 'الآثار اليونانية الرومانية', en: 'Greco-Roman',        icon: '𓆣', color: '#1B4F8A' },
};

export default function PublicNavbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const isAr = locale === 'ar';
  const dir  = isAr ? 'rtl' : 'ltr';
  const base = `/${locale}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsMobileOpen(false); setOpenDropdown(null); }, [pathname]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header
      dir={dir}
      className="navbar-public sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm"
      suppressHydrationWarning
    >
      {/* خط ذهبي علوي — rendered via CSS ::before, not JS */}

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ─── الشعار ─────────────────────────── */}
          <Link href={base} className="flex items-center gap-3 shrink-0 group">
            {/* أيقونة دائرية هيروغليفية */}
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-xl font-hieroglyph text-yellow-950 transition-all duration-300 group-hover:shadow-gold"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E0B020)' }}
              aria-hidden="true"
            >
              𓂀
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-bold text-gray-900 group-hover:text-gold-700 transition-colors">
                {isAr ? 'كلية الآثار' : 'Faculty of Archaeology'}
              </p>
              <p className="text-xs text-gray-500">
                {isAr ? 'جامعة القاهرة' : 'Cairo University'}
              </p>
            </div>
          </Link>

          {/* ─── روابط الديسكتوب ────────────────── */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">

            {/* الرئيسية */}
            <NavLink href={base} active={pathname === base || pathname === `${base}/`}>
              {t('home')}
            </NavLink>

            {/* عن الكلية — Dropdown */}
            <DropdownMenu
              label={t('about')}
              isActive={isActive(`${base}/about`)}
              isOpen={openDropdown === 'about'}
              onOpen={() => setOpenDropdown('about')}
              onClose={() => setOpenDropdown(null)}
            >
              {[
                { href: `${base}/about/history`,    label: isAr ? 'تاريخ الكلية' : 'History' },
                { href: `${base}/about/mission`,     label: isAr ? 'الرسالة'      : 'Mission' },
                { href: `${base}/about/vision`,      label: isAr ? 'الرؤية'       : 'Vision' },
                { href: `${base}/about/leadership`,  label: isAr ? 'القيادات'     : 'Leadership' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gold-700 hover:bg-gold-50 transition-colors"
                >
                  <span className="w-1 h-1 rounded-full bg-gold-500/60 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </DropdownMenu>

            {/* الأقسام — Dropdown */}
            <DropdownMenu
              label={t('departments')}
              isActive={isActive(`${base}/departments`)}
              isOpen={openDropdown === 'depts'}
              onOpen={() => setOpenDropdown('depts')}
              onClose={() => setOpenDropdown(null)}
              wide
            >
              {DEPT_SLUGS.map((slug) => {
                const d = DEPT_LABELS[slug];
                return (
                  <Link
                    key={slug}
                    href={`${base}/departments/${slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gold-50 transition-colors group"
                  >
                    <span
                      className="text-lg font-hieroglyph w-6 text-center transition-transform group-hover:scale-110"
                      style={{ color: d.color }}
                      aria-hidden="true"
                    >
                      {d.icon}
                    </span>
                    <span>{d[locale as 'ar' | 'en']}</span>
                  </Link>
                );
              })}
            </DropdownMenu>

            <NavLink href={`${base}/faculty`} active={isActive(`${base}/faculty`)}>
              {t('faculty')}
            </NavLink>
            <NavLink href={`${base}/news`} active={isActive(`${base}/news`)}>
              {t('news')}
            </NavLink>
            <NavLink href={`${base}/quality`} active={isActive(`${base}/quality`)}>
              {isAr ? 'الجودة' : 'Quality'}
            </NavLink>
            <NavLink href={`${base}/student-services`} active={isActive(`${base}/student-services`)}>
              {isAr ? 'خدمات الطلاب' : 'Services'}
            </NavLink>
            <NavLink href={`${base}/excavations`} active={isActive(`${base}/excavations`)}>
              {isAr ? 'الحفائر' : 'Excavations'}
            </NavLink>
            
            {/* More dropdown */}
            <DropdownMenu
              label={isAr ? 'المزيد' : 'More'}
              isActive={isActive(`${base}/community`) || isActive(`${base}/special-programs`) || isActive(`${base}/agreements`) || isActive(`${base}/centers`) || isActive(`${base}/links`)}
              isOpen={openDropdown === 'more'}
              onOpen={() => setOpenDropdown('more')}
              onClose={() => setOpenDropdown(null)}
            >
              {[
                { href: `${base}/community`, label: isAr ? 'خدمة المجتمع' : 'Community', icon: '🤝' },
                { href: `${base}/special-programs`, label: isAr ? 'البرامج الخاصة' : 'Special Programs', icon: '🎯' },
                { href: `${base}/agreements`, label: isAr ? 'الاتفاقيات' : 'Agreements', icon: '🌍' },
                { href: `${base}/centers`, label: isAr ? 'مراكز البحوث' : 'Research Centers', icon: '🔬' },
                { href: `${base}/links`, label: isAr ? 'روابط مهمة' : 'Important Links', icon: '🔗' },
              ].map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gold-700 hover:bg-gold-50 transition-colors"
                >
                  <span className="text-base">{icon}</span>
                  {label}
                </Link>
              ))}
            </DropdownMenu>
            
            <NavLink href={`${base}/library`} active={isActive(`${base}/library`)}>
              {t('library')}
            </NavLink>
            <NavLink href={`${base}/conferences`} active={isActive(`${base}/conferences`)}>
              {t('conferences')}
            </NavLink>
            <NavLink href={`${base}/contact`} active={isActive(`${base}/contact`)}>
              {t('contact')}
            </NavLink>
          </div>

          {/* ─── جانب أيمن ──────────────────────── */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* تبديل اللغة */}
            <Link
              href={pathname.replace(`/${locale}`, locale === 'ar' ? '/en' : '/ar')}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-full
                         hover:border-gold-500/60 hover:text-gold-700 transition-all duration-200"
            >
              {locale === 'ar' ? 'EN' : 'عربي'}
            </Link>
          </div>

          {/* ─── زر الموبايل ────────────────────── */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gold-700 hover:bg-gold-50 transition-colors"
            aria-label={isAr ? 'فتح القائمة' : 'Toggle menu'}
            aria-expanded={isMobileOpen}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* ─── القائمة الجانبية (موبايل) ────────── */}
        {isMobileOpen && (
          <div
            className="lg:hidden border-t border-gray-100 py-4 space-y-0.5 bg-white"
          >
            {[
              { href: base,                       label: t('home') },
              { href: `${base}/about/history`,    label: isAr ? 'تاريخ الكلية' : 'History' },
              { href: `${base}/departments`,      label: t('departments') },
              { href: `${base}/faculty`,          label: t('faculty') },
              { href: `${base}/news`,             label: t('news') },
              { href: `${base}/quality`,          label: isAr ? 'الجودة' : 'Quality' },
              { href: `${base}/student-services`, label: isAr ? 'خدمات الطلاب' : 'Services' },
              { href: `${base}/excavations`,      label: isAr ? 'الحفائر' : 'Excavations' },
              { href: `${base}/community`,        label: isAr ? 'خدمة المجتمع' : 'Community' },
              { href: `${base}/special-programs`, label: isAr ? 'البرامج الخاصة' : 'Special Programs' },
              { href: `${base}/agreements`,       label: isAr ? 'الاتفاقيات' : 'Agreements' },
              { href: `${base}/centers`,          label: isAr ? 'مراكز البحوث' : 'Centers' },
              { href: `${base}/links`,            label: isAr ? 'روابط مهمة' : 'Links' },
              { href: `${base}/library`,          label: t('library') },
              { href: `${base}/conferences`,      label: t('conferences') },
              { href: `${base}/contact`,          label: t('contact') },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gold-700 hover:bg-gold-50 rounded-lg transition-colors"
              >
                <span className="w-1 h-1 rounded-full bg-gold-500/50" />
                {label}
              </Link>
            ))}

            <div className="flex gap-3 px-4 pt-4 border-t border-gray-100 mt-3">
              <Link
                href={pathname.replace(`/${locale}`, locale === 'ar' ? '/en' : '/ar')}
                className="flex-1 text-center py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:text-gold-700 hover:border-gold-400/50 transition-colors"
              >
                {locale === 'ar' ? 'EN' : 'عربي'}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ─── مكوّنات مساعدة داخلية ─────────────────────────── */

function NavLink({
  href, active, children,
}: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${active
          ? 'text-gold-700 bg-gold-50'
          : 'text-gray-600 hover:text-gold-700 hover:bg-gold-50'}`}
    >
      {children}
      {active && (
        <span
          className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #a8882a, #C9A84C)' }}
        />
      )}
    </Link>
  );
}

function DropdownMenu({
  label, isActive, isOpen, onOpen, onClose, wide, children,
}: {
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" onMouseLeave={onClose}>
      <button
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
          ${isActive
            ? 'text-gold-700 bg-gold-50'
            : 'text-gray-600 hover:text-gold-700 hover:bg-gold-50'}`}
        onMouseEnter={onOpen}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        /* pt-1 يملأ الـ gap بين الـ button والـ panel ويمنع onMouseLeave من الانطلاق */
        <div
          className={`absolute top-full pt-1 z-50 ${wide ? 'w-64' : 'w-52'}`}
          style={{ insetInlineStart: 0 }}
        >
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-white">
            {/* خط ذهبي علوي */}
            <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
            <div className="py-1">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
