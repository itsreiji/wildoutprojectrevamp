import React from "react";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardMainContentProps {
  children?: React.ReactNode;
}

/**
 * DashboardMainContent component
 *
 * Provides a consistent layout wrapper for dashboard pages.
 * If children are provided, it renders them within the standard layout.
 * If no children are provided (default dashboard view), it shows a welcome screen with basic info.
 */
const DashboardMainContent = ({ children }: DashboardMainContentProps) => {
  const { user } = useAuth();

  const displayName = user?.email?.split("@")[0] || "User";

  if (children) {
    return (
      <div className="flex-1 bg-[#12141a] p-8 relative z-10">
        <div className="w-full max-w-[1600px] mx-auto min-w-0">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#12141a] p-8" id="main-content">
      <div className="w-full max-w-[1600px] mx-auto min-w-0 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
              DASHBOARD OVERVIEW
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Welcome back,{" "}
              <span className="text-[#E93370] font-bold">{displayName}</span>!
              Here's what's happening today.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 px-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Server Status
                </p>
                <p className="text-xs font-bold text-green-500">OPTIMAL</p>
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
              Quick Access
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Seamlessly manage your content with our intuitive navigation
              system.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
              Instant Sync
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your updates are pushed live to the WildOut! platform in
              milliseconds.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-[#E93370]/10 text-[#E93370] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#E93370] group-hover:text-white transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
              Secure & Audited
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Every action is logged and protected with enterprise-grade
              security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DashboardMainContent };
