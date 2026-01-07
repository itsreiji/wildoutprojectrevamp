import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Edit, Trash2, Calendar, MapPin, Users, 
  Filter, MoreVertical, X, Music, Image as ImageIcon, 
  List, CheckCircle2, Clock, DollarSign, Upload 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ImageUpload } from './ImageUpload';
import { useContent } from '../../contexts/ContentContextCore';
import { Event } from '../../types/content';
import { toast } from 'sonner';

export const DashboardEventsNew = React.memo(() => {
  const { events, updateEvents } = useContent();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Form State
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

  const [activeTab, setActiveTab] = useState('details');

  const filteredEvents = events.filter((event: Event) => {
    return event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           event.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreate = (): void => {
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
    setActiveTab('details');
    setIsDialogOpen(true);
  };

  const handleEdit = (event: Event): void => {
    setEditingEvent(event);
    setFormData(JSON.parse(JSON.stringify(event))); // Deep copy to avoid reference issues
    setActiveTab('details');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string): void => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      updateEvents(events.filter((e: Event) => e.id !== id));
      toast.success('Event deleted successfully!');
    }
  };

  const handleSubmit = (): void => {
    // Basic Validation
    if (!formData.title || !formData.date) {
        toast.error('Please fill in at least the Title and Date');
        return;
    }

    if (editingEvent) {
      updateEvents(
        events.map((e: Event) =>
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

  // Helper for Artists
  const addArtist = () => {
      setFormData(prev => ({
          ...prev,
          artists: [...(prev.artists || []), { name: '', role: '', image: '' }]
      }));
  };

  const updateArtist = (index: number, field: string, value: string) => {
      const newArtists = [...(formData.artists || [])];
      newArtists[index] = { ...newArtists[index], [field]: value };
      setFormData(prev => ({ ...prev, artists: newArtists }));
  };

  const removeArtist = (index: number) => {
      setFormData(prev => ({
          ...prev,
          artists: (prev.artists || []).filter((_, i) => i !== index)
      }));
  };

  // Helper for Highlights
  const addHighlight = () => {
      setFormData(prev => ({
          ...prev,
          highlights: [...(prev.highlights || []), '']
      }));
  };

  const updateHighlight = (index: number, value: string) => {
      const newHighlights = [...(formData.highlights || [])];
      newHighlights[index] = value;
      setFormData(prev => ({ ...prev, highlights: newHighlights }));
  };

  const removeHighlight = (index: number) => {
      setFormData(prev => ({
          ...prev,
          highlights: (prev.highlights || []).filter((_, i) => i !== index)
      }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'ongoing': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'completed': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
      default: return 'text-white bg-white/10 border-white/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2">EVENT MANAGEMENT</h1>
          <p className="text-white/40 font-mono text-sm">:: ORCHESTRATE & OVERSEE ::</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/20 focus:outline-none focus:border-[#E93370]/50 focus:bg-white/10 transition-all w-64"
            />
          </div>
          <button 
             onClick={handleCreate}
             className="px-6 py-2.5 bg-[#E93370] hover:bg-[#D61E5C] text-white rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_-5px_#E93370] transition-all flex items-center gap-2 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            NEW EVENT
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.07]"
            >
               <div className="flex items-center gap-6">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/50 shrink-0 relative border border-white/5" style={{ width: '80px', height: '80px' }}>
                     <ImageWithFallback
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                     <div className="md:col-span-5">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-3 ${getStatusColor(event.status)}`}>
                           {event.status}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 truncate">{event.title}</h3>
                        <div className="flex items-center gap-4 text-white/40 text-sm">
                           <span className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-[#E93370]" />
                              {event.date}
                           </span>
                           <span className="flex items-center gap-1.5">
                              <Clock size={14} />
                              {event.time}
                           </span>
                           <span className="flex items-center gap-1.5 truncate">
                              <MapPin size={14} />
                              {event.venue}
                           </span>
                        </div>
                     </div>

                     <div className="md:col-span-3 flex flex-col gap-1">
                        <span className="text-white/40 text-xs uppercase font-medium">Capacity</span>
                        <div className="flex items-center gap-2">
                           <Users size={16} className="text-[#E93370]" />
                           <span className="text-white font-mono">{event.attendees} / {event.capacity}</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-1">
                           <div 
                              className="h-full bg-[#E93370] rounded-full" 
                              style={{ width: `${Math.min((event.attendees / event.capacity) * 100, 100)}%` }} 
                           />
                        </div>
                     </div>

                     <div className="md:col-span-2">
                        <span className="text-white/40 text-xs uppercase font-medium">Category</span>
                        <div className="text-white font-medium">{event.category}</div>
                     </div>

                     <div className="md:col-span-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                           onClick={() => handleEdit(event)}
                           className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                        >
                           <Edit size={18} />
                        </button>
                        <button 
                           onClick={() => handleDelete(event.id)}
                           className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-500 transition-colors"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 text-white sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-white/10 bg-white/5">
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              {editingEvent ? <Edit className="w-5 h-5 text-[#E93370]" /> : <Plus className="w-5 h-5 text-[#E93370]" />}
              {editingEvent ? 'EDIT EVENT' : 'CREATE NEW EVENT'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full bg-black/40 p-1 rounded-xl mb-6 h-auto border border-white/10">
                <TabsTrigger value="details" className="flex-1 data-[state=active]:bg-[#E93370] data-[state=active]:text-white rounded-lg text-xs uppercase font-bold tracking-wider py-2">Details</TabsTrigger>
                <TabsTrigger value="logistics" className="flex-1 data-[state=active]:bg-[#E93370] data-[state=active]:text-white rounded-lg text-xs uppercase font-bold tracking-wider py-2">Logistics</TabsTrigger>
                <TabsTrigger value="media" className="flex-1 data-[state=active]:bg-[#E93370] data-[state=active]:text-white rounded-lg text-xs uppercase font-bold tracking-wider py-2">Media</TabsTrigger>
                <TabsTrigger value="lineup" className="flex-1 data-[state=active]:bg-[#E93370] data-[state=active]:text-white rounded-lg text-xs uppercase font-bold tracking-wider py-2">Lineup</TabsTrigger>
                <TabsTrigger value="extras" className="flex-1 data-[state=active]:bg-[#E93370] data-[state=active]:text-white rounded-lg text-xs uppercase font-bold tracking-wider py-2">Extras</TabsTrigger>
              </TabsList>

              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                {/* DETAILS TAB */}
                <TabsContent value="details" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Event Title</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus:border-[#E93370] h-11"
                        placeholder="e.g. Neon Nights 2025"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Category</Label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus:border-[#E93370] h-11"
                        placeholder="e.g. Electronic / Rave"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white/5 border-white/10 text-white focus:border-[#E93370] min-h-[120px] resize-none"
                      placeholder="Describe the event experience..."
                    />
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Status</Label>
                     <div className="flex gap-2">
                        {['upcoming', 'ongoing', 'completed'].map((status) => (
                           <button
                              key={status}
                              onClick={() => setFormData({ ...formData, status: status as any })}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                                 formData.status === status 
                                    ? 'bg-[#E93370]/20 border-[#E93370] text-[#E93370]' 
                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                              }`}
                           >
                              {status}
                           </button>
                        ))}
                     </div>
                  </div>
                </TabsContent>

                {/* LOGISTICS TAB */}
                <TabsContent value="logistics" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                           type="date"
                           value={formData.date}
                           onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                           className="bg-white/5 border-white/10 text-white focus:border-[#E93370] h-11"
                           style={{ paddingLeft: '3rem' }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                           type="time"
                           value={formData.time}
                           onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                           className="bg-white/5 border-white/10 text-white focus:border-[#E93370] h-11"
                           style={{ paddingLeft: '3rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Venue Name</Label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                       <Input
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus:border-[#E93370] h-11"
                        placeholder="e.g. The Grand Hall"
                        style={{ paddingLeft: '3rem' }}
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Full Address</Label>
                    <Input
                      value={formData.venueAddress}
                      onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                      className="bg-white/5 border-white/10 text-white focus:border-[#E93370] h-11"
                      placeholder="e.g. 123 Music Ave, Jakarta"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Total Capacity</Label>
                        <div className="relative">
                           <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                           <Input
                              type="number"
                              value={formData.capacity}
                              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                              className="bg-white/5 border-white/10 text-white focus:border-[#E93370] h-11"
                              style={{ paddingLeft: '3rem' }}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Price / Ticket</Label>
                        <div className="relative">
                           <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                           <Input
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              className="bg-white/5 border-white/10 text-white focus:border-[#E93370] h-11"
                              placeholder="e.g. IDR 150.000"
                              style={{ paddingLeft: '3rem' }}
                           />
                        </div>
                     </div>
                  </div>
                </TabsContent>

                {/* MEDIA TAB */}
                <TabsContent value="media" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <ImageUpload 
          label="Main Event Poster"
          value={formData.image || ''}
          onChange={(url) => setFormData({ ...formData, image: url })}
      />
                  </div>
                  
                  <div className="space-y-2 pt-4">
                     <div className="flex items-center justify-between">
                        <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Gallery Images (URLs)</Label>
                        <Button 
                           size="sm" 
                           onClick={() => setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), ''] }))}
                           className="h-6 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10"
                        >
                           <Plus className="w-3 h-3 mr-1" /> ADD URL
                        </Button>
                     </div>
                     <div className="space-y-2">
                        {formData.gallery?.map((url, index) => (
                           <div key={index} className="flex gap-2">
                              <Input 
                                 value={url}
                                 onChange={(e) => {
                                    const newGallery = [...(formData.gallery || [])];
                                    newGallery[index] = e.target.value;
                                    setFormData({ ...formData, gallery: newGallery });
                                 }}
                                 placeholder="https://..."
                                 className="bg-white/5 border-white/10 text-white h-9 text-xs"
                              />
                              <Button
                                 size="icon"
                                 variant="ghost"
                                 onClick={() => {
                                    const newGallery = formData.gallery?.filter((_, i) => i !== index);
                                    setFormData({ ...formData, gallery: newGallery });
                                 }}
                                 className="h-9 w-9 text-white/40 hover:text-red-500 hover:bg-red-500/10"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </Button>
                           </div>
                        ))}
                        {(!formData.gallery || formData.gallery.length === 0) && (
                           <div className="text-center py-4 text-white/20 text-xs italic border border-dashed border-white/10 rounded-lg">
                              No gallery images added yet.
                           </div>
                        )}
                     </div>
                  </div>
                </TabsContent>

                {/* LINEUP TAB */}
                <TabsContent value="lineup" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-white">Featured Artists</h3>
                     <Button 
                        size="sm" 
                        onClick={addArtist}
                        className="bg-[#E93370] hover:bg-[#D61E5C] text-white h-8 text-xs font-bold"
                     >
                        <Plus className="w-3 h-3 mr-1" /> ADD ARTIST
                     </Button>
                  </div>
                  
                  <div className="space-y-4">
                     {formData.artists?.map((artist, index) => (
                        <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 relative group">
                           <div className="absolute top-2 right-2">
                              <Button
                                 size="icon"
                                 variant="ghost"
                                 onClick={() => removeArtist(index)}
                                 className="h-6 w-6 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                              >
                                 <X className="w-3 h-3" />
                              </Button>
                           </div>
                           
                           <div className="flex gap-4">
                              <div className="w-16 h-16 shrink-0 bg-black/40 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center">
                                 {artist.image ? (
                                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                                 ) : (
                                    <Music className="w-6 h-6 text-white/20" />
                                 )}
                              </div>
                              <div className="flex-1 space-y-2">
                                 <Input 
                                    value={artist.name}
                                    onChange={(e) => updateArtist(index, 'name', e.target.value)}
                                    placeholder="Artist Name"
                                    className="h-8 bg-black/20 border-white/10 text-sm"
                                 />
                                 <Input 
                                    value={artist.role}
                                    onChange={(e) => updateArtist(index, 'role', e.target.value)}
                                    placeholder="Role (e.g. DJ, Guest Star)"
                                    className="h-8 bg-black/20 border-white/10 text-xs"
                                 />
                                 <Input 
                                    value={artist.image}
                                    onChange={(e) => updateArtist(index, 'image', e.target.value)}
                                    placeholder="Photo URL"
                                    className="h-8 bg-black/20 border-white/10 text-xs font-mono text-white/60"
                                 />
                              </div>
                           </div>
                        </div>
                     ))}
                     {(!formData.artists || formData.artists.length === 0) && (
                        <div className="text-center py-8 text-white/20 text-sm border border-dashed border-white/10 rounded-xl">
                           <Music className="w-8 h-8 mx-auto mb-2 opacity-20" />
                           No artists added to the lineup.
                        </div>
                     )}
                  </div>
                </TabsContent>

                {/* EXTRAS TAB */}
                <TabsContent value="extras" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-white">Event Highlights</h3>
                     <Button 
                        size="sm" 
                        onClick={addHighlight}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white h-8 text-xs font-bold"
                     >
                        <Plus className="w-3 h-3 mr-1" /> ADD ITEM
                     </Button>
                  </div>

                  <div className="space-y-2">
                     {formData.highlights?.map((highlight, index) => (
                        <div key={index} className="flex gap-2">
                           <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-white/40 text-xs font-mono">
                              {index + 1}
                           </div>
                           <Input 
                              value={highlight}
                              onChange={(e) => updateHighlight(index, e.target.value)}
                              placeholder="e.g. Free Welcome Drink"
                              className="bg-white/5 border-white/10 text-white h-8"
                           />
                           <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeHighlight(index)}
                              className="h-8 w-8 text-white/40 hover:text-red-500 hover:bg-red-500/10"
                           >
                              <X className="w-4 h-4" />
                           </Button>
                        </div>
                     ))}
                     {(!formData.highlights || formData.highlights.length === 0) && (
                        <div className="text-center py-8 text-white/20 text-sm border border-dashed border-white/10 rounded-xl">
                           <List className="w-8 h-8 mx-auto mb-2 opacity-20" />
                           Add highlights to showcase what makes this event special.
                        </div>
                     )}
                  </div>
                </TabsContent>

              </div>
            </Tabs>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
             <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
                {editingEvent ? `ID: ${editingEvent.id}` : 'NEW ENTRY'}
             </div>
             <div className="flex gap-2">
               <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5 hover:text-white h-9 text-xs">
                  CANCEL
               </Button>
               <Button onClick={handleSubmit} className="bg-[#E93370] hover:bg-[#D61E5C] text-white h-9 text-xs font-bold tracking-wide">
                  {editingEvent ? 'SAVE CHANGES' : 'CREATE EVENT'}
               </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardEventsNew.displayName = 'DashboardEventsNew';
