import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Users, Music, Ticket, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventDetailModal } from './EventDetailModal';
import { useEvents } from '../contexts/EventsContext';
import type { LandingEvent as Event, LandingEvent } from '@/types/content';
import { useRouter } from "./router/RouterContext";
import { H2, H3, BodyText, SmallText } from './ui/typography';

import { Skeleton } from './ui/skeleton';

export const EventsSection = React.memo(() => {
  const { events, loading } = useEvents();
  const { navigate } = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const upcomingEvents = events.filter(e => e.status === 'upcoming');

  return (
    <>
      <section className="relative py-32 px-4 overflow-hidden" id="events-section">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E93370]/10 border border-[#E93370]/20 text-[#E93370] text-xs font-medium mb-6 uppercase tracking-wider"
            >
              <Calendar className="w-3 h-3" />
              <span>Happening Now</span>
            </motion.div>
            <H2 gradient="from-white via-[#E93370] to-white" className="mb-6">
              Upcoming Events
            </H2>
            <BodyText className="text-white/60 max-w-2xl mx-auto mb-8">
              Discover the hottest events in Indonesia's creative scene
            </BodyText>
            <Button
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl shadow-lg shadow-[#E93370]/20"
              id="events-view-all-button"
              onClick={() => navigate('/events')}
            >
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="events-grid">
            {loading ? (
              // Loading state
              [...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4" aria-hidden="true">
                  <Skeleton className="h-64 rounded-3xl" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-8 w-3/4 rounded-xl" />
                    <Skeleton className="h-4 w-full rounded-xl" />
                    <Skeleton className="h-4 w-5/6 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3 rounded-xl" />
                      <Skeleton className="h-4 w-1/4 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.slice(0, 4).map((event, index) => (
                <motion.div
                  key={event.id}
                  className="group relative cursor-pointer focus:outline-none"
                  id={`events-item-${event.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedEvent(event)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedEvent(event);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for event: ${event.title}`}
                >
                  <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-500" id={`events-item-${event.id}-card`}>
                    {/* Event Image */}
                    <div className="relative h-64 overflow-hidden">
                      <ImageWithFallback
                        alt={event.title || 'Event'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        id={`events-item-${event.id}-image`}
                        src={event.image || (event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata) && 'featured_image' in event.metadata ? String(event.metadata.featured_image) : "")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                      {/* Category Badge */}
                      <Badge
                        variant="category"
                        size="sm"
                        className="absolute top-4 left-4"
                        id={`events-item-${event.id}-category-badge`}
                      >
                        {event.category?.toUpperCase() || "EVENT"}
                      </Badge>

                      {/* Capacity Indicator */}
                      <Badge
                        variant="category"
                        size="sm"
                        className="absolute top-4 right-4"
                        id={`events-item-${event.id}-capacity-indicator`}
                      >
                        <Users className="inline h-3 w-3 mr-1" />
                        {event.attendees}/{event.capacity}
                      </Badge>
                    </div>

                    {/* Event Info */}
                    <div className="p-6 space-y-4" id={`events-item-${event.id}-info`}>
                      <H3 className="text-white group-hover:text-[#E93370] transition-colors duration-300" id={`events-item-${event.id}-title`}>
                        {event.title}
                      </H3>

                      <BodyText className="text-white/60 line-clamp-2">
                        {event.description}
                      </BodyText>

                      <div className="space-y-2">
                        <div className="flex items-center text-white/70">
                          <Calendar className="h-4 w-4 mr-2 text-[#E93370]" />
                          <SmallText>
                            {(event as any).date ? new Date((event as any).date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }) : event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }) : 'TBD'}
                          </SmallText>
                        </div>
                        <div className="flex items-center text-white/70">
                          <Clock className="h-4 w-4 mr-2 text-[#E93370]" />
                          <SmallText>{(event as any).time || (event.start_date ? new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD')}</SmallText>
                        </div>
                        <div className="flex items-center text-white/70">
                          <MapPin className="h-4 w-4 mr-2 text-[#E93370]" />
                          <SmallText>{(event as any).venue || event.location || 'TBD'}</SmallText>
                        </div>
                        <div className="flex items-center text-white/70">
                          <Ticket className="h-4 w-4 mr-2 text-[#E93370]" />
                          <SmallText>{event.price}</SmallText>
                        </div>
                      </div>

                      {/* Artists Preview */}
                      {event.artists && Array.isArray(event.artists) && (
                        <div className="flex items-center space-x-2">
                          <Music className="h-4 w-4 text-[#E93370]" />
                          <div className="flex -space-x-2">
                            {event.artists.slice(0, 3).map((artist: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full border-2 border-black overflow-hidden"
                              >
                                <ImageWithFallback
                                  alt={artist?.name || 'Artist'}
                                  className="w-full h-full object-cover"
                                  src={artist?.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"}
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
                        id={`events-item-${event.id}-details-button`}
                        onClick={() => setSelectedEvent(event as LandingEvent)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-white/40 italic">No upcoming events scheduled at the moment.</p>
              </div>
            )}
          </div>
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

EventsSection.displayName = 'EventsSection';
