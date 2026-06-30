'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import type { Department } from '@/lib/api/types';
import { localize } from '@/lib/utils/locale';

interface DepartmentCardProps {
  department: Department;
}

/* رموز هيروغليفية لكل قسم */
const DEPT_ICONS: Record<string, string> = {
  egyptology:    '𓂀',
  islamic:       '𓅓',
  conservation:  '𓊪',
  'greco-roman': '𓆣',
};

/* ألوان كل قسم */
const DEPT_COLORS: Record<string, { primary: string; glow: string; border: string; bg: string }> = {
  egyptology:    { primary: '#a8882a', glow: 'rgba(201,168,76,0.15)',  border: 'rgba(201,168,76,0.30)', bg: 'rgba(253,249,237,0.8)' },
  islamic:       { primary: '#1A7A55', glow: 'rgba(26,122,85,0.12)',   border: 'rgba(26,122,85,0.25)',  bg: 'rgba(237,250,244,0.8)' },
  conservation:  { primary: '#C4522A', glow: 'rgba(196,82,42,0.12)',   border: 'rgba(196,82,42,0.25)',  bg: 'rgba(254,244,239,0.8)' },
  'greco-roman': { primary: '#1B4F8A', glow: 'rgba(27,79,138,0.12)',   border: 'rgba(27,79,138,0.25)',  bg: 'rgba(238,244,251,0.8)' },
};

export default function DepartmentCard({ department }: DepartmentCardProps) {
  const locale = useLocale();
  const base = `/${locale}`;

  const name        = localize(department.nameAr, department.nameEn, locale);
  const description = localize(department.descriptionAr, department.descriptionEn, locale);
  const colors      = DEPT_COLORS[department.slug] ?? DEPT_COLORS['egyptology'];
  const icon        = DEPT_ICONS[department.slug]  ?? '𓏏';
  const href        = `${base}/departments/${department.slug}`;

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl h-80 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2"
      style={{
        border: `1px solid ${colors.border}`,
        background: colors.bg,
      }}
      aria-label={name}
    >
      {/* صورة الخلفية */}
      {department.coverImageUrl ? (
        <Image
          src={department.coverImageUrl}
          alt=""
          fill
          className="object-cover opacity-10 scale-105 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          aria-hidden="true"
        />
      ) : (
        <div
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-hieroglyph"
          aria-hidden="true"
        />
      )}

      {/* طبقة التدرج — فاتح للأسفل */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.7) 100%)`,
        }}
      />

      {/* هالة اللون عند hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${colors.glow} 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* خط لوني سفلي */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"
        style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)` }}
        aria-hidden="true"
      />

      {/* المحتوى */}
      <div className="relative h-full flex flex-col p-6">

        {/* أيقونة هيروغليفية */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-hieroglyph mb-auto
                     border transition-all duration-300 group-hover:scale-110 group-hover:shadow-md bg-white"
          style={{
            borderColor: colors.border,
            color: colors.primary,
          }}
          aria-hidden="true"
        >
          {icon}
        </div>

        {/* عدد أعضاء هيئة التدريس */}
        {department.facultyCount !== undefined && (
          <div
            className="absolute top-5 end-5 px-2.5 py-1 rounded-full text-xs font-medium border bg-white"
            style={{
              color: colors.primary,
              borderColor: colors.border,
            }}
          >
            {department.facultyCount} {locale === 'ar' ? 'عضو' : 'members'}
          </div>
        )}

        {/* النص السفلي */}
        <div className="mt-auto">
          <h3 className="text-lg font-bold text-gray-900 transition-colors duration-200 leading-snug">
            {name}
          </h3>

          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {description?.slice(0, 90)}
          </p>

          {/* CTA */}
          <div
            className="mt-4 flex items-center gap-1.5 text-sm font-medium
                       opacity-0 -translate-y-2
                       group-hover:opacity-100 group-hover:translate-y-0
                       transition-all duration-300 delay-100"
            style={{ color: colors.primary }}
          >
            <span className="font-hieroglyph text-base" aria-hidden="true">𓏏</span>
            <span>{locale === 'ar' ? 'استكشف القسم' : 'Explore Department'}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
