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
          <div className="landing-container py-8">
            <Skeleton className="h-10 w-48 mb-[var(--gap-lg)] rounded-xl" />
            <Skeleton className="h-10 w-80 mb-[var(--gap-md)] rounded-xl" />
            <div className="responsive-grid">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="col-span-1 md:col-span-2 lg:col-span-4 bg-white/5 backdrop-blur-xl border-white/10 text-white">
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4 rounded-xl" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-[var(--gap-md)]">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Skeleton className="h-4 w-16 rounded-xl" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Skeleton className="h-4 w-12 rounded-xl" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-full mt-[var(--gap-md)] rounded-xl" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="landing-container py-8 text-center text-red-500">
            Error: {error}
          </div>
        ) : (
          <div className="landing-container py-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-[var(--gap-lg)] tracking-normal">
              <span className="bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
                All Events
              </span>
            </h1>
            <Input
              className="mb-[var(--gap-lg)] max-w-md bg-white/5 border-white/10 text-white placeholder:text-white/40"
              placeholder="Search events..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="responsive-grid">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="col-span-1 md:col-span-2 lg:col-span-4 bg-white/5 backdrop-blur-xl border-white/10 text-white hover:border-[#E93370]/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-[var(--gap-md)]">
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
                      className="mt-[var(--gap-md)] w-full bg-[#E93370] hover:bg-[#E93370]/90 text-white border-0" 
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
