import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { StatusBadge } from '../ui/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from "../router/RouterContext";

/**
 * DashboardHome Component
 *
 * The default landing view for the admin dashboard.
 * Displays quick stats and recent activity overview.
 */
const DashboardHome = () => {
  const { user } = useAuth();
  const { navigate, getAdminPath } = useRouter();

  // Stats data
  const stats = [
    { name: 'Total Events', value: '24', change: '+12%', positive: true },
    { name: 'Active Users', value: '1,248', change: '+4.2%', positive: true },
    { name: 'Pending Approvals', value: '3', change: '-2.1%', positive: false },
    { name: 'Content Updates', value: '12', change: '+8.3%', positive: true },
  ];

  const displayName = user?.email?.split('@')[0] || 'Admin User';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-white/60 mt-1">
          Welcome back, <span className="text-white font-medium">{displayName}</span>. Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white/5 border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white/40"
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
              <p className={`text-xs ${stat.positive ? 'text-green-400' : 'text-red-400'} mt-1`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription className="text-white/40">Your most recent content updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, action: 'Updated event details', time: '2 hours ago', user: displayName },
                { id: 2, action: 'Added new team member', time: '4 hours ago', user: displayName },
                { id: 3, action: 'Published new gallery item', time: '6 hours ago', user: displayName },
              ].map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-white/40">{activity.user} • {activity.time}</p>
                  </div>
                  <StatusBadge status="completed" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription className="text-white/40">Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-sm">Database</span>
                <StatusBadge status="operational" />
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-sm">API Server</span>
                <StatusBadge status="operational" />
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-sm">CDN</span>
                <StatusBadge status="operational" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <StatusBadge status="update" showDot={false} className="bg-blue-500/15 text-blue-400 border-blue-500/30">98% FREE</StatusBadge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription className="text-white/40">Quick links to manage your site's content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Hero Section', slug: 'hero', items: 1 },
              { title: 'Events Section', slug: 'events', items: 12 },
              { title: 'Team Section', slug: 'team', items: 8 },
              { title: 'Gallery Section', slug: 'gallery', items: 24 },
              { title: 'Partners Section', slug: 'partners', items: 6 },
              { title: 'About Section', slug: 'about', items: 1 },
            ].map((section, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-white/40">
                      {section.items} {section.items === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <Button
                    className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white border-0 h-10 focus-visible:ring-[#E93370] transition-colors"
                    variant="outline"
                    onClick={() => navigate(getAdminPath(section.slug))}
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { DashboardHome };
