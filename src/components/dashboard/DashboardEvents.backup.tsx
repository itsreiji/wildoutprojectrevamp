/**
 * DashboardEvents Component
 *
 * Manages the complete CRUD workflow for events in the dashboard.
 * Features:
 * - Display events in a paginated table with search/filter capabilities
 * - Create new events with featured image and gallery uploads
 * - Edit existing events with image replacement
 * - Delete events with confirmation and proper cleanup
 * - Case-insensitive search with diacritics support
 *
 * File Upload Pipeline:
 * - Client-side validation for image type and size (max 10MB)
 * - Featured image and gallery images are stored in Supabase Storage (event-media bucket)
 * - Uploads are validated before database mutations
 * - If mutation fails, uploaded files are automatically cleaned up
 * - Public URLs are stored in event metadata for display
 *
 * Error Handling:
 * - Delete dialog stays open if deletion fails, allowing user to retry
 * - Granular error messages for each upload/operation
 * - Partial gallery upload failures show warnings but continue operation
 * - Storage cleanup failures are logged but non-fatal
 */

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, MapPin, Users, CheckSquare, Square, ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useEvents } from '../../contexts/EventsContext';
import { toast } from 'sonner';
import { DashboardEventForm, EventFormValues } from './DashboardEventForm';
import { supabaseClient } from '@/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { LandingEvent } from '@/types/content';

/**
 * DashboardEvents component for managing event CRUD operations
 * Integrates with ContentContext mutation functions (addEvent, updateEvent, deleteEvent)
 */
