import type { LandingEvent as Event } from "@/types/content";
import { formatCurrency } from "@/utils/formatting";
import { Calendar, Clock, Heart, MapPin, Share2, Ticket } from "lucide-react";
import React from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { H3, BodyText, SmallText } from "./ui/typography";

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal = React.memo(
  ({ event, isOpen, onClose }: EventDetailModalProps) => {
    if (!event) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-3xl w-[95vw] !h-[800px] max-h-[90vh] bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden shadow-2xl flex flex-col gap-0"
          id="event-detail-dialog"
          aria-label={`Event Details: ${event.title}`}
          aria-labelledby="event-detail-dialog-title"
        >
          <DialogTitle
            className="text-xl font-bold text-white flex items-center gap-2 p-4 pb-2 border-b border-white/10"
            id="event-detail-dialog-title"
          >
            <div className="w-2 h-2 rounded-full bg-[#E93370] animate-pulse" aria-hidden="true"></div>
            Event Details: {event.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about {event.title}
          </DialogDescription>
          <div className="flex-1 overflow-y-auto wildout-scrollbar">
            {/* Hero Image */}
            <div className="relative h-64 overflow-hidden border-b border-white/10">
              <ImageWithFallback
                alt={event.title || "Event"}
                className="w-full h-full object-cover"
                src={
                  event.image ||
                  (event.metadata &&
                  typeof event.metadata === "object" &&
                  !Array.isArray(event.metadata) &&
                  "featured_image" in event.metadata
                    ? String(event.metadata.featured_image)
                    : undefined) ||
                  undefined
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6">
                <Badge
                  variant="brand"
                  size="sm"
                  className="mb-2"
                >
                  {event.category || "EVENT"}
                </Badge>
                <H3 className="text-white shadow-sm">
                  {event.title}
                </H3>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Essential Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <Calendar className="h-5 w-5 text-[#E93370] mr-3" />
                  <div>
                    <SmallText className="uppercase tracking-wider text-white/40 font-bold">
                      Date
                    </SmallText>
                    <SmallText className="text-white/80">
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "TBD"}
                    </SmallText>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <Clock className="h-5 w-5 text-[#E93370] mr-3" />
                  <div>
                    <SmallText className="uppercase tracking-wider text-white/40 font-bold">
                      Time
                    </SmallText>
                    <SmallText className="text-white/80">
                      {event.time || "TBD"}
                    </SmallText>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <Ticket className="h-5 w-5 text-[#E93370] mr-3" />
                  <div>
                    <SmallText className="uppercase tracking-wider text-white/40 font-bold">
                      Price
                    </SmallText>
                    <SmallText className="text-white/80">
                      {event.price
                        ? formatCurrency(Number(event.price))
                        : "Free"}
                    </SmallText>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <H3 className="text-white flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#E93370] rounded-full"></span>
                  About This Event
                </H3>
                <BodyText className="text-white/70 bg-white/5 p-6 rounded-2xl border border-white/5">
                  {event.description}
                </BodyText>
              </div>

              {/* Venue & Location */}
              <div className="space-y-3">
                <H3 className="text-white flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#E93370] rounded-full"></span>
                  Venue & Location
                </H3>
                <div className="flex items-start p-4 rounded-xl bg-white/5 border border-white/10">
                  <MapPin className="h-5 w-5 text-[#E93370] mr-3 mt-1" />
                  <div>
                    <BodyText className="text-white font-medium">{event.venue}</BodyText>
                    <SmallText className="text-white/60">
                      {event.venueAddress}
                    </SmallText>
                  </div>
                </div>
              </div>

              {/* Lineup Section */}
              {event.artists &&
                Array.isArray(event.artists) &&
                event.artists.length > 0 && (
                  <div className="space-y-4">
                    <H3 className="text-white flex items-center gap-2">
                      <span className="w-1 h-4 bg-[#E93370] rounded-full"></span>
                      Artist Lineup
                    </H3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {event.artists.map((artist: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#E93370]/30 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E93370]/20">
                            <ImageWithFallback
                              alt={artist.name}
                              className="w-full h-full object-cover"
                              src={artist.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"}
                            />
                          </div>
                          <div>
                            <BodyText className="text-white font-medium">
                              {artist.name}
                            </BodyText>
                            <SmallText className="text-[#E93370]">
                              {artist.role}
                            </SmallText>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center px-8 py-4 bg-[#0a0a0a] border-t border-white/10 sticky bottom-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <div className="flex gap-2">
              <Button
                className="border-white/10 text-white hover:bg-white/5"
                variant="outline"
                size="icon"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                className="border-white/10 text-white hover:bg-white/5"
                variant="outline"
                size="icon"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                className="h-10 px-6 text-white/80 border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                onClick={onClose}
                variant="outline"
              >
                Close
              </Button>
              <Button className="h-10 px-8 bg-[#E93370] hover:bg-[#E93370]/90 text-white font-bold transition-all shadow-lg shadow-[#E93370]/25">
                <Ticket className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

EventDetailModal.displayName = "EventDetailModal";
