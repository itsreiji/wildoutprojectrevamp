import React, { useState } from "react";
import { 
  DashboardLeftPanel, 
  DashboardRightPanel, 
  DashboardTwoPanelLayout 
} from "./index";
import { 
  Card, 
  CardContent 
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ExternalLink,
  Edit,
  Trash2
} from "lucide-react";
import { cn } from "../ui/utils";

interface MockItem {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  location: string;
  attendees: number;
  description: string;
}

const mockItems: MockItem[] = [
  {
    id: "1",
    title: "WildOut Summer Festival",
    type: "Event",
    status: "Upcoming",
    date: "2024-07-15",
    location: "Central Park, NY",
    attendees: 1200,
    description: "The biggest music festival of the summer featuring top artists from around the world."
  },
  {
    id: "2",
    title: "John Smith",
    type: "Team",
    status: "Active",
    date: "2024-01-10",
    location: "Remote",
    attendees: 0,
    description: "Senior Developer with over 10 years of experience in full-stack development."
  },
  {
    id: "3",
    title: "MusicCorp Sponsorship",
    type: "Partner",
    status: "Pending",
    date: "2024-06-05",
    location: "Global",
    attendees: 0,
    description: "Strategic partnership with MusicCorp to provide audio equipment for all events."
  }
];

export const DashboardTwoPanelExample = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = mockItems.find(item => item.id === selectedId);

  return (
    <DashboardTwoPanelLayout>
      {/* Left Panel - List of items */}
      <DashboardLeftPanel 
        title="Content Management" 
        description="Manage your events, team members, and partners in one place."
      >
        <div className="grid gap-4">
          {mockItems.map((item) => (
            <Card 
              key={item.id}
              className={cn(
                "cursor-pointer transition-all hover:border-[#E93370]/50",
                selectedId === item.id ? "ring-2 ring-[#E93370] border-transparent shadow-lg" : ""
              )}
              onClick={() => setSelectedId(item.id)}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {item.location}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={item.status === "Upcoming" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {item.type}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLeftPanel>

      {/* Right Panel - Details of selected item */}
      <DashboardRightPanel 
        title={selectedItem ? "Item Details" : "Details"}
        isOpen={true}
        onClose={selectedId ? () => setSelectedId(null) : undefined}
      >
        {selectedItem ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">
                {selectedItem.title}
              </h2>
              <div className="flex gap-2">
                <Badge className="bg-[#E93370]">{selectedItem.type}</Badge>
                <Badge variant="outline">{selectedItem.status}</Badge>
              </div>
            </div>

            <div className="grid gap-4 py-4 border-y border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
                  <p className="text-sm font-medium text-gray-900">{selectedItem.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Location</p>
                  <p className="text-sm font-medium text-gray-900">{selectedItem.location}</p>
                </div>
              </div>

              {selectedItem.attendees > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Attendees</p>
                    <p className="text-sm font-medium text-gray-900">{selectedItem.attendees.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedItem.description}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button className="w-full bg-[#E93370] hover:bg-[#E93370]/90">
                <Edit className="h-4 w-4 mr-2" /> Edit Item
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" /> View Public Page
              </Button>
              <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        ) : null}
      </DashboardRightPanel>
    </DashboardTwoPanelLayout>
  );
};
