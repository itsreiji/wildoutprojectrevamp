import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge-enhanced";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import logo from "figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  Handshake,
  Image,
  Info,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useStaticContent } from "../../contexts/StaticContentContext";
import { useRouter } from "../router";
import { cn } from "../ui/utils";

interface DashboardSidebarProps {
  currentPage: string;
}

// Menu group configuration
interface MenuGroup {
  id: string;
  label: string;
  sections: string[]; // section slugs that belong to this group
}

const menuGroups: MenuGroup[] = [
  {
    id: "core",
    label: "CORE FEATURES",
    sections: ["home", "hero", "about"],
  },
  {
    id: "content",
    label: "CONTENT MANAGEMENT",
    sections: ["events", "team", "gallery", "partners"],
  },
  {
    id: "system",
    label: "SYSTEM",
    sections: ["settings", "audit"],
  },
];

// Badge configuration for menu items (can be dynamic from API)
const menuBadges: Record<string, { count?: number; label?: string; color?: "blue" | "green" | "red" }> = {
  events: { count: 5, color: "blue" },
  team: { label: "New", color: "green" },
  audit: { count: 12, color: "red" },
};

export const DashboardSidebar = React.memo(
  ({ currentPage }: DashboardSidebarProps) => {
    const { navigate, getAdminPath } = useRouter();
    const { adminSections, getSectionPermissions } = useStaticContent();
    const { user, signOut } = useAuth();
    const [sidebarSearch, setSidebarSearch] = useState("");

    const handleLogout = async () => {
      try {
        await signOut();
        navigate(getAdminPath("login"));
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

    const displayInitial = user?.email
      ? user.email.charAt(0).toUpperCase()
      : "A";
    const displayName =
      (user?.user_metadata &&
      typeof user.user_metadata === "object" &&
      "full_name" in user.user_metadata
        ? user.user_metadata.full_name
        : null) || (user?.email ? user.email.split("@")[0] : "Admin User");
    const displayEmail = user?.email || "admin@wildoutproject.com";

    const iconMap: Record<string, any> = {
      LayoutDashboard,
      Sparkles,
      Info,
      Calendar,
      Users,
      Image,
      Handshake,
      Settings,
    };

    // Filter sections based on search and permissions
    const allowedSections = useMemo(() => {
      return adminSections
        .filter((section) => getSectionPermissions(section.slug).canView)
        .sort((a, b) => a.order_index - b.order_index);
    }, [adminSections, getSectionPermissions]);

    // Group sections
    const groupedSections = useMemo(() => {
      if (sidebarSearch.trim()) {
        // When searching, show all matching sections in one flat list
        return [{
          id: "search-results",
          label: "SEARCH RESULTS",
          sections: allowedSections.filter((section) =>
            section.label.toLowerCase().includes(sidebarSearch.toLowerCase())
          ),
        }];
      }

      // Group sections based on menuGroups configuration
      return menuGroups.map((group) => ({
        ...group,
        sections: allowedSections.filter((section) =>
          group.sections.includes(section.slug)
        ),
      })).filter((group) => group.sections.length > 0);
    }, [allowedSections, sidebarSearch]);

    return (
      <Sidebar collapsible="icon" id="dashboard-sidebar" side="left">
        {/* Sidebar Header */}
        <SidebarHeader
          className="h-auto border-b border-sidebar-border px-4 py-4 flex flex-col gap-4"
          id="dashboard-sidebar-header"
        >
          {/* Logo */}
          <div
            className="flex items-center gap-2 font-semibold text-lg overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
            data-testid="dashboard-logo"
            id="dashboard-logo"
          >
            <img
              alt="WildOut Logo"
              className="h-8 w-8 object-contain"
              data-testid="logo-image"
              id="logo-image"
              src={logo}
            />
            <span
              className="whitespace-nowrap transition-all duration-300 group-data-[collapsible=icon]:hidden"
              data-testid="logo-text"
              id="logo-text"
            >
              WildOut
            </span>
          </div>

          {/* Sidebar Search - Hidden when collapsed */}
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Menu Search..."
                className="pl-8 h-9 bg-black/10 dark:bg-white/10 border-white/20 rounded-full focus-visible:ring-sidebar-ring placeholder:text-sidebar-foreground/60"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
              />
            </div>
          </div>
        </SidebarHeader>

        {/* Sidebar Content - Grouped Menu Items */}
        <SidebarContent
          className="px-2 py-2 overflow-hidden"
          id="dashboard-sidebar-content"
        >
          {groupedSections.map((group) => (
            <div
              key={group.id}
              className="mb-3 bg-black/10 dark:bg-white/5 p-2 rounded-2xl border border-white/10 shadow-sm group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-0"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between text-xs font-semibold text-sidebar-foreground/70 uppercase px-3 py-2 group-data-[collapsible=icon]:hidden">
                <span className="px-3 py-1 bg-black/20 dark:bg-white/10 rounded-xl">
                  {group.label}
                </span>
                <Settings className="h-3 w-3 opacity-50" />
              </div>

              {/* Group Menu Items */}
              <SidebarMenu>
                {group.sections.map((section) => {
                  const Icon = iconMap[section.icon] || LayoutDashboard;
                  const isActive = currentPage === section.slug;
                  const badge = menuBadges[section.slug];

                  return (
                    <SidebarMenuItem
                      key={section.id}
                      id={`sidebar-menu-item-${section.slug}`}
                    >
                      <SidebarMenuButton
                        asChild={false}
                        data-active={isActive}
                        data-testid={`nav-${section.slug}`}
                        id={`sidebar-menu-button-${section.slug}`}
                        isActive={isActive}
                        onClick={() => navigate(getAdminPath(section.slug))}
                        tooltip={section.label}
                        className={cn(
                          "relative",
                          isActive && "hover:rounded-2xl"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-colors duration-300",
                            isActive && "text-sidebar-primary"
                          )}
                          data-testid={`nav-icon-${section.slug}`}
                          id={`nav-icon-${section.slug}`}
                        />
                        <span
                          className="text-sm transition-colors duration-300 flex-grow"
                          id={`nav-label-${section.slug}`}
                        >
                          {section.label}
                        </span>
                        
                        {/* Badge - count or label */}
                        {badge && !isActive && (
                          <Badge
                            variant={badge.count ? "count" : "new"}
                            color={badge.color || "blue"}
                            className="ml-auto group-data-[collapsible=icon]:hidden"
                          >
                            {badge.count || badge.label}
                          </Badge>
                        )}

                        {/* Chevron for expandable items (placeholder for future submenu) */}
                        {section.slug === "settings" && (
                          <ChevronDown className="h-3 w-3 ml-auto opacity-50 group-data-[collapsible=icon]:hidden" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}

          {groupedSections.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
              No menu items found.
            </div>
          )}
        </SidebarContent>

        {/* Sidebar Footer - Stats Widget + User Profile */}
        <SidebarFooter
          className="border-t border-sidebar-border p-3 mt-auto"
          id="dashboard-sidebar-footer"
        >
          {/* Stats Widget - Hidden when collapsed */}
          <div className="mb-3 bg-white/10 dark:bg-gray-700/50 rounded-lg p-3 text-center group-data-[collapsible=icon]:hidden">
            <CircularProgress
              value={75}
              size={100}
              color="cyan"
              label="ACTIVE"
              sublabel="Users Online"
            />
            <div className="mt-3 text-xs text-sidebar-foreground/80">
              Dashboard Activity
            </div>
          </div>

          <SidebarMenu id="dashboard-sidebar-footer-menu">
            {/* Back to Site Button */}
            <SidebarMenuItem id="sidebar-menu-item-back-to-site">
              <SidebarMenuButton
                asChild={false}
                data-testid="back-to-site-button"
                id="sidebar-menu-button-back-to-site"
                onClick={() => navigate("/")}
                tooltip="Back to Site"
              >
                <ChevronLeft className="h-4 w-4" id="back-to-site-icon" />
                <span className="text-sm" id="back-to-site-label">
                  Back to Site
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* User Profile Dropdown */}
            <SidebarMenuItem id="sidebar-menu-item-user-profile">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    asChild={false}
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
                    data-testid="user-menu-button"
                    id="user-menu-trigger"
                    size="lg"
                  >
                    <Avatar
                      className="h-8 w-8 rounded-lg"
                      data-testid="user-avatar"
                      id="user-avatar"
                    >
                      <AvatarFallback
                        className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                        data-testid="user-avatar-fallback"
                        id="user-avatar-fallback"
                      >
                        {displayInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span
                        className="truncate font-medium text-sidebar-foreground"
                        data-testid="user-name"
                      >
                        {displayName}
                      </span>
                      <span
                        className="truncate text-xs text-sidebar-foreground/60"
                        data-testid="user-email"
                      >
                        {displayEmail}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-sidebar border-sidebar-border text-sidebar-foreground"
                  id="user-menu-content"
                  side="right"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg">
                          {displayInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {displayName}
                        </span>
                        <span className="truncate text-xs">
                          {displayEmail}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>Upgrade to Pro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
                    data-testid="logout-button"
                    id="logout-menu-item"
                    onClick={handleLogout}
                  >
                    <LogOut
                      className="h-4 w-4"
                      data-testid="logout-icon"
                      id="logout-icon"
                    />
                    <span data-testid="logout-label" id="logout-label">
                      Log out
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* Sidebar Rails for Drag-to-Toggle */}
        <SidebarRail id="dashboard-sidebar-rail-left" />
        <SidebarRail id="dashboard-sidebar-rail-right" />
      </Sidebar>
    );
  }
);

DashboardSidebar.displayName = "DashboardSidebar";
