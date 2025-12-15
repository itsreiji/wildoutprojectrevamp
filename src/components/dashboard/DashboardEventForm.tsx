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

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { LandingEvent } from '@/types/content';

const eventFormSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional().nullable(),
  start_date: z.string().min(1, 'Start date is required').refine(
    (date) => !isNaN(Date.parse(date)),
    'Start date must be a valid date'
  ),
  end_date: z.string().min(1, 'End date is required').refine(
    (date) => !isNaN(Date.parse(date)),
    'End date must be a valid date'
  ),
  location: z.string().optional().nullable(),
  category: z.enum([
    'music',
    'sports',
    'arts',
    'food',
    'community',
    'other',
    'festival',
    'concert',
    'exhibition',
    'club',
    'conference',
  ]),
  status: z.enum(['upcoming', 'ongoing', 'completed']),
  capacity: z
    .union([z.number().min(0, 'Capacity must be 0 or greater'), z.null()])
    .optional(),
  price_range: z.string().optional().nullable(),
  ticket_url: z.string().url('Ticket URL must be a valid URL').optional().nullable(),
  featured_image_file: z.any().optional(),
  gallery_images_files: z.any().optional(),
}).refine(
  (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return start <= end;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  }
);

export type EventFormValues = z.infer<typeof eventFormSchema>;

interface DashboardEventFormProps {
  onSubmit: (values: EventFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<LandingEvent>;
  onCancel?: () => void;
}

export function DashboardEventForm({ onSubmit, isSubmitting, defaultValues, onCancel }: DashboardEventFormProps) {
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Ensure we have a valid date
      if (isNaN(date.getTime())) return '';
      // Format as YYYY-MM-DD for date input
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const getDefaultValues = (): EventFormValues => {
    if (!defaultValues) {
      return {
        title: '',
        description: null,
        start_date: '',
        end_date: '',
        location: null,
        category: undefined as any, // Cast to any to allow undefined initially for required field
        status: 'upcoming',
        capacity: null,
        price_range: null,
        ticket_url: null,
        featured_image_file: undefined,
        gallery_images_files: undefined,
      };
    }

    return {
      title: defaultValues.title || '',
      description: defaultValues.description || null,
      start_date: formatDateForInput(defaultValues.start_date),
      end_date: formatDateForInput(defaultValues.end_date),
      location: defaultValues.location || null,
      category: (defaultValues.category || undefined) as any,
      status: (defaultValues.status as 'upcoming' | 'ongoing' | 'completed') || 'upcoming',
      capacity: defaultValues.capacity ?? null,
      price_range: defaultValues.price_range || null,
      ticket_url: defaultValues.ticket_url || null,
      featured_image_file: undefined,
      gallery_images_files: undefined,
    };
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: getDefaultValues(),
    mode: 'onBlur', // Validate on blur for better UX
  });

  // Reset form when editing target changes to ensure fresh values
  useEffect(() => {
    form.reset(getDefaultValues());
  }, [defaultValues?.id, form]);

