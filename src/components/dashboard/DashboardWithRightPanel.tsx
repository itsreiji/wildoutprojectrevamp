import React, { useState } from 'react';
import { ResponsiveDashboardLayout } from '../ui/responsive-dashboard-layout';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '../../contexts/AuthContext';

const DashboardWithRightPanel = () => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Sample navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: '📊' },
    { id: 'events', label: 'Events', href: '/admin/events', icon: '📅' },
    { id: 'team', label: 'Team', href: '/admin/team', icon: '👥' },
    { id: 'gallery', label: 'Gallery', href: '/admin/gallery', icon: '🖼️' },
    { id: 'partners', label: 'Partners', href: '/admin/partners', icon: '🤝' },
    { id: 'settings', label: 'Settings', href: '/admin/settings', icon: '⚙️' },
    { id: 'audit', label: 'Audit Log', href: '/admin/audit', icon: '📋' },
  ];

  // Stats data
  const stats = [
    { name: 'Total Events', value: '24', change: '+12%', positive: true },
    { name: 'Active Users', value: '1,248', change: '+4.2%', positive: true },
    { name: 'Pending Approvals', value: '3', change: '-2.1%', positive: false },
    { name: 'Content Updates', value: '12', change: '+8.3%', positive: true },
  ];

  // Content items for selection
  const contentItems = [
    { id: 1, title: 'WildOut Music Festival', type: 'Event', status: 'Published', date: '2024-06-15' },
    { id: 2, title: 'Team Member: John Doe', type: 'Team', status: 'Draft', date: '2024-06-10' },
    { id: 3, title: 'Gallery Item: Sunset', type: 'Gallery', status: 'Published', date: '2024-06-05' },
    { id: 4, title: 'Partner: MusicCorp', type: 'Partner', status: 'Pending', date: '2024-06-01' },
  ];

  return (
    <ResponsiveDashboardLayout
      sidebarContent={
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300"
              onClick={() => console.log(`Navigating to ${item.href}`)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      }
      headerContent="Dashboard with Right Panel"
      user={{
        name: user?.email?.split('@')[0] || 'Admin User',
        email: user?.email || 'admin@example.com',
      }}
      onLogout={() => console.log('Logout clicked')}
      onBackToSite={() => console.log('Back to site clicked')}
      showRightPanel={true}
      rightPanelContent={
        <div className="space-y-4">
          <h3 className="font-medium">Item Details</h3>
          {selectedItem ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Title</span>
                <span className="text-sm">{selectedItem.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="text-sm">{selectedItem.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={selectedItem.status === 'Published' ? 'default' : selectedItem.status === 'Draft' ? 'secondary' : 'outline'}>
                  {selectedItem.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm">{selectedItem.date}</span>
              </div>
              
              <Separator className="my-4" />
              
              <h4 className="font-medium">Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => console.log('Edit clicked')}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => console.log('Publish clicked')}>
                  {selectedItem.status === 'Published' ? 'Unpublish' : 'Publish'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select an item to view details</p>
          )}
        </div>
      }
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
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Perform frequent tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Create Event</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new event.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Event Name</label>
                        <input 
                          className="w-full p-2 border rounded" 
                          placeholder="Enter event name" 
                        />
                      </div>
                      <div className="space-y-2 mt-4">
                        <label className="text-sm font-medium">Date</label>
                        <input 
                          className="w-full p-2 border rounded" 
                          type="date" 
                        />
                      </div>
                    </div>
                    <Button>Create Event</Button>
                  </DialogContent>
                </Dialog>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Settings</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Quick Settings</p>
                      <div className="flex items-center justify-between">
                        <span>Dark Mode</span>
                        <Button size="sm" variant="outline">Toggle</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Notifications</span>
                        <Button size="sm" variant="outline">On</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Manage your site's content sections</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {contentItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer transition-colors ${selectedItem?.id === item.id ? 'ring-2 ring-primary' : 'hover:bg-muted'}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.type} • {item.date}
                          </p>
                        </div>
                        <Badge variant={item.status === 'Published' ? 'default' : item.status === 'Draft' ? 'secondary' : 'outline'}>
                          {item.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </ResponsiveDashboardLayout>
  );
};

export { DashboardWithRightPanel };