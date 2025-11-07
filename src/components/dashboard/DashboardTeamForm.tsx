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
import { TeamMember } from '../../contexts/ContentContext';

const teamFormSchema = z.object({
  name: z.string().min(1, 'Team member name is required'),
  title: z.string().min(1, 'Title is required'),
  email: z.string().email('Email must be a valid email address'),
  bio: z.string().optional().nullable(),
  avatar_file: z.any().optional(),
  social_links: z.record(z.string()).optional().nullable(),
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
      social_links: defaultValues.social_links || {},
    };
  };

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when defaultValues changes (switching between create/edit modes)
  useEffect(() => {
    form.reset(getDefaultValues());
  }, [defaultValues?.id]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title/Role *</FormLabel>
              <FormControl>
                <Input placeholder="CEO & Founder" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio Field */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief biography or description"
                  className="resize-none h-24"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>Optional biographical information about the team member</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Avatar Upload Field */}
        <FormField
          control={form.control}
          name="avatar_file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Avatar Image</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                    disabled={isSubmitting}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                JPG, PNG, WebP, or GIF format. Max 10MB. {defaultValues?.avatar_url && 'Upload a new image to replace the current one.'}
              </FormDescription>
              {defaultValues?.avatar_url && (
                <div className="mt-2 text-sm text-white/60">
                  Current avatar: {defaultValues.avatar_url.split('/').pop()}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : defaultValues?.id ? 'Update' : 'Add'} Team Member
          </Button>
        </div>
      </form>
    </Form>
  );
}

