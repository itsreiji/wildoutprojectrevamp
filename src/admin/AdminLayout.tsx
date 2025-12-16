import React from 'react';
import { useStaticContent } from '@/contexts/StaticContentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/components/router';
import { LayoutDashboard, Calendar, Users, Image, Handshake, Settings, LogOut, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from 'figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = React.memo(({ children }: AdminLayoutProps) => {
  const { getCurrentSubPath, navigate, getAdminPath } = useRouter();
  const { adminSections, getSectionPermissions } = useStaticContent();
  const { user, signOut } = useAuth();

  const currentPage = getCurrentSubPath() || 'home';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate(getAdminPath('login'));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const displayInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';
  const displayName = (user?.user_metadata && typeof user.user_metadata === 'object' && 'full_name' in user.user_metadata ? user.user_metadata.full_name : null) || (user?.email ? user.email.split('@')[0] : 'Admin User');
  const displayEmail = user?.email || 'admin@wildoutproject.com';

  const iconMap: Record<string, any> = {
    LayoutDashboard,
    Calendar,
    Users,
    Image,
    Handshake,
    Settings,
  };

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {!isMobile && (
        <div className="w-[20%] bg-card border-r border-border overflow-hidden flex flex-col">
          <div className="h-full flex flex-col">
            <div className="h-16 border-b border-sidebar-border flex items-center justify-center px-4">
              <div className="flex items-center gap-2 font-semibold text-lg overflow-hidden">
                <img alt="WildOut Logo" className="h-8 w-8 object-contain" src={logo} />
                <span className="whitespace-nowrap">WildOut</span>
              </div>
            </div>

            <div className="flex-1 px-2 py-4 overflow-hidden">
              <div className="space-y-1 h-full">
                {adminSections
                  .filter((section) => getSectionPermissions(section.slug).canView)
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((section) => {
                    const Icon = iconMap[section.icon] || LayoutDashboard;
                    const isActive = currentPage === section.slug;

                    return (
                      <button
                        key={section.id}
                        onClick={() => navigate(getAdminPath(section.slug))}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                          isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="border-t border-sidebar-border p-2 mt-auto">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-sidebar-accent/50 text-sidebar-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Site</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-sidebar-accent/50 text-sidebar-foreground mt-2">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        {displayInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{displayName}</span>
                      <span className="truncate text-xs text-sidebar-foreground/60">{displayEmail}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-sidebar border-sidebar-border text-sidebar-foreground" side="top" sideOffset={4}>
                  <div className="flex items-center gap-4 px-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{displayInitial}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{displayName}</span>
                      <span className="truncate text-xs text-sidebar-foreground/60">{displayEmail}</span>
                    </div>
                  </div>
                  <Separator className="bg-sidebar-border my-1" />
                  <DropdownMenuItem
                    className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-20 w-full px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Separator className="mr-2 h-4 bg-border" orientation="vertical" />
            <div className="flex flex-col">
              <h1 className="text-sm font-medium leading-none text-foreground">
                {adminSections.find((item) => item.slug === currentPage)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background relative z-10">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});

AdminLayout.displayName = 'AdminLayout';