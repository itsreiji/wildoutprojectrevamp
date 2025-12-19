import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEvents } from "@/contexts/EventsContext";
import type { LandingEvent } from "@/types/content";
import { Calendar, MapPin } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Background3D } from "./Background3D";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { EventDetailModal } from "./EventDetailModal";

const AllEventsPage = () => {
  const { events, loading, error } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<LandingEvent | null>(null);

  const filteredEvents = events.filter((event: LandingEvent) =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Background3D />
      <Navigation />
      
      <div className="relative z-10 pt-20">
        {loading ? (
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-8 rounded-xl" />
            <Skeleton className="h-10 w-80 mb-6 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/10 text-white">
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4 rounded-xl" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Skeleton className="h-4 w-16 rounded-xl" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Skeleton className="h-4 w-12 rounded-xl" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-full mt-4 rounded-xl" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="container mx-auto px-4 py-8 text-center text-red-500">
            Error: {error}
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-8 tracking-normal">
              <span className="bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
                All Events
              </span>
            </h1>
            <Input
              className="mb-8 max-w-md bg-white/5 border-white/10 text-white placeholder:text-white/40"
              placeholder="Search events..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="bg-white/5 backdrop-blur-xl border-white/10 text-white hover:border-[#E93370]/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="h-4 w-4 text-[#E93370]" />
                        <span>
                          {event.start_date
                            ? new Date(event.start_date).toLocaleDateString()
                            : "TBD"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <MapPin className="h-4 w-4 text-[#E93370]" />
                        <span>{event.location || "Online"}</span>
                      </div>
                    </div>
                    <Button 
                      className="mt-4 w-full bg-[#E93370] hover:bg-[#E93370]/90 text-white border-0" 
                      onClick={() => setSelectedEvent(event)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {filteredEvents.length === 0 && (
                <div className="col-span-full text-center py-12 text-white/40">
                  No events found matching your search.
                </div>
              )}
            </div>
          </div>
        )}
        <Footer />
      </div>

      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export default AllEventsPage;
