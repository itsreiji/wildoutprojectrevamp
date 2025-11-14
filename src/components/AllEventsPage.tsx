import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Users, X, Search, Filter, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventDetailModal } from './EventDetailModal';
import { useContent, Event } from '../contexts/ContentContext';
import { useRouter } from './router';
import logo from 'figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png';

export const AllEventsPage = React.memo(() => {
  const { navigate } = useRouter();
  const { events } = useContent();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    'all',
    ...Array.from(new Set(events.map(e => e.category).filter((category): category is string => Boolean(category))))
  ];

  const filteredEvents = events.filter(event => {
    const description = event.description ?? '';
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <img src={logo} alt="WildOut!" className="h-10 w-auto object-contain" />
                <div>
                  <h1 className="text-3xl md:text-4xl bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent mb-1">
                    All Events
                  </h1>
                  <p className="text-white/60">Browse our complete event catalog</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-white/10 text-white/70 hover:bg-white/5 rounded-xl"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    onClick={() => setFilterCategory(category)}
                    variant={filterCategory === category ? 'default' : 'outline'}
                    className={`rounded-xl whitespace-nowrap ${
                      filterCategory === category
                        ? 'bg-[#E93370] hover:bg-[#E93370]/90 text-white'
                        : 'border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {category === 'all' ? 'All Events' : category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedEvent(event)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-300 h-full flex flex-col">
                  {/* Event Image */}
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={event.image || ''}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-[#E93370]/90 text-white border-0 backdrop-blur-sm">
                        {event.category}
                      </Badge>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className={
                        event.status === 'upcoming' ? 'bg-blue-500/90 text-white border-0' :
                        event.status === 'ongoing' ? 'bg-green-500/90 text-white border-0' :
                        'bg-gray-500/90 text-white border-0'
                      }>
                        {event.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl text-white mb-3 line-clamp-2 group-hover:text-[#E93370] transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-white/60 text-sm mb-4 line-clamp-2 flex-1">
                      {event.description ?? 'No description available.'}
                    </p>

                    <div className="space-y-2">
                      {/* Date & Time */}
                      {(event.date || event.start_date) && (
                        <div className="flex items-center text-sm text-white/70">
                          <Calendar className="h-4 w-4 mr-2 text-[#E93370]" />
                          <span>
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
                          {event.time && (
                            <>
                              <Clock className="h-4 w-4 ml-4 mr-2 text-[#E93370]" />
                              <span>{event.time.split(' - ')[0]}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Venue */}
                      {(event.venue || event.location) && (
                        <div className="flex items-center text-sm text-white/70">
                          <MapPin className="h-4 w-4 mr-2 text-[#E93370]" />
                          <span className="line-clamp-1">{event.venue || event.location || 'TBD'}</span>
                        </div>
                      )}

                      {/* Attendance */}
                      {((event.attendees !== undefined && event.attendees !== null) ||
                        (event.capacity !== undefined && event.capacity !== null)) && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex items-center text-sm text-white/70">
                            <Users className="h-4 w-4 mr-2 text-[#E93370]" />
                            <span>
                              {event.attendees ?? 0}/{event.capacity ?? 'N/A'}
                            </span>
                          </div>
                          {(event.price || event.price_range) && (
                            <span className="text-sm text-[#E93370]">{event.price || event.price_range || 'TBD'}</span>
                          )}
                        </div>
                      )}

                      {/* Progress Bar */}
                      {event.attendees !== undefined &&
                        event.attendees !== null &&
                        event.capacity !== undefined &&
                        event.capacity !== null &&
                        event.capacity > 0 && (
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div
                            className="bg-[#E93370] h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                ((event.attendees ?? 0) / (event.capacity ?? 0)) * 100,
                                100
                              )}%`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="h-20 w-20 mx-auto mb-4 text-white/20" />
              <h3 className="text-2xl text-white mb-2">No events found</h3>
              <p className="text-white/60">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Event Count */}
          <div className="text-center mt-12 text-white/60">
            Showing {filteredEvents.length} of {events.length} events
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
});

AllEventsPage.displayName = 'AllEventsPage';
