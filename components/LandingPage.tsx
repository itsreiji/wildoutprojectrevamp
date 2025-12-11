'use client';

import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useContent } from '@/providers/content-provider';
import { useEvents } from '@/providers/events-provider';

// Define types based on the expected data
interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  image_url: string;
  category: string | null;
}

export const LandingPage = () => {
  const { hero, about, settings, loading, error } = useContent();
  const { events } = useEvents();

  const displayedEvents = useMemo(() => {
    if (events && events.length > 0) {
      return events
        .filter(event => event.status !== 'completed')
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .slice(0, 6) as Event[]; // Show only first 6 events
    }
    return [];
  }, [events]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-100 rounded-lg">
          <h2 className="text-xl font-bold text-red-700">Error Loading Content</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-r from-blue-900 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              {hero?.title || 'WildOut!'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {hero?.subtitle || 'Media Digital Nightlife & Event Multi-Platform'}
            </p>
            <p className="text-lg mb-10 max-w-2xl mx-auto opacity-80">
              {hero?.description || "Indonesia's premier creative community connecting artists, events, and experiences."}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {hero?.stats && (
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{hero.stats.events}</div>
                    <div className="text-sm opacity-80">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{hero.stats.members}</div>
                    <div className="text-sm opacity-80">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{hero.stats.partners}</div>
                    <div className="text-sm opacity-80">Partners</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                className="px-8 py-3 text-lg bg-white text-blue-900 hover:bg-gray-100 rounded-full"
                size="lg"
              >
                {hero?.cta_text || 'Join Us'}
              </Button>
              <Button
                className="px-8 py-3 text-lg border-2 rounded-full"
                size="lg"
                variant="outline"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              {about?.title || 'About WildOut!'}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {about?.subtitle || "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {about?.story?.map((story, index) => (
                <Card key={index} className="border-0 shadow-none bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-xl">Story #{index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-700">{story}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {about?.features?.map((feature, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Upcoming Events</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the latest events happening in the creative community
            </p>
          </div>

          {displayedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden transition-all hover:shadow-lg">
                  {event.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        alt={event.title}
                        className="w-full h-full object-cover"
                        src={event.image_url}
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
                      <Badge className="w-fit mt-2" variant="secondary">
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
                        <span className="mr-2">📅</span>
                        <span>
                          {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">📍</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-600">Check back later for new events</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button className="rounded-full px-6" variant="outline">
              View All Events
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Get In Touch</h2>
            <p className="text-lg text-gray-600 mb-10">
              Have questions or want to collaborate? Reach out to our team
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {settings?.email && (
                <Card className="border-0 shadow-sm bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Email</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      className="text-blue-600 hover:underline"
                      href={`mailto:${settings.email}`}
                    >
                      {settings.email}
                    </a>
                  </CardContent>
                </Card>
              )}

              {settings?.phone && (
                <Card className="border-0 shadow-sm bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Phone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      className="text-blue-600 hover:underline"
                      href={`tel:${settings.phone}`}
                    >
                      {settings.phone}
                    </a>
                  </CardContent>
                </Card>
              )}

              {settings?.address && (
                <Card className="border-0 shadow-sm bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{settings.address}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
              <div className="flex justify-center space-x-4">
                {settings?.social_media?.instagram && (
                  <a
                    className="text-gray-700 hover:text-blue-600"
                    href={settings.social_media.instagram}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Instagram
                  </a>
                )}
                {settings?.social_media?.twitter && (
                  <a
                    className="text-gray-700 hover:text-blue-600"
                    href={settings.social_media.twitter}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Twitter
                  </a>
                )}
                {settings?.social_media?.facebook && (
                  <a
                    className="text-gray-700 hover:text-blue-600"
                    href={settings.social_media.facebook}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Facebook
                  </a>
                )}
                {settings?.social_media?.youtube && (
                  <a
                    className="text-gray-700 hover:text-blue-600"
                    href={settings.social_media.youtube}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    YouTube
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
