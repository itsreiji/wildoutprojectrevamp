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
import { Plus, Search, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';
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
import type { LandingEvent } from '@/types/content';

/**
 * DashboardEvents component for managing event CRUD operations
 * Integrates with ContentContext mutation functions (addEvent, updateEvent, deleteEvent)
 */
export const DashboardEvents = React.memo(() => {
    const { events = [], addEvent, updateEvent, deleteEvent, loading, error } = useEvents();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<LandingEvent | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
                    ...(editingEvent?.metadata || {}),
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12"
                />
            </div>

            {/* Events Table */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="px-6 py-4 text-white/90 text-sm font-semibold">Event Name</TableHead>
                            <TableHead className="px-6 py-4 text-white/90 text-sm font-semibold">Date & Time</TableHead>
                            <TableHead className="px-6 py-4 text-white/90 text-sm font-semibold">Venue</TableHead>
                            <TableHead className="px-6 py-4 text-white/90 text-sm font-semibold">Category</TableHead>
                            <TableHead className="px-6 py-4 text-white/90 text-sm font-semibold">Attendance</TableHead>
                            <TableHead className="px-6 py-4 text-white/90 text-sm font-semibold">Status</TableHead>
                            <TableHead className="px-6 py-4 text-white/90 text-right text-sm font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEvents.map((event: LandingEvent) => (
                            <TableRow
                                key={event.id}
                                className="border-white/10 hover:bg-white/5 transition-colors"
                            >
                                <TableCell className="px-6 py-5">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                                            {(event.metadata as any)?.featured_image ? (
                                                <img src={(event.metadata as any)?.featured_image} alt={event.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Calendar className="h-6 w-6 text-white/40" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-white">{event.title}</div>
                                            <div className="text-xs text-white/50">{event.price_range || 'TBD'}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-white/70">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-[#E93370]" />
                                        <div>
                                            <div className="text-sm">
                                                {new Date(event.start_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                            <div className="text-xs text-white/50">
                                                {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                -
                                                {new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-white/70">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-[#E93370]" />
                                        <div className="text-sm">{event.location}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <Badge className="bg-[#E93370]/20 text-[#E93370] border-[#E93370]/30">
                                        {event.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-white/70">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-[#E93370]" />
                                        <span className="text-sm">
                                            {event.attendees || 0}/{event.capacity || '∞'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                                        <div
                                            className="bg-[#E93370] h-1.5 rounded-full"
                                            style={{ width: `${((event.attendees || 0) / (event.capacity || 1)) * 100}%` }}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <Badge className={getStatusColor(event.status)}>
                                        {event.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end space-x-3">
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
                                            onClick={() => {
                                                setDeletingEventId(event.id);
                                                setIsDeleteDialogOpen(true);
                                            }}
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
});

DashboardEvents.displayName = 'DashboardEvents';
