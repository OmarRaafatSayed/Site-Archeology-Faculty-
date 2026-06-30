/**
 * Student Dashboard Layout
 * يحمي كل صفحات بوابة الطالب بـ DashboardGuard
 */
import DashboardGuard from '@/components/dashboard/DashboardGuard';
import StudentNavWrapper from './StudentNavWrapper';

type Props = { children: React.ReactNode; params: { locale: string } };

export default function StudentDashboardLayout({ children, params: { locale } }: Props) {
  return (
    <DashboardGuard allowedRoles={['student']}>
      <StudentNavWrapper locale={locale}>
        {children}
      </StudentNavWrapper>
    </DashboardGuard>
  );
}
