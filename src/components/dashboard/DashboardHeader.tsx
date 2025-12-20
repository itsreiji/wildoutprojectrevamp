import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatusBadge } from "../ui/StatusBadge";
import { Bell, Search } from "lucide-react";
import React from "react";
import { useStaticContent } from "../../contexts/StaticContentContext";
import { useRouter } from "../router/RouterContext";
import { cn } from "../ui/utils";

interface DashboardHeaderProps {
  currentPage: string;
}

// Mock notifications - can be replaced with real data from context or API
const mockNotifications = [
  {
    title: "New Event Created",
    desc: "WildOut Summer Fest was created",
    time: "2 min ago",
    color: "bg-blue-500",
  },
  {
    title: "System Update",
    desc: "Dashboard successfully updated",
    time: "1 hour ago",
    color: "bg-green-500",
  },
  {
    title: "New User Registered",
    desc: "Welcome to 5 new users",
    time: "3 hours ago",
    color: "bg-purple-500",
  },
];

export const DashboardHeader = React.memo(
  ({ currentPage }: DashboardHeaderProps) => {
    const { getAdminPath } = useRouter();
    const { adminSections } = useStaticContent();

    const currentSection = adminSections.find(
      (item) => item.slug === currentPage
    );
    const pageTitle =
      currentSection?.label ||
      currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    return (
      <header
        className={cn(
          "flex h-20 shrink-0 items-center justify-between gap-4",
          "border-b border-white/5 bg-[#12141a] !bg-opacity-100 !opacity-100 !backdrop-blur-none shadow-lg",
          "sticky top-0 z-20 w-full px-6 md:px-12 shrink-0"
        )}
        style={{ backgroundColor: '#12141a', opacity: 1, backdropFilter: 'none' }}
        id="dashboard-header"
        data-testid="admin-header"
      >
        {/* Left Section - Sidebar Toggle and Breadcrumbs */}
        <div className="flex items-center gap-4">
          <SidebarTrigger
            className="h-10 w-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
            id="sidebar-trigger"
            data-testid="sidebar-trigger"
          />
          <Separator
            className="h-6 bg-white/10"
            id="dashboard-header-separator"
            orientation="vertical"
          />
          <Breadcrumb className="hidden md:flex" data-testid="admin-header-title">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={getAdminPath("home")}
                  className="text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              {currentPage !== "home" && (
                <>
                  <BreadcrumbSeparator className="text-gray-600" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white font-bold tracking-normal">
                      {pageTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right Section - Search, Notifications, User */}
        <div className="flex items-center gap-4">
          {/* Global Search */}
          <div className="relative hidden lg:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#E93370] transition-colors" />
            <Input
              className="pl-10 h-10 w-64 lg:w-80 bg-white/5 border-white/10 text-white rounded-xl focus-visible:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#E93370]/20 focus-visible:border-[#E93370] focus-visible:ring-offset-0 transition-all placeholder:text-gray-500"
              placeholder="Search anything..."
            />
          </div>

          <div className="flex items-center bg-[#1a1d24] p-1 rounded-xl border border-white/10 shadow-sm">
            {/* Notifications Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-lg h-9 w-9 text-gray-400 hover:bg-white/5 hover:text-[#E93370] transition-all"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#E93370] rounded-full border-2 border-[#1a1d24]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 p-0 border-white/10 shadow-2xl rounded-xl overflow-hidden !bg-[#1a1d24] !opacity-100 !backdrop-blur-none"
                style={{ backgroundColor: '#1a1d24', opacity: 1, backdropFilter: 'none' }}
              >
                <div className="px-6 py-4 border-b border-white/5 !bg-[#12141a] !opacity-100" style={{ backgroundColor: '#12141a', opacity: 1, backdropFilter: 'none' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">
                      Notifications
                    </h3>
                    <StatusBadge
                      status="active"
                      showDot={false}
                      className="text-2xs px-1.5 py-0 uppercase tracking-wider text-[#E93370] border-[#E93370]/30 bg-[#E93370]/10"
                    >
                      {mockNotifications.length} NEW
                    </StatusBadge>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto px-3 py-2 !bg-[#1a1d24] !opacity-100" style={{ backgroundColor: '#1a1d24', opacity: 1, backdropFilter: 'none' }}>
                  {mockNotifications.map((notif, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div
                        className={cn(
                          "mt-1.5 h-2 w-2 rounded-full shrink-0",
                          notif.color
                        )}
                      />
                      <div className="grid gap-0.5">
                        <p className="text-sm font-bold text-white leading-tight group-hover:text-[#E93370] transition-colors">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {notif.desc}
                        </p>
                        <p className="text-2xs text-gray-500 font-medium mt-1">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-2 border-t border-white/5 !bg-[#12141a] !opacity-100" style={{ backgroundColor: '#12141a', opacity: 1, backdropFilter: 'none' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-bold text-gray-400 hover:text-[#E93370] hover:bg-white/5"
                  >
                    View All Activity
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>
    );
  }
);

DashboardHeader.displayName = "DashboardHeader";
