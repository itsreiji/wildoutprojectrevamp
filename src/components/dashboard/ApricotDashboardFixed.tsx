import { useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Bell,
  Calendar,
  ChartBar,
  Cog,
  Edit,
  Eye,
  FileText,
  Plus,
  Settings,
  User,
  Users,
} from "lucide-react";

// Type definitions
interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  positive: boolean;
}

interface ActivityItem {
  id: string;
  action: string;
  time: string;
  user: string;
  status: "completed" | "pending" | "failed";
}

interface ContentItem {
  id: string;
  title: string;
  type: "Event" | "Team" | "Gallery" | "Partner";
  status: "Published" | "Draft" | "Pending";
  date: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const ApricotDashboard = () => {
  // Mock data for the dashboard - replace with real data from contexts/props later
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "content">("dashboard");

  // Stats data
  const stats: StatCard[] = [
    {
      id: "events",
      title: "Total Events",
      value: 24,
      change: "+18.2%",
      icon: <Calendar className="h-4 w-4 text-gray-500" />,
      positive: true,
    },
    {
      id: "attendees",
      title: "Total Attendees",
      value: 1242,
      change: "+12.5%",
      icon: <Users className="h-4 w-4 text-gray-500" />,
      positive: true,
    },
    {
      id: "revenue",
      title: "Revenue",
      value: "$24,500",
      change: "+8.3%",
      icon: <ChartBar className="h-4 w-4 text-gray-500" />,
      positive: true,
    },
    {
      id: "content",
      title: "Content Items",
      value: 42,
      change: "+22.1%",
      icon: <FileText className="h-4 w-4 text-gray-500" />,
      positive: true,
    },
  ];

  // Activity feed
  const activityItems: ActivityItem[] = [
    {
      id: "activity-1",
      action: "Updated event details for WildOut Festival",
      time: "2 hours ago",
      user: "You",
      status: "completed",
    },
    {
      id: "activity-2",
      action: "Created new team member profile",
      time: "Yesterday",
      user: "Admin",
      status: "completed",
    },
    {
      id: "activity-3",
      action: "Submitted gallery photos for review",
      time: "2 days ago",
      user: "Editor",
      status: "pending",
    },
    {
      id: "activity-4",
      action: "Partner onboarding completed",
      time: "1 week ago",
      user: "System",
      status: "completed",
    },
  ];

  // Content items
  const contentItems: ContentItem[] = [
    {
      id: "event-1",
      title: "WildOut Festival 2024",
      type: "Event",
      status: "Published",
      date: "2024-06-15",
    },
    {
      id: "team-1",
      title: "John Doe - Event Manager",
      type: "Team",
      status: "Published",
      date: "2024-06-10",
    },
    {
      id: "gallery-1",
      title: "Gallery Item: Sunset",
      type: "Gallery",
      status: "Published",
      date: "2024-06-05",
    },
    {
      id: "partner-1",
      title: "Partner: MusicCorp",
      type: "Partner",
      status: "Pending",
      date: "2024-06-01",
    },
  ];

  // Notifications
  const notifications: Notification[] = [
    {
      id: "notif-1",
      title: "New Event Created",
      description: "WildOut Summer Fest was created and is pending approval",
      time: "5 min ago",
      read: false,
    },
    {
      id: "notif-2",
      title: "Content Published",
      description: "Your gallery photos have been published",
      time: "1 hour ago",
      read: true,
    },
    {
      id: "notif-3",
      title: "Partner Request",
      description: "New partner request received",
      time: "2 hours ago",
      read: false,
    },
  ];

  const handleTabChange = useCallback((tab: "dashboard" | "analytics" | "content") => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-500">
              Welcome back, {user?.email?.split("@")[0] || "Admin User"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-red-500" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium">Notifications</h4>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-3 p-2 rounded ${
                        !notification.read ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.id} className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <p
                      className={`text-xs mt-1 font-medium ${
                        stat.positive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change} from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your most recent content updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityItems.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.user} • {activity.time}
                          </p>
                        </div>
                        <Badge
                          variant={
                            activity.status === "completed" ? "default" :
                            activity.status === "pending" ? "secondary" : "destructive"
                          }
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Perform frequent tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Event
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md mx-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Event</DialogTitle>
                          <DialogDescription>
                            Fill in the details for the new event.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Event Name
                            </label>
                            <input
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter event name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Date</label>
                            <input
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              type="date"
                            />
                          </div>
                        </div>
                        <Button className="w-full">Create Event</Button>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>

                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Cog className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Quick Settings</p>
                          <div className="flex items-center justify-between">
                            <span>Dark Mode</span>
                            <Button size="sm" variant="outline">
                              Toggle
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Notifications</span>
                            <Button size="sm" variant="outline">
                              On
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Management */}
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Manage your site's content sections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {contentItems.map((item) => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-colors hover:shadow-md ${
                          selectedItem?.id === item.id
                            ? "ring-2 ring-blue-500 border-blue-500"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {item.type} • {item.date}
                              </p>
                            </div>
                            <Badge
                              variant={
                                item.status === "Published"
                                  ? "default"
                                  : item.status === "Draft"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
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
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Overview of your platform metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Analytics Chart Placeholder</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Library</CardTitle>
                    <CardDescription>
                      Manage all your content items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contentItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-lg ${selectedItem?.id === item.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"}`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {item.type} • {item.date}
                            </p>
                          </div>
                          <Badge
                            variant={
                              item.status === "Published" ? "default" :
                              item.status === "Draft" ? "secondary" : "outline"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Content Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedItem ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">
                            {selectedItem.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedItem.type} • {selectedItem.date}
                          </p>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Status</span>
                            <Badge
                              variant={
                                selectedItem.status === "Published" ? "default" :
                                selectedItem.status === "Draft" ? "secondary" : "outline"
                              }
                            >
                              {selectedItem.status}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => console.log("Edit clicked")}
                            >
                              <Edit className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => console.log("Publish clicked")}
                            >
                              {selectedItem.status === "Published" ? "Unpublish" : "Publish"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
                        <span className="text-3xl mb-2">👈</span>
                        <p className="text-sm">
                          Select an item to view details
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export { ApricotDashboard };