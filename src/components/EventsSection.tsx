import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Users, Music, Ticket, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventDetailModal } from './EventDetailModal';
import type { Event } from '../contexts/ContentContext';
import { useRouter } from './router';

// Number of days ahead to show upcoming events (30 days)
const UPCOMING_DAYS = 30;

const parseEventDate = (event: Event): Date | null => {
  const dateValue = event.start_date || event.date;
  if (!dateValue) return null;
  try {
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

export const EventsSection = React.memo(({ events }: EventsSectionProps) => {
  const { navigate } = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Filter and sort upcoming events (within next 30 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + UPCOMING_DAYS);
    futureDate.setHours(23, 59, 59, 999); // End of day

    return events
      .filter(event => {
        // Filter by status - accept 'upcoming', 'ongoing', or 'published' (for backward compatibility)
        const validStatuses = ['upcoming', 'ongoing', 'published'];
        if (!validStatuses.includes(event.status)) {
          return false;
        }

        // Filter by date - only show events within next 30 days
        const eventDate = parseEventDate(event);
        if (!eventDate) return false;

        // Reset to start of day for comparison
        const eventStartDate = new Date(eventDate);
        eventStartDate.setHours(0, 0, 0, 0);

        // Include events that are today or in the future, but within 30 days
        // Also include ongoing events (started but not ended)
        const endDate = event.end_date ? new Date(event.end_date) : null;
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }
        const isOngoing = endDate && now >= eventStartDate && now <= endDate;
        const isUpcoming = eventStartDate >= now && eventStartDate <= futureDate;

        return isUpcoming || isOngoing;
      })
      .sort((a, b) => {
        // Sort by date (earliest first)
        const dateA = parseEventDate(a);
        const dateB = parseEventDate(b);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 4); // Show only first 4 events
  }, [events]);

  return (
    <>
      <section id="events" className="relative py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4">
              <span className="bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
                Upcoming Events
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Discover the hottest events in Indonesia's creative scene
            </p>
            <Button
              onClick={() => navigate('/events')}
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl shadow-lg shadow-[#E93370]/20"
            >
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          {/* Events Grid */}
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <p className="text-white/60 text-lg">No upcoming events in the next {UPCOMING_DAYS} days</p>
              <p className="text-white/40 text-sm mt-2">Check back soon for new events!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-500">
                  {/* Event Image */}
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={event.image || ''}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Category Badge */}
                    <Badge className="absolute top-4 left-4 bg-[#E93370]/90 text-white border-0">
                      {event.category}
                    </Badge>

                    {/* Capacity Indicator */}
                    {(event.attendees !== undefined || event.capacity !== null) && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl rounded-full px-3 py-1 text-sm text-white/90">
                        <Users className="inline h-4 w-4 mr-1" />
                        {event.attendees || 0}/{event.capacity || 'N/A'}
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl text-white group-hover:text-[#E93370] transition-colors duration-300">
                      {event.title}
                    </h3>

                    <p className="text-white/60 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2">
                      {(event.date || event.start_date) && (
                        <div className="flex items-center text-white/70">
                          <Calendar className="h-4 w-4 mr-2 text-[#E93370]" />
                          <span className="text-sm">
                            {event.date
                              ? new Date(event.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : new Date(event.start_date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                          </span>
                        </div>
                      )}
                      {event.time && (
                        <div className="flex items-center text-white/70">
                          <Clock className="h-4 w-4 mr-2 text-[#E93370]" />
                          <span className="text-sm">{event.time}</span>
                        </div>
                      )}
                      {(event.venue || event.location) && (
                        <div className="flex items-center text-white/70">
                          <MapPin className="h-4 w-4 mr-2 text-[#E93370]" />
                          <span className="text-sm">{event.venue || event.location || 'TBD'}</span>
                        </div>
                      )}
                      {(event.price || event.price_range) && (
                        <div className="flex items-center text-white/70">
                          <Ticket className="h-4 w-4 mr-2 text-[#E93370]" />
                          <span className="text-sm">{event.price || event.price_range || 'TBD'}</span>
                        </div>
                      )}
                    </div>

                    {/* Artists Preview */}
                    {event.artists && event.artists.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Music className="h-4 w-4 text-[#E93370]" />
                        <div className="flex -space-x-2">
                          {event.artists.slice(0, 3).map((artist, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full border-2 border-black overflow-hidden"
                            >
                              <ImageWithFallback
                                src={artist.image}
                                alt={artist.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-white/60">
                          {event.artists.length} {event.artists.length === 1 ? 'Artist' : 'Artists'}
                        </span>
                      </div>
                    )}

                    {/* CTA Button */}
                    <Button
                      className="w-full bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl"
                      onClick={() => setSelectedEvent(event)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
});

export type EventsSectionProps = {
  events: Event[];
};

EventsSection.displayName = 'EventsSection';
