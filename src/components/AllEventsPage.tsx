import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEvents } from "@/contexts/EventsContext";
import type { LandingEvent } from "@/types/content";
import { Calendar, MapPin } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

const AllEventsPage = () => {
  const { events, loading, error } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = events.filter((event: LandingEvent) =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8 rounded-xl" />
        <Skeleton className="h-10 w-80 mb-6 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 rounded-xl" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Skeleton className="h-4 w-16 rounded-xl" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Skeleton className="h-4 w-12 rounded-xl" />
                  </div>
                </div>
                <Skeleton className="h-9 w-full mt-4 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Events</h1>
      <Input
        className="mb-6 max-w-md"
        placeholder="Search events..."
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {event.start_date
                      ? new Date(event.start_date).toLocaleDateString()
                      : "TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location || "Online"}</span>
                </div>
              </div>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link to={`/events/${event.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AllEventsPage;
