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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import type { Partner } from '@/types/content';

const partnerFormSchema = z.object({
  name: z.string().min(1, 'Partner name is required'),
  sponsorship_level: z.enum(['bronze', 'silver', 'gold', 'platinum'] as const).default('bronze'),
  website_url: z.string().url('Website URL must be a valid URL').optional().nullable(),
  description: z.string().optional().nullable(),
  contact_email: z.string().email('Contact email must be valid').optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  logo_file: z.any().optional(),
  social_links: z.record(z.string(), z.string().nullable()).optional().nullable(),
});

export type PartnerFormValues = z.infer<typeof partnerFormSchema>;

interface DashboardPartnerFormProps {
  onSubmit: (values: PartnerFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<Partner>;
  onCancel?: () => void;
}

export function DashboardPartnerForm({ onSubmit, isSubmitting, defaultValues, onCancel }: DashboardPartnerFormProps) {
  const getDefaultValues = (): PartnerFormValues => {
    if (!defaultValues) {
      return {
        name: '',
        sponsorship_level: 'bronze',
        website_url: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        featured: false,
        social_links: {},
      };
    }

    return {
      name: defaultValues.name || '',
      sponsorship_level: (defaultValues as any).sponsorship_level || 'bronze',
      website_url: defaultValues.website_url || '',
      description: defaultValues.description || '',
      contact_email: defaultValues.contact_email || '',
      contact_phone: defaultValues.contact_phone || '',
      featured: defaultValues.featured || false,
      social_links: defaultValues.social_links || {},
    };
  };

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema) as Resolver<PartnerFormValues>,
    defaultValues: getDefaultValues(),
  });

  // Reset form when defaultValues changes (switching between create/edit modes)
  useEffect(() => {
    form.reset(getDefaultValues());
  }, [defaultValues?.id]);

  return (
    <Form {...form}>
      <form id="admin-partner-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem id="admin-partner-form-name-field">
              <FormLabel htmlFor="admin-partner-form-name-input">Partner Name *</FormLabel>
              <FormControl>
                <Input
                  id="admin-partner-form-name-input"
                  placeholder="e.g., Red Bull, Spotify"
                  {...field}
                />
              </FormControl>
              <FormMessage id="admin-partner-form-name-error" />
            </FormItem>
          )}
        />

        {/* Sponsorship Level Field */}
        <FormField
          control={form.control}
          name="sponsorship_level"
          render={({ field }) => (
            <FormItem id="admin-partner-form-level-field">
              <FormLabel htmlFor="admin-partner-form-level-select">Sponsorship Level *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="admin-partner-form-level-select">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem id="admin-partner-form-level-select-bronze" value="bronze">Bronze</SelectItem>
                  <SelectItem id="admin-partner-form-level-select-silver" value="silver">Silver</SelectItem>
                  <SelectItem id="admin-partner-form-level-select-gold" value="gold">Gold</SelectItem>
                  <SelectItem id="admin-partner-form-level-select-platinum" value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription id="admin-partner-form-level-description">Tier determines visibility and placement priority</FormDescription>
              <FormMessage id="admin-partner-form-level-error" />
            </FormItem>
          )}
        />

        {/* Website URL Field */}
        <FormField
          control={form.control}
          name="website_url"
          render={({ field }) => (
            <FormItem id="admin-partner-form-website-field">
              <FormLabel htmlFor="admin-partner-form-website-input">Website URL</FormLabel>
              <FormControl>
                <Input
                  id="admin-partner-form-website-input"
                  type="url"
                  placeholder="https://example.com"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription id="admin-partner-form-website-description">Partner website URL for reference</FormDescription>
              <FormMessage id="admin-partner-form-website-error" />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem id="admin-partner-form-description-field">
              <FormLabel htmlFor="admin-partner-form-description-textarea">Description</FormLabel>
              <FormControl>
                <Textarea
                  id="admin-partner-form-description-textarea"
                  placeholder="Brief description of the partnership"
                  className="resize-none h-20"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription id="admin-partner-form-description-description">Optional description of the partnership</FormDescription>
              <FormMessage id="admin-partner-form-description-error" />
            </FormItem>
          )}
        />

        {/* Contact Email Field */}
        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem id="admin-partner-form-email-field">
              <FormLabel htmlFor="admin-partner-form-email-input">Contact Email</FormLabel>
              <FormControl>
                <Input
                  id="admin-partner-form-email-input"
                  type="email"
                  placeholder="contact@partner.com"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage id="admin-partner-form-email-error" />
            </FormItem>
          )}
        />

        {/* Contact Phone Field */}
        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem id="admin-partner-form-phone-field">
              <FormLabel htmlFor="admin-partner-form-phone-input">Contact Phone</FormLabel>
              <FormControl>
                <Input
                  id="admin-partner-form-phone-input"
                  placeholder="+62 812 3456 7890"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage id="admin-partner-form-phone-error" />
            </FormItem>
          )}
        />

        {/* Logo Upload Field */}
        <FormField
          control={form.control}
          name="logo_file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem id="admin-partner-form-logo-field">
              <FormLabel htmlFor="admin-partner-form-logo-input">Partner Logo</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    id="admin-partner-form-logo-input"
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
              <FormDescription id="admin-partner-form-logo-description">
                JPG, PNG, WebP, or GIF format. Max 10MB. {defaultValues?.logo_url && 'Upload a new logo to replace the current one.'}
              </FormDescription>
              {defaultValues?.logo_url && (
                <div id="admin-partner-form-logo-current" className="mt-2 text-sm text-white/60">
                  Current logo: {defaultValues.logo_url.split('/').pop()}
                </div>
              )}
              <FormMessage id="admin-partner-form-logo-error" />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div id="admin-partner-form-actions" className="flex gap-2 justify-end pt-4">
          <Button
            id="admin-partner-form-cancel-button"
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            id="admin-partner-form-submit-button"
            type="submit"
            className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : defaultValues?.id ? 'Update' : 'Add'} Partner
          </Button>
        </div>
      </form>
    </Form>
  );
}

