import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type { Event } from '@/contexts/ContentContext';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventDetailModal } from './EventDetailModal';
import { Background3D } from './Background3D';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useContent } from '@/contexts/ContentContext';

const ITEMS_PER_PAGE = 8;

type DateFilterOption = 'all' | 'this-weekend' | 'next-7-days' | 'next-30-days';
type SortOption = 'date-newest' | 'date-oldest' | 'title-az';

const DATE_FILTERS: { label: string; value: DateFilterOption }[] = [
  { label: 'Any date', value: 'all' },
  { label: 'This weekend', value: 'this-weekend' },
  { label: 'Next 7 days', value: 'next-7-days' },
  { label: 'Next 30 days', value: 'next-30-days' },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Date · Newest first', value: 'date-newest' },
  { label: 'Date · Oldest first', value: 'date-oldest' },
  { label: 'Title · A → Z', value: 'title-az' },
];

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const addDays = (date: Date, days: number) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};

const parseEventDate = (event: Event): Date | null => {
  const value = event.start_date || event.date;
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const matchesDateFilter = (
  target: Date | null,
  filter: DateFilterOption,
  reference: Date
) => {
  if (!target || filter === 'all') {
    return true;
  }

  const referenceStart = startOfDay(reference);

  if (filter === 'this-weekend') {
    const isWeekend = target.getDay() === 6 || target.getDay() === 0;
    return (
      isWeekend &&
      target >= referenceStart &&
      target <= addDays(referenceStart, 7)
    );
  }

  const rangeEnd =
    filter === 'next-7-days'
      ? addDays(referenceStart, 7)
      : addDays(referenceStart, 30);

  return target >= referenceStart && target <= rangeEnd;
};

const formatArtistList = (event: Event) => {
  if (!event.artists || event.artists.length === 0) {
    return 'Artist lineup coming soon';
  }
  return event.artists
    .map(artist => `${artist.name}${artist.role ? ` · ${artist.role}` : ''}`)
    .join(', ');
};

const formatEventDate = (event: Event): string => {
  const dateValue = event.start_date || event.date;
  if (!dateValue) return 'Date TBD';

  try {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Date TBD';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Date TBD';
  }
};

const formatEventTime = (event: Event): string => {
  if (event.time) return event.time;

  // Try to extract time from start_date if available
  const dateValue = event.start_date || event.date;
  if (dateValue) {
    try {
      const date = new Date(dateValue);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }
    } catch {
      // Fall through to default
    }
  }

  return 'Time TBD';
};

