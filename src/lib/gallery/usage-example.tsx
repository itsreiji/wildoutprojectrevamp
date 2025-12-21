/**
 * Gallery System Usage Examples
 *
 * This file provides practical examples of how to use the new Supabase Storage-based
 * gallery management system in your application.
 */

import { galleryStorageService } from './storage-service';
import {
  useGalleryItems,
  useUploadGallery,
  useDeleteGallery,
  useGalleryManager
} from './gallery-hooks';
import { EnhancedGalleryManager } from '@/components/gallery/EnhancedGalleryManager';
import { supabaseClient } from '@/supabase/client';

// ==================== BASIC USAGE ====================

/**
 * Example 1: Upload a single file
 */
export async function exampleUploadSingleFile() {
  // Get authenticated user
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return;
  }

  // Create a file input or get file from somewhere
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';

  fileInput.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const result = await galleryStorageService.uploadFile(file, user.id);
      console.log('Upload successful:', result);

      // Now create a gallery item record
      const { error } = await supabaseClient
        .from('gallery_items')
        .insert({
          title: file.name,
          image_url: '', // Use storage path instead
          storage_path: result.path,
          file_metadata: result.metadata,
          category: 'general',
          status: 'published'
        });

      if (error) {
        console.error('Failed to create gallery record:', error);
      } else {
        console.log('Gallery item created successfully');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  fileInput.click();
}

/**
 * Example 2: Get paginated gallery items
 */
export function useGalleryExample() {
  const {
    galleryItems,
    pagination,
    isLoading,
    error,
    refetch
  } = useGalleryItems({
    page: 1,
    limit: 20,
    category: 'event',
    status: 'published'
  });

  if (isLoading) return 'Loading...';
  if (error) return `Error: ${error.message}`;

  return (
    <div>
      <h2>Gallery Items ({pagination.total} total)</h2>
      {galleryItems.map(item => (
        <div key={item.id}>
          <img src={item.image_url} alt={item.title} />
          <p>{item.title}</p>
        </div>
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}

/**
 * Example 3: Upload with React Hook
 */
export function UploadComponent() {
  const uploadMutation = useUploadGallery();

  const handleUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    await uploadMutation.mutateAsync(fileArray);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
        disabled={uploadMutation.isPending}
      />
      {uploadMutation.isPending && <p>Uploading...</p>}
      {uploadMutation.error && <p>Error: {uploadMutation.error.message}</p>}
      {uploadMutation.isSuccess && <p>Upload complete!</p>}
    </div>
  );
}

/**
 * Example 4: Delete with React Hook
 */
export function DeleteButton({ itemId }: { itemId: string }) {
  const deleteMutation = useDeleteGallery();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteMutation.mutateAsync(itemId);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
      className="bg-red-600 text-white px-4 py-2 rounded"
    >
      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}

/**
 * Example 5: All-in-one Gallery Manager
 */
export function GalleryManagementPage() {
  const {
    items,
    stats,
    isLoading,
    upload,
    delete: deleteItem,
    refresh
  } = useGalleryManager();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Gallery Management</h1>

      {/* Stats */}
      {stats && (
        <div className="stats">
          <p>Total Files: {stats.totalFiles}</p>
          <p>Total Size: {(stats.totalSize / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      {/* Upload */}
      <input
        type="file"
        multiple
        onChange={async (e) => {
          if (e.target.files) {
            const fileArray = Array.from(e.target.files);
            await upload(fileArray);
            refresh();
          }
        }}
      />

      {/* Gallery Grid */}
      <div className="grid">
        {items.map(item => (
          <div key={item.id} className="gallery-item">
            <img src={item.image_url} alt={item.title} />
            <h3>{item.title}</h3>
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 6: Using the Enhanced Gallery Manager Component
 */
export function CompleteGalleryPage() {
  return (
    <div className="container">
      <h1>My Gallery</h1>

      {/* The complete gallery management system */}
      <EnhancedGalleryManager />
    </div>
  );
}

/**
 * Example 7: Direct service usage (without hooks)
 */
export async function directServiceUsage() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  // Upload
  const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  Object.defineProperty(file, 'size', { value: 100000 });

  const uploadResult = await galleryStorageService.uploadFile(file, user.id);
  console.log('Uploaded:', uploadResult.path);

  // Get items
  const items = await galleryStorageService.getGalleryItems({
    page: 1,
    limit: 10,
    category: 'general'
  });
  console.log('Items:', items.data);

  // Get stats
  const stats = await galleryStorageService.getStorageStats();
  console.log('Stats:', stats);

  // Check consistency
  const issues = await galleryStorageService.checkConsistency();
  console.log('Issues:', issues);
}

/**
 * Example 8: Bulk operations
 */
export async function bulkOperationsExample() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  // Multiple files
  const files = [
    new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
    new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' }),
  ];

  // Bulk upload
  const uploadResults = await galleryStorageService.bulkUpload(files, user.id);
  console.log('Upload results:', uploadResults);

  // Get gallery items to delete
  const { data: items } = await supabaseClient
    .from('gallery_items')
    .select('id')
    .limit(5);

  if (items) {
    const itemIds = items.map(item => item.id);
    const deleteResults = await galleryStorageService.bulkDelete(itemIds);
    console.log('Delete results:', deleteResults);
  }
}

/**
 * Example 9: Error handling
 */
export async function errorHandlingExample() {
  try {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 100000 });

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const result = await galleryStorageService.uploadFile(file, user.id);
    console.log('Success:', result);

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      console.error('Validation failed:', error.message);
      console.error('Details:', error.details);
    } else if (error.name === 'UploadError') {
      console.error('Upload failed:', error.message);
      console.error('Details:', error.details);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example 10: Real-time updates with Supabase subscriptions
 */
export function realTimeGalleryUpdates() {
  const channel = supabaseClient
    .channel('gallery-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'gallery_items'
    }, (payload) => {
      console.log('Gallery changed:', payload);
      // Refresh your UI here
    })
    .subscribe();

  return () => {
    supabaseClient.removeChannel(channel);
  };
}

// ==================== INTEGRATION GUIDE ====================

/**
 * Step-by-step integration guide
 */
export const integrationGuide = {
  step1: `
    // 1. Install dependencies (if needed)
    pnpm install @supabase/supabase-js @tanstack/react-query sonner lucide-react
  `,

  step2: `
    // 2. Run the migration
    // The migration file is at: supabase/migrations/20251221_gallery_storage_migration.sql
    // Apply it via Supabase dashboard or CLI
  `,

  step3: `
    // 3. Update your .env file
    SUPABASE_URL=your-project-url
    SUPABASE_ANON_KEY=your-anon-key
  `,

  step4: `
    // 4. Use in your components
    import { EnhancedGalleryManager } from '@/components/gallery/EnhancedGalleryManager';

    function MyPage() {
      return <EnhancedGalleryManager />;
    }
  `,

  step5: `
    // 5. Or use hooks for custom UI
    import { useGalleryItems, useUploadGallery } from '@/lib/gallery/gallery-hooks';

    function CustomGallery() {
      const { galleryItems } = useGalleryItems({ page: 1, limit: 20 });
      const upload = useUploadGallery();
      // ... build your custom UI
    }
  `
};

// Export everything
export default {
  exampleUploadSingleFile,
  useGalleryExample,
  UploadComponent,
  DeleteButton,
  GalleryManagementPage,
  CompleteGalleryPage,
  directServiceUsage,
  bulkOperationsExample,
  errorHandlingExample,
  realTimeGalleryUpdates,
  integrationGuide
};