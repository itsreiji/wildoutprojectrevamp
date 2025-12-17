import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import logo from "figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png";
import {
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useStaticContent } from "../../contexts/StaticContentContext";
import { useRouter } from "../router";
import { cn } from "../ui/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = React.memo(
  ({ children }: AdminLayoutProps) => {
    const { getCurrentSubPath, navigate, getAdminPath } = useRouter();
    const { adminSections, getSectionPermissions } = useStaticContent();
    const { user, signOut } = useAuth();

    // Derive current page from URL path
    const currentPage = getCurrentSubPath() || "home";

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
      Shield,
      Users,
      Settings,
    };

    return (
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="none" id="admin-sidebar" side="left">
          <SidebarHeader
            className="h-16 border-b border-border flex items-center justify-center px-4"
            id="admin-sidebar-header"
          >
            <div
              className="flex items-center gap-2 font-semibold text-lg"
              data-testid="admin-logo"
              id="admin-logo"
            >
              <img
                alt="WildOut Admin Logo"
                className="h-8 w-8 object-contain"
                data-testid="logo-image"
                id="admin-logo-image"
                src={logo}
              />
              <span
                className="whitespace-nowrap"
                data-testid="logo-text"
                id="admin-logo-text"
              >
                Admin Panel
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent
            className="px-2 py-4 overflow-y-auto"
            id="admin-sidebar-content"
          >
            <SidebarMenu id="admin-sidebar-menu">
              {adminSections
                .filter((section) => getSectionPermissions(section.slug).canView)
                .sort((a, b) => a.order_index - b.order_index)
                .map((section) => {
                  const Icon = iconMap[section.icon] || LayoutDashboard;
                  const isActive = currentPage === section.slug;

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
                        tooltip={section.label} // Tooltip for collapsed state
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
                          className="text-sm transition-colors duration-300"
                          id={`nav-label-${section.slug}`}
                        >
                          {section.label}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter
            className="border-t border-border p-2 mt-auto"
            id="admin-sidebar-footer"
          >
            <SidebarMenu id="admin-sidebar-footer-menu">
              <SidebarMenuItem id="sidebar-menu-item-back-to-site">
                <SidebarMenuButton
                  asChild={false}
                  data-testid="back-to-site-button"
                  id="sidebar-menu-button-back-to-site"
                  onClick={() => navigate("/")}
                >
                  <ChevronLeft className="h-4 w-4" id="back-to-site-icon" />
                  <span className="text-sm" id="back-to-site-label">
                    Back to Site
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem id="sidebar-menu-item-user-profile">
                <SidebarMenuButton
                  asChild={false}
                  data-testid="logout-button"
                  id="admin-logout-button"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4" data-testid="logout-icon" id="admin-logout-icon" />
                  <span data-testid="logout-label" id="admin-logout-label">Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset id="admin-main-content">
          <header
            className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20 w-full px-4 md:px-6"
            id="admin-header"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground" id="admin-header-title">
                {adminSections.find(
                  (item) => item.slug === currentPage
                )?.label || 'Admin Dashboard'}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <Avatar className="h-8 w-8 rounded-lg" data-testid="user-avatar" id="admin-user-avatar">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground" data-testid="user-avatar-fallback" id="admin-user-avatar-fallback">
                  {displayInitial}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight max-w-[120px] truncate">
                <span className="truncate font-medium text-foreground" data-testid="user-name" id="admin-user-name">{displayName}</span>
                <span className="truncate text-xs text-foreground/60" data-testid="user-email" id="admin-user-email">{displayEmail}</span>
              </div>
            </div>
          </header>

          <main
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-background relative z-10"
            id="admin-main"
          >
            <div className="w-full max-w-[1600px] mx-auto min-w-0">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }
);

AdminLayout.displayName = "AdminLayout";