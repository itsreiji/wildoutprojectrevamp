import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useContent } from '../../contexts/ContentContext';
import { toast } from 'sonner';
import type { EventArtist } from '@/types/content';

interface EventArtistFormData {
  event_id: string;
  artist_name: string;
  role: string;
  performance_time: string;
}

export const DashboardEventArtists = () => {
  const { fetchEventArtists, addEventArtist, updateEventArtist, deleteEventArtist, events } = useContent();
  const [artists, setArtists] = useState<EventArtist[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<EventArtist | null>(null);
  const [formData, setFormData] = useState<EventArtistFormData>({
    event_id: '',
    artist_name: '',
    role: '',
    performance_time: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('all'); // Filter by event, default to 'all' for Select compatibility

  useEffect(() => {
    loadArtists();
  }, [selectedEventId]);

  const loadArtists = async () => {
    if (!selectedEventId || selectedEventId === 'all') {
      setArtists([]);
      return;
    }
    const fetched = await fetchEventArtists(selectedEventId);
    setArtists(fetched);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const artistData: any = {
        event_id: formData.event_id,
        artist_name: formData.artist_name,
        role: formData.role || null as any,
        performance_time: formData.performance_time || null as any,
      };
      if (editingArtist) {
        await updateEventArtist(editingArtist.id!, { artist_name: formData.artist_name, role: formData.role, performance_time: formData.performance_time } as any);
        toast.success('Artist updated');
      } else {
        await addEventArtist(artistData);
        toast.success('Artist added');
      }
      loadArtists();
      setIsDialogOpen(false);
      setFormData({ event_id: selectedEventId === 'all' ? '' : selectedEventId, artist_name: '', role: '', performance_time: '' });
      setEditingArtist(null);
    } catch (error) {
      toast.error('Failed to save artist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (artist: EventArtist) => {
    setEditingArtist(artist);
    setFormData({
      event_id: artist.event_id!,
      artist_name: artist.name,
      role: artist.role || '',
      performance_time: artist.performance_time || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this artist?')) {
      try {
        await deleteEventArtist(id);
        toast.success('Artist deleted');
        loadArtists();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <h2 className="text-3xl bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">Event Artists</h2>
        <div className="w-[200px]">
          <Select
            value={selectedEventId}
            onValueChange={(value) => setSelectedEventId(value)}
          >
            <SelectTrigger className="border-white/10 text-white">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} className="cursor-pointer" value={event.id!}>
                  {event.title || 'Untitled Event'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-[#E93370] hover:bg-[#E93370]/90" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Artist
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artists.map(artist => (
            <TableRow key={artist.id}>
              <TableCell>{events.find(e => e.id === artist.event_id)?.title}</TableCell>
              <TableCell>{artist.name}</TableCell>
              <TableCell>{artist.role}</TableCell>
              <TableCell>{artist.performance_time}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-8 w-8 p-0" variant="ghost">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleEdit(artist)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleDelete(artist.id!)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>{editingArtist ? 'Edit Artist' : 'Add Artist'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Event</label>
                <Select
                  value={formData.event_id}
                  onValueChange={(value) => setFormData({ ...formData, event_id: value })}
                >
                  <SelectTrigger className="border-white/10 text-white">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} className="cursor-pointer" value={event.id!}>
                        {event.title || 'Untitled Event'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Artist Name" value={formData.artist_name} onChange={e => setFormData({ ...formData, artist_name: e.target.value })} />
              <Input placeholder="Role" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
              <Input type="time" value={formData.performance_time} onChange={e => setFormData({ ...formData, performance_time: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
