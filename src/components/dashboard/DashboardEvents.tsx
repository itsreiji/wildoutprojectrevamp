import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  attendees: number;
  capacity: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Neon Nights: Electronic Odyssey',
    date: '2025-11-15',
    venue: 'Jakarta Convention Center',
    category: 'Music Festival',
    attendees: 3200,
    capacity: 5000,
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Urban Art Exhibition',
    date: '2025-11-20',
    venue: 'Museum MACAN',
    category: 'Art & Culture',
    attendees: 450,
    capacity: 800,
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Sunset Sessions Vol. 12',
    date: '2025-11-25',
    venue: 'Cloud Lounge',
    category: 'Live Music',
    attendees: 285,
    capacity: 300,
    status: 'upcoming',
  },
];

export const DashboardEvents = React.memo(() => {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    venue: '',
    category: '',
    capacity: '',
  });

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: '',
      venue: '',
      category: '',
      capacity: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      venue: event.venue,
      category: event.category,
      capacity: event.capacity.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter((e) => e.id !== id));
    }
  };

  const handleSubmit = () => {
    if (editingEvent) {
      // Update existing event
      setEvents(
        events.map((e) =>
          e.id === editingEvent.id
            ? {
                ...e,
                title: formData.title,
                date: formData.date,
                venue: formData.venue,
                category: formData.category,
                capacity: parseInt(formData.capacity),
              }
            : e
        )
      );
    } else {
      // Create new event
      const newEvent: Event = {
        id: Date.now().toString(),
        title: formData.title,
        date: formData.date,
        venue: formData.venue,
        category: formData.category,
        attendees: 0,
        capacity: parseInt(formData.capacity),
        status: 'upcoming',
      };
      setEvents([...events, newEvent]);
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
          <h2 className="text-2xl mb-1">Event Management</h2>
          <p className="text-white/60">Manage all your events and schedules</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl"
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
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
        />
      </div>

      {/* Events Table */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/80">Event Name</TableHead>
              <TableHead className="text-white/80">Date</TableHead>
              <TableHead className="text-white/80">Venue</TableHead>
              <TableHead className="text-white/80">Category</TableHead>
              <TableHead className="text-white/80">Attendance</TableHead>
              <TableHead className="text-white/80">Status</TableHead>
              <TableHead className="text-white/80 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow
                key={event.id}
                className="border-white/10 hover:bg-white/5 transition-colors"
              >
                <TableCell className="text-white">{event.title}</TableCell>
                <TableCell className="text-white/70">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-[#E93370]" />
                    <span>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-white/70">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-[#E93370]" />
                    <span>{event.venue}</span>
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
                    <span>
                      {event.attendees}/{event.capacity}
                    </span>
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
          <div className="text-center py-12 text-white/60">
            No events found. Create your first event!
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter event title"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="e.g., 500"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                placeholder="Enter venue name"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Music Festival, Art Exhibition"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
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
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardEvents.displayName = 'DashboardEvents';
