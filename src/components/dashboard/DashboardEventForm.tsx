/**
 * DashboardEventForm Component
 *
 * Form abstraction supporting both create and edit flows for events.
 *
 * Features:
 *
 * - React Hook Form integration for efficient form state management
 * - Zod schema validation with enhanced error messages
 * - Automatic form reset when switching between create/edit modes
 * - Optional field mapping to null for proper database storage
 * - shadcn/ui components for consistent styling and accessibility
 * - Date field helpers explaining timezone behavior
 * - File upload UI for featured image and gallery images
 *
 * Validation Rules:
 * - Title and Category are required
 * - Start Date must be a valid date
 * - End Date must be after or equal to Start Date
 * - Ticket URL must be valid if provided
 * - Capacity must be >= 0 if provided
 * - Optional fields (description, location, price_range, ticket_url) map to null
 *
 * Form Modes:
 * - Create: All fields empty, defaultValues prop is undefined
 * - Edit: Form pre-populated with event data, resets when defaultValues changes
 */

import type { LandingEvent } from "@/types/content";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Upload } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const eventFormSchema = z
  .object({
    title: z.string().min(1, "Event title is required"),
    description: z.string().optional().nullable(),
    start_date: z
      .string()
      .min(1, "Start date is required")
      .refine(
        (date) => !isNaN(Date.parse(date)),
        "Start date must be a valid date"
      ),
    end_date: z
      .string()
      .min(1, "End date is required")
      .refine(
        (date) => !isNaN(Date.parse(date)),
        "End date must be a valid date"
      ),
    location: z.string().optional().nullable(),
    category: z.enum([
      "music",
      "sports",
      "arts",
      "food",
      "community",
      "other",
      "festival",
      "concert",
      "exhibition",
      "club",
      "conference",
    ]),
    status: z.enum(["draft", "published", "cancelled", "archived"]),
    capacity: z
      .union([z.number().min(0, "Capacity must be 0 or greater"), z.null()])
      .optional(),
    price_range: z.string().optional().nullable(),
    ticket_url: z
      .string()
      .url("Ticket URL must be a valid URL")
      .optional()
      .nullable(),
    featured_image_file: z.any().optional(),
    gallery_images_files: z.any().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return start <= end;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["end_date"],
    }
  );

export type EventFormValues = z.infer<typeof eventFormSchema>;

interface DashboardEventFormProps {
  onSubmit: (values: EventFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<LandingEvent>;
  onCancel?: () => void;
}

export function DashboardEventForm({
  onSubmit,
  isSubmitting,
  defaultValues,
  onCancel,
}: DashboardEventFormProps) {
  const [featuredImagePreview, setFeaturedImagePreview] = useState<
    string | null
  >(null);
  const [galleryImagesPreviews, setGalleryImagesPreviews] = useState<string[]>(
    []
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const formatDateForInput = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Ensure we have a valid date
      if (isNaN(date.getTime())) return "";
      // Format as YYYY-MM-DD for date input
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const getDefaultValues = useCallback((): EventFormValues => {
    if (!defaultValues) {
      return {
        title: "",
        description: null,
        start_date: "",
        end_date: "",
        location: null,
        category: undefined as any, // Cast to any to allow undefined initially for required field
        status: "draft",
        capacity: null,
        price_range: null,
        ticket_url: null,
        featured_image_file: undefined,
        gallery_images_files: undefined,
      };
    }

    return {
      title: defaultValues.title || "",
      description: defaultValues.description || null,
      start_date: formatDateForInput(defaultValues.start_date),
      end_date: formatDateForInput(defaultValues.end_date),
      location: defaultValues.location || null,
      category: (defaultValues.category || undefined) as any,
      status:
        (defaultValues.status as
          | "draft"
          | "published"
          | "cancelled"
          | "archived") || "draft",
      capacity: defaultValues.capacity ?? null,
      price_range: defaultValues.price_range || null,
      ticket_url: defaultValues.ticket_url || null,
      featured_image_file: undefined,
      gallery_images_files: undefined,
    };
  }, [defaultValues]);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: getDefaultValues(),
    mode: "onBlur", // Validate on blur for better UX
  });

