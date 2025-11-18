import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Clock, Users, Music, Ticket, Share2, Heart, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Event } from '@/types/content';

interface EventArtist {
  name: string;
  role?: string;
  image?: string;  // Make optional to match types/content
}

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal = React.memo(({ event, isOpen, onClose }: EventDetailModalProps) => {
  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 md:p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-6xl bg-black/95 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden my-8 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button - Fixed Position */}
                <button
                  onClick={onClose}
                  className="sticky top-4 right-4 z-20 ml-auto mr-4 mt-4 w-12 h-12 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-[#E93370] hover:border-[#E93370] transition-all duration-300 shadow-lg"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Scrollable Content */}
                <div className="overflow-y-auto"  style={{ maxHeight: 'calc(90vh - 80px)' }}>

              {/* Hero Image */}
              <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <ImageWithFallback
                  src={event.image || ''}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Floating Info */}
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge className="mb-4 bg-[#E93370]/90 text-white border-0">
                    {event.category}
                  </Badge>
                  <h2 className="text-4xl md:text-5xl text-white mb-4">
                    {event.title}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-white/90">
                    {(event.date || event.start_date) && (
                      <div className="flex items-center bg-black/60 backdrop-blur-xl rounded-full px-4 py-2">
                        <Calendar className="h-4 w-4 mr-2 text-[#E93370]" />
                        <span className="text-sm">
                          {event.date
                            ? new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : new Date(event.start_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                        </span>
                      </div>
                    )}
                    {event.time && (
                      <div className="flex items-center bg-black/60 backdrop-blur-xl rounded-full px-4 py-2">
                        <Clock className="h-4 w-4 mr-2 text-[#E93370]" />
                        <span className="text-sm">{event.time}</span>
                      </div>
                    )}
                    {(event.attendees !== undefined || event.capacity !== null) && (
                      <div className="flex items-center bg-black/60 backdrop-blur-xl rounded-full px-4 py-2">
                        <Users className="h-4 w-4 mr-2 text-[#E93370]" />
                        <span className="text-sm">{event.attendees || 0}/{event.capacity || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 space-y-8">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Button className="flex-1 bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl">
                    <Ticket className="mr-2 h-5 w-5" />
                    Get Tickets{event.price || event.price_range ? ` - ${event.price || event.price_range}` : ''}
                  </Button>
                  <Button variant="outline" className="border-[#E93370]/50 text-white hover:bg-[#E93370]/10 rounded-xl">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" className="border-[#E93370]/50 text-white hover:bg-[#E93370]/10 rounded-xl">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Description & Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Description */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-2xl text-white mb-3">About This Event</h3>
                      <p className="text-white/70 leading-relaxed">
                        {event.description ?? 'No description available yet.'}
                      </p>
                    </div>

                    {/* Highlights */}
                    {event.highlights && event.highlights.length > 0 && (
                      <div>
                        <h3 className="text-2xl text-white mb-3">Event Highlights</h3>
                        <ul className="space-y-2">
                          {event.highlights.map((highlight: string, index: number) => (
                            <li key={index} className="flex items-start text-white/70">
                              <div className="w-2 h-2 bg-[#E93370] rounded-full mt-2 mr-3 flex-shrink-0" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Artists */}
                    {event.artists && event.artists.length > 0 && (
                      <div>
                        <h3 className="text-2xl text-white mb-4">
                          <Music className="inline h-6 w-6 mr-2 text-[#E93370]" />
                          Artist Lineup
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {event.artists.map(
                            (artist: EventArtist, index: number) => (
                            <div
                              key={index}
                              className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
                            >
                              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                <ImageWithFallback
                                  src={artist.image}
                                  alt={artist.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="text-white">{artist.name}</div>
                                <div className="text-sm text-[#E93370]">{artist.role ?? ''}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gallery */}
                    {event.gallery && event.gallery.length > 0 && (
                      <div>
                        <h3 className="text-2xl text-white mb-4">Event Gallery</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {event.gallery.map((image: string, index: number) => (
                            <div
                              key={index}
                              className="aspect-square rounded-2xl overflow-hidden border border-white/10"
                            >
                              <ImageWithFallback
                                src={image}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Venue Info */}
                  <div className="space-y-6">
                    {/* Venue Card */}
                    {(event.venue || event.location) && (
                      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
                        <h3 className="text-xl text-white">
                          <MapPin className="inline h-5 w-5 mr-2 text-[#E93370]" />
                          Venue
                        </h3>
                        <div>
                          <div className="text-white mb-1">{event.venue || event.location || 'TBD'}</div>
                          {event.venueAddress && (
                            <div className="text-sm text-white/60">{event.venueAddress}</div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-[#E93370]/50 text-white hover:bg-[#E93370]/10 rounded-xl"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Get Directions
                        </Button>
                      </div>
                    )}

                    {/* Map Placeholder */}
                    <div className="aspect-square rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 mx-auto mb-2 text-[#E93370]" />
                          <p>Interactive Map</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-3">
                      <h3 className="text-xl text-white mb-4">Event Info</h3>
                      <div className="space-y-3 text-sm">
                        {(event.date || event.start_date) && (
                          <div>
                            <div className="text-white/60">Date</div>
                            <div className="text-white">
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
                            </div>
                          </div>
                        )}
                        {event.time && (
                          <div>
                            <div className="text-white/60">Time</div>
                            <div className="text-white">{event.time}</div>
                          </div>
                        )}
                        {event.capacity !== null && (
                          <div>
                            <div className="text-white/60">Capacity</div>
                            <div className="text-white">{event.capacity} people</div>
                          </div>
                        )}
                        {event.attendees !== undefined && (
                          <div>
                            <div className="text-white/60">Current Attendees</div>
                            <div className="text-white">{event.attendees} registered</div>
                          </div>
                        )}
                        {(event.price || event.price_range) && (
                          <div>
                            <div className="text-white/60">Price Range</div>
                            <div className="text-white">{event.price || event.price_range || 'TBD'}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
});

EventDetailModal.displayName = 'EventDetailModal';
