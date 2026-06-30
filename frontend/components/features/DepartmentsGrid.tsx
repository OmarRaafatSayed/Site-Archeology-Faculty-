import type { Department } from '@/lib/api/types';
import DepartmentCard from './DepartmentCard';

interface DepartmentsGridProps {
  departments: Department[];
  locale: string;
}

export default function DepartmentsGrid({ departments, locale }: DepartmentsGridProps) {
  const isAr = locale === 'ar';

  return (
    <section
      className="py-20 relative overflow-hidden bg-gray-50"
      aria-labelledby="departments-heading"
    >
      {/* نمط هيروغليفي في الخلفية */}
      <div className="absolute inset-0 bg-hieroglyph opacity-60 pointer-events-none" aria-hidden="true" />

      {/* هالة ذهبية مركزية */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* رأس القسم */}
        <div className="text-center mb-14">
          {/* رموز هيروغليفية زخرفية */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <div
              className="h-px flex-1 max-w-20"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4))' }}
            />
            <div className="flex items-center gap-3 font-hieroglyph text-xl" aria-hidden="true">
              <span className="text-gold-400/50">𓂀</span>
              <span className="text-gold-400/30">𓏏</span>
              <span className="text-gold-400/50">𓁹</span>
            </div>
            <div
              className="h-px flex-1 max-w-20"
              style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }}
            />
          </div>

          <h2 id="departments-heading" className="section-title mb-3">
            {isAr ? 'الأقسام العلمية' : 'Academic Departments'}
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'أربعة أقسام متخصصة تغطي كل جوانب دراسة وصون التراث الأثري'
              : 'Four specialized departments covering all aspects of archaeological study and heritage conservation'}
          </p>
        </div>

        {/* الشبكة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      </div>
    </section>
  );
}
