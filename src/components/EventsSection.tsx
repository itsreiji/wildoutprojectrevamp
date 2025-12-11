import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Users, Music, Ticket, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventDetailModal } from './EventDetailModal';
import { useContent } from '../contexts/ContentContext';
import type { LandingEvent as Event, LandingEvent } from '@/types/content';
import { useRouter } from './router';

export const EventsSection = React.memo(() => {
  const { events } = useContent();
  const { navigate } = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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
              id="events-view-all-button"
              onClick={() => navigate('/events')}
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl shadow-lg shadow-[#E93370]/20"
            >
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          {/* Events Grid */}
          <div id="events-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {events.filter(e => e.status === 'upcoming').slice(0, 4).map((event, index) => (
              <motion.div
                id={`events-item-${event.id}`}
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div id={`events-item-${event.id}-card`} className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-500">
                  {/* Event Image */}
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      id={`events-item-${event.id}-image`}
                      src={event.image || (event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata) && 'featured_image' in event.metadata ? String(event.metadata.featured_image) : undefined) || undefined}
                      alt={event.title || 'Event'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Category Badge */}
                    <Badge id={`events-item-${event.id}-category-badge`} className="absolute top-4 left-4 bg-[#E93370]/90 text-white border-0">
                      {event.category}
                    </Badge>

                    {/* Capacity Indicator */}
                    <div id={`events-item-${event.id}-capacity-indicator`} className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl rounded-full px-3 py-1 text-sm text-white/90">
                      <Users className="inline h-4 w-4 mr-1" />
                      {event.attendees}/{event.capacity}
                    </div>
                  </div>

                  {/* Event Info */}
                  <div id={`events-item-${event.id}-info`} className="p-6 space-y-4">
                    <h3 id={`events-item-${event.id}-title`} className="text-2xl text-white group-hover:text-[#E93370] transition-colors duration-300">
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
                                src={artist?.image || undefined}
                                alt={artist?.name || 'Artist'}
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
                      id={`events-item-${event.id}-details-button`}
                      className="w-full bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl"
                      onClick={() => setSelectedEvent(event as LandingEvent)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
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
