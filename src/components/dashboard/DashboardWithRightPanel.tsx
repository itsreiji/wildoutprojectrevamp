import { useState } from "react";
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

const DashboardWithRightPanel = () => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Stats data
  const stats = [
    { name: "Total Events", value: "24", change: "+12%", positive: true },
    { name: "Active Users", value: "1,248", change: "+4.2%", positive: true },
    { name: "Pending Approvals", value: "3", change: "-2.1%", positive: false },
    { name: "Content Updates", value: "12", change: "+8.3%", positive: true },
  ];

  // Content items for selection
  const contentItems = [
    {
      id: 1,
      title: "WildOut Music Festival",
      type: "Event",
      status: "Published",
      date: "2024-06-15",
    },
    {
      id: 2,
      title: "Team Member: John Doe",
      type: "Team",
      status: "Draft",
      date: "2024-06-10",
    },
    {
      id: 3,
      title: "Gallery Item: Sunset",
      type: "Gallery",
      status: "Published",
      date: "2024-06-05",
    },
    {
      id: 4,
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split("@")[0] || "Admin User"}. Here's
            what's happening today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
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
                <p
                  className={`text-xs ${
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
                    <Button variant="outline">Create Event</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new event.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Event Name
                        </label>
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
                    className={`cursor-pointer transition-colors ${
                      selectedItem?.id === item.id
                        ? "ring-2 ring-primary"
                        : "hover:bg-muted"
                    }`}
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
        <Card className="h-full border shadow-sm bg-card">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Title</span>
                  <span className="text-sm text-right">
                    {selectedItem.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm">{selectedItem.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      selectedItem.status === "Published"
                        ? "default"
                        : selectedItem.status === "Draft"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {selectedItem.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm">{selectedItem.date}</span>
                </div>

                <Separator className="my-4" />

                <h4 className="font-medium mb-2">Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => console.log("Edit clicked")}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => console.log("Publish clicked")}
                  >
                    {selectedItem.status === "Published"
                      ? "Unpublish"
                      : "Publish"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
                <span className="text-3xl mb-2">👈</span>
                <p className="text-sm">
                  Select an item from the Content Management list to view
                  details
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
