'use client';

import {
  Users,
  Calendar,
  Camera,
  Users2,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { useContent } from '@/providers/content-provider';

export const Dashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const {
    events,
    partners,
    gallery,
    team,
    loading: contentLoading,
    adminSections,
  } = useContent();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  // Auto-close sidebar on mobile after selecting a section
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (authLoading || contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || role === 'anonymous') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-100 rounded-lg">
          <h2 className="text-xl font-bold text-red-700">Access Denied</h2>
          <p className="text-red-600 mt-2">Please sign in to access the dashboard</p>
          <Button asChild className="mt-4">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Default admin sections if none are loaded from the database
  const defaultSections = [
    { id: 'events', slug: 'events', label: 'Events', icon: Calendar, description: 'Manage events' },
    { id: 'partners', slug: 'partners', label: 'Partners', icon: Users, description: 'Manage partners' },
    { id: 'gallery', slug: 'gallery', label: 'Gallery', icon: Camera, description: 'Manage gallery' },
    { id: 'team', slug: 'team', label: 'Team', icon: Users2, description: 'Manage team members' },
    { id: 'settings', slug: 'settings', label: 'Settings', icon: Settings, description: 'Manage site settings' },
  ];

  const sections = adminSections.length > 0
    ? adminSections.map(section => ({
        id: section.id,
        slug: section.slug,
        label: section.label,
        icon: Settings, // Using Settings as default since we can't dynamically import icons
        description: section.description || '',
      }))
    : defaultSections;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar toggle button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r h-full transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user.email}</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <li key={section.id}>
                  <Button
                    className="w-full justify-start"
                    variant={activeSection === section.slug ? 'secondary' : 'ghost'}
                    onClick={() => {
                      setActiveSection(section.slug);
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {section.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-0">
        {/* Header */}
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <div className="md:hidden">
            <h2 className="text-lg font-semibold">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-gray-500">Role: {role}</span>
            <Button size="sm" variant="outline">
              <Link href="/sadmin/logout">Logout</Link>
            </Button>
          </div>
        </header>

        {/* Dashboard Overview */}
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome to the admin dashboard. Manage your content and settings.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partners</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partners.length}</div>
                <p className="text-xs text-muted-foreground">Active partnerships</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gallery Items</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gallery.length}</div>
                <p className="text-xs text-muted-foreground">Photos & media</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{team.length}</div>
                <p className="text-xs text-muted-foreground">Active contributors</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest events added to the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(event.start_date).toLocaleDateString()} • {event.location}
                        </p>
                      </div>
                      <Badge variant="outline">{event.status}</Badge>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No events found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Sections</CardTitle>
                <CardDescription>Available management areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {sections.map((section) => (
                    <Link
                      key={section.id}
                      className="block"
                      href={`/sadmin/${section.slug}`}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <section.icon className="h-8 w-8 text-blue-500" />
                          <CardTitle className="text-lg">{section.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-500">{section.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
