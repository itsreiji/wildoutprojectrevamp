import React from "react";
import { AuditProvider } from "../../contexts/AuditContext";
import { DashboardAbout } from "../dashboard/DashboardAbout";
import { DashboardEvents } from "../dashboard/DashboardEvents";
import { DashboardGallery } from "../dashboard/DashboardGallery";
import { DashboardHero } from "../dashboard/DashboardHero";
import { DashboardLayout } from "../dashboard/DashboardLayout";
import { DashboardPartners } from "../dashboard/DashboardPartners";
import { DashboardSettings } from "../dashboard/DashboardSettings";
import { DashboardTeam } from "../dashboard/DashboardTeam";
import { DashboardAuditLog } from "../dashboard/DashboardAuditLog";
import { DashboardHome } from "../dashboard/DashboardHome";
import { useRouter } from "../router";

/**
 * AdminDashboard Component
 * 
 * The main entry point for the administrative interface.
 * Uses conditional rendering to show the appropriate management section
 * based on the current URL sub-path.
 */
const AdminDashboard = () => {
  const { getCurrentSubPath } = useRouter();
  const currentPage = getCurrentSubPath() || "home";

  // Map sub-paths to components
  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return <DashboardHome />;
      case "hero":
        return <DashboardHero />;
      case "events":
        return <DashboardEvents />;
      case "gallery":
        return <DashboardGallery />;
      case "team":
        return <DashboardTeam />;
      case "about":
        return <DashboardAbout />;
      case "partners":
        return <DashboardPartners />;
      case "settings":
        return <DashboardSettings />;
      case "audit":
        return <DashboardAuditLog />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <AuditProvider>
      <DashboardLayout>
        {renderContent()}
      </DashboardLayout>
    </AuditProvider>
  );
};

export default AdminDashboard;
