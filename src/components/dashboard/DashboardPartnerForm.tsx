/**
 * DashboardPartnerForm Component
 *
 * Form abstraction supporting both create and edit flows for partners.
 *
 * Features:
 * - React Hook Form integration for efficient form state management
 * - Zod schema validation with enhanced error messages
 * - Automatic form reset when switching between create/edit modes
 * - File upload UI for logo images
 * - shadcn/ui components for consistent styling and accessibility
 *
 * Validation Rules:
 * - Name is required
 * - Website URL must be valid if provided
 * - Optional fields (description, contact_email, contact_phone, social_links) are handled gracefully
 *
 * Form Modes:
 * - Create: All fields empty, defaultValues prop is undefined
 * - Edit: Form pre-populated with partner data, resets when defaultValues changes
 */

import type { Partner } from "@/types/content";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useCallback } from "react";
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

const partnerFormSchema = z.object({
  name: z.string().min(1, "Partner name is required"),
  sponsorship_level: z
    .enum(["bronze", "silver", "gold", "platinum"] as const)
    .default("bronze"),
  website_url: z
    .string()
    .url("Website URL must be a valid URL")
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
  contact_email: z
    .string()
    .email("Contact email must be valid")
    .optional()
    .nullable(),
  contact_phone: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  logo_url: z.string().url("Logo URL must be a valid URL").optional().nullable().or(z.literal("")),
  logo_file: z.any().optional(),
  social_links: z
    .record(z.string(), z.string().nullable())
    .optional()
    .nullable(),
});

export type PartnerFormValues = z.infer<typeof partnerFormSchema>;

interface DashboardPartnerFormProps {
  onSubmit: (values: PartnerFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<Partner>;
  onCancel?: () => void;
}

export function DashboardPartnerForm({
  onSubmit,
  isSubmitting,
  defaultValues,
  onCancel,
}: DashboardPartnerFormProps) {
  const getDefaultValues = useCallback((): PartnerFormValues => {
    if (!defaultValues) {
      return {
        name: "",
        sponsorship_level: "bronze",
        website_url: "",
        description: "",
        contact_email: "",
        contact_phone: "",
        featured: false,
        logo_url: "",
        social_links: {},
      };
    }

    return {
      name: defaultValues.name || "",
      sponsorship_level: (defaultValues as any).sponsorship_level || "bronze",
      website_url: defaultValues.website_url || "",
      description: defaultValues.description || "",
      contact_email: defaultValues.contact_email || "",
      contact_phone: defaultValues.contact_phone || "",
      featured: defaultValues.featured || false,
      logo_url: defaultValues.logo_url || "",
      social_links: defaultValues.social_links || {},
    };
  }, [defaultValues]);

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema) as Resolver<PartnerFormValues>,
    defaultValues: getDefaultValues(),
  });

  // Reset form when defaultValues changes (switching between create/edit modes)
  useEffect(() => {
    form.reset(getDefaultValues());
  }, [defaultValues?.id, form, getDefaultValues]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden"
        id="dashboard-partner-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-8 px-8 py-10 wildout-scrollbar">
          {/* Basic Info */}
          <div className="space-y-6" id="dashboard-partner-form-basic-info">
            <h3
              className="text-sm font-semibold text-[#E93370] flex items-center gap-2 mb-4"
              id="dashboard-partner-form-basic-info-title"
            >
              <span className="w-1.5 h-5 bg-[#E93370] rounded-full"></span>
              Partner Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start relative">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-partner-form-name-field"
                    className="space-y-2"
                  >
                    <FormLabel
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="dashboard-partner-form-name-input"
                    >
                      Partner Name <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="dashboard-partner-form-name-input"
                        placeholder="e.g. Red Bull, Spotify"
                        {...field}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus-visible:ring-[#E93370] transition-colors"
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1"
                      id="dashboard-partner-form-name-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sponsorship_level"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-partner-form-level-field"
                    className="space-y-2"
                  >
                    <FormLabel
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="dashboard-partner-form-level-select"
                    >
                      Sponsorship Level{" "}
                      <span className="text-[#E93370]">*</span>
                    </FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="w-full bg-white/5 border-white/10 hover:border-white/20 focus-visible:ring-[#E93370] transition-colors"
                          id="dashboard-partner-form-level-select"
                        >
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1"
                      id="dashboard-partner-form-level-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-partner-form-website-field"
                    className="space-y-2"
                  >
                    <FormLabel
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="dashboard-partner-form-website-input"
                    >
                      Website URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="dashboard-partner-form-website-input"
                        placeholder="https://example.com"
                        type="url"
                        {...field}
                        value={field.value || ""}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus-visible:ring-[#E93370] transition-colors"
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1"
                      id="dashboard-partner-form-website-error"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-partner-form-email-field"
                    className="space-y-2"
                  >
                    <FormLabel
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="dashboard-partner-form-email-input"
                    >
                      Contact Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="dashboard-partner-form-email-input"
                        placeholder="contact@partner.com"
                        type="email"
                        {...field}
                        value={field.value || ""}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors text-sm"
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1"
                      id="dashboard-partner-form-email-error"
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
                  id="dashboard-partner-form-description-field"
                  className="space-y-2 mt-6"
                >
                  <FormLabel
                    className="text-white/80 text-sm font-semibold"
                    htmlFor="dashboard-partner-form-description-textarea"
                  >
                    Partner Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="dashboard-partner-form-description-textarea"
                      placeholder="Brief description of the partnership..."
                      {...field}
                      value={field.value || ""}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px] hover:border-white/20 focus-visible:ring-[#E93370] transition-colors resize-none"
                    />
                  </FormControl>
                  <FormMessage
                    className="text-[#E93370] text-xs mt-1"
                    id="dashboard-partner-form-description-error"
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem
                  id="dashboard-partner-form-logo-url-field"
                  className="space-y-2 mt-6"
                >
                  <FormLabel
                    className="text-white/80 text-sm font-semibold"
                    htmlFor="dashboard-partner-form-logo-url-input"
                  >
                    Partner Logo URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="dashboard-partner-form-logo-url-input"
                      placeholder="https://example.com/logo.png"
                      type="url"
                      {...field}
                      value={field.value || ""}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus-visible:ring-[#E93370] transition-colors"
                    />
                  </FormControl>
                  <FormMessage
                    className="text-[#E93370] text-xs mt-1"
                    id="dashboard-partner-form-logo-url-error"
                  />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="logo_file"
                render={({ field: { onChange, value: _value, ...field } }) => (
                <FormItem
                  id="dashboard-partner-form-logo-field"
                  className="space-y-2 mt-6"
                >
                  <FormLabel
                    className="text-white/80 text-sm font-semibold"
                    htmlFor="dashboard-partner-form-logo-input"
                  >
                    Partner Logo
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <Input
                          accept="image/*"
                          className="hidden"
                          id="partner-logo-upload"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files
                              ? e.target.files[0]
                              : null;
                            onChange(file);
                          }}
                          {...field}
                        />
                        <label
                          htmlFor="partner-logo-upload"
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
                              Click to upload logo
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                              PNG, JPG or WebP (max 10MB)
                            </p>
                          </div>
                        </label>
                      </div>
                      {defaultValues?.logo_url && (
                        <div className="flex flex-col items-center gap-3">
                          <label className="text-2xs uppercase tracking-wider text-white/40 font-bold">
                            Current
                          </label>
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 p-2 bg-white/5">
                            <img
                              src={defaultValues.logo_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200"}
                              alt="Current logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-[#E93370] text-xs mt-1" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div
          className="flex justify-end space-x-3 px-8 py-6 bg-[#0a0a0a] border-t border-white/10 rounded-b-lg sticky bottom-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]"
          id="dashboard-partner-form-actions"
        >
          <Button
            className="h-10 px-6 text-white/80 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
            disabled={isSubmitting}
            id="dashboard-partner-form-cancel-button"
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
            id="dashboard-partner-form-submit-button"
            size="lg"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  id="dashboard-partner-form-submit-spinner"
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
                {defaultValues?.id ? "Saving..." : "Adding..."}
              </>
            ) : defaultValues?.id ? (
              "Save Changes"
            ) : (
              "Add Partner"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
