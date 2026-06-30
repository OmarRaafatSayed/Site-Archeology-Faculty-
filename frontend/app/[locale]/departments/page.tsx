import type { Metadata } from 'next';
import { getDepartments } from '@/lib/api/endpoints';
import DepartmentsGrid from '@/components/features/DepartmentsGrid';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'الأقسام العلمية' : 'Academic Departments',
    description: locale === 'ar'
      ? 'الأقسام العلمية الأربعة في كلية الآثار بجامعة القاهرة'
      : 'The four academic departments of the Faculty of Archaeology, Cairo University',
  };
}

export default async function DepartmentsPage({ params: { locale } }: Props) {
  const departments = await getDepartments().catch(() => []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DepartmentsGrid departments={departments} locale={locale} />
    </div>
  );
}
