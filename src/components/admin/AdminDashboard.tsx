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
import { DashboardTeamForm } from "../dashboard/DashboardTeamForm";
import { DashboardAuditLog } from "../dashboard/DashboardAuditLog";
import { useRouter } from "../router";
import { AdminLayout } from "./AdminLayout";

const AdminDashboard = () => {
  const { getCurrentSubPath } = useRouter();
  const currentPage = getCurrentSubPath();

  return (
    <AdminLayout>
      <AuditProvider>
        <DashboardLayout>
          <DashboardHero />
          <DashboardEvents />
          <DashboardGallery />
          <DashboardTeam />
          <DashboardAbout />
          <DashboardPartners />
          <DashboardSettings />
          <DashboardAuditLog />
        </DashboardLayout>
      </AuditProvider>
    </AdminLayout>
  );
};

export default AdminDashboard;