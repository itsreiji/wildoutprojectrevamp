/**
 * Storage Helpers Module
 *
 * Utilities for managing Supabase Storage assets associated with events.
 *
 * Storage Structure:
 * - Bucket: event-media
 * - Path format: {timestamp}-{random}-{filename}
 * - Unique naming prevents collisions and allows concurrent uploads
 * - Public URLs are stored in event.metadata.featured_image and event.metadata.gallery_images
 *
 * Asset Cleanup:
 * - Called when events are deleted
 * - Extracts filenames from public URLs (last path segment)
 * - Removes files in batch from Supabase Storage
 * - Non-fatal failures are logged but don't block deletion
 *
 * Image Requirements:
 * - Supported formats: JPEG, PNG, WebP, GIF
 * - Maximum size: 10MB per file (enforced client-side in DashboardEvents)
 * - Featured image: Single required file for event display
 * - Gallery images: Multiple optional files for event details page
 */

import { supabaseClient } from '@/supabase/client';

/**
 * Clean up storage assets associated with an event
 * Removes featured image and gallery images from Supabase Storage.
 * This is called during event deletion to free up storage space.
 *
 * @param eventMetadata - Event metadata object containing featured_image and gallery_images URLs
 * @returns Promise that resolves when cleanup is complete
 *
 * @example
 * ```ts
 * const metadata = {
 *   featured_image: 'https://.../{bucket}/event-media/1234-abc-photo.jpg',
 *   gallery_images: ['https://.../{bucket}/event-media/5678-def-photo.jpg']
 * };
 * await cleanupEventAssets(metadata);
 * ```
 */
export async function cleanupEventAssets(eventMetadata: any): Promise<void> {
  if (!eventMetadata) return;

  const filesToDelete: string[] = [];

  // Collect featured image filename
  if (eventMetadata.featured_image) {
    const fileName = eventMetadata.featured_image.split('/').pop();
    if (fileName) filesToDelete.push(fileName);
  }

  // Collect gallery image filenames
  if (eventMetadata.gallery_images && Array.isArray(eventMetadata.gallery_images)) {
    eventMetadata.gallery_images.forEach((imageUrl: string) => {
      const fileName = imageUrl.split('/').pop();
      if (fileName) filesToDelete.push(fileName);
    });
  }

  if (filesToDelete.length === 0) return;

  try {
    const { error } = await supabaseClient.storage
      .from('event-media')
      .remove(filesToDelete);

    if (error) {
      console.error('Error deleting storage files:', error);
      // Non-fatal error - log but don't throw
    }
  } catch (error) {
    console.error('Unexpected error during storage cleanup:', error);
    // Non-fatal error
  }
}

/**
 * Get metadata from an event
 * @param eventId - Event ID
 * @returns Event metadata or null if not found
 */
export async function getEventMetadata(eventId: string): Promise<any | null> {
  try {
    const { data, error } = await supabaseClient
      .from('events')
      .select('metadata')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event metadata:', error);
      return null;
    }

    return data?.metadata || null;
  } catch (error) {
    console.error('Unexpected error fetching event metadata:', error);
    return null;
  }
}

/**
 * Validate that all URLs in metadata are still accessible
 * This is useful for detecting orphaned storage references
 * @param eventMetadata - Event metadata object
 * @returns Promise resolving to array of inaccessible URLs
 */
export async function validateMetadataUrls(eventMetadata: any): Promise<string[]> {
  if (!eventMetadata) return [];

  const urls: string[] = [];
  if (eventMetadata.featured_image) urls.push(eventMetadata.featured_image);
  if (eventMetadata.gallery_images && Array.isArray(eventMetadata.gallery_images)) {
    urls.push(...eventMetadata.gallery_images);
  }

  const inaccessibleUrls: string[] = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      if (response.status === 404) {
        inaccessibleUrls.push(url);
      }
    } catch (error) {
      // Network errors are not considered inaccessible
      console.warn('Could not validate URL:', url, error);
    }
  }

  return inaccessibleUrls;
}

/**
 * Clean up storage assets for team members
 * Removes avatar photos from Supabase Storage when team members are deleted or avatars are replaced.
 *
 * @param photoUrl - Team member photo URL to delete
 * @param bucket - Storage bucket name (default: 'event-media')
 * @returns Promise that resolves when cleanup is complete
 *
 * @example
 * ```ts
 * await cleanupTeamMemberAsset('https://.../event-media/1234-abc-avatar.jpg');
 * ```
 */
export async function cleanupTeamMemberAsset(photoUrl: string | null | undefined, bucket: string = 'event-media'): Promise<void> {
  if (!photoUrl) return;

  try {
    const fileName = photoUrl.split('/').pop();
    if (!fileName) return;

    const { error } = await supabaseClient.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting team member asset:', error);
      // Non-fatal error - log but don't throw
    }
  } catch (error) {
    console.error('Unexpected error during team member asset cleanup:', error);
    // Non-fatal error
  }
}

/**
 * Clean up storage assets for partners
 * Removes partner logos from Supabase Storage when partners are deleted or logos are replaced.
 *
 * @param logoUrl - Partner logo URL to delete
 * @param bucket - Storage bucket name (default: 'event-media')
 * @returns Promise that resolves when cleanup is complete
 *
 * @example
 * ```ts
 * await cleanupPartnerAsset('https://.../event-media/5678-def-logo.png');
 * ```
 */
export async function cleanupPartnerAsset(logoUrl: string | null | undefined, bucket: string = 'event-media'): Promise<void> {
  if (!logoUrl) return;

  try {
    const fileName = logoUrl.split('/').pop();
    if (!fileName) return;

    const { error } = await supabaseClient.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting partner asset:', error);
      // Non-fatal error - log but don't throw
    }
  } catch (error) {
    console.error('Unexpected error during partner asset cleanup:', error);
    // Non-fatal error
  }
}

/**
 * Clean up storage assets for gallery items
 * Removes gallery images from Supabase Storage when items are deleted.
 * Handles batch deletion of multiple files efficiently.
 *
 * @param imageUrl - Gallery image URL to delete (or array of URLs)
 * @param bucket - Storage bucket name (default: 'event-media')
 * @returns Promise that resolves when cleanup is complete
 *
 * @example
 * ```ts
 * await cleanupGalleryAsset('https://.../event-media/9999-xyz-photo.jpg');
 * await cleanupGalleryAsset(['https://.../{bucket}/event-media/1.jpg', 'https://.../{bucket}/event-media/2.jpg']);
 * ```
 */
export async function cleanupGalleryAsset(imageUrl: string | string[] | null | undefined, bucket: string = 'event-media'): Promise<void> {
  if (!imageUrl) return;

  const urls = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
  const filesToDelete: string[] = [];

  for (const url of urls) {
    const fileName = url?.split('/').pop();
    if (fileName) filesToDelete.push(fileName);
  }

  if (filesToDelete.length === 0) return;

  try {
    const { error } = await supabaseClient.storage
      .from(bucket)
      .remove(filesToDelete);

    if (error) {
      console.error('Error deleting gallery assets:', error);
      // Non-fatal error - log but don't throw
    }
  } catch (error) {
    console.error('Unexpected error during gallery asset cleanup:', error);
    // Non-fatal error
  }
}

