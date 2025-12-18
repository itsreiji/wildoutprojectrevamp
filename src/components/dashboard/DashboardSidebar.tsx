import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge-enhanced";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronLeft,
  Handshake,
  Image,
  Info,
  LayoutDashboard,
  LogOut,
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
const menuBadges: Record<
  string,
  { count?: number; label?: string; color?: "blue" | "green" | "red" }
> = {
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
        return [
          {
            id: "search-results",
            label: "SEARCH RESULTS",
            sections: allowedSections.filter((section) =>
              section.label.toLowerCase().includes(sidebarSearch.toLowerCase())
            ),
          },
        ];
      }

      // Group sections based on menuGroups configuration
      return menuGroups
        .map((group) => ({
          ...group,
          sections: allowedSections.filter((section) =>
            group.sections.includes(section.slug)
          ),
        }))
        .filter((group) => group.sections.length > 0);
    }, [allowedSections, sidebarSearch]);

    return (
      <Sidebar
        collapsible="none"
        id="dashboard-sidebar"
        side="left"
        className="border-r border-sidebar-border shadow-2xl"
      >
        {/* Sidebar Header */}
        <SidebarHeader
          className="h-20 border-b border-white/5 px-6 flex flex-row items-center gap-4 shrink-0 bg-[#1e2129]"
          id="dashboard-sidebar-header"
        >
          {/* Logo */}
          <div
            className="flex items-center gap-3 font-bold text-xl overflow-hidden"
            data-testid="dashboard-logo"
            id="dashboard-logo"
          >
            <div className="bg-[#E93370] p-1.5 rounded-lg shadow-lg shadow-[#E93370]/20">
              <img
                alt="WildOut Logo"
                className="h-6 w-6 object-contain brightness-0 invert"
                data-testid="logo-image"
                id="logo-image"
                src={logo}
              />
            </div>
            <span
              className="whitespace-nowrap tracking-tight text-white font-black italic"
              data-testid="logo-text"
              id="logo-text"
            >
              WILDOUT!
            </span>
          </div>
        </SidebarHeader>

        {/* Sidebar Content - Grouped Menu Items */}
        <SidebarContent
          className="px-3 py-6 overflow-y-auto space-y-8 bg-[#1e2129]"
          id="dashboard-sidebar-content"
        >
          {groupedSections.map((group) => (
            <div key={group.id} className="space-y-2">
              {/* Group Header */}
              <div className="flex items-center justify-between px-3 mb-4">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                  {group.label}
                </span>
              </div>

              {/* Group Menu Items */}
              <SidebarMenu className="gap-1">
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
                          "group/item h-11 px-4 rounded-xl transition-all duration-200 border border-transparent",
                          isActive
                            ? "bg-white/10 text-white border-white/5 shadow-sm"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center w-5 h-5 transition-transform duration-200 group-hover/item:scale-110",
                            isActive
                              ? "text-[#E93370]"
                              : "text-white/40 group-hover/item:text-white/80"
                          )}
                        >
                          <Icon
                            className="h-4 w-4"
                            data-testid={`nav-icon-${section.slug}`}
                            id={`nav-icon-${section.slug}`}
                          />
                        </div>
                        <span
                          className="text-sm font-medium tracking-wide flex-grow ml-3"
                          id={`nav-label-${section.slug}`}
                        >
                          {section.label}
                        </span>

                        {/* Badge - count or label */}
                        {badge && !isActive && (
                          <Badge
                            variant={badge.count ? "count" : "new"}
                            color={badge.color || "blue"}
                            className="ml-auto scale-90"
                          >
                            {badge.count || badge.label}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </SidebarContent>

        {/* Sidebar Footer - Stats Widget + User Profile */}
        <SidebarFooter
          className="border-t border-white/5 p-4 mt-auto space-y-4 bg-[#1e2129]"
          id="dashboard-sidebar-footer"
        >
          <SidebarMenu id="dashboard-sidebar-footer-menu" className="gap-2">
            {/* Back to Site Button */}
            <SidebarMenuItem id="sidebar-menu-item-back-to-site">
              <SidebarMenuButton
                asChild={false}
                data-testid="back-to-site-button"
                id="sidebar-menu-button-back-to-site"
                onClick={() => navigate("/")}
                tooltip="Back to Site"
                className="h-10 px-4 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" id="back-to-site-icon" />
                <span
                  className="text-xs font-medium ml-3"
                  id="back-to-site-label"
                >
                  Back to Website
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* User Profile Dropdown */}
            <SidebarMenuItem id="sidebar-menu-item-user-profile">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    asChild={false}
                    className="h-14 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                    data-testid="user-menu-button"
                    id="user-menu-trigger"
                    size="lg"
                  >
                    <div className="relative">
                      <Avatar
                        className="h-8 w-8 rounded-lg border border-white/10"
                        data-testid="user-avatar"
                        id="user-avatar"
                      >
                        <AvatarFallback
                          className="rounded-lg bg-[#E93370] text-white text-[10px] font-bold"
                          data-testid="user-avatar-fallback"
                          id="user-avatar-fallback"
                        >
                          {displayInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#1e2129] rounded-full" />
                    </div>
                    <div className="grid flex-1 text-left text-xs leading-tight ml-3">
                      <span
                        className="truncate font-bold text-white tracking-tight"
                        data-testid="user-name"
                      >
                        {displayName.toUpperCase()}
                      </span>
                      <span
                        className="truncate text-white/40 text-[10px] font-medium"
                        data-testid="user-email"
                      >
                        {displayEmail}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl bg-[#1e2129] border-white/10 text-white shadow-2xl"
                  id="user-menu-content"
                  side="right"
                  sideOffset={12}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-3 px-3 py-3 text-left">
                      <Avatar className="h-10 w-10 rounded-lg border border-white/10">
                        <AvatarFallback className="rounded-lg bg-[#E93370] text-white font-bold">
                          {displayInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-xs leading-tight">
                        <span className="truncate font-bold tracking-tight">
                          {displayName}
                        </span>
                        <span className="truncate text-white/40">
                          {displayEmail}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="py-2.5 px-3 rounded-lg focus:bg-white/5 focus:text-white cursor-pointer transition-colors">
                    <Sparkles className="mr-3 h-4 w-4 text-[#E93370]" />
                    <span className="text-xs font-medium">Upgrade to Pro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2.5 px-3 rounded-lg focus:bg-white/5 focus:text-white cursor-pointer transition-colors">
                    <Settings className="mr-3 h-4 w-4 text-white/40" />
                    <span className="text-xs font-medium">
                      Account Settings
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    className="py-2.5 px-3 rounded-lg text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer transition-colors"
                    data-testid="logout-button"
                    id="logout-menu-item"
                    onClick={handleLogout}
                  >
                    <LogOut
                      className="mr-3 h-4 w-4"
                      data-testid="logout-icon"
                      id="logout-icon"
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      data-testid="logout-label"
                      id="logout-label"
                    >
                      Log out
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* Sidebar Rails - Not used in fixed mode but kept for layout consistency */}
        <SidebarRail
          id="dashboard-sidebar-rail-left"
          className="opacity-0 pointer-events-none"
        />
        <SidebarRail
          id="dashboard-sidebar-rail-right"
          className="opacity-0 pointer-events-none"
        />
      </Sidebar>
    );
  }
);

DashboardSidebar.displayName = "DashboardSidebar";
