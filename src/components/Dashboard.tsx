import React from 'react';
import { DashboardLayout } from './dashboard/DashboardLayout';
import { DashboardHome } from './dashboard/DashboardHome';
import { DashboardHero } from './dashboard/DashboardHero';
import { DashboardAbout } from './dashboard/DashboardAbout';
import { DashboardEventsNew } from './dashboard/DashboardEventsNew';
import { DashboardTeam } from './dashboard/DashboardTeam';
import { DashboardGallery } from './dashboard/DashboardGallery';
import { DashboardPartners } from './dashboard/DashboardPartners';
import { DashboardSettings } from './dashboard/DashboardSettings';
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
        return <DashboardEventsNew />;
      case 'team':
        return <DashboardTeam />;
      case 'gallery':
        return <DashboardGallery />;
      case 'partners':
        return <DashboardPartners />;
      case 'settings':
        return <DashboardSettings />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <DashboardLayout>
      {renderPage()}
    </DashboardLayout>
  );
});

Dashboard.displayName = 'Dashboard';
