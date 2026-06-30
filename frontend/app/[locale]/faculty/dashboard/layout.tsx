import DashboardGuard from '@/components/dashboard/DashboardGuard';
import FacultyNavWrapper from './FacultyNavWrapper';

type Props = { children: React.ReactNode; params: { locale: string } };

export default function FacultyDashboardLayout({ children, params: { locale } }: Props) {
  return (
    <DashboardGuard allowedRoles={['faculty']}>
      <FacultyNavWrapper locale={locale}>
        {children}
      </FacultyNavWrapper>
    </DashboardGuard>
  );
}
