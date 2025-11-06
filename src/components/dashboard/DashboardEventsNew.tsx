import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, Calendar, MapPin, Users, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useContent, Event } from '../../contexts/ContentContext';
import { toast } from 'sonner';

export const DashboardEventsNew = React.memo(() => {
  const { events, updateEvents } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    venueAddress: '',
    image: '',
    category: '',
    capacity: 0,
    price: '',
    artists: [],
    gallery: [],
    highlights: [],
    status: 'upcoming',
  });

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      venue: '',
      venueAddress: '',
      image: '',
      category: '',
      capacity: 0,
      price: '',
      artists: [],
      gallery: [],
      highlights: [],
      status: 'upcoming',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData(event);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      updateEvents(events.filter((e) => e.id !== id));
      toast.success('Event deleted successfully!');
    }
  };

  const handleSubmit = () => {
    if (editingEvent) {
      updateEvents(
        events.map((e) =>
          e.id === editingEvent.id ? { ...e, ...formData } : e
        )
      );
      toast.success('Event updated successfully!');
    } else {
      const newEvent: Event = {
        ...(formData as Event),
        id: Date.now().toString(),
        attendees: 0,
      };
      updateEvents([...events, newEvent]);
      toast.success('Event created successfully!');
    }
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ongoing':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
            Event Management
          </h2>
          <p className="text-white/60">Create and manage events - changes sync to landing page instantly</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl shadow-lg shadow-[#E93370]/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
        <Input
          type="text"
          placeholder="Search events by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12"
        />
      </div>

      {/* Events Table */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/90">Event Name</TableHead>
              <TableHead className="text-white/90">Date & Time</TableHead>
              <TableHead className="text-white/90">Venue</TableHead>
              <TableHead className="text-white/90">Category</TableHead>
              <TableHead className="text-white/90">Attendance</TableHead>
              <TableHead className="text-white/90">Status</TableHead>
              <TableHead className="text-white/90 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow
                key={event.id}
                className="border-white/10 hover:bg-white/5 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-white">{event.title}</div>
                      <div className="text-xs text-white/50">{event.price}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-white/70">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-[#E93370]" />
                    <div>
                      <div className="text-sm">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-white/50">{event.time}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-white/70">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-[#E93370]" />
                    <div className="text-sm">{event.venue}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-[#E93370]/20 text-[#E93370] border-[#E93370]/30">
                    {event.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-white/70">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-[#E93370]" />
                    <span className="text-sm">
                      {event.attendees}/{event.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-[#E93370] h-1.5 rounded-full"
                      style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(event)}
                      className="border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(event.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16 text-white/60">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-white/20" />
            <p className="text-lg">No events found</p>
            <p className="text-sm mt-2">Create your first event to get started!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Music Festival, Art Exhibition"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter event description"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Event Image URL *</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g., 21:00 - 04:00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Venue Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue Name *</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Enter venue name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venueAddress">Venue Address *</Label>
                  <Input
                    id="venueAddress"
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    placeholder="Enter venue address"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg text-white/90">Capacity & Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 500"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price Range *</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., IDR 250K - 500K"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-white/10 text-white/70 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20"
              disabled={!formData.title || !formData.date || !formData.venue}
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardEventsNew.displayName = 'DashboardEventsNew';
