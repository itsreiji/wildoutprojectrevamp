import React from 'react';
import { DashboardLayout } from '../ui/dashboard-layout';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { NavigationMenuLink, NavigationMenuItem, NavigationMenuList } from '../ui/navigation-menu';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../router';

const DashboardHomeWithRadixNav = () => {
  const { user } = useAuth();
  const { navigate, getAdminPath } = useRouter();

  // Sample navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', href: getAdminPath(''), icon: '📊' },
    { id: 'events', label: 'Events', href: getAdminPath('events'), icon: '📅' },
    { id: 'team', label: 'Team', href: getAdminPath('team'), icon: '👥' },
    { id: 'gallery', label: 'Gallery', href: getAdminPath('gallery'), icon: '🖼️' },
    { id: 'partners', label: 'Partners', href: getAdminPath('partners'), icon: '🤝' },
    { id: 'settings', label: 'Settings', href: getAdminPath('settings'), icon: '⚙️' },
    { id: 'audit', label: 'Audit Log', href: getAdminPath('audit'), icon: '📋' },
  ];

  // Stats data
  const stats = [
    { name: 'Total Events', value: '24', change: '+12%', positive: true },
    { name: 'Active Users', value: '1,248', change: '+4.2%', positive: true },
    { name: 'Pending Approvals', value: '3', change: '-2.1%', positive: false },
    { name: 'Content Updates', value: '12', change: '+8.3%', positive: true },
  ];

  // Function to handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <DashboardLayout
      sidebarContent={
        <NavigationMenuList className="flex flex-col space-y-1">
          {navigationItems.map((item) => (
            <NavigationMenuItem key={item.id}>
              <NavigationMenuLink
                to={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.href);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 text-muted-foreground hover:bg-muted hover:text-foreground data-[active]:bg-accent data-[active]:text-accent-foreground"
              >
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      }
      headerContent="Dashboard Home"
      user={{
        name: user?.email?.split('@')[0] || 'Admin User',
        email: user?.email || 'admin@example.com',
      }}
      onLogout={() => {
        console.log('Logout clicked');
        // Add actual logout logic here
      }}
      onBackToSite={() => {
        console.log('Back to site clicked');
        // Add actual back to site navigation here
      }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split('@')[0] || 'Admin User'}. Here's what's happening today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your most recent content updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, action: 'Updated event details', time: '2 hours ago', user: 'Admin User' },
                  { id: 2, action: 'Added new team member', time: '4 hours ago', user: 'Admin User' },
                  { id: 3, action: 'Published new gallery item', time: '6 hours ago', user: 'Admin User' },
                ].map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>API Server</span>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>CDN</span>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Storage</span>
                  <Badge variant="default">98% free</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Content Overview</CardTitle>
            <CardDescription>Manage your site's content sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: 'Hero Section', items: 1, status: 'Published' },
                { title: 'Events Section', items: 12, status: 'Published' },
                { title: 'Team Section', items: 8, status: 'Published' },
                { title: 'Gallery Section', items: 24, status: 'Published' },
                { title: 'Partners Section', items: 6, status: 'Published' },
                { title: 'About Section', items: 1, status: 'Published' },
              ].map((section, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {section.items} {section.items === 1 ? 'item' : 'items'}
                      </p>
                      <Badge variant="outline">{section.status}</Badge>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export { DashboardHomeWithRadixNav };