  const isEditMode = !!defaultValues?.id;

  // Reset form when editing target changes to ensure fresh values
  useEffect(() => {
    // Only reset if we haven't initialized yet, OR if the ID actually changed
    // This prevents race conditions where defaultValues might be null initially
    if (!isInitialized || (defaultValues?.id && form.getValues("title") === "")) {
      form.reset(getDefaultValues());
      setIsInitialized(true);
    }
  }, [defaultValues?.id, form, getDefaultValues, isInitialized]);

  // Transform form values to map empty strings to null for optional fields
  const handleFormSubmit = (values: EventFormValues) => {
    const processedValues: EventFormValues = {
      ...values,
      description: values.description || null,
      location: values.location || null,
      price_range: values.price_range || null,
      ticket_url: values.ticket_url || null,
      capacity:
        values.capacity === null || values.capacity === undefined
          ? null
          : values.capacity,
    };
    onSubmit(processedValues);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden rounded-2xl sm:rounded-[32px]"
        id="dashboard-event-form"
        onSubmit={form.handleSubmit(handleFormSubmit)}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-10 px-8 py-10 custom-scrollbar">
          {/* Basic Info */}
          <div className="space-y-8" id="dashboard-event-form-basic-info">
            <h3
              className="text-sm font-bold text-[#E93370] uppercase tracking-[0.2em] flex items-center gap-3 mb-6"
              id="dashboard-event-form-basic-info-title"
            >
              <span className="w-2 h-2 rounded-full bg-[#E93370] shadow-[0_0_10px_#E93370]"></span>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem
                    className="md:col-span-2 space-y-2.5"
                    id="dashboard-event-form-title-field"
                  >
                    <FormLabel
                      className="text-white/90 text-sm font-bold tracking-tight"
                      htmlFor="dashboard-event-form-title-input"
                    >
                      Event Name <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="dashboard-event-form-title-input"
                        placeholder="e.g. Summer Music Festival"
                        {...field}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:ring-[#E93370] transition-all h-12 rounded-xl text-base"
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1 font-medium"
                      id="dashboard-event-form-title-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-event-form-category-field"
                    className="flex-1 space-y-2.5"
                  >
                    <FormLabel
                      className="text-white/90 text-sm font-bold tracking-tight"
                      htmlFor="dashboard-event-form-category-select"
                    >
                      Category <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="w-full h-12 rounded-xl relative z-10 bg-white/5 border-white/10 hover:border-white/20 focus-visible:ring-[#E93370] transition-all text-base"
                          id="dashboard-event-form-category-select"
                        >
                          <SelectValue
                            className="capitalize"
                            placeholder="Select category"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="bg-[#1a1a1a] border-white/10 text-white rounded-xl">
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="exhibition">Exhibition</SelectItem>
                        <SelectItem value="club">Club</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1 font-medium"
                      id="dashboard-event-form-category-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-event-form-status-field"
                    className="flex-1 space-y-2.5"
                  >
                    <FormLabel
                      className="text-white/90 text-sm font-bold tracking-tight"
                      htmlFor="dashboard-event-form-status-select"
                    >
                      Status <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="w-full h-12 rounded-xl relative z-10 bg-white/5 border-white/10 hover:border-white/20 focus-visible:ring-[#E93370] transition-all text-base"
                          id="dashboard-event-form-status-select"
                        >
                          <SelectValue
                            className="capitalize"
                            placeholder="Select status"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="bg-[#1a1a1a] border-white/10 text-white rounded-xl">
                        {["draft", "published", "cancelled", "archived"].map(
                          (status) => (
                            <SelectItem key={status} value={status}>
                              <span className="w-full capitalize font-medium">
                                {status}
                              </span>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1 font-medium"
                      id="dashboard-event-form-status-error"
                    />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem
                  className="md:col-span-2 space-y-2.5"
                  id="dashboard-event-form-description-field"
                >
                  <FormLabel
                    className="text-white/90 text-sm font-bold tracking-tight"
                    htmlFor="dashboard-event-form-description-input"
                  >
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="dashboard-event-form-description-input"
                      placeholder="Enter event description"
                      {...field}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[160px] hover:border-white/20 focus-visible:ring-[#E93370] transition-all rounded-xl text-base py-4"
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage
                    className="text-[#E93370] text-xs mt-1 font-medium"
                    id="dashboard-event-form-description-error"
                  />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="featured_image_file"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-event-form-featured-image-field"
                    className="space-y-2.5"
                  >
                    <FormLabel className="text-white/90 text-sm font-bold tracking-tight">
                      Featured Image
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          accept="image/*"
                          className="hidden"
                          id="featured-image-upload"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files
                              ? e.target.files[0]
                              : null;
                            field.onChange(file);
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () =>
                                setFeaturedImagePreview(
                                  reader.result as string
                                );
                              reader.readAsDataURL(file);
                            } else {
                              setFeaturedImagePreview(null);
                            }
                          }}
                        />
                        <label
                          htmlFor="featured-image-upload"
                          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                            featuredImagePreview
                              ? "border-transparent"
                              : "border-white/10 hover:border-[#E93370]/50 hover:bg-white/5"
                          }`}
                        >
                          {featuredImagePreview ? (
                            <div className="relative w-full h-full rounded-2xl overflow-hidden">
                              <img
                                src={featuredImagePreview}
                                alt="Featured Preview"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                                  <Upload className="h-6 w-6 text-white" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <div className="p-3 rounded-xl bg-white/5 mb-4">
                                <ImagePlus className="w-6 h-6 text-[#E93370]" />
                              </div>
                              <p className="text-sm text-white/60 font-bold">
                                Upload featured image
                              </p>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                                PNG, JPG or WebP (max 10MB)
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[#E93370] text-xs mt-1 font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gallery_images_files"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-event-form-gallery-images-field"
                    className="space-y-2.5"
                  >
                    <FormLabel className="text-white/90 text-sm font-bold tracking-tight">
                      Gallery Images
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          multiple
                          accept="image/*"
                          className="hidden"
                          id="gallery-images-upload"
                          type="file"
                          onChange={(e) => {
                            const files = e.target.files;
                            field.onChange(files);
                            if (files && files.length > 0) {
                              const newPreviews: string[] = [];
                              Array.from(files).forEach((file) => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  newPreviews.push(reader.result as string);
                                  if (newPreviews.length === files.length) {
                                    setGalleryImagesPreviews(newPreviews);
                                  }
                                };
                                reader.readAsDataURL(file);
                              });
                            } else {
                              setGalleryImagesPreviews([]);
                            }
                          }}
                        />
                        <label
                          htmlFor="gallery-images-upload"
                          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-[#E93370]/50 hover:bg-white/5 transition-all overflow-hidden"
                        >
                          {galleryImagesPreviews.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 w-full h-full p-3">
                              {galleryImagesPreviews
                                .slice(0, 4)
                                .map((preview, i) => (
                                  <div
                                    key={i}
                                    className="relative rounded-lg overflow-hidden h-full shadow-lg"
                                  >
                                    <img
                                      src={preview}
                                      alt={`Gallery ${i}`}
                                      className="w-full h-full object-cover"
                                    />
                                    {i === 3 &&
                                      galleryImagesPreviews.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-bold">
                                          +{galleryImagesPreviews.length - 4}
                                        </div>
                                      )}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <div className="p-3 rounded-xl bg-white/5 mb-4">
                                <Upload className="w-6 h-6 text-[#E93370]" />
                              </div>
                              <p className="text-sm text-white/60 font-bold">
                                Upload gallery images
                              </p>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                                Multiple selection allowed
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[#E93370] text-xs mt-1 font-medium" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div
            className="space-y-8 pt-10 border-t border-white/5"
            id="dashboard-event-form-date-time"
          >
            <h3
              className="text-sm font-bold text-[#E93370] uppercase tracking-[0.2em] flex items-center gap-3 mb-6"
              id="dashboard-event-form-date-time-title"
            >
              <span className="w-2 h-2 rounded-full bg-[#E93370] shadow-[0_0_10px_#E93370]"></span>
              Date & Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-event-form-start-date-field"
                    className="space-y-2.5"
                  >
                    <FormLabel
                      className="text-white/90 text-sm font-bold tracking-tight"
                      htmlFor="dashboard-event-form-start-date-input"
                    >
                      Start Date <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="dashboard-event-form-start-date-input"
                        type="date"
                        {...field}
                        className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white hover:border-white/20 focus-visible:ring-[#E93370] transition-all text-base [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                        min={new Date().toISOString().split("T")[0]}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1 font-medium"
                      id="dashboard-event-form-start-date-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-event-form-end-date-field"
                    className="space-y-2.5"
                  >
                    <FormLabel
                      className="text-white/90 text-sm font-bold tracking-tight"
                      htmlFor="dashboard-event-form-end-date-input"
                    >
                      End Date <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="dashboard-event-form-end-date-input"
                        type="date"
                        {...field}
                        className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white hover:border-white/20 focus-visible:ring-[#E93370] transition-all text-base [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                        min={new Date().toISOString().split("T")[0]}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1 font-medium"
                      id="dashboard-event-form-end-date-error"
                    />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Venue & Capacity */}
          <div
            className="space-y-8 pt-10 border-t border-white/5 pb-10"
            id="dashboard-event-form-venue-capacity"
          >
            <h3
              className="text-sm font-bold text-[#E93370] uppercase tracking-[0.2em] flex items-center gap-3 mb-6"
              id="dashboard-event-form-venue-capacity-title"
            >
              <span className="w-2 h-2 rounded-full bg-[#E93370] shadow-[0_0_10px_#E93370]"></span>
              Venue & Capacity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-event-form-location-field"
                    className="self-start space-y-2.5"
                  >
                    <FormLabel
                      className="text-white/90 text-sm font-bold tracking-tight"
                      htmlFor="dashboard-event-form-location-input"
                    >
                      Venue Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="dashboard-event-form-location-input"
                        placeholder="Enter venue name"
                        {...field}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:ring-[#E93370] transition-all h-12 rounded-xl text-base"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1 font-medium"
                      id="dashboard-event-form-location-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-event-form-capacity-field"
                    className="space-y-2.5"
                  >
                    <FormLabel className="text-white/90 text-sm font-bold tracking-tight">
                      Capacity
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:ring-[#E93370] transition-all h-12 rounded-xl text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        id="dashboard-event-form-capacity-input"
                        min="0"
                        placeholder="e.g., 500"
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const nextValue =
                            e.target.value === ""
                              ? null
                              : Number(e.target.value);
                          field.onChange(nextValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1 font-medium"
                      id="dashboard-event-form-capacity-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_range"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-event-form-price-field"
                    className="space-y-2.5"
                  >
                    <FormLabel className="text-white/90 text-sm font-bold tracking-tight">
                      Price Range
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="dashboard-event-form-price-input"
                        placeholder="e.g., IDR 250K - 500K"
                        {...field}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:ring-[#E93370] transition-all h-12 rounded-xl text-base"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1 font-medium"
                      id="dashboard-event-form-price-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ticket_url"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-event-form-ticket-field"
                    className="space-y-2.5"
                  >
                    <FormLabel className="text-white/90 text-sm font-bold tracking-tight">
                      Ticket URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="dashboard-event-form-ticket-input"
                        placeholder="https://example.com/tickets"
                        {...field}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:ring-[#E93370] transition-all h-12 rounded-xl text-base"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1 font-medium"
                      id="dashboard-event-form-ticket-error"
                    />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div
          className="flex justify-end space-x-4 px-10 py-8 bg-[#0a0a0a] border-t border-white/5 sticky bottom-0 z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
          id="dashboard-event-form-actions"
        >
          <Button
            className="px-8 h-12 rounded-xl text-white/60 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all font-bold tracking-tight"
            disabled={isSubmitting}
            id="dashboard-event-form-cancel-button"
            type="button"
            variant="outline"
            onClick={() => {
              form.reset(getDefaultValues());
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button
            className="px-8 h-12 rounded-xl bg-[#E93370] hover:bg-[#E93370]/90 text-white font-bold tracking-tight transition-all shadow-lg shadow-[#E93370]/20"
            disabled={isSubmitting}
            id="dashboard-event-form-submit-button"
            type="submit"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Create Event"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