export const AllEventsPage = () => {
  const { events, loading, error } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const referenceDate = useMemo(() => new Date(), [events, loading]);

  const upcomingEvents = useMemo(() => {
    return events.filter(event => {
      if (event.status === 'completed') {
        return false;
      }
      if (event.status === 'ongoing') {
        return true;
      }
      const start = parseEventDate(event);
      return start ? start >= referenceDate : true;
    });
  }, [events, referenceDate]);

  const categories = useMemo(() => {
    const normalized = Array.from(
      new Set(
        upcomingEvents
          .map(event => event.category)
          .filter((category): category is string => Boolean(category && category.trim()))
          .map(category => category.trim())
      )
    ).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    return ['all', ...normalized];
  }, [upcomingEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, dateFilter, sortOption, referenceDate]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return upcomingEvents.filter(event => {
      const matchesCategory =
        categoryFilter === 'all' ||
        (event.category?.trim().toLowerCase() === categoryFilter.toLowerCase());

      if (!matchesCategory) {
        return false;
      }

      const matchesDate = matchesDateFilter(
        parseEventDate(event),
        dateFilter,
        referenceDate
      );

      if (!matchesDate) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        event.title,
        event.description ?? '',
        event.category ?? '',
        event.venue ?? '',
        formatArtistList(event),
      ]
        .map(value => value.toLowerCase())
        .join(' ');

      return haystack.includes(query);
    });
  }, [upcomingEvents, categoryFilter, dateFilter, searchQuery, referenceDate]);

  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];
    sorted.sort((a, b) => {
      const dateA = parseEventDate(a)?.getTime() ?? 0;
      const dateB = parseEventDate(b)?.getTime() ?? 0;

      if (sortOption === 'date-newest') {
        return dateB - dateA;
      }

      if (sortOption === 'date-oldest') {
        return dateA - dateB;
      }

      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    });
    return sorted;
  }, [filteredEvents, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvents = sortedEvents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const rangeStart = safeCurrentPage === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(sortedEvents.length, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="dark relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Background3D />
      <Navigation />

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-y-12 px-4 py-12 md:gap-y-16 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-3 text-center mb-8 pt-8 md:pt-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
            <span className="bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
              Browse Every Upcoming WildOut! Experience
            </span>
          </h1>
          <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto">
            Search, filter, sort, and page through the entire WildOut calendar powered by the shared
            Content Context.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col gap-6 mb-8"
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Input
              type="search"
              placeholder="Search by title, description, artist, venue..."
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-3 text-white placeholder:text-white/30 focus:border-[#E93370]/50 focus:outline-none focus:ring-2 focus:ring-[#E93370]/20 transition-all duration-300"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
            />

            <div className="flex items-center gap-3">
              <Select value={sortOption} onValueChange={value => setSortOption(value as SortOption)}>
                <SelectTrigger className="min-w-[200px] border border-white/10 bg-white/5 backdrop-blur-xl px-3 py-2 text-sm text-white placeholder:text-white/50 rounded-2xl">
                  <span className="text-sm text-white/70">Sort</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl text-white">
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {DATE_FILTERS.map(filter => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setDateFilter(filter.value)}
                aria-pressed={dateFilter === filter.value}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${
                  dateFilter === filter.value
                    ? 'bg-[#E93370] text-white shadow-lg shadow-[#E93370]/20'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                aria-pressed={categoryFilter === category}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${
                  categoryFilter === category
                    ? 'bg-[#E93370] text-white shadow-lg shadow-[#E93370]/20'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center text-white/70 shadow-2xl"
          >
            Loading events from Supabase...
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-red-500/60 bg-red-500/10 backdrop-blur-xl p-6 text-sm text-red-100 shadow-xl"
          >
            <p className="font-semibold text-base text-red-100">Unable to load events</p>
            <p className="mt-1 text-[13px] text-red-200">{error}</p>
          </motion.div>
        )}

        {!loading && !error && (
          <>
            {sortedEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-dashed border-white/20 bg-white/5 backdrop-blur-xl p-10 text-center text-white/70 shadow-2xl"
              >
                No upcoming events match those filters right now. Try relaxing the search
                criteria or removing a filter.
              </motion.div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {paginatedEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-[#E93370]/50 transition-all duration-500 shadow-2xl cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        {event.image ? (
                          <div className="relative h-64 w-full overflow-hidden">
                            <ImageWithFallback
                              src={event.image}
                              alt={`${event.title} banner`}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                            <Badge className="absolute top-4 left-4 bg-[#E93370]/90 text-white border-0">
                              {event.category || 'Event'}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex h-64 items-center justify-center bg-white/5 text-sm text-white/60">
                            Image coming soon
                          </div>
                        )}

                        <CardHeader className="space-y-2 border-b border-white/10 p-6">
                          <CardTitle className="text-xl md:text-2xl font-semibold text-white group-hover:text-[#E93370] transition-colors duration-300">
                            {event.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-white/60">
                            {formatEventDate(event)} · {formatEventTime(event)}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3 p-6">
                          {event.description && (
                            <p className="text-sm text-white/70 line-clamp-2">{event.description}</p>
                          )}
                          <div className="space-y-2">
                            {event.venue && (
                              <p className="text-sm text-white/60">
                                <span className="font-semibold text-white">Venue:</span> {event.venue}
                              </p>
                            )}
                            {event.artists && event.artists.length > 0 && (
                              <p className="text-sm text-white/60">
                                <span className="font-semibold text-white">Artists:</span> {formatArtistList(event)}
                              </p>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="justify-between text-xs text-white/50 p-6 border-t border-white/10">
                          <span>{event.location || event.venue || 'Venue TBD'}</span>
                          <span>{formatEventTime(event)}</span>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4 text-sm text-white/70 shadow-xl mt-12"
                >
                  <p className="flex items-center">
                    Showing {rangeStart}–{rangeEnd} of {sortedEvents.length} events
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safeCurrentPage <= 1}
                      onClick={() =>
                        setCurrentPage(prev => Math.max(prev - 1, 1))
                      }
                      className="border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage(prev => Math.min(prev + 1, totalPages))
                      }
                      className="border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                    >
                      Next
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
