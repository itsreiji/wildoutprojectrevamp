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

import { useContent } from "@/contexts/ContentContext";
import type { GalleryImage } from "@/types/content";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
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

const galleryFormSchema = z.object({
  title: z.string().min(1, "Gallery title is required"),
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

export function DashboardGalleryForm({
  onSubmit,
  isSubmitting,
  defaultValues,
  onCancel,
}: DashboardGalleryFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { events } = useContent();

  const getDefaultValues = (): GalleryFormValues => {
    if (!defaultValues) {
      return {
        title: "",
        description: "",
        category: "",
        tags: [],
        image_files: [],
      };
    }

    return {
      title: defaultValues.title || "",
      description: defaultValues.description || "",
      category: defaultValues.category || "",
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
    setSelectedFiles((prev) => [...prev, ...files]);

    // Generate previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (values: GalleryFormValues) => {
    // Ensure at least one image
    if (selectedFiles.length === 0 && !defaultValues?.id) {
      form.setError("image_files", {
        message: "Please select at least one image",
      });
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
      <form
        className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden"
        id="admin-gallery-form"
        onSubmit={form.handleSubmit(handleFormSubmit)}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 px-8 py-6 wildout-scrollbar">
          {/* Basic Info */}
          <div className="space-y-4" id="admin-gallery-form-basic-info">
            <h3
              className="text-sm font-semibold text-[#E93370] flex items-center gap-2"
              id="admin-gallery-form-basic-info-title"
            >
              <span className="w-1 h-4 bg-[#E93370] rounded-full"></span>
              Gallery Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start relative">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem
                    className="md:col-span-2"
                    id="admin-gallery-form-title-field"
                  >
                    <FormLabel
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="admin-gallery-form-title-input"
                    >
                      Gallery Title <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="admin-gallery-form-title-input"
                        placeholder="e.g. Summer Festival 2025"
                        {...field}
                        className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors text-sm"
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1"
                      id="admin-gallery-form-title-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem id="admin-gallery-form-category-field">
                    <FormLabel
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="admin-gallery-form-category-input"
                    >
                      Category
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="admin-gallery-form-category-input"
                        placeholder="e.g. Events, Behind-the-Scenes"
                        {...field}
                        value={field.value || ""}
                        className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors text-sm"
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1"
                      id="admin-gallery-form-category-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="event_id"
                render={({ field }) => (
                  <FormItem id="admin-gallery-form-event-field">
                    <FormLabel
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="admin-gallery-form-event-select"
                    >
                      Link to Event (optional)
                    </FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="h-10 w-full text-sm bg-white/5 border-white/10"
                          id="admin-gallery-form-event-select"
                        >
                          <SelectValue placeholder="Select an event..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1a1a] border-white/10 shadow-2xl">
                        <SelectItem value="none">No event</SelectItem>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id || ""}>
                            {event.title || "Untitled Event"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1"
                      id="admin-gallery-form-event-error"
                    />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem id="admin-gallery-form-description-field">
                  <FormLabel
                    className="text-white/80 text-sm font-semibold"
                    htmlFor="admin-gallery-form-description-textarea"
                  >
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="admin-gallery-form-description-textarea"
                      placeholder="Brief description of the gallery..."
                      {...field}
                      value={field.value || ""}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px] hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors text-sm resize-none"
                    />
                  </FormControl>
                  <FormMessage
                    className="text-[#E93370] text-sm mt-1"
                    id="admin-gallery-form-description-error"
                  />
                </FormItem>
              )}
            />

            {/* Image Upload Area */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="image_files"
                render={() => (
                  <FormItem id="admin-gallery-form-images-field">
                    <FormLabel
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="admin-gallery-form-images-input"
                    >
                      Gallery Images{" "}
                      {!defaultValues?.id && (
                        <span className="text-[#E93370]">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          multiple
                          accept="image/*"
                          className="hidden"
                          id="gallery-images-upload-input"
                          type="file"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor="gallery-images-upload-input"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#E93370]/50 hover:bg-white/5 transition-all text-center p-4"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <svg
                              className="w-8 h-8 mb-2 text-white/40"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 4v16m8-8H4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                              ></path>
                            </svg>
                            <p className="text-sm text-white/60">
                              Click to upload images
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                              PNG, JPG or WebP (max 10MB each)
                            </p>
                          </div>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1"
                      id="admin-gallery-form-images-error"
                    />
                  </FormItem>
                )}
              />

              {/* Previews Grid */}
              {previewUrls.length > 0 && (
                <div
                  className="grid grid-cols-4 gap-3 pt-2"
                  id="admin-gallery-form-previews"
                >
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-white/10"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex justify-end space-x-3 px-8 py-4 bg-[#0a0a0a] border-t border-white/10 rounded-b-lg sticky bottom-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]"
          id="admin-gallery-form-actions"
        >
          <Button
            className="h-10 px-6 text-white/80 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
            disabled={isSubmitting}
            id="admin-gallery-form-cancel-button"
            size="lg"
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-6 bg-[#E93370] hover:bg-[#E93370]/90 text-white font-medium transition-colors"
            disabled={isSubmitting}
            id="admin-gallery-form-submit-button"
            size="lg"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  id="admin-gallery-form-submit-spinner"
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
                {defaultValues?.id
                  ? "Saving Changes..."
                  : "Uploading Gallery..."}
              </>
            ) : defaultValues?.id ? (
              "Save Changes"
            ) : (
              "Add Gallery"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
