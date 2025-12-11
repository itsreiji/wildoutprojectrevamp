/**
 * DashboardGalleryForm Component
 *
 * Form abstraction supporting both create and edit flows for gallery items.
 *
 * Features:
 * - React Hook Form integration for efficient form state management
 * - Zod schema validation with enhanced error messages
 * - Automatic form reset when switching between create/edit modes
 * - File upload UI for multiple image uploads
 * - Preview of selected images
 * - shadcn/ui components for consistent styling and accessibility
 *
 * Validation Rules:
 * - Title is required
 * - At least one image is required for new gallery items
 * - Category and tags are optional
 *
 * Form Modes:
 * - Create: All fields empty, must provide images, defaultValues prop is undefined
 * - Edit: Form pre-populated with gallery data, can add more images
 */

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { useEffect, useState } from 'react';
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
import { useContent } from '@/contexts/ContentContext';
import type { GalleryImage } from '@/types/content';
import { X } from 'lucide-react';

const galleryFormSchema = z.object({
  title: z.string().min(1, 'Gallery title is required'),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  event_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).default([]),
  image_files: z.array(z.any()).default([]),
});

export type GalleryFormValues = z.infer<typeof galleryFormSchema>;

interface DashboardGalleryFormProps {
  onSubmit: (values: GalleryFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<GalleryImage>;
  onCancel?: () => void;
}

export function DashboardGalleryForm({ onSubmit, isSubmitting, defaultValues, onCancel }: DashboardGalleryFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { events } = useContent();

  const getDefaultValues = (): GalleryFormValues => {
    if (!defaultValues) {
      return {
        title: '',
        description: '',
        category: '',
        tags: [],
        image_files: [],
      };
    }

    return {
      title: defaultValues.title || '',
      description: defaultValues.description || '',
      category: defaultValues.category || '',
      event_id: defaultValues.event_id || undefined,
      tags: Array.isArray(defaultValues.tags) ? defaultValues.tags : [],
      image_files: [],
    };
  };

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryFormSchema) as Resolver<GalleryFormValues>,
    defaultValues: getDefaultValues(),
  });

  // Reset form when defaultValues changes (switching between create/edit modes)
  useEffect(() => {
    form.reset(getDefaultValues());
    setSelectedFiles([]);
    setPreviewUrls([]);
  }, [defaultValues?.id]);

  // Handle file selection with preview generation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);

    // Generate previews for new files
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (values: GalleryFormValues) => {
    // Ensure at least one image
    if (selectedFiles.length === 0 && !defaultValues?.id) {
      form.setError('image_files', { message: 'Please select at least one image' });
      return;
    }

    // Set files in form values and submit
    const submissionValues = {
      ...values,
      image_files: selectedFiles,
    };
    onSubmit(submissionValues);
  };

  return (
    <Form {...form}>
      <form id="admin-gallery-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem id="admin-gallery-form-title-field">
              <FormLabel htmlFor="admin-gallery-form-title-input">Gallery Title *</FormLabel>
              <FormControl>
                <Input
                  id="admin-gallery-form-title-input"
                  placeholder="e.g., Summer Festival 2025"
                  {...field}
                />
              </FormControl>
              <FormMessage id="admin-gallery-form-title-error" />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem id="admin-gallery-form-description-field">
              <FormLabel htmlFor="admin-gallery-form-description-textarea">Description</FormLabel>
              <FormControl>
                <Textarea
                  id="admin-gallery-form-description-textarea"
                  placeholder="Brief description of the gallery"
                  className="resize-none h-20"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage id="admin-gallery-form-description-error" />
            </FormItem>
          )}
        />

        {/* Category Field */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem id="admin-gallery-form-category-field">
              <FormLabel htmlFor="admin-gallery-form-category-input">Category</FormLabel>
              <FormControl>
                <Input
                  id="admin-gallery-form-category-input"
                  placeholder="e.g., Events, Performances, Behind-the-Scenes"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage id="admin-gallery-form-category-error" />
            </FormItem>
          )}
        />

        {/* Event Link Field */}
        <FormField
          control={form.control}
          name="event_id"
          render={({ field }) => (
            <FormItem id="admin-gallery-form-event-field">
              <FormLabel htmlFor="admin-gallery-form-event-select">Link to Event (optional)</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger id="admin-gallery-form-event-select">
                      <SelectValue placeholder="Select an event..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem id="admin-gallery-form-event-select-none" value="none">No event</SelectItem>
                    {events.map((event) => (
                      <SelectItem id={`admin-gallery-form-event-select-${event.id}`} key={event.id} value={event.id || ''}>
                        {event.title || 'Untitled Event'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage id="admin-gallery-form-event-error" />
            </FormItem>
          )}
        />

        {/* Image Upload Field */}
        <FormField
          control={form.control}
          name="image_files"
          render={() => (
            <FormItem id="admin-gallery-form-images-field">
              <FormLabel htmlFor="admin-gallery-form-images-input">Gallery Images {!defaultValues?.id && '*'}</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Input
                    id="admin-gallery-form-images-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  />
                </div>
              </FormControl>
              <FormDescription id="admin-gallery-form-images-description">
                JPG, PNG, WebP, or GIF format. Max 10MB per file. You can select multiple images at once.
              </FormDescription>
              <FormMessage id="admin-gallery-form-images-error" />
            </FormItem>
          )}
        />

        {/* Image Previews */}
        {previewUrls.length > 0 && (
          <div id="admin-gallery-form-previews">
            <FormLabel id="admin-gallery-form-previews-title" className="mb-2 block">Selected Images ({previewUrls.length})</FormLabel>
            <div id="admin-gallery-form-previews-grid" className="grid grid-cols-3 gap-2">
              {previewUrls.map((url, index) => (
                <div key={`admin-gallery-form-preview-${index}`} id={`admin-gallery-form-preview-${index}`} className="relative group">
                  <img
                    id={`admin-gallery-form-preview-image-${index}`}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    id={`admin-gallery-form-preview-remove-${index}`}
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X id={`admin-gallery-form-preview-remove-icon-${index}`} className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div id="admin-gallery-form-actions" className="flex gap-2 justify-end pt-4">
          <Button
            id="admin-gallery-form-cancel-button"
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            id="admin-gallery-form-submit-button"
            type="submit"
            className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : defaultValues?.id ? 'Update' : 'Add'} Gallery
          </Button>
        </div>
      </form>
    </Form>
  );
}

