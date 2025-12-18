import { Badge } from "@/components/ui/badge";
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
import { Bell, Search, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useStaticContent } from "../../contexts/StaticContentContext";
import { useRouter } from "../router";
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

const mockAlerts = [
  {
    title: "Storage Warning",
    desc: "85% storage capacity reached",
    time: "10 min ago",
  },
  {
    title: "Pending Approvals",
    desc: "3 events waiting for approval",
    time: "1 hour ago",
  },
];

export const DashboardHeader = React.memo(
  ({ currentPage }: DashboardHeaderProps) => {
    const { getAdminPath, navigate } = useRouter();
    const { adminSections } = useStaticContent();
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
      // eslint-disable-next-line no-undef
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      // eslint-disable-next-line no-undef
      return () => clearInterval(timer);
    }, []);

    const currentSection = adminSections.find(
      (item) => item.slug === currentPage
    );
    const pageTitle =
      currentSection?.label ||
      currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    const displayName =
      (user?.user_metadata &&
      typeof user.user_metadata === "object" &&
      "full_name" in user.user_metadata
        ? user.user_metadata.full_name
        : null) || (user?.email ? user.email.split("@")[0] : "User");

    // Format date and time
    const dateStr = currentTime.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timeStr = currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return (
      <header
        className={cn(
          "flex h-20 shrink-0 items-center justify-between gap-4",
          "border-b border-white/5 bg-[#12141a] shadow-lg",
          "sticky top-0 z-20 w-full px-8 shrink-0"
        )}
        id="dashboard-header"
      >
        {/* Left Section - Sidebar Toggle and Breadcrumbs */}
        <div className="flex items-center gap-4">
          <SidebarTrigger
            className="h-10 w-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
            id="sidebar-trigger"
          />
          <Separator
            className="h-6 bg-gray-200"
            id="dashboard-header-separator"
            orientation="vertical"
          />
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={getAdminPath("home")}
                  className="text-gray-400 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              {currentPage !== "home" && (
                <>
                  <BreadcrumbSeparator className="text-gray-300" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-gray-900 font-bold tracking-tight">
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
              className="pl-10 h-10 w-64 lg:w-80 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#E93370]/10 focus:border-[#E93370] transition-all"
              placeholder="Search anything..."
            />
          </div>

          <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200">
            {/* Notifications Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-lg h-9 w-9 text-gray-500 hover:bg-white hover:text-[#E93370] hover:shadow-sm transition-all"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#E93370] rounded-full border-2 border-white" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 p-0 border-gray-200 shadow-2xl rounded-xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900">
                      Notifications
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider text-[#E93370] border-[#E93370]/20 bg-[#E93370]/5"
                    >
                      {mockNotifications.length} New
                    </Badge>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {mockNotifications.map((notif, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div
                        className={cn(
                          "mt-1.5 h-2 w-2 rounded-full shrink-0",
                          notif.color
                        )}
                      />
                      <div className="grid gap-0.5">
                        <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-[#E93370] transition-colors">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {notif.desc}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-bold text-gray-500 hover:text-[#E93370]"
                  >
                    View All Activity
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Dropdown Shortcut */}
            <Separator
              orientation="vertical"
              className="h-4 mx-1 bg-gray-200"
            />

            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg h-9 w-9 text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
    );
  }
);

DashboardHeader.displayName = "DashboardHeader";
