import React from 'react';
import { AdminLayout } from '../admin/AdminLayout';
import { DashboardHome } from './dashboard/DashboardHome';
import { DashboardHero } from './dashboard/DashboardHero';
import { DashboardAbout } from './dashboard/DashboardAbout';
import { DashboardEvents } from './dashboard/DashboardEvents';
import { DashboardTeam } from './dashboard/DashboardTeam';
import { DashboardGallery } from './dashboard/DashboardGallery';
import { DashboardPartners } from './dashboard/DashboardPartners';
import { DashboardSettings } from './dashboard/DashboardSettings';
import { DashboardAuditLog } from './dashboard/DashboardAuditLog';
import { AuditProvider } from '../contexts/AuditContext';
import { useRouter } from './router';

export const Dashboard = React.memo(() => {
  const { getCurrentSubPath } = useRouter();

  // Extract admin sub-path from URL (e.g., 'events' from '/admin/events')
  const subPath = getCurrentSubPath() || 'home';

  const renderPage = () => {
    switch (subPath) {
      case 'home':
        return <DashboardHome />;
      case 'hero':
        return <DashboardHero />;
      case 'about':
        return <DashboardAbout />;
      case 'events':
        return <DashboardEvents />;
      case 'team':
        return <DashboardTeam />;
      case 'gallery':
        return <DashboardGallery />;
      case 'partners':
        return <DashboardPartners />;
      case 'settings':
        return <DashboardSettings />;
      case 'audit':
        return <DashboardAuditLog />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <AuditProvider>
      <AdminLayout>
        {renderPage()}
      </AdminLayout>
    </AuditProvider>
  );
});

Dashboard.displayName = 'Dashboard';
