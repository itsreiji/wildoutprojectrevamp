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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search } from "lucide-react";
import React, { useCallback } from "react";
import { useStaticContent } from "../../contexts/StaticContentContext";
import { useRouter } from "../router/RouterContext";
import { cn } from "../ui/utils";

interface DashboardHeaderProps {
  currentPage: string;
}

// Mock notifications - can be replaced with real data from context or API
const mockNotifications = [
  {
    title: "Event Update",
    desc: "WildOut Summer Fest details updated",
    time: "2 min ago",
    color: "bg-blue-500",
    link: "events"
  },
  {
    title: "System Status",
    desc: "All systems are operational",
    time: "1 hour ago",
    color: "bg-emerald-500",
    link: "home"
  },
  {
    title: "User Growth",
    desc: "5 new users joined this morning",
    time: "3 hours ago",
    color: "bg-[#E93370]",
    link: "users"
  },
];

export const DashboardHeader = React.memo(
  ({ currentPage }: DashboardHeaderProps) => {
    const { getAdminPath, navigate } = useRouter();
    const { adminSections } = useStaticContent();

    const handleNotificationClick = useCallback((link?: string) => {
      if (!link) return;

      try {
        const path = getAdminPath(link as any);
        if (path) {
          navigate(path);
        } else {
          console.warn(`[DashboardHeader] No path found for link: ${link}`);
        }
      } catch (error) {
        console.error(`[DashboardHeader] Error navigating to ${link}:`, error);
      }
    }, [getAdminPath, navigate]);

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
          "border-b border-[#1a1a1a] bg-[#0a0a0a] bg-opacity-100 opacity-100 backdrop-blur-none shadow-lg",
          "sticky top-0 z-20 w-full px-6 md:px-12 shrink-0"
        )}
        style={{ backgroundColor: '#0a0a0a', opacity: 1, backdropFilter: 'none' }}
        id="dashboard-header"
        data-testid="admin-header"
      >
        {/* Left Section - Sidebar Toggle and Breadcrumbs */}
        <div className="flex items-center gap-4">
          <SidebarTrigger
            className="h-10 w-10 text-gray-400 hover:text-white hover:bg-[#1a1a1a] active:bg-[#202020] rounded-xl"
            id="sidebar-trigger"
            data-testid="sidebar-trigger"
          />
          <Separator
            className="h-6 bg-[#1a1a1a]"
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
              className="pl-10 h-10 w-64 lg:w-80 bg-[#141414] border-[#1a1a1a] text-white rounded-xl focus-visible:bg-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#E93370]/20 focus-visible:border-[#E93370] focus-visible:ring-offset-0 transition-all placeholder:text-gray-500"
              placeholder="Search anything..."
            />
          </div>

          <div className="flex items-center bg-[#0a0a0a] p-1 rounded-xl border border-[#1a1a1a] shadow-sm">
            {/* Notifications Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-lg h-9 w-9 text-gray-400 hover:bg-[#1a1a1a] active:bg-[#202020] hover:text-[#E93370] transition-all active:scale-95"
                  aria-label="View notifications"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#E93370] rounded-full border-2 border-[#0a0a0a]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-80 p-0 border-[#1a1a1a] shadow-2xl rounded-xl overflow-hidden bg-[#0a0a0a] opacity-100"
              >
                <ScrollArea className="max-h-[380px] bg-[#0a0a0a] opacity-100">
                  <div className="px-2 py-2">
                    {mockNotifications.map((notif, i) => (
                      <div
                        key={i}
                        onClick={() => handleNotificationClick(notif.link)}
                        className="flex items-start gap-3.5 p-3 hover:bg-[#1a1a1a] active:bg-[#202020] rounded-lg transition-all cursor-pointer group mb-1 last:mb-0 overflow-hidden active:scale-[0.98]"
                        role="button"
                        tabIndex={0}
                        aria-label={`Notification: ${notif.title}. ${notif.desc}`}
                      >
                        <div
                          className={cn(
                            "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                            notif.color
                          )}
                        />
                        <div className="grid gap-1 min-w-0 flex-1">
                          <p className="text-sm md:text-base font-bold text-white leading-[1.5] group-hover:text-[#E93370] transition-colors truncate">
                            {notif.title}
                          </p>

                          <p className="text-xs md:text-sm text-[#9ca3af] line-clamp-2 leading-[1.5] font-normal">
                            {notif.desc}
                          </p>

                          <p className="text-[10px] md:text-xs text-[#6b7280] font-normal mt-0.5 uppercase tracking-wide leading-[1.5]">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div
                  className="px-4 py-3 border-t border-[#1a1a1a] bg-[#141414] opacity-100"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-bold text-[#9ca3af] hover:text-[#E93370] hover:bg-[#1a1a1a] active:bg-[#202020] rounded-lg h-9 transition-all active:scale-95"
                    onClick={() => console.log("View All Activity clicked")}
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
