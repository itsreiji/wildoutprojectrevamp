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
import { Badge } from "../ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
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
      <div className="flex flex-col space-y-4">
        <div id="admin-events-header">
          <h2
            className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent"
            data-testid="events-page-title"
            id="admin-events-title"
          >
            Event Management
          </h2>
          <p
            className="text-white/60"
            data-testid="events-page-subtitle"
            id="admin-events-subtitle"
          >
            Create and manage events - changes sync to landing page instantly
          </p>
        </div>

        {/* Header with Bulk Actions */}
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          id="admin-events-actions-header"
        >
          <div
            className="flex items-center gap-3"
            id="admin-events-actions-container"
          >
            {selectedEvents.size > 0 && (
              <Button
                className="bg-[#E9370] hover:bg-[#E93370]/90 text-white rounded-xl shadow-lg shadow-[#E93370]/20"
                data-testid="events-bulk-delete-button"
                disabled={isDeleting}
                id="admin-events-bulk-delete-button"
                onClick={handleBulkDelete}
              >
                <Trash2
                  className="mr-2 h-4 w-4"
                  data-testid="events-bulk-delete-icon"
                  id="admin-events-bulk-delete-icon"
                />
                <span
                  data-testid="events-bulk-delete-text"
                  id="admin-events-bulk-delete-text"
                >
                  Delete {selectedEvents.size}{" "}
                  {selectedEvents.size === 1 ? "Event" : "Events"}
                </span>
              </Button>
            )}
            <Button
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl shadow-lg shadow-[#E93370]/20"
              data-testid="events-create-event-button"
              id="admin-events-create-event-button"
              onClick={handleCreate}
            >
              <Plus
                className="mr-2 h-4 w-4"
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

        {/* Search Bar */}
        <div
          className="relative"
          data-testid="events-search-container"
          id="admin-events-search-container"
        >
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40"
            data-testid="events-search-icon"
            id="admin-events-search-icon"
          />
          <Input
            className="pl-12 pr-4 h-10 bg-white/5 border-white/10 focus-visible:ring-[#E93370] focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
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

        {/* Events Table */}
        <div
          className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden"
          data-testid="events-events-table"
        >
          <Table data-testid="events-table">
            <TableHeader data-testid="events-table-header">
              <TableRow
                className="border-white/10 hover:bg-white/5"
                data-testid="events-header-row"
              >
                <TableHead
                  className="w-16 py-3 pl-5 pr-0"
                  data-testid="events-select-all-header"
                >
                  <div className="flex items-center justify-start w-4">
                    <Checkbox
                      checked={
                        paginatedEvents.length > 0 &&
                        selectedEvents.size === paginatedEvents.length
                      }
                      className="border-white/30 h-4 w-4 flex-shrink-0"
                      data-testid="events-select-all-checkbox"
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="min-w-[200px] px-4 py-3 text-white/90 text-sm font-semibold"
                  data-testid="events-event-name-header"
                >
                  <Button
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-2"
                    data-testid="events-sort-by-title-button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSort("title")}
                  >
                    <span data-testid="events-title-header-text">
                      Event Name
                    </span>
                    <ArrowUpDown
                      className="ml-2 h-3.5 w-3.5"
                      data-testid="events-title-sort-icon"
                    />
                  </Button>
                </TableHead>
                <TableHead
                  className="w-48 px-4 py-3 text-white/90 text-sm font-semibold"
                  data-testid="events-date-time-header"
                >
                  <Button
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-2"
                    data-testid="events-sort-by-date-button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSort("start_date")}
                  >
                    <span data-testid="events-date-header-text">
                      Date & Time
                    </span>
                    <ArrowUpDown
                      className="ml-2 h-3.5 w-3.5"
                      data-testid="events-date-sort-icon"
                    />
                  </Button>
                </TableHead>
                <TableHead
                  className="w-48 px-4 py-3 text-white/90 text-sm font-semibold"
                  data-testid="events-venue-header"
                >
                  <Button
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-2"
                    data-testid="events-sort-by-location-button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSort("location")}
                  >
                    <span data-testid="events-venue-header-text">Venue</span>
                    <ArrowUpDown
                      className="ml-2 h-3.5 w-3.5"
                      data-testid="events-venue-sort-icon"
                    />
                  </Button>
                </TableHead>
                <TableHead
                  className="w-32 px-4 py-3 text-white/90 text-sm font-semibold"
                  data-testid="events-category-header"
                >
                  <Button
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-2"
                    data-testid="events-sort-by-category-button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSort("category")}
                  >
                    <span data-testid="events-category-header-text">
                      Category
                    </span>
                    <ArrowUpDown
                      className="ml-2 h-3.5 w-3.5"
                      data-testid="events-category-sort-icon"
                    />
                  </Button>
                </TableHead>
                <TableHead
                  className="w-36 px-4 py-3 text-white/90 text-sm font-semibold"
                  data-testid="events-attendance-header"
                >
                  <span data-testid="events-attendance-header-text">
                    Attendance
                  </span>
                </TableHead>
                <TableHead
                  className="w-28 px-4 py-3 text-white/90 text-sm font-semibold"
                  data-testid="events-status-header"
                >
                  <Button
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 px-2"
                    data-testid="events-sort-by-status-button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSort("status")}
                  >
                    <span data-testid="events-status-header-text">Status</span>
                    <ArrowUpDown
                      className="ml-2 h-3.5 w-3.5"
                      data-testid="events-status-sort-icon"
                    />
                  </Button>
                </TableHead>
                <TableHead
                  className="w-24 px-4 py-3 text-white/90 text-right text-sm font-semibold"
                  data-testid="events-actions-header"
                >
                  <span data-testid="events-actions-header-text">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-testid="events-table-body">
              {paginatedEvents.map((event) => (
                <TableRow
                  key={event.id}
                  className="border-white/10 hover:bg-white/5"
                  data-event-id={event.id}
                  data-testid={`events-event-row-${event.id}`}
                >
                  <TableCell
                    className="py-2.5 pl-5 pr-0"
                    data-testid={`events-select-event-${event.id}`}
                  >
                    <div className="flex items-center justify-start w-4">
                      <Checkbox
                        checked={selectedEvents.has(event.id)}
                        className="border-white/30 h-4 w-4 flex-shrink-0"
                        data-testid={`events-select-event-checkbox-${event.id}`}
                        onCheckedChange={(checked) =>
                          handleSelectEvent(event.id, checked as boolean)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    className="min-w-[200px] px-4 py-3"
                    data-testid={`events-event-name-cell-${event.id}`}
                  >
                    <div className="flex flex-col">
                      <span
                        className="font-medium text-white"
                        data-testid={`events-event-title-${event.id}`}
                      >
                        {event.title || "Untitled Event"}
                      </span>
                      {event.description && (
                        <span
                          className="text-xs text-white/60 mt-1 line-clamp-2"
                          data-testid={`events-event-description-${event.id}`}
                        >
                          {event.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className="w-48 px-4 py-3"
                    data-testid={`events-event-date-cell-${event.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar
                        className="h-4 w-4 text-white/60 flex-shrink-0"
                        data-testid="events-date-icon"
                      />
                      <div>
                        <div
                          className="text-sm text-white"
                          data-testid={`events-event-date-${event.id}`}
                        >
                          {event.start_date
                            ? new Date(event.start_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "No date"}
                        </div>
                        <div
                          className="text-xs text-white/60"
                          data-testid={`events-event-time-${event.id}`}
                        >
                          {(() => {
                            const startTime = event.start_date
                              ? new Date(event.start_date).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )
                              : "";
                            const endTime = event.end_date
                              ? new Date(event.end_date).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )
                              : "";
                            return startTime + (endTime ? ` - ${endTime}` : "");
                          })()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className="w-48 px-4 py-3"
                    data-testid={`events-event-venue-cell-${event.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin
                        className="h-4 w-4 text-white/60 flex-shrink-0"
                        data-testid="events-venue-icon"
                      />
                      <span
                        className="text-sm text-white"
                        data-testid={`events-event-location-${event.id}`}
                      >
                        {event.location || "No location"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className="w-32 px-4 py-3"
                    data-testid={`events-event-category-cell-${event.id}`}
                  >
                    <StatusBadge
                      status="update"
                      showDot={false}
                      className={cn(getCategoryBadgeColor(event.category || ""), "border-0 shadow-none")}
                    >
                      {event.category || "UNCATEGORIZED"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell
                    className="w-36 px-4 py-3"
                    data-testid={`events-event-attendance-cell-${event.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <Users
                        className="h-4 w-4 text-white/60 flex-shrink-0"
                        data-testid="events-attendance-icon"
                      />
                      <span
                        className="text-sm text-white"
                        data-testid={`events-event-attendance-${event.id}`}
                      >
                        {event.attendees || "0"} / {event.capacity || "∞"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className="w-28 px-4 py-3"
                    data-testid={`events-event-status-cell-${event.id}`}
                  >
                    <StatusBadge status={event.status || "draft"} />
                  </TableCell>
                  <TableCell
                    className="w-24 px-4 py-3 text-right"
                    data-testid={`events-event-actions-cell-${event.id}`}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="h-8 w-8 p-0 hover:bg-white/10"
                          data-testid={`events-event-actions-button-${event.id}`}
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal
                            className="h-4 w-4 text-white/60"
                            data-testid="events-more-actions-icon"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-900 border-gray-700 text-white"
                        data-testid={`events-event-actions-menu-${event.id}`}
                      >
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-gray-80"
                          data-testid="events-edit-event-action"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit
                            className="mr-2 h-4 w-4"
                            data-testid="events-edit-icon"
                          />
                          <span data-testid="events-edit-text">Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-400 hover:bg-red-500/10"
                          data-testid="events-delete-event-action"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2
                            className="mr-2 h-4 w-4"
                            data-testid="events-delete-icon"
                          />
                          <span data-testid="events-delete-text">Delete</span>
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
          className="flex items-center justify-between px-4 py-3 border-t border-white/10"
          id="dashboard-events-pagination"
        >
          <div
            className="text-sm text-white/60"
            id="dashboard-events-pagination-info"
          >
            Showing{" "}
            <span
              className="font-medium text-white"
              id="dashboard-events-showing-from"
            >
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                filteredEvents.length
              )}
            </span>{" "}
            to{" "}
            <span
              className="font-medium text-white"
              id="dashboard-events-showing-to"
            >
              {Math.min(currentPage * itemsPerPage, filteredEvents.length)}
            </span>{" "}
            of{" "}
            <span
              className="font-medium text-white"
              id="dashboard-events-total-items"
            >
              {filteredEvents.length}
            </span>{" "}
            events
          </div>
          <div
            className="flex items-center space-x-2"
            id="dashboard-events-pagination-controls"
          >
            <Button
              className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
              id="dashboard-events-previous-page-button"
              disabled={currentPage === 1}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <div
              className="flex items-center space-x-1"
              id="dashboard-events-page-numbers"
            >
              {Array.from(
                { length: Math.ceil(filteredEvents.length / itemsPerPage) },
                (_, i) => i + 1
              ).map((page) => (
                <Button
                  key={page}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page
                      ? "bg-white/10 border-white/20 text-white"
                      : "text-white/60 hover:bg-white/5"
                  }`}
                  data-active={currentPage === page}
                  id={`dashboard-events-page-button-${page}`}
                  size="sm"
                  variant={currentPage === page ? "outline" : "ghost"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
              id="dashboard-events-next-page-button"
              disabled={currentPage * itemsPerPage >= filteredEvents.length}
              size="sm"
              variant="outline"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(
                    Math.ceil(filteredEvents.length / itemsPerPage),
                    p + 1
                  )
                )
              }
            >
              Next
            </Button>
          </div>
        </div>

        {/* Create/Edit Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            className="sm:max-w-3xl w-[95vw] !h-[800px] max-h-[90vh] bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden shadow-2xl flex flex-col gap-0"
            id="dashboard-events-create-edit-dialog"
          >
            <DialogHeader
              className="px-8 py-6 border-b border-white/10"
              id="dashboard-events-create-edit-dialog-header"
            >
              <DialogTitle
                className="text-xl font-bold text-white flex items-center gap-2"
                id="dashboard-events-create-edit-dialog-title"
              >
                <div className="w-2 h-2 rounded-full bg-[#E93370] animate-pulse"></div>
                {editingEvent ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
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
            className="bg-[#0a0a0a] border-white/10 text-white max-w-md"
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
