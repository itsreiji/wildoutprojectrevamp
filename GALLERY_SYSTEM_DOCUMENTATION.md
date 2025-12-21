# Gallery Management System - Supabase Storage Integration

## Overview

This document provides comprehensive documentation for the revamped Gallery Management system that utilizes Supabase Storage as the primary storage solution. The system implements secure file upload, retrieval, and management functionality for gallery images in the "wildout-images/moments" bucket.

## System Architecture

### Core Components

1. **Database Schema** (`supabase/migrations/20251221_gallery_storage_migration.sql`)
2. **Storage Service** (`src/lib/gallery/storage-service.ts`)
3. **React Hooks** (`src/lib/gallery/gallery-hooks.ts`)
4. **Frontend Components** (`src/components/gallery/EnhancedGalleryManager.tsx`)
5. **Constants & Utilities** (`src/lib/gallery/constants.ts`)
6. **Test Suite** (`src/lib/gallery/storage-service.test.ts`)

### Storage Structure

```
wildout-images/ (bucket)
└── moments/
    ├── {user_id}/
    │   ├── {timestamp}-{random}-{filename}.jpg
    │   ├── {timestamp}-{random}-{filename}_thumb.jpg (thumbnails)
    │   └── ...
    └── ...
```

## Database Schema

### Enhanced Gallery Items Table

```sql
-- Extended gallery_items table with storage integration
ALTER TABLE public.gallery_items 
ADD COLUMN storage_path TEXT,
ADD COLUMN file_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN upload_session_id UUID,
ADD COLUMN processing_status TEXT DEFAULT 'ready';
```

### Storage Audit Log

```sql
CREATE TABLE public.storage_audit_log (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    bucket_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    metadata JSONB,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Key Features

### 1. Secure File Upload

**Features:**
- File type validation (images only: JPEG, PNG, WebP, GIF, SVG)
- Size limit enforcement (20MB per file, 500MB per user)
- Automatic file name sanitization
- Path traversal attack prevention
- Progress tracking with callbacks
- Thumbnail generation support

**Validation Rules:**
```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/gif',
  'image/svg+xml'
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
```

### 2. Robust Retrieval System

**Features:**
- Paginated loading with configurable page sizes
- Search and filter capabilities
- Caching strategy with React Query
- Thumbnail generation and optimization
- Error handling for missing files
- Real-time consistency checking

**Pagination Example:**
```typescript
const { data, isLoading, error } = useGalleryItems({
  page: 1,
  limit: 20,
  category: 'event',
  status: 'published',
  searchQuery: 'wedding'
});
```

### 3. Storage Management

**Features:**
- File organization by user and timestamp
- Bulk upload/delete operations
- Usage monitoring and statistics
- Orphaned file cleanup
- Data consistency validation
- Backup/recovery procedures

**Storage Statistics:**
```typescript
const stats = await storageService.getStorageStats();
// Returns: total files, size, by category, by status, recent uploads
```

### 4. Comprehensive Error Handling

**Error Types:**
- `ValidationError` - File validation failures
- `UploadError` - Upload operation failures
- `DownloadError` - Retrieval failures
- `StorageError` - General storage operations

**Error Logging:**
All operations are logged to `storage_audit_log` with:
- User ID
- Action type
- File path
- Success/failure status
- Error messages
- IP address and user agent

## API Endpoints

### Backend API Routes

```typescript
// Upload endpoint
POST /api/gallery/upload
Body: FormData with files
Response: { results: UploadResult[] }

// Get paginated items
GET /api/gallery/items?page=1&limit=20&category=general&status=published
Response: { data: GalleryImage[], total, page, limit, totalPages }

// Get single item
GET /api/gallery/items/:id
Response: GalleryImage

// Delete item
DELETE /api/gallery/items/:id
Response: { success: true }

// Get statistics
GET /api/gallery/stats
Response: StorageStats

// Check consistency
GET /api/gallery/consistency
Response: { issues: StorageConsistencyIssue[] }
```

## Frontend Integration

### React Hooks

#### useGalleryItems
```typescript
const { 
  galleryItems, 
  pagination, 
  isLoading, 
  error,
  refetch 
} = useGalleryItems({
  page: 1,
  limit: 20,
  category: 'event'
});
```

#### useUploadGallery
```typescript
const uploadMutation = useUploadGallery();

const handleUpload = async (files: File[]) => {
  await uploadMutation.mutateAsync(files);
};
```

#### useGalleryManager (All-in-one)
```typescript
const {
  items,
  stats,
  upload,
  delete: deleteItem,
  bulkUpload,
  bulkDelete,
  checkConsistency,
  refresh
} = useGalleryManager();
```

### Enhanced Gallery Manager Component

```tsx
import { EnhancedGalleryManager } from '@/components/gallery/EnhancedGalleryManager';

