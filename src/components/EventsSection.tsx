import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Users, Music, Ticket, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { StatusBadge } from './ui/StatusBadge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventDetailModal } from './EventDetailModal';
import { useEvents } from '../contexts/EventsContext';
import type { LandingEvent as Event, LandingEvent } from '@/types/content';
import { useRouter } from './router';

import { Skeleton } from './ui/skeleton';

export const EventsSection = React.memo(() => {
  const { events, loading } = useEvents();
  const { navigate } = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const upcomingEvents = events.filter(e => e.status === 'upcoming');

  return (
    <>
      <section className="relative py-20 px-4" id="events-section">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4 tracking-normal">
              <span className="bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
                Upcoming Events
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Discover the hottest events in Indonesia's creative scene
            </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8" id="events-grid">
            {loading ? (
              // Loading state
              [...Array(2)].map((_, i) => (
                <div key={i} className="space-y-4">
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
                  className="group relative"
                  id={`events-item-${event.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-500" id={`events-item-${event.id}-card`}>
                    {/* Event Image */}
                    <div className="relative h-64 overflow-hidden">
                      <ImageWithFallback
                        alt={event.title || 'Event'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        id={`events-item-${event.id}-image`}
                        src={event.image || (event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata) && 'featured_image' in event.metadata ? String(event.metadata.featured_image) : undefined) || undefined}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                      {/* Category Badge */}
                      <StatusBadge
                        status="active"
                        showDot={false}
                        className="absolute top-4 left-4 bg-[#E93370]/90 text-white border-0 shadow-[0_0_12px_rgba(233,51,112,0.3)]"
                        id={`events-item-${event.id}-category-badge`}
                      >
                        {event.category?.toUpperCase() || "EVENT"}
                      </StatusBadge>

                      {/* Capacity Indicator */}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl rounded-full px-3 py-1 text-sm text-white/90" id={`events-item-${event.id}-capacity-indicator`}>
                        <Users className="inline h-4 w-4 mr-1" />
                        {event.attendees}/{event.capacity}
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-6 space-y-4" id={`events-item-${event.id}-info`}>
                      <h3 className="text-2xl text-white group-hover:text-[#E93370] transition-colors duration-300" id={`events-item-${event.id}-title`}>
                        {event.title}
                      </h3>

                      <p className="text-white/60 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center text-white/70">
                          <Calendar className="h-4 w-4 mr-2 text-[#E93370]" />
                          <span className="text-sm">
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
                          </span>
                        </div>
                        <div className="flex items-center text-white/70">
                          <Clock className="h-4 w-4 mr-2 text-[#E93370]" />
                          <span className="text-sm">{(event as any).time || (event.start_date ? new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD')}</span>
                        </div>
                        <div className="flex items-center text-white/70">
                          <MapPin className="h-4 w-4 mr-2 text-[#E93370]" />
                          <span className="text-sm">{(event as any).venue || event.location || 'TBD'}</span>
                        </div>
                        <div className="flex items-center text-white/70">
                          <Ticket className="h-4 w-4 mr-2 text-[#E93370]" />
                          <span className="text-sm">{event.price}</span>
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
                                  src={artist?.image || undefined}
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
