import React from "react";
import { AuditProvider } from "../../contexts/AuditContext";
import { DashboardAbout } from "../dashboard/DashboardAbout";
import { DashboardAuditLog } from "../dashboard/DashboardAuditLog";
import { DashboardEvents } from "../dashboard/DashboardEvents";
import { DashboardGallery } from "../dashboard/DashboardGallery";
import { DashboardHero } from "../dashboard/DashboardHero";
import { DashboardPartners } from "../dashboard/DashboardPartners";
import { DashboardSettings } from "../dashboard/DashboardSettings";
import { DashboardTeam } from "../dashboard/DashboardTeam";
import { DashboardWithRightPanel } from "../dashboard/DashboardWithRightPanel";
import { useRouter } from "../router";
import { AdminLayout } from "./AdminLayout";

export const AdminDashboard = React.memo(() => {
  const { getCurrentSubPath } = useRouter();

  // Extract admin sub-path from URL (e.g., 'events' from '/admin/events')
  const subPath = getCurrentSubPath() || "home";

  const renderPage = () => {
    switch (subPath) {
      case "home":
        return <DashboardWithRightPanel />;
      case "hero":
        return <DashboardHero />;
      case "about":
        return <DashboardAbout />;
      case "events":
        return <DashboardEvents />;
      case "team":
        return <DashboardTeam />;
      case "gallery":
        return <DashboardGallery />;
      case "partners":
        return <DashboardPartners />;
      case "settings":
        return <DashboardSettings />;
      case "audit":
        return <DashboardAuditLog />;
      default:
        return <DashboardWithRightPanel />;
    }
  };

  return (
    <AuditProvider>
      <AdminLayout>{renderPage()}</AdminLayout>
    </AuditProvider>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;