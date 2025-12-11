'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/providers/events-provider';
import { useAuth } from '@/providers/auth-provider';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

export default function AllEventsPage() {
  const { events, loading, error } = useEvents();
  const { role } = useAuth();
  const [filteredEvents, setFilteredEvents] = useState(events);

  // Filter events based on status (all events for now)
  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600">Browse and discover upcoming events</p>
          </div>
          {role === 'admin' || role === 'editor' ? (
            <Button asChild>
              <Link href="/sadmin/events">
                Manage Events
              </Link>
            </Button>
          ) : null}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {event.image_url && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.image_url} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge 
                    variant={event.status === 'ongoing' ? 'default' : 
                            event.status === 'completed' ? 'secondary' : 'outline'}
                  >
                    {event.status}
                  </Badge>
                </div>
                {event.category && (
                  <Badge variant="secondary" className="w-fit mt-2">
                    {event.category}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {event.description || 'Event description coming soon...'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  {event.attendees !== null && event.capacity !== null && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.attendees} of {event.capacity} attendees</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Check back later for new events</p>
          </div>
        )}
      </div>
    </div>
  );
}