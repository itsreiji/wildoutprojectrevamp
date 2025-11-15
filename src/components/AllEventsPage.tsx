import React, { useEffect, useMemo, useState } from 'react';
import type { Event } from '@/types';
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

export const AllEventsPage = () => {
  const { events, loading, error } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-newest');
  const [currentPage, setCurrentPage] = useState(1);

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
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
            WildOut! Events
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Browse Every Upcoming WildOut! Experience
          </h1>
          <p className="text-base text-slate-300">
            Search, filter, sort, and page through the entire WildOut calendar powered by the shared
            Content Context.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Input
              type="search"
              placeholder="Search by title, description, artist, venue..."
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white placeholder:text-slate-500"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
            />

            <div className="flex items-center gap-3">
              <Select value={sortOption} onValueChange={value => setSortOption(value as SortOption)}>
                <SelectTrigger className="min-w-[200px] border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/50">
                  <span className="text-sm text-white/70">Sort</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full rounded-2xl border border-white/10 bg-slate-900/80 text-white">
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
                className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                  dateFilter === filter.value
                    ? 'bg-white text-slate-900'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
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
                className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                  categoryFilter === category
                    ? 'bg-white text-slate-900'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
            Loading events from Supabase...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-3xl border border-rose-500 bg-rose-500/10 p-6 text-sm text-rose-200">
            {`Unable to load events: ${error}`}
          </div>
        )}

        {!loading && !error && (
          <>
            {sortedEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-10 text-center text-white/70">
                No upcoming events match those filters right now. Try relaxing the search
                criteria or removing a filter.
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {paginatedEvents.map(event => (
                    <Card
                      key={event.id}
                      className="overflow-hidden border border-white/5 bg-slate-900/50"
                    >
                      {event.image ? (
                        <div className="relative h-44 w-full overflow-hidden">
                          <img
                            src={event.image}
                            alt={`${event.title} banner`}
                            className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                          />
                          <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
                            {event.category || 'Event'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-44 items-center justify-center bg-white/5 text-sm text-white/60">
                          Image coming soon
                        </div>
                      )}

                      <CardHeader className="space-y-1 border-b border-white/5">
                        <CardTitle className="text-xl font-semibold text-white">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-300">
                          {event.date} · {event.time}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {event.description && (
                          <p className="text-sm text-slate-200">{event.description}</p>
                        )}
                        <p className="text-sm text-slate-400">
                          <span className="font-semibold text-white">Venue:</span> {event.venue}
                        </p>
                        <p className="text-sm text-slate-400">
                          <span className="font-semibold text-white">Artists:</span> {formatArtistList(event)}
                        </p>
                      </CardContent>

                      <CardFooter className="justify-between text-xs text-slate-400">
                        <span>{event.location || event.venue || 'Venue TBD'}</span>
                        <span>{event.time || 'Time TBD'}</span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300">
                  <p>
                    Showing {rangeStart}–{rangeEnd} of {sortedEvents.length} events
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safeCurrentPage <= 1}
                      onClick={() =>
                        setCurrentPage(prev => Math.max(prev - 1, 1))
                      }
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
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
};
