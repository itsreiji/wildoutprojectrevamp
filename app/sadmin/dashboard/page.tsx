import { AdminGuard } from '@/components/admin/AdminGuard';
import { Dashboard } from '@/components/common/Dashboard';

export default function AdminPage() {
  return (
    <AdminGuard requiredRole="admin">
      <Dashboard />
    </AdminGuard>
  );
}
