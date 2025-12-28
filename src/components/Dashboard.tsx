import React, { useState } from 'react';
import { DashboardLayout } from './dashboard/DashboardLayout';
import { DashboardHome } from './dashboard/DashboardHome';
import { DashboardHero } from './dashboard/DashboardHero';
import { DashboardAbout } from './dashboard/DashboardAbout';
import { DashboardEventsNew } from './dashboard/DashboardEventsNew';
import { DashboardTeam } from './dashboard/DashboardTeam';
import { DashboardGallery } from './dashboard/DashboardGallery';
import { DashboardPartners } from './dashboard/DashboardPartners';
import { DashboardSettings } from './dashboard/DashboardSettings';

export const Dashboard = React.memo(() => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
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
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderPage()}
    </DashboardLayout>
  );
});

Dashboard.displayName = 'Dashboard';
