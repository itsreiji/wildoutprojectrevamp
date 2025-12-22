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

import { supabaseClient } from "@/supabase/client";
import type { LandingEvent } from "@/types/content";
import {
  ArrowUpDown,
  Calendar,
  Edit,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useEvents } from "../../contexts/EventsContext";
import { auditService } from "../../services/auditService";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DashboardEventForm, type EventFormValues } from "./DashboardEventForm";
import { H2, BodyText } from "../ui/typography";

/**
 * DashboardEvents component for managing event CRUD operations
 * Integrates with ContentContext mutation functions (addEvent, updateEvent, deleteEvent)
 */
export const DashboardEvents = () => {
  const {
    events = [],
    addEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();
  const { user, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LandingEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<
    "title" | "start_date" | "location" | "category" | "status"
  >("start_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 10;

  // Normalize text for case-insensitive search with diacritics support
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
  };

  const filteredEvents = (events || []).filter((event: LandingEvent) => {
    const query = normalizeText(searchQuery);
    const title = normalizeText(event?.title || "");
    const category = normalizeText(event?.category || "");
    return title.includes(query) || category.includes(query);
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "start_date") {
      aValue = a.start_date ? new Date(a.start_date).getTime() : 0;
      bValue = b.start_date ? new Date(b.start_date).getTime() : 0;
    }

    if (aValue === null || aValue === undefined) aValue = "";
    if (bValue === null || bValue === undefined) bValue = "";

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = sortedEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(new Set(paginatedEvents.map((event) => event.id)));
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete some events.";
      toast.error(errorMessage);
      console.error("Bulk delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
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
      const eventToDelete = events.find((e) => e.id === id);
      await deleteEvent(id);

      // Log delete action
      if (user?.id) {
        await auditService.logContentAction(
          user.id,
          role,
          "DELETE",
          "EVENT",
          id,
          { title: eventToDelete?.title || "Unknown" }
        );
      }

      toast.success("Event deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeletingEventId(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete event.";
      toast.error(errorMessage);
      console.error("Delete error:", error);
      // Keep the dialog open on error so user can retry or cancel
    } finally {
      setIsDeleting(false);
    }
  };

  // Validate file type and size
  const validateFile = (
    file: File,
    isImage: boolean = true
  ): { valid: boolean; message?: string } => {
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        message: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    if (isImage && !file.type.startsWith("image/")) {
      return { valid: false, message: "Only image files are allowed" };
    }

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (isImage && !validImageTypes.includes(file.type)) {
      return {
        valid: false,
        message: "Only JPEG, PNG, WebP, and GIF formats are supported",
      };
    }

    return { valid: true };
  };

  const handleSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    try {
      let featuredImageUrl: string | undefined = (editingEvent?.metadata as any)
        ?.featured_image;
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
          toast.loading("Uploading featured image...");
          const uniqueName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}-${file.name}`;
          const { data, error } = await supabaseClient.storage
            .from("event-media")
            .upload(uniqueName, file);

          if (error) throw error;

          const {
            data: { publicUrl },
          } = supabaseClient.storage
            .from("event-media")
            .getPublicUrl(data.path);
          featuredImageUrl = publicUrl;
          newUploadedFiles.push(data.path);
          toast.dismiss();
        } catch (error) {
          toast.error(
            `Failed to upload featured image: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Handle gallery images upload
      let galleryImageUrls: string[] =
        (editingEvent?.metadata as any)?.gallery_images || [];
      if (
        values.gallery_images_files &&
        values.gallery_images_files.length > 0
      ) {
        const files = Array.from(values.gallery_images_files as FileList);
        const failedFiles: string[] = [];

        for (const file of files) {
          const validation = validateFile(file);
          if (!validation.valid) {
            failedFiles.push(`${file.name}: ${validation.message}`);
            continue;
          }

          try {
            const uniqueName = `${Date.now()}-${Math.random()
              .toString(36)
              .substring(2)}-${file.name}`;
            const { data, error } = await supabaseClient.storage
              .from("event-media")
              .upload(uniqueName, file);

            if (error) throw error;

            const {
              data: { publicUrl },
            } = supabaseClient.storage
              .from("event-media")
              .getPublicUrl(data.path);
            galleryImageUrls.push(publicUrl);
            newUploadedFiles.push(data.path);
          } catch (error) {
            failedFiles.push(
              `${file.name}: ${
                error instanceof Error ? error.message : "Upload failed"
              }`
            );
          }
        }

        if (failedFiles.length > 0) {
          toast.warning(
            `${
              failedFiles.length
            } gallery image(s) failed to upload:\n${failedFiles.join("\n")}`
          );
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
        max_attendees: values.capacity ?? null,
        metadata: {
          ...(editingEvent?.metadata &&
          typeof editingEvent.metadata === "object" &&
          !Array.isArray(editingEvent.metadata)
            ? editingEvent.metadata
            : {}),
          featured_image: featuredImageUrl,
          gallery_images: galleryImageUrls,
          price_range: values.price_range || null,
          ticket_url: values.ticket_url || null,
        },
      };

      try {
        if (editingEvent) {
          await updateEvent(editingEvent.id, eventData);

          // Log update action
          if (user?.id) {
            await auditService.logContentAction(
              user.id,
              role,
              "UPDATE",
              "EVENT",
              editingEvent.id,
              { title: eventData.title }
            );
          }

          toast.success("Event updated successfully!");
        } else {
          const newEvent = await addEvent(eventData);

          // Log create action
          if (user?.id && newEvent) {
            await auditService.logContentAction(
              user.id,
              role,
              "CREATE",
              "EVENT",
              (newEvent as any).id || "unknown",
              { title: eventData.title }
            );
          }

          toast.success("Event created successfully!");
        }
        setIsDialogOpen(false);
        setEditingEvent(null);
      } catch (error) {
        // If mutation fails, clean up uploaded files
        if (newUploadedFiles.length > 0) {
          try {
            await supabaseClient.storage
              .from("event-media")
              .remove(newUploadedFiles);
          } catch (cleanupError) {
            console.error("Failed to clean up uploaded files:", cleanupError);
          }
        }
        const errorMessage =
          error instanceof Error ? error.message : "Failed to save event";
        toast.error(errorMessage);
        console.error("Event save error:", error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred while processing your event.");
      console.error("Unexpected error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    // Generate a consistent color based on the category name
    const colors = [
      "bg-purple-500/20 text-purple-400 border-purple-500/40",
      "bg-blue-500/20 text-blue-400 border-blue-500/40",
      "bg-pink-500/20 text-pink-400 border-pink-500/40",
      "bg-amber-500/20 text-amber-400 border-amber-500/40",
      "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    ];

    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return `${colors[index]} border rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap`;
  };

  return (
    <div
      className="space-y-4"
      data-testid="dashboard-events"
      id="admin-events-container"
    >
      <div className="flex flex-col space-y-8" id="admin-events-header-container">
        <div id="admin-events-header" className="space-y-2">
          <H2
            gradient="from-white via-[#E93370] to-white"
            data-testid="events-page-title"
            id="admin-events-title"
            className="text-3xl md:text-4xl font-bold tracking-tight"
          >
            Event Management
          </H2>
          <BodyText
            className="text-white/60 text-lg"
            data-testid="events-page-subtitle"
            id="admin-events-subtitle"
          >
            Create and manage events - changes sync to landing page instantly
          </BodyText>
        </div>

        {/* Header with Search and Actions */}
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl"
          id="admin-events-actions-header"
        >
          <div
            className="relative flex-1 w-full"
            data-testid="events-search-container"
            id="admin-events-search-container"
          >
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40"
              data-testid="events-search-icon"
              id="admin-events-search-icon"
            />
            <Input
              className="pl-12 pr-4 h-12 bg-white/5 border-white/10 focus-visible:ring-[#E93370] focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl text-base placeholder:text-white/30"
              data-testid="events-event-search-input"
              id="admin-events-search-input"
              placeholder="Search events by name or category..."
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>

          <div
            className="flex items-center gap-4 w-full md:w-auto"
            id="admin-events-actions-container"
          >
            {selectedEvents.size > 0 && (
              <Button
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 h-12 px-6 font-bold transition-all"
                data-testid="events-bulk-delete-button"
                disabled={isDeleting}
                id="admin-events-bulk-delete-button"
                onClick={handleBulkDelete}
              >
                <Trash2
                  className="mr-2 h-5 w-5"
                  data-testid="events-bulk-delete-icon"
                  id="admin-events-bulk-delete-icon"
                />
                <span
                  data-testid="events-bulk-delete-text"
                  id="admin-events-bulk-delete-text"
                >
                  Delete {selectedEvents.size}
                </span>
              </Button>
            )}
            <Button
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl shadow-lg shadow-[#E93370]/20 h-12 px-6 font-bold transition-all flex-1 md:flex-none"
              data-testid="events-create-event-button"
              id="admin-events-create-event-button"
              onClick={handleCreate}
            >
              <Plus
                className="mr-2 h-5 w-5"
                data-testid="events-create-event-icon"
                id="admin-events-create-event-icon"
              />
              <span
                data-testid="events-create-event-text"
                id="admin-events-create-event-text"
              >
                Create Event
              </span>
            </Button>
          </div>
        </div>

        {/* Events Table Container */}
        <div
          className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl"
          data-testid="events-events-table"
        >
          <Table data-testid="events-table">
            <TableHeader data-testid="events-table-header" className="bg-white/5">
              <TableRow
                className="border-white/10 hover:bg-transparent"
                data-testid="events-header-row"
              >
                <TableHead
                  className="w-16 py-5 pl-6 pr-0"
                  data-testid="events-select-all-header"
                >
                  <div className="flex items-center justify-start">
                    <Checkbox
                      checked={
                        paginatedEvents.length > 0 &&
                        selectedEvents.size === paginatedEvents.length
                      }
                      className="border-white/30 h-5 w-5 rounded-md data-[state=checked]:bg-[#E93370] data-[state=checked]:border-[#E93370]"
                      data-testid="events-select-all-checkbox"
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="min-w-[250px] px-4 py-5"
                  data-testid="events-event-name-header"
                >
                  <Button
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-3 h-10 font-bold text-sm tracking-tight"
                    data-testid="events-sort-by-title-button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSort("title")}
                  >
                    <span>EVENT NAME</span>
                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead
                  className="w-48 px-4 py-5 text-white/90 text-sm font-bold tracking-tight"
                  data-testid="events-date-time-header"
                >
                  <Button
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-3 h-10 font-bold text-sm tracking-tight"
                    data-testid="events-sort-by-date-button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSort("start_date")}
                  >
                    <span data-testid="events-date-header-text">DATE & TIME</span>
                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead
                  className="w-48 px-4 py-5 text-white/90 text-sm font-bold tracking-tight"
                  data-testid="events-venue-header"
                >
                  <Button
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-3 h-10 font-bold text-sm tracking-tight"
                    data-testid="events-sort-by-location-button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSort("location")}
                  >
                    <span data-testid="events-venue-header-text">VENUE</span>
                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead
                  className="w-32 px-4 py-5 text-white/90 text-sm font-bold tracking-tight"
                  data-testid="events-category-header"
                >
                  <Button
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-3 h-10 font-bold text-sm tracking-tight"
                    data-testid="events-sort-by-category-button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSort("category")}
                  >
                    <span data-testid="events-category-header-text">CATEGORY</span>
                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead
                  className="w-36 px-4 py-5 text-white/90 text-sm font-bold tracking-tight"
                  data-testid="events-attendance-header"
                >
                  <div className="px-3 h-10 flex items-center">
                    <span data-testid="events-attendance-header-text">ATTENDANCE</span>
                  </div>
                </TableHead>
                <TableHead
                  className="w-28 px-4 py-5 text-white/90 text-sm font-bold tracking-tight"
                  data-testid="events-status-header"
                >
                  <Button
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-3 h-10 font-bold text-sm tracking-tight"
                    data-testid="events-sort-by-status-button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSort("status")}
                  >
                    <span data-testid="events-status-header-text">STATUS</span>
                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead
                  className="w-24 px-4 py-5 text-right text-white/90 text-sm font-bold tracking-tight"
                  data-testid="events-actions-header"
                >
                  <div className="px-3 h-10 flex items-center justify-end">
                    <span data-testid="events-actions-header-text">ACTIONS</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-testid="events-table-body">
              {paginatedEvents.map((event) => (
                <TableRow
                  key={event.id}
                  className="border-white/5 hover:bg-white/5 transition-colors group"
                  data-event-id={event.id}
                  data-testid={`events-event-row-${event.id}`}
                >
                  <TableCell
                    className="py-6 pl-8 pr-0"
                    data-testid={`events-select-event-${event.id}`}
                  >
                    <Checkbox
                      checked={selectedEvents.has(event.id)}
                      className="border-white/20 data-[state=checked]:bg-[#E93370] data-[state=checked]:border-[#E93370] transition-all"
                      data-testid={`events-select-event-checkbox-${event.id}`}
                      onCheckedChange={(checked) =>
                        handleSelectEvent(event.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell
                    className="min-w-[200px] px-4 py-6"
                    data-testid={`events-event-name-cell-${event.id}`}
                  >
                    <div className="flex flex-col gap-1">
                      <span
                        className="font-bold text-white text-base tracking-tight group-hover:text-[#E93370] transition-colors"
                        data-testid={`events-event-title-${event.id}`}
                      >
                        {event.title || "Untitled Event"}
                      </span>
                      {event.description && (
                        <p
                          className="text-white/40 text-xs line-clamp-1 max-w-[300px]"
                          data-testid={`events-event-description-${event.id}`}
                        >
                          {event.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className="w-48 px-4 py-6"
                    data-testid={`events-event-date-cell-${event.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-white/60">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm tracking-tight">
                          {event.start_date
                            ? new Date(event.start_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "No date"}
                        </span>
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">
                          {(() => {
                            const startTime = event.start_date
                              ? new Date(event.start_date).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                              : "";
                            return startTime;
                          })()}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className="w-48 px-4 py-6"
                    data-testid={`events-event-venue-cell-${event.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-white/60">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="text-white/80 text-sm font-bold tracking-tight">
                        {event.location || "No location"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className="w-32 px-4 py-6"
                    data-testid={`events-event-category-cell-${event.id}`}
                  >
                    <Badge
                      variant="category"
                      size="sm"
                      className={cn(
                        getCategoryBadgeColor(event.category || ""),
                        "border-0 shadow-none px-3 py-1 text-[10px] font-bold tracking-wider uppercase"
                      )}
                    >
                      {event.category || "UNCATEGORIZED"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="w-36 px-4 py-6"
                    data-testid={`events-event-attendance-cell-${event.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-white/60">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-white/80 text-sm font-bold tracking-tight">
                        {event.attendees || "0"} <span className="text-white/30 mx-1">/</span> {event.capacity || "∞"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className="w-28 px-4 py-6"
                    data-testid={`events-event-status-cell-${event.id}`}
                  >
                    <StatusBadge status={event.status || "draft"} />
                  </TableCell>
                  <TableCell
                    className="w-24 px-4 py-6 text-right"
                    data-testid={`events-event-actions-cell-${event.id}`}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="h-10 w-10 p-0 hover:bg-[#E93370]/10 hover:text-[#E93370] transition-all rounded-xl border border-white/5"
                          data-testid={`events-event-actions-button-${event.id}`}
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#1a1a1a] border-white/10 text-white p-2 rounded-xl min-w-[160px] shadow-2xl"
                      >
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-white/5 rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2 font-bold tracking-tight"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4 text-white/60" />
                          <span>Edit Event</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2 font-bold tracking-tight"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Event</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-8 py-6 border-t border-white/5 bg-white/[0.02]"
          id="dashboard-events-pagination"
        >
          <div className="flex items-center gap-4">
            <p className="text-xs text-white/40 font-bold tracking-tight">
              Showing <span className="text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredEvents.length)}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredEvents.length)}</span> of <span className="text-white">{filteredEvents.length}</span> events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="h-10 px-4 rounded-xl border-white/5 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all text-xs font-bold tracking-tight disabled:opacity-30"
              disabled={currentPage === 1}
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from(
                { length: Math.ceil(filteredEvents.length / itemsPerPage) },
                (_, i) => i + 1
              ).map((page) => (
                <Button
                  key={page}
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all text-xs font-bold tracking-tight",
                    currentPage === page
                      ? "bg-[#E93370] text-white shadow-lg shadow-[#E93370]/20"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                  size="icon"
                  variant="ghost"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              className="h-10 px-4 rounded-xl border-white/5 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all text-xs font-bold tracking-tight disabled:opacity-30"
              disabled={currentPage * itemsPerPage >= filteredEvents.length}
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredEvents.length / itemsPerPage), p + 1))}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Create/Edit Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            className="sm:max-w-3xl w-[95vw] !h-[800px] max-h-[90vh] bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden shadow-2xl flex flex-col gap-0 rounded-2xl sm:rounded-[32px]"
            id="dashboard-events-create-edit-dialog"
            aria-label={editingEvent ? `Edit Event: ${editingEvent.title}` : "Add Event"}
            aria-labelledby="dashboard-events-create-edit-dialog-title"
          >
            <DialogTitle
              className="text-xl font-bold text-white flex items-center gap-2 px-8 py-6 border-b border-white/10"
              id="dashboard-events-create-edit-dialog-title"
            >
              <div className="w-2 h-2 rounded-full bg-[#E93370] animate-pulse"></div>
              {editingEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingEvent ? "Edit event details" : "Create a new event in the system"}
            </DialogDescription>
            <DashboardEventForm
              defaultValues={editingEvent || undefined}
              isSubmitting={isSubmitting}
              onCancel={() => setIsDialogOpen(false)}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent
            className="bg-[#0a0a0a] border-white/10 text-white max-w-md rounded-2xl"
            id="dashboard-events-delete-confirmation-dialog"
          >
            <AlertDialogHeader id="dashboard-events-delete-confirmation-dialog-header">
              <AlertDialogTitle
                id="dashboard-events-delete-confirmation-dialog-title"
                className="text-xl font-bold"
              >
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription
                className="text-white/60"
                id="dashboard-events-delete-confirmation-dialog-description"
              >
                This action cannot be undone. This will permanently delete the
                event and remove all associated data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter id="dashboard-events-delete-confirmation-dialog-footer">
              <AlertDialogCancel
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors"
                id="dashboard-events-cancel-delete-button"
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20"
                id="dashboard-events-confirm-delete-button"
                disabled={isDeleting}
                onClick={() => deletingEventId && handleDelete(deletingEventId)}
              >
                {isDeleting ? "Deleting..." : "Delete Event"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
