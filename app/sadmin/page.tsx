import { Dashboard } from '@/components/Dashboard';
import { AdminGuard } from '@/components/admin/AdminGuard';

export default function AdminPage() {
  return (
    <AdminGuard requiredRole="admin">
      <Dashboard />
    </AdminGuard>
  );
}