  // Transform form values to map empty strings to null for optional fields
  const handleFormSubmit = (values: EventFormValues) => {
    const processedValues: EventFormValues = {
      ...values,
      description: values.description || null,
      location: values.location || null,
      price_range: values.price_range || null,
      ticket_url: values.ticket_url || null,
      capacity: values.capacity === null || values.capacity === undefined ? null : values.capacity,
    };
    onSubmit(processedValues);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" id="admin-event-form" onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4" id="admin-event-form-basic-info">
            <h3 className="text-lg font-medium text-white/90" id="admin-event-form-basic-info-title">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem id="admin-event-form-title-field">
                    <FormLabel className="text-white/80 text-sm font-medium" htmlFor="admin-event-form-title-input">
                      Event Title <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="admin-event-form-title-input"
                        placeholder="Enter event title"
                        {...field}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors"
                      />
                    </FormControl>
                    <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-title-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem id="admin-event-form-category-field">
                    <FormLabel className="text-white/80 text-sm font-medium" htmlFor="admin-event-form-category-select">
                      Category <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full relative z-10" id="admin-event-form-category-select">
                          <SelectValue className="capitalize" placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-50" position="popper">
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
                    <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-category-error" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2" id="admin-event-form-description-field">
                  <FormLabel className="text-white/80 text-sm font-medium" htmlFor="admin-event-form-description-input">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="admin-event-form-description-input"
                      placeholder="Enter event description"
                      {...field}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px] hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors"
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-description-error" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="featured_image_file"
                render={({ field }) => (
                  <FormItem id="admin-event-form-featured-image-field">
                    <FormLabel className="text-white/80 text-sm font-medium" htmlFor="admin-event-form-featured-image-input">Featured Image</FormLabel>
                    <FormControl>
                      <div className="relative z-0">
                        <Input
                          accept="image/*"
                          className="h-11 w-full bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors file:bg-white/5 file:border-white/10 file:text-white/80 file:hover:bg-white/10 file:hover:border-white/20 file:focus:outline-none file:focus:ring-1 file:focus:ring-[#E93370]/50 file:transition-colors file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-white/10 file:text-sm file:font-medium"
                          id="admin-event-form-featured-image-input"
                          type="file"
                          onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-featured-image-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gallery_images_files"
                render={({ field }) => (
                  <FormItem id="admin-event-form-gallery-images-field">
                    <FormLabel className="text-white/80 text-sm font-medium" htmlFor="admin-event-form-gallery-images-input">Gallery Images</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          multiple
                          accept="image/*"
                          className="h-11 w-full bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors file:bg-white/5 file:border-white/10 file:text-white/80 file:hover:bg-white/10 file:hover:border-white/20 file:focus:outline-none file:focus:ring-1 file:focus:ring-[#E93370]/50 file:transition-colors file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-white/10 file:text-sm file:font-medium"
                          id="admin-event-form-gallery-images-input"
                          type="file"
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-gallery-images-error" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4" id="admin-event-form-date-time">
            <h3 className="text-lg font-medium text-white/90" id="admin-event-form-date-time-title">Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem id="admin-event-form-start-date-field">
                    <FormLabel className="text-white/80 text-sm font-medium" htmlFor="admin-event-form-start-date-input">
                      Start Date <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="admin-event-form-start-date-input"
                          type="date"
                          {...field}
                          className="h-11 w-full bg-white/5 border-white/10 text-white/90 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                          min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                          value={field.value || ''}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-white/60 text-xs mt-1" id="admin-event-form-start-date-description">
                      Event start date (local timezone)
                    </FormDescription>
                    <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-start-date-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem id="admin-event-form-end-date-field">
                    <FormLabel className="text-white/80 text-sm font-medium" htmlFor="admin-event-form-end-date-input">
                      End Date <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="admin-event-form-end-date-input"
                          type="date"
                          {...field}
                          className="h-11 w-full bg-white/5 border-white/10 text-white/90 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                          min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                          value={field.value || ''}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-white/60 text-xs mt-1" id="admin-event-form-end-date-description">
                      Event end date (local timezone)
                    </FormDescription>
                    <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-end-date-error" />
                  </FormItem>
                )}
              />
            </div>

            {/* Status Field - Moved outside the grid to match other form fields */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full" id="admin-event-form-status-field">
                  <FormLabel className="text-white/80 text-sm font-medium" htmlFor="admin-event-form-status-select">
                    Status <span className="text-[#E93370]">*</span>
                  </FormLabel>
                  <div className="w-full">
                    <Select
                      defaultValue={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full" id="admin-event-form-status-select">
                          <SelectValue className="capitalize" placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {["upcoming", "ongoing", "completed"].map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                          >
                            <span className="w-full capitalize">{status}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-status-error" />
                </FormItem>
              )}
            />
          </div>

          {/* Venue */}
          <div className="space-y-4" id="admin-event-form-venue">
            <h3 className="text-lg font-medium text-white/90" id="admin-event-form-venue-title">Venue Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem id="admin-event-form-location-field">
                    <FormLabel className="text-white/80 text-sm font-medium" htmlFor="admin-event-form-location-input">Venue Name</FormLabel>
                    <FormControl>
                      <Input
                        id="admin-event-form-location-input"
                        placeholder="Enter venue name"
                        {...field}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors"
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-location-error" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <div className="space-y-4" id="admin-event-form-capacity">
            <h3 className="text-lg font-medium text-white/90" id="admin-event-form-capacity-title">Capacity & Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem id="admin-event-form-capacity-field">
                    <FormLabel className="text-white/80 text-sm font-medium">Capacity</FormLabel>
                    <FormControl>
                      <Input
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        id="admin-event-form-capacity-input"
                        min="0"
                        placeholder="e.g., 500"
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const nextValue = e.target.value === '' ? null : Number(e.target.value);
                          field.onChange(nextValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-capacity-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_range"
                render={({ field }) => (
                  <FormItem id="admin-event-form-price-field">
                    <FormLabel className="text-white/80 text-sm font-medium">Price Range</FormLabel>
                    <FormControl>
                      <Input
                        id="admin-event-form-price-input"
                        placeholder="e.g., IDR 250K - 500K"
                        {...field}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors"
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-price-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ticket_url"
                render={({ field }) => (
                  <FormItem className="md:col-span-2" id="admin-event-form-ticket-field">
                    <FormLabel className="text-white/80 text-sm font-medium">Ticket URL</FormLabel>
                    <FormControl>
                      <Input
                        id="admin-event-form-ticket-input"
                        placeholder="https://example.com/tickets"
                        {...field}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors"
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage className="text-[#E93370] text-sm mt-1" id="admin-event-form-ticket-error" />
                  </FormItem>
                )}
              />
            </div>
          </div>

        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-white/10" id="admin-event-form-actions">
          <Button
            className="h-11 px-6 text-white/80 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
            disabled={isSubmitting}
            id="admin-event-form-cancel-button"
            size="lg"
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
            className="h-11 px-6 bg-[#E93370] hover:bg-[#E93370]/90 text-white font-medium transition-colors"
            disabled={isSubmitting}
            id="admin-event-form-submit-button"
            size="lg"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
