/**
 * DashboardEventForm Component
 *
 * Form abstraction supporting both create and edit flows for events.
 *
 * Features:
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
import type { Event } from '@/types/content';

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
  category: z.string().min(1, 'Category is required'),
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
  defaultValues?: Partial<Event>;
  onCancel?: () => void;
}

export function DashboardEventForm({ onSubmit, isSubmitting, defaultValues, onCancel }: DashboardEventFormProps) {
  const getDefaultValues = (): EventFormValues => {
    if (!defaultValues) {
      return {
        title: '',
        description: null,
        start_date: '',
        end_date: '',
        location: null,
        category: '',
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
      start_date: defaultValues.start_date ? new Date(defaultValues.start_date).toISOString().substring(0, 10) : '',
      end_date: defaultValues.end_date ? new Date(defaultValues.end_date).toISOString().substring(0, 10) : '',
      location: defaultValues.location || null,
      category: defaultValues.category || '',
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
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg text-white/90">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} className="bg-white/5 border-white/10 text-white placeholder:text-white/40" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Music Festival" {...field} className="bg-white/5 border-white/10 text-white placeholder:text-white/40" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter event description"
                      {...field}
                      value={field.value ?? ''}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="featured_image_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gallery_images_files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gallery Images</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => field.onChange(e.target.files)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg text-white/90">Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-white/5 border-white/10 text-white" />
                    </FormControl>
                    <FormDescription className="text-white/50">
                      Select when the event starts (in your local timezone)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-white/5 border-white/10 text-white" />
                    </FormControl>
                    <FormDescription className="text-white/50">
                      Must be after or equal to start date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select event status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/95 border-white/10 text-white">
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Venue */}
          <div className="space-y-4">
             <h3 className="text-lg text-white/90">Venue Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Venue Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Enter venue name" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10 text-white placeholder:text-white/40" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg text-white/90">Capacity & Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 500"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const nextValue = e.target.value === '' ? null : Number(e.target.value);
                          field.onChange(nextValue);
                        }}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Range</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., IDR 250K - 500K" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10 text-white placeholder:text-white/40" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="ticket_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/tickets" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10 text-white placeholder:text-white/40" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>

        </div>

        <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset(getDefaultValues());
                onCancel?.();
              }}
              disabled={isSubmitting}
              className="text-white/70 border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
