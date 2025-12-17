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
import { NotificationBadge } from "@/components/ui/badge-enhanced";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, AlertTriangle, Calendar, Clock, Cloud, ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useStaticContent } from "../../contexts/StaticContentContext";
import { useRouter } from "../router";
import { useAuth } from "../../contexts/AuthContext";
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

    // Mock weather data - can be replaced with real API
    const weatherData = {
      location: "New York",
      temp: "72°F",
      condition: "Sunny",
      windSpeed: "5 km/h",
    };

    return (
      <header
        className={cn(
          "flex h-16 shrink-0 items-center justify-between gap-2",
          "border-b border-border bg-card/95 backdrop-blur-sm",
          "sticky top-0 z-20 w-full px-4 md:px-6 shadow-sm"
        )}
        id="dashboard-header"
      >
        {/* Left Section - Sidebar Toggle and Breadcrumbs */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" id="sidebar-trigger" />
          <Separator
            className="mr-2 h-4 bg-border hidden md:block"
            id="dashboard-header-separator"
            orientation="vertical"
          />
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={getAdminPath("home")}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              {currentPage !== "home" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Info Panel - Date/Time/Weather */}
          <div className="hidden lg:flex items-center gap-4 ml-4 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-full border border-white/10">
            {/* Date */}
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground">{dateStr}</span>
            </div>

            <Separator orientation="vertical" className="h-4" />

            {/* Time */}
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground font-mono">{timeStr}</span>
            </div>

            <Separator orientation="vertical" className="h-4" />

            {/* Weather */}
            <div className="flex items-center gap-2 text-xs">
              <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground">
                {weatherData.location} <b>{weatherData.temp}</b>, {weatherData.windSpeed}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Search, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Global Search */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 h-9 bg-background border-border rounded-2xl"
              placeholder="Global search..."
            />
          </div>

          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full h-10 w-10"
              >
                <Bell className="h-5 w-5" />
                <NotificationBadge count={mockNotifications.length} color="red" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto p-1">
                {mockNotifications.map((notif, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                  >
                    <div
                      className={cn("mt-1 h-2 w-2 rounded-full", notif.color)}
                    />
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notif.desc}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80">
                        {notif.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                >
                  Mark all as read
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Alerts Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full h-10 w-10"
              >
                <AlertTriangle className="h-5 w-5" />
                <NotificationBadge count={mockAlerts.length} color="blue" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">System Alerts</h3>
              </div>
              <div className="max-h-80 overflow-y-auto p-1">
                {mockAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.desc}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                >
                  View all alerts
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Profile Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-10 px-2 rounded-full hover:bg-muted/50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">
                  Hi, {displayName}
                </span>
                <ChevronDown className="h-3 w-3 hidden sm:inline" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => navigate(getAdminPath("settings"))}
                >
                  Profile Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                >
                  Preferences
                </Button>
                <Separator className="my-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-destructive hover:text-destructive"
                >
                  Sign Out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>
    );
  }
);

DashboardHeader.displayName = "DashboardHeader";
