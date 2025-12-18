import React from "react";
import { AuditProvider } from "../../contexts/AuditContext";
import { ApricotDashboardLayout } from "./ApricotDashboardLayout";
import { ApricotDashboard } from "./ApricotDashboardFixed";

/**
 * ApricotDashboardPage
 * 
 * The main entry point for the Apricot dashboard with proper layout integration.
 * This combines the Apricot dashboard component with the sidebar layout system.
 */
const ApricotDashboardPage = () => {
  return (
    <ApricotDashboardLayout>
      <AuditProvider>
        <ApricotDashboard />
      </AuditProvider>
    </ApricotDashboardLayout>
  );
};

export default ApricotDashboardPage;