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
  Calendar,
  Users,
  FileText,
  Edit,
  Plus,
  Settings,
  Eye,
  Cog,
  Bell,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  User,
  ChartBar,
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

interface ContentItem {
  id: string;
  title: string;
  type: "Event" | "Team" | "Gallery" | "Partner";
  status: "Published" | "Draft" | "Pending";
  date: string;
}

const DashboardWithRightPanel = () => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // Stats data
  const stats: StatCard[] = [
    {
      id: "events",
      title: "Total Events",
      value: 24,
      change: "+12%",
      icon: <Calendar className="h-4 w-4" />,
      positive: true,
    },
    {
      id: "users",
      title: "Active Users",
      value: 1248,
      change: "+4.2%",
      icon: <Users className="h-4 w-4" />,
      positive: true,
    },
    {
      id: "approvals",
      title: "Pending Approvals",
      value: 3,
      change: "-2.1%",
      icon: <FileText className="h-4 w-4" />,
      positive: false,
    },
    {
      id: "updates",
      title: "Content Updates",
      value: 12,
      change: "+8.3%",
      icon: <Edit className="h-4 w-4" />,
      positive: true,
    },
  ];

  // Content items for selection
  const contentItems: ContentItem[] = [
    {
      id: "event-1",
      title: "WildOut Music Festival",
      type: "Event",
      status: "Published",
      date: "2024-06-15",
    },
    {
      id: "team-1",
      title: "Team Member: John Doe",
      type: "Team",
      status: "Draft",
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

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full min-w-0">
      {/* Main Stats and Activity Column */}
      <div className="flex-1 space-y-6 min-w-0 overflow-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.email?.split("@")[0] || "Admin User"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your most recent content updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    action: "Updated event details",
                    time: "2 hours ago",
                    user: "Admin User",
                  },
                  {
                    id: 2,
                    action: "Added new team member",
                    time: "4 hours ago",
                    user: "Admin User",
                  },
                  {
                    id: 3,
                    action: "Published new gallery item",
                    time: "6 hours ago",
                    user: "Admin User",
                  },
                ].map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.time}
                      </p>
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
                    <Button className="w-full justify-start" aria-label="Create new event">
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
                          aria-label="Event name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Date</label>
                        <input
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="date"
                          aria-label="Event date"
                        />
                      </div>
                    </div>
                    <Button className="w-full">Create Event</Button>
                  </DialogContent>
                </Dialog>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" aria-label="Open settings">
                      Settings
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Quick Settings</p>
                      <div className="flex items-center justify-between">
                        <span>Dark Mode</span>
                        <Button size="sm" variant="outline" aria-label="Toggle dark mode">
                          Toggle
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Notifications</span>
                        <Button size="sm" variant="outline" aria-label="Toggle notifications">
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

      {/* Right Details Panel Column */}
      <div className="w-full xl:w-80 xl:shrink-0 min-w-0">
        <Card className="h-full border border-gray-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
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
  );
};

export { DashboardWithRightPanel };
