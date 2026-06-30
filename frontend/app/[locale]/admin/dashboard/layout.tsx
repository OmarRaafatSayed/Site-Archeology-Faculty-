import DashboardGuard from '@/components/dashboard/DashboardGuard';
import AdminNavWrapper from './AdminNavWrapper';

type Props = { children: React.ReactNode; params: { locale: string } };

export default function AdminDashboardLayout({ children, params: { locale } }: Props) {
  return (
    <DashboardGuard allowedRoles={['admin', 'content_manager']}>
      <AdminNavWrapper locale={locale}>
        {children}
      </AdminNavWrapper>
    </DashboardGuard>
  );
}