const DashboardEvents = () => {
    const { events = [], addEvent, updateEvent, deleteEvent, loading, error } = useEvents();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<LandingEvent | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'title' | 'start_date' | 'location' | 'category' | 'status'>('start_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 10;

    // Normalize text for case-insensitive search with diacritics support
    const normalizeText = (text: string): string => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
    };

    const filteredEvents = (events || []).filter((event: LandingEvent) => {
        const query = normalizeText(searchQuery);
        const title = normalizeText(event?.title || '');
        const category = normalizeText(event?.category || '');
        return title.includes(query) || category.includes(query);
    });

    // Sort events
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];
        
        if (sortField === 'start_date') {
            aValue = a.start_date ? new Date(a.start_date).getTime() : 0;
            bValue = b.start_date ? new Date(b.start_date).getTime() : 0;
        }
        
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEvents = sortedEvents.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Bulk selection handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedEvents(new Set(paginatedEvents.map(event => event.id)));
        } else {
            setSelectedEvents(new Set());
        }
    };

    const handleSelectEvent = (eventId: string, checked: boolean) => {
        const newSelected = new Set(selectedEvents);
        if (checked) {
            newSelected.add(eventId);
        } else {
            newSelected.delete(eventId);
        }
        setSelectedEvents(newSelected);
    };

    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
            for (const eventId of selectedEvents) {
                await deleteEvent(eventId);
            }
            toast.success(`${selectedEvents.size} event(s) deleted successfully!`);
            setSelectedEvents(new Set());
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete some events.';
            toast.error(errorMessage);
            console.error('Bulk delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleCreate = () => {
        setEditingEvent(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (event: LandingEvent) => {
        setEditingEvent(event);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        try {
            await deleteEvent(id);
            toast.success('Event deleted successfully!');
            setIsDeleteDialogOpen(false);
            setDeletingEventId(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete event.';
            toast.error(errorMessage);
            console.error('Delete error:', error);
            // Keep the dialog open on error so user can retry or cancel
        } finally {
            setIsDeleting(false);
        }
    };

    // Validate file type and size
    const validateFile = (file: File, isImage: boolean = true): { valid: boolean; message?: string } => {
        const maxSizeMB = 10;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (file.size > maxSizeBytes) {
            return { valid: false, message: `File size exceeds ${maxSizeMB}MB limit` };
        }

        if (isImage && !file.type.startsWith('image/')) {
            return { valid: false, message: 'Only image files are allowed' };
        }

        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (isImage && !validImageTypes.includes(file.type)) {
            return { valid: false, message: 'Only JPEG, PNG, WebP, and GIF formats are supported' };
        }

        return { valid: true };
    };

    const handleSubmit = async (values: EventFormValues) => {
        setIsSubmitting(true);
        try {
            let featuredImageUrl: string | undefined = (editingEvent?.metadata as any)?.featured_image;
            const newUploadedFiles: string[] = [];

            // Handle featured image upload
            if (values.featured_image_file) {
                const file = values.featured_image_file as File;
                const validation = validateFile(file);

                if (!validation.valid) {
                    toast.error(`Featured image: ${validation.message}`);
                    setIsSubmitting(false);
                    return;
                }

                try {
                    toast.loading('Uploading featured image...');
                    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
                    const { data, error } = await supabaseClient.storage
                        .from('event-media')
                        .upload(uniqueName, file);

                    if (error) throw error;

                    const { data: { publicUrl } } = supabaseClient.storage.from('event-media').getPublicUrl(data.path);
                    featuredImageUrl = publicUrl;
                    newUploadedFiles.push(data.path);
                    toast.dismiss();
                } catch (error) {
                    toast.error(`Failed to upload featured image: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    setIsSubmitting(false);
                    return;
                }
            }

            // Handle gallery images upload
            let galleryImageUrls: string[] = (editingEvent?.metadata as any)?.gallery_images || [];
            if (values.gallery_images_files && values.gallery_images_files.length > 0) {
                const files = Array.from(values.gallery_images_files as FileList);
                const failedFiles: string[] = [];

                for (const file of files) {
                    const validation = validateFile(file);
                    if (!validation.valid) {
                        failedFiles.push(`${file.name}: ${validation.message}`);
                        continue;
                    }

                    try {
                        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
                        const { data, error } = await supabaseClient.storage
                            .from('event-media')
                            .upload(uniqueName, file);

                        if (error) throw error;

                        const { data: { publicUrl } } = supabaseClient.storage.from('event-media').getPublicUrl(data.path);
                        galleryImageUrls.push(publicUrl);
                        newUploadedFiles.push(data.path);
                    } catch (error) {
                        failedFiles.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
                    }
                }

                if (failedFiles.length > 0) {
                    toast.warning(`${failedFiles.length} gallery image(s) failed to upload:\n${failedFiles.join('\n')}`);
                }
            }

            const eventData = {
                title: values.title,
                description: values.description || null,
                start_date: new Date(values.start_date).toISOString(),
                end_date: new Date(values.end_date).toISOString(),
                location: values.location || null,
                category: values.category,
                status: values.status,
                capacity: values.capacity ?? null,
                price_range: values.price_range || null,
                ticket_url: values.ticket_url || null,
                metadata: {
                    ...(editingEvent?.metadata && typeof editingEvent.metadata === 'object' && !Array.isArray(editingEvent.metadata) ? editingEvent.metadata : {}),
                    featured_image: featuredImageUrl,
                    gallery_images: galleryImageUrls,
                },
            };

            try {
                if (editingEvent) {
                    await updateEvent(editingEvent.id, eventData);
                    toast.success('Event updated successfully!');
                } else {
                    await addEvent(eventData as any);
                    toast.success('Event created successfully!');
                }
                setIsDialogOpen(false);
                setEditingEvent(null);
            } catch (error) {
                // If mutation fails, clean up uploaded files
                if (newUploadedFiles.length > 0) {
                    try {
                        await supabaseClient.storage.from('event-media').remove(newUploadedFiles);
                    } catch (cleanupError) {
                        console.error('Failed to clean up uploaded files:', cleanupError);
                    }
                }
                const errorMessage = error instanceof Error ? error.message : 'Failed to save event';
                toast.error(errorMessage);
                console.error('Event save error:', error);
            }
        } catch (error) {
            toast.error('An unexpected error occurred while processing your event.');
            console.error('Unexpected error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming':
                return 'bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full px-3 py-1 text-xs font-medium';
            case 'ongoing':
                return 'bg-green-500/20 text-green-400 border border-green-500/40 rounded-full px-3 py-1 text-xs font-medium';
            case 'completed':
                return 'bg-gray-500/20 text-gray-400 border border-gray-500/40 rounded-full px-3 py-1 text-xs font-medium';
            default:
                return 'bg-white/10 text-white/60 rounded-full px-3 py-1 text-xs font-medium';
        }
    };

    const getCategoryColor = (category: string) => {
        // Generate a consistent color based on category name
        const colors = [
            'bg-purple-500/20 text-purple-400 border-purple-500/40',
            'bg-pink-500/20 text-pink-400 border-pink-500/40',
            'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
            'bg-teal-500/20 text-teal-400 border-teal-500/40',
            'bg-amber-500/20 text-amber-400 border-amber-500/40',
            'bg-rose-500/20 text-rose-400 border-rose-500/40',
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        ];
        
        // Simple hash function to get consistent colors for the same category
        const hash = category.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        const index = Math.abs(hash) % colors.length;
        return `${colors[index]} border rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap`;
    };

    return (
        <div className="space-y-6">
            {/* Header with Bulk Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
                        Event Management
                    </h2>
                    <p className="text-white/60">Create and manage events - changes sync to landing page instantly</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedEvents.size > 0 && (
                        <Button
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete {selectedEvents.size} {selectedEvents.size === 1 ? 'Event' : 'Events'}
                        </Button>
                    )}
                    <Button
                        onClick={handleCreate}
                        className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl shadow-lg shadow-[#E93370]/20"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                    type="text"
                    placeholder="Search events by name or category..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12"
                />
            </div>

            {/* Events Table */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="w-16 px-4 py-3 text-white/90 text-sm font-semibold">
                                <div className="flex items-center">
                                    <Checkbox
                                        checked={paginatedEvents.length > 0 && selectedEvents.size === paginatedEvents.length}
                                        onCheckedChange={handleSelectAll}
                                        className="border-white/30 h-4 w-4"
                                    />
                                </div>
                            </TableHead>
                            <TableHead className="min-w-[200px] px-4 py-3 text-white/90 text-sm font-semibold">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-2"
                                    onClick={() => handleSort('title')}
                                >
                                    Event Name
                                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="w-48 px-4 py-3 text-white/90 text-sm font-semibold">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-2"
                                onClick={() => handleSort('start_date')}
                            >
                                Date & Time
                                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                        </TableHead>
                        <TableHead className="w-48 px-4 py-3 text-white/90 text-sm font-semibold">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-2"
                                onClick={() => handleSort('location')}
                            >
                                Venue
                                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                        </TableHead>
                        <TableHead className="w-32 px-4 py-3 text-white/90 text-sm font-semibold">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-2"
                                onClick={() => handleSort('category')}
                            >
                                Category
                                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                        </TableHead>
                        <TableHead className="w-36 px-4 py-3 text-white/90 text-sm font-semibold">Attendance</TableHead>
                        <TableHead className="w-28 px-4 py-3 text-white/90 text-sm font-semibold">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-2"
                                onClick={() => handleSort('status')}
                            >
                                Status
                                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                        </TableHead>
                        <TableHead className="w-24 px-4 py-3 text-white/90 text-right text-sm font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedEvents.map((event) => (
                        <TableRow key={event.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="px-4 py-3">
                                <Checkbox
                                    checked={selectedEvents.has(event.id)}
                                    onCheckedChange={(checked) => handleSelectEvent(event.id, checked as boolean)}
                                    className="border-white/30"
                                />
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                                        {event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata) && 'featured_image' in event.metadata && event.metadata.featured_image ? (
                                            <img src={String(event.metadata.featured_image)} alt={event.title || 'Event'} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-16 flex items-center justify-center">
                                                <Badge 
                                                    className={`${getCategoryColor(event.category || '')} hover:opacity-90 transition-opacity w-full flex justify-center`}
                                                    title={event.category || ''}
                                                >
                                                    {event.category}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-white truncate">{event.title}</div>
                                        <div className="text-xs text-white/60">{event.price_range || 'TBD'}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-white/70">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-3.5 w-3.5 text-[#E93370] shrink-0" />
                                    <div className="text-sm">
                                        {event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        }) : 'TBD'}
                                        {event.start_date && (
                                            <span className="text-white/50"> • {new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-white/70">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-3.5 w-3.5 text-[#E93370] shrink-0" />
                                    <div className="text-sm truncate">{event.location || 'TBD'}</div>
                                </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                <div className="w-24">
                                    <Badge 
                                        className={`${getCategoryColor(event.category || '')} hover:opacity-90 transition-opacity w-full flex justify-center`}
                                        title={event.category || ''}
                                    >
                                        {event.category}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-white/70">
                                <div className="flex flex-col w-full">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-3.5 w-3.5 text-[#E93370] shrink-0" />
                                        <span className="text-sm">
                                            {event.attendees || 0}/{event.capacity || '∞'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                                        <div
                                            className="bg-gradient-to-r from-[#E93370] to-[#FF8A9F] h-full rounded-full"
                                            style={{
                                                width: event.capacity && event.capacity > 0 
                                                    ? `${Math.min(100, Math.round(((event.attendees || 0) / event.capacity) * 100))}%` 
                                                    : '0%'
                                            }}
                                        />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                <div className="w-24">
                                    <Badge 
                                        className={`${getStatusColor(event.status || '')} hover:opacity-90 transition-opacity w-full flex justify-center`}
                                        title={event.status || ''}
                                    >
                                        {event.status}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                                <div className="flex justify-end space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                                        onClick={() => handleEdit(event)}
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                                        onClick={() => {
                                            setDeletingEventId(event.id);
                                            setIsDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {paginatedEvents.length === 0 && (
                <div className="text-center py-16 text-white/60">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-white/20" />
                    <p className="text-lg">No events found</p>
                    <p className="text-sm mt-2">Create your first event to get started!</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-white/60">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedEvents.length)} of {sortedEvents.length} events
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                        >
                            Previous
                        </Button>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={currentPage === page 
                                        ? "bg-[#E93370] text-white border-[#E93370]" 
                                        : "border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                    }
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event: {deletingEventId ? filteredEvents.find(e => e.id === deletingEventId)?.title || 'Unknown Event' : ''}</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70">
                            This action cannot be undone. The event and all associated media will be permanently deleted from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} className="text-white/70 border-white/10 hover:bg-white/5">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingEventId && handleDelete(deletingEventId)}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
                            {editingEvent ? 'Edit Event' : 'Create New Event'}
                        </DialogTitle>
                    </DialogHeader>
                    <DashboardEventForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        onCancel={() => setIsDialogOpen(false)}
                        defaultValues={editingEvent || undefined}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Set display name
DashboardEvents.displayName = 'DashboardEvents';

export default DashboardEvents;