function Dashboard() {
  return (
    <EnhancedGalleryManager 
      onGalleryUpdate={() => console.log('Gallery updated')}
      maxFileSize={20 * 1024 * 1024}
      allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
    />
  );
}
```

## Security Features

### 1. Authentication & Authorization
- All operations require authenticated user
- Users can only access their own files
- Service role key used for admin operations

### 2. Storage Policies
```sql
-- Allow authenticated users to upload to their folder
CREATE POLICY "Authenticated users can upload to moments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'wildout-images' AND
    auth.role() = 'authenticated' AND
    storage_path() LIKE 'moments/%' AND
    auth.uid() = owner_id
);

-- Public read access to moments folder
CREATE POLICY "Public can view moments"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'wildout-images' AND
    storage_path() LIKE 'moments/%'
);
```

### 3. File Validation
- MIME type checking
- Size limits
- File extension validation
- Path sanitization

### 4. Audit Logging
- All operations logged
- IP tracking
- User agent capture
- Session tracking

## Performance Optimization

### 1. Caching Strategy
- React Query for client-side caching
- 5-minute stale time for gallery items
- 10-minute stale time for statistics
- Automatic refetching on mutations

### 2. Pagination
- Configurable page sizes (default: 20)
- Efficient database queries
- Total count calculation in single query

### 3. Batch Operations
- Upload: 10 files per batch
- Delete: 20 items per batch
- Concurrent processing: 5 operations

### 4. Image Optimization
- Automatic AVIF detection
- Thumbnail generation
- Compression quality: 0.8
- Responsive image sizes

## Data Consistency

### Consistency Checks
The system provides functions to verify data integrity:

```typescript
// Check for issues
const issues = await storageService.checkConsistency();

// Returns:
// - Missing files (referenced in DB but not in storage)
// - Orphaned files (in storage but not referenced in DB)
// - Failed processing items
```

### Cleanup Operations
```typescript
// Remove orphaned files
const result = await storageService.cleanupOrphanedFiles();
// Returns: { attempted, deleted, errors }
```

## Monitoring & Logging

### Storage Audit Log
Every operation is logged with:
- Timestamp
- User ID
- Action type
- File path
- File size
- Success/failure
- Error details

### Statistics Tracking
```typescript
const stats = await storageService.getStorageStats();
// Tracks:
// - Total files and size
// - Distribution by category
// - Distribution by status
// - Recent uploads (24h)
```

## Migration Guide

### From Existing System

1. **Run Migration**
```bash
# Apply database migration
pnpm supabase migration up
```

2. **Update Components**
Replace existing gallery components with:
```tsx
import { EnhancedGalleryManager } from '@/components/gallery/EnhancedGalleryManager';
```

3. **Update API Calls**
Use the new storage service:
```typescript
import { galleryStorageService } from '@/lib/gallery/storage-service';
```

### Data Migration
```sql
-- Run once to migrate existing URLs to storage paths
SELECT public.migrate_existing_gallery_to_storage();
```

## Testing

### Run Tests
```bash
# Run all tests
pnpm test gallery-storage

# Run specific test suites
pnpm test gallery-storage -- --run
```

### Test Coverage
- ✅ File validation
- ✅ Upload operations
- ✅ Download operations
- ✅ Delete operations
- ✅ Bulk operations
- ✅ Pagination
- ✅ Statistics
- ✅ Consistency checks
- ✅ Error handling
- ✅ Security validation
- ✅ Performance benchmarks

## Deployment

### Environment Variables
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Configuration
1. Create bucket: `wildout-images`
2. Enable public access for `moments/` folder
3. Set file size limits: 20MB
4. Configure allowed MIME types

### Build & Deploy
```bash
# Build the project
pnpm build

# Deploy to production
pnpm deploy
```

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size limits
   - Verify MIME type
   - Check user authentication
   - Review storage audit log

2. **Permission Denied**
   - Verify RLS policies
   - Check user roles
   - Ensure bucket is public for reads

3. **Consistency Issues**
   - Run consistency check
   - Review orphaned files
   - Check database records

4. **Performance Issues**
   - Check pagination settings
   - Review cache configuration
   - Monitor storage usage

## Best Practices

### 1. File Organization
- Use descriptive file names
- Organize by user and date
- Generate thumbnails for performance
- Clean up unused files regularly

### 2. Error Handling
- Always validate before upload
- Implement retry logic
- Log all operations
- Provide user feedback

### 3. Security
- Never expose service role key
- Validate all file inputs
- Implement rate limiting
- Monitor audit logs

### 4. Performance
- Use pagination for large datasets
- Implement caching
- Generate thumbnails
- Optimize image sizes

## Future Enhancements

### Planned Features
1. **Image Processing**
   - Automatic resizing
   - Format conversion
   - Watermarking
   - EXIF data extraction

2. **Advanced Search**
   - Full-text search
   - Tag-based filtering
   - Date range queries
   - AI-powered tagging

3. **Analytics**
   - Usage patterns
   - Storage trends
   - User behavior
   - Performance metrics

4. **Integration**
   - CDN integration
   - WebP/AVIF optimization
   - Progressive loading
   - Lazy loading

## Support

For issues or questions:
1. Check the test suite for examples
2. Review the audit logs
3. Run consistency checks
4. Consult the Supabase documentation

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-21  
**Maintainer:** Development Team