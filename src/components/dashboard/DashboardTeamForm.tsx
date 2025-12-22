/**
 * DashboardTeamForm Component
 *
 * Form abstraction supporting both create and edit flows for team members.
 *
 * Features:
 * - React Hook Form integration for efficient form state management
 * - Zod schema validation with enhanced error messages
 * - Automatic form reset when switching between create/edit modes
 * - File upload UI for avatar images
 * - shadcn/ui components for consistent styling and accessibility
 *
 * Validation Rules:
 * - Name is required
 * - Email is required and must be valid
 * - Title is required
 * - Optional fields (bio, social_links) are handled gracefully
 *
 * Form Modes:
 * - Create: All fields empty, defaultValues prop is undefined
 * - Edit: Form pre-populated with team member data, resets when defaultValues changes
 */

import type { TeamMember } from "@/types/content";
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
import { Textarea } from "../ui/textarea";

const teamFormSchema = z.object({
  name: z.string().min(1, "Team member name is required"),
  title: z.string().min(1, "Title is required"),
  email: z.string().email("Email must be a valid email address"),
  bio: z.string().optional().nullable(),
  avatar_file: z.any().optional(),
  photo_url_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_photo_removed: z.boolean().optional(),
  social_links: z
    .record(z.string(), z.string().nullable())
    .optional()
    .nullable(),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;

interface DashboardTeamFormProps {
  onSubmit: (values: TeamFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<TeamMember>;
  onCancel?: () => void;
}

export function DashboardTeamForm({
  onSubmit,
  isSubmitting,
  defaultValues,
  onCancel,
}: DashboardTeamFormProps) {
  const getDefaultValues = useCallback((): TeamFormValues => {
    if (!defaultValues) {
      return {
        name: "",
        title: "",
        email: "",
        bio: "",
        photo_url_link: "",
        is_photo_removed: false,
        social_links: {},
      };
    }

    return {
      name: defaultValues.name || "",
      title: defaultValues.title || "",
      email: defaultValues.email || "",
      bio: defaultValues.bio || "",
      photo_url_link:
        defaultValues.photo_url_link ||
        (defaultValues.metadata as any)?.photo_url_link ||
        "",
      is_photo_removed: false,
      social_links:
        (defaultValues.social_links as Record<string, string | null>) || {},
    };
  }, [defaultValues]);

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema) as Resolver<TeamFormValues>,
    defaultValues: getDefaultValues(),
  });

  // Reset form when defaultValues changes (switching between create/edit modes)
  useEffect(() => {
    form.reset(getDefaultValues());
  }, [defaultValues?.id, form, getDefaultValues]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden rounded-2xl sm:rounded-[32px]"
        id="dashboard-team-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden wildout-scrollbar">
          <div className="px-8 py-10 space-y-12">
            {/* Basic Info */}
            <div className="space-y-8" id="dashboard-team-form-basic-info">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-[#E93370] rounded-full shadow-[0_0_10px_rgba(233,51,112,0.5)]"></div>
                <h3
                  className="text-lg font-bold text-white tracking-tight"
                  id="dashboard-team-form-basic-info-title"
                >
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start relative">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem
                      id="dashboard-team-form-name-field"
                      className="space-y-2.5"
                    >
                      <FormLabel
                        className="text-white/70 text-sm font-medium ml-1"
                        htmlFor="dashboard-team-form-name-input"
                      >
                        Full Name <span className="text-[#E93370]">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="dashboard-team-form-name-input"
                          placeholder="e.g. John Doe"
                          {...field}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:ring-[#E93370] focus-visible:border-[#E93370] transition-all px-5 text-sm rounded-xl"
                        />
                      </FormControl>
                      <FormMessage
                        className="text-[#E93370] text-xs mt-1.5 ml-1"
                        id="dashboard-team-form-name-error"
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem
                      id="dashboard-team-form-title-field"
                      className="space-y-2.5"
                    >
                      <FormLabel
                        className="text-white/70 text-sm font-medium ml-1"
                        htmlFor="dashboard-team-form-title-input"
                      >
                        Title / Role <span className="text-[#E93370]">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="dashboard-team-form-title-input"
                          placeholder="e.g. CEO & Founder"
                          {...field}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:ring-[#E93370] focus-visible:border-[#E93370] transition-all px-5 text-sm rounded-xl"
                        />
                      </FormControl>
                      <FormMessage
                        className="text-[#E93370] text-xs mt-1.5 ml-1"
                        id="dashboard-team-form-title-error"
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem
                      id="dashboard-team-form-email-field"
                      className="space-y-2.5"
                    >
                      <FormLabel
                        className="text-white/70 text-sm font-medium ml-1"
                        htmlFor="dashboard-team-form-email-input"
                      >
                        Email Address <span className="text-[#E93370]">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="dashboard-team-form-email-input"
                          placeholder="e.g. john@example.com"
                          type="email"
                          {...field}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:ring-[#E93370] focus-visible:border-[#E93370] transition-all px-5 text-sm rounded-xl"
                        />
                      </FormControl>
                      <FormMessage
                        className="text-[#E93370] text-xs mt-1.5 ml-1"
                        id="dashboard-team-form-email-error"
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social_links.instagram"
                  render={({ field }) => (
                    <FormItem
                      id="dashboard-team-form-instagram-field"
                      className="space-y-2.5"
                    >
                      <FormLabel
                        className="text-white/70 text-sm font-medium ml-1"
                        htmlFor="dashboard-team-form-instagram-input"
                      >
                        Instagram Handle
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">
                            @
                          </span>
                          <Input
                            id="dashboard-team-form-instagram-input"
                            placeholder="username"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/^@/, "");
                              field.onChange(value || null);
                            }}
                            className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:ring-[#E93370] focus-visible:border-[#E93370] transition-all text-sm rounded-xl"
                          />
                        </div>
                      </FormControl>
                      <FormMessage
                        className="text-[#E93370] text-xs mt-1.5 ml-1"
                        id="dashboard-team-form-instagram-error"
                      />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem
                    id="dashboard-team-form-bio-field"
                    className="space-y-2.5"
                  >
                    <FormLabel
                      className="text-white/70 text-sm font-medium ml-1"
                      htmlFor="dashboard-team-form-bio-textarea"
                    >
                      Biography
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="dashboard-team-form-bio-textarea"
                        placeholder="Enter a brief biography about this team member..."
                        {...field}
                        value={field.value || ""}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[140px] hover:border-white/20 focus-visible:ring-[#E93370] focus-visible:border-[#E93370] transition-all resize-none px-5 py-4 leading-relaxed text-sm rounded-xl"
                      />
                    </FormControl>
                    <FormMessage
                      className="text-[#E93370] text-xs mt-1.5 ml-1"
                      id="dashboard-team-form-bio-error"
                    />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Photo Link Field */}
                <FormField
                  control={form.control}
                  name="photo_url_link"
                  render={({ field }) => (
                    <FormItem
                      id="dashboard-team-form-photo-link-field"
                      className="space-y-2.5"
                    >
                      <FormLabel
                        className="text-white/70 text-sm font-medium ml-1"
                        htmlFor="dashboard-team-form-photo-link-input"
                      >
                        Photo Link (URL)
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="dashboard-team-form-photo-link-input"
                          placeholder="https://example.com/photo.jpg"
                          {...field}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:border-white/20 focus-visible:ring-[#E93370] focus-visible:border-[#E93370] transition-all px-5 text-sm rounded-xl"
                        />
                      </FormControl>
                      <FormMessage
                        className="text-[#E93370] text-xs mt-1.5 ml-1"
                        id="dashboard-team-form-photo-link-error"
                      />
                    </FormItem>
                  )}
                />

                {/* Avatar File Field */}
                <FormField
                  control={form.control}
                  name="avatar_file"
                  render={({ field: { onChange, value: _value, ...field } }) => (
                    <FormItem
                      id="dashboard-team-form-avatar-field"
                      className="space-y-2.5"
                    >
                      <FormLabel
                        className="text-white/70 text-sm font-medium ml-1"
                        htmlFor="dashboard-team-form-avatar-input"
                      >
                        Profile Photo Upload
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="flex-1 w-full">
                              <Input
                                accept="image/*"
                                className="hidden"
                                id="team-avatar-upload"
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files
                                    ? e.target.files[0]
                                    : null;
                                  onChange(file);
                                  if (file) {
                                    form.setValue("is_photo_removed", false);
                                  }
                                }}
                                {...field}
                              />
                              <label
                                htmlFor="team-avatar-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#E93370]/50 hover:bg-white/5 transition-all text-center p-4 group"
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <div className="w-10 h-10 mb-2 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#E93370]/10 transition-colors">
                                    <svg
                                      className="w-5 h-5 text-white/40 group-hover:text-[#E93370] transition-colors"
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
                                  </div>
                                  <p className="text-xs font-medium text-white/60">
                                    Click to upload photo
                                  </p>
                                </div>
                              </label>
                            </div>

                            {((defaultValues?.avatar_url && !form.watch("is_photo_removed")) || form.watch("avatar_file")) && (
                              <div className="flex flex-col items-center gap-2 bg-white/5 rounded-xl p-3 border border-white/10 shrink-0">
                                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-[#E93370]/30 bg-[#0a0a0a] shadow-lg">
                                  {form.watch("avatar_file") ? (
                                    <img
                                      src={URL.createObjectURL(form.watch("avatar_file"))}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src={defaultValues?.avatar_url || ""}
                                      alt="Current"
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-7 px-2 text-[10px] text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors uppercase font-bold tracking-wider"
                                  onClick={() => {
                                    form.setValue("is_photo_removed", true);
                                    form.setValue("avatar_file", null);
                                    form.setValue("photo_url_link", "");
                                    form.trigger();
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[#E93370] text-xs mt-1.5 ml-1" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex justify-end space-x-4 px-8 py-8 bg-[#0a0a0a] border-t border-white/10 rounded-b-xl sticky bottom-0 z-20"
          id="dashboard-team-form-actions"
        >
          <Button
            className="h-12 px-8 text-white/60 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all rounded-xl font-medium"
            disabled={isSubmitting}
            id="dashboard-team-form-cancel-button"
            size="lg"
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="h-12 px-10 bg-[#E93370] hover:bg-[#E93370]/90 text-white font-bold transition-all shadow-[0_0_20px_rgba(233,51,112,0.3)] hover:shadow-[0_0_25px_rgba(233,51,112,0.5)] rounded-xl"
            disabled={isSubmitting}
            id="dashboard-team-form-submit-button"
            size="lg"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  id="dashboard-team-form-submit-spinner"
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
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
