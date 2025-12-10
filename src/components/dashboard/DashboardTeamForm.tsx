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

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
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
import type { TeamMember } from '@/types/content';

const teamFormSchema = z.object({
  name: z.string().min(1, 'Team member name is required'),
  title: z.string().min(1, 'Title is required'),
  email: z.string().email('Email must be a valid email address'),
  bio: z.string().optional().nullable(),
  avatar_file: z.any().optional(),
  social_links: z.record(z.string(), z.string().nullable()).optional().nullable(),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;

interface DashboardTeamFormProps {
  onSubmit: (values: TeamFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<TeamMember>;
  onCancel?: () => void;
}

export function DashboardTeamForm({ onSubmit, isSubmitting, defaultValues, onCancel }: DashboardTeamFormProps) {
  const getDefaultValues = (): TeamFormValues => {
    if (!defaultValues) {
      return {
        name: '',
        title: '',
        email: '',
        bio: '',
        social_links: {},
      };
    }

    return {
      name: defaultValues.name || '',
      title: defaultValues.title || '',
      email: defaultValues.email || '',
      bio: defaultValues.bio || '',
      social_links: (defaultValues.social_links as Record<string, string | null>) || {},
    };
  };

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema) as Resolver<TeamFormValues>,
    defaultValues: getDefaultValues(),
  });

  // Reset form when defaultValues changes (switching between create/edit modes)
  useEffect(() => {
    form.reset(getDefaultValues());
  }, [defaultValues?.id]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Title/Role *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="CEO & Founder"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Instagram Field */}
          <FormField
            control={form.control}
            name="social_links.instagram"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Instagram</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">@</span>
                    </div>
                    <Input
                      type="text"
                      placeholder="username"
                      className="pl-8 w-full"
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/^@/, '');
                        field.onChange(value || null);
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Optional Instagram username (without @)
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Bio Field - Full width */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief biography or description"
                  className="resize-none h-32 w-full"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Optional biographical information about the team member
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Avatar Upload Field */}
        <FormField
          control={form.control}
          name="avatar_file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">Avatar Image</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                    disabled={isSubmitting}
                    className="w-full"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs">
                JPG, PNG, WebP, or GIF format. Max 10MB. {defaultValues?.avatar_url && 'Upload a new image to replace the current one.'}
              </FormDescription>
              {defaultValues?.avatar_url && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Current avatar: {defaultValues.avatar_url.split('/').pop()}
                </div>
              )}
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#E93370] hover:bg-[#E93370]/90 text-white w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : defaultValues?.id ? (
              'Update Team Member'
            ) : (
              'Add Team Member'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

