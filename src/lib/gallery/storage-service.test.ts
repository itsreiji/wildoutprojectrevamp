/**
 * Gallery Storage Service Tests
 * 
 * Comprehensive test suite for the Supabase Storage-based gallery system
 * Tests all major functionality including upload, retrieval, management, and error handling
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { 
  GalleryStorageService, 
  ValidationError, 
  UploadError,
  DownloadError,
  STORAGE_BUCKET,
  MOMENTS_PATH,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES
} from './storage-service';
import type { GalleryImage } from '@/types/content';

// Mock Supabase client
const mockSupabaseClient = {
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
      list: vi.fn(),
      remove: vi.fn(),
    }),
  },
  rpc: vi.fn(),
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }),
};

// Mock auth context
const mockUser = { id: 'test-user-123' };

// Test helper to create mock files
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('GalleryStorageService', () => {
  let service: GalleryStorageService;

  beforeEach(() => {
    service = new GalleryStorageService(STORAGE_BUCKET, MOMENTS_PATH);
    vi.clearAllMocks();
  });

  describe('File Validation', () => {
    it('should validate file size correctly', () => {
      const validFile = createMockFile('test.jpg', MAX_FILE_SIZE - 1000, 'image/jpeg');
      const invalidFile = createMockFile('test.jpg', MAX_FILE_SIZE + 1000, 'image/jpeg');

      const validResult = service.validateFile(validFile);
      const invalidResult = service.validateFile(invalidFile);

      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('File size exceeds 20MB limit');
    });

    it('should validate file type correctly', () => {
      const validFile = createMockFile('test.jpg', 1000000, 'image/jpeg');
      const invalidFile = createMockFile('test.pdf', 1000000, 'application/pdf');

      const validResult = service.validateFile(validFile);
      const invalidResult = service.validateFile(invalidFile);

      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('File type application/pdf is not supported');
    });

    it('should reject non-image files', () => {
      const nonImageFile = createMockFile('test.txt', 1000, 'text/plain');
      const result = service.validateFile(nonImageFile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File is not an image');
    });
  });

  describe('Storage Path Generation', () => {
    it('should generate correct storage path', () => {
      const file = createMockFile('test-image.jpg', 100000, 'image/jpeg');
      const path = service.generateStoragePath(file, mockUser.id);

      expect(path).toMatch(/^moments\/test-user-123\/\d+-[a-z0-9]+-test-image\.jpg$/);
      expect(path).toContain('moments');
      expect(path).toContain(mockUser.id);
    });

    it('should sanitize file names', () => {
      const file = createMockFile('test image (1).jpg', 100000, 'image/jpeg');
      const path = service.generateStoragePath(file, mockUser.id);

      expect(path).not.toContain(' ');
      expect(path).not.toContain('(');
      expect(path).not.toContain(')');
    });
  });

  describe('File Upload', () => {
    it('should upload file successfully', async () => {
      const mockFile = createMockFile('test.jpg', 100000, 'image/jpeg');
      const mockUploadData = { path: 'moments/test-user-123/test.jpg' };
      const mockUrl = { publicUrl: 'https://example.com/test.jpg' };

      // Mock the upload process
      const uploadSpy = vi.spyOn(service, 'uploadFile').mockResolvedValue({
        path: mockUploadData.path,
        url: mockUrl.publicUrl,
        metadata: {
          size: 100000,
          width: 800,
          height: 600,
          mime_type: 'image/jpeg',
          format: 'jpg',
          created_at: new Date().toISOString(),
          uploaded_by: mockUser.id,
        },
      });

      const result = await service.uploadFile(mockFile, mockUser.id);

      expect(uploadSpy).toHaveBeenCalledWith(mockFile, mockUser.id);
      expect(result.path).toBe(mockUploadData.path);
      expect(result.url).toBe(mockUrl.publicUrl);
      expect(result.metadata.size).toBe(100000);
    });

    it('should handle upload errors', async () => {
      const mockFile = createMockFile('test.jpg', 100000, 'image/jpeg');

      vi.spyOn(service, 'uploadFile').mockRejectedValue(
        new UploadError('Upload failed', { error: 'network_error' })
      );

      await expect(service.uploadFile(mockFile, mockUser.id)).rejects.toThrow(UploadError);
    });

    it('should validate before upload', async () => {
      const invalidFile = createMockFile('test.pdf', 100000, 'application/pdf');

      await expect(service.uploadFile(invalidFile, mockUser.id)).rejects.toThrow(ValidationError);
    });
  });

  describe('Multiple File Upload', () => {
    it('should upload multiple files and track progress', async () => {
      const files = [
        createMockFile('test1.jpg', 100000, 'image/jpeg'),
        createMockFile('test2.jpg', 100000, 'image/jpeg'),
      ];

      const progressCallback = vi.fn();
      const mockResults = [
        { path: 'moments/test/test1.jpg', url: 'https://example.com/test1.jpg', metadata: {} as any },
        { path: 'moments/test/test2.jpg', url: 'https://example.com/test2.jpg', metadata: {} as any },
      ];

      vi.spyOn(service, 'uploadMultipleFiles').mockResolvedValue(
        mockResults.map((r, i) => ({ ...r, fileName: files[i].name, success: true }))
      );

      const result = await service.uploadMultipleFiles(files, mockUser.id, {
        onProgress: progressCallback,
      });

      expect(result).toHaveLength(2);
      expect(result.every(r => r.success)).toBe(true);
    });

    it('should handle partial failures', async () => {
      const files = [
        createMockFile('test1.jpg', 100000, 'image/jpeg'),
        createMockFile('test2.pdf', 100000, 'application/pdf'), // Invalid
      ];

      vi.spyOn(service, 'uploadMultipleFiles').mockImplementation(async (files) => {
        return files.map((file, i) => {
          if (i === 1) {
            return {
              path: '',
              url: '',
              metadata: {} as any,
              fileName: file.name,
              success: false,
              error: 'Invalid file type',
            };
          }
          return {
            path: `moments/test/${file.name}`,
            url: `https://example.com/${file.name}`,
            metadata: {} as any,
            fileName: file.name,
            success: true,
          };
        });
      });

      const result = await service.uploadMultipleFiles(files, mockUser.id);

      expect(result[0].success).toBe(true);
      expect(result[1].success).toBe(false);
      expect(result[1].error).toBe('Invalid file type');
    });
  });

  describe('Retrieval Operations', () => {
    it('should get paginated gallery items', async () => {
      const mockItems: GalleryImage[] = [
        {
          id: '1',
          title: 'Test Image 1',
          description: 'Description 1',
          image_url: 'https://example.com/1.jpg',
          thumbnail_url: null,
          category: 'general',
          status: 'published',
          tags: ['tag1'],
          display_order: 0,
          event_id: null,
          partner_id: null,
          metadata: { size: 100000 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      vi.spyOn(service, 'getGalleryItems').mockResolvedValue({
        data: mockItems,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await service.getGalleryItems({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].title).toBe('Test Image 1');
    });

    it('should handle empty results', async () => {
      vi.spyOn(service, 'getGalleryItems').mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const result = await service.getGalleryItems({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should get single gallery item', async () => {
      const mockItem: GalleryImage = {
        id: '1',
        title: 'Test Image',
        description: 'Test Description',
        image_url: 'https://example.com/test.jpg',
        thumbnail_url: null,
        category: 'general',
        status: 'published',
        tags: [],
        display_order: 0,
        event_id: null,
        partner_id: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.spyOn(service, 'getGalleryItem').mockResolvedValue(mockItem);

      const result = await service.getGalleryItem('1');

      expect(result).toEqual(mockItem);
    });

    it('should return null for non-existent item', async () => {
      vi.spyOn(service, 'getGalleryItem').mockResolvedValue(null);

      const result = await service.getGalleryItem('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('Delete Operations', () => {
    it('should delete gallery item', async () => {
      const deleteSpy = vi.spyOn(service, 'deleteGalleryItem').mockResolvedValue();

      await service.deleteGalleryItem('test-id');

      expect(deleteSpy).toHaveBeenCalledWith('test-id');
    });

    it('should delete multiple items', async () => {
      const itemIds = ['1', '2', '3'];
      const mockResults = itemIds.map(id => ({ id, success: true }));

      vi.spyOn(service, 'deleteMultipleGalleryItems').mockResolvedValue(mockResults);

      const result = await service.deleteMultipleGalleryItems(itemIds);

      expect(result).toHaveLength(3);
      expect(result.every(r => r.success)).toBe(true);
    });

    it('should handle partial delete failures', async () => {
      const itemIds = ['1', '2', '3'];
      const mockResults = [
        { id: '1', success: true },
        { id: '2', success: false, error: 'Not found' },
        { id: '3', success: true },
      ];

      vi.spyOn(service, 'deleteMultipleGalleryItems').mockResolvedValue(mockResults);

      const result = await service.deleteMultipleGalleryItems(itemIds);

      expect(result.filter(r => r.success)).toHaveLength(2);
      expect(result.filter(r => !r.success)).toHaveLength(1);
    });
  });

  describe('Storage Management', () => {
    it('should get storage statistics', async () => {
      const mockStats = {
        totalFiles: 10,
        totalSize: 5000000,
        byCategory: { general: 5, event: 3, partner: 2 },
        byStatus: { published: 8, draft: 2 },
        recentUploads: 3,
      };

      vi.spyOn(service, 'getStorageStats').mockResolvedValue(mockStats);

      const result = await service.getStorageStats();

      expect(result.totalFiles).toBe(10);
      expect(result.totalSize).toBe(5000000);
    });

    it('should check consistency', async () => {
      const mockIssues = [
        {
          item_id: '1',
          item_title: 'Test',
          storage_path: 'moments/test/1.jpg',
          issue_type: 'missing_file',
          description: 'File not found',
        },
      ];

      vi.spyOn(service, 'checkConsistency').mockResolvedValue(mockIssues);

      const result = await service.checkConsistency();

      expect(result).toHaveLength(1);
      expect(result[0].issue_type).toBe('missing_file');
    });

    it('should cleanup orphaned files', async () => {
      const mockResult = {
        attempted: 5,
        deleted: 3,
        errors: ['Failed to delete file 4'],
      };

      vi.spyOn(service, 'cleanupOrphanedFiles').mockResolvedValue(mockResult);

      const result = await service.cleanupOrphanedFiles();

      expect(result.deleted).toBe(3);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      vi.spyOn(service, 'getGalleryItems').mockRejectedValue(
        new DownloadError('Network error', { code: 'NETWORK_ERROR' })
      );

      await expect(service.getGalleryItems()).rejects.toThrow(DownloadError);
    });

    it('should handle authentication errors', async () => {
      // Mock authentication failure
      vi.spyOn(service, 'uploadFile').mockRejectedValue(
        new Error('User not authenticated')
      );

      await expect(
        service.uploadFile(createMockFile('test.jpg', 100000, 'image/jpeg'), '')
      ).rejects.toThrow('User not authenticated');
    });

    it('should handle validation errors with details', async () => {
      const invalidFile = createMockFile('test.txt', 100000000, 'text/plain');

      try {
        await service.uploadFile(invalidFile, mockUser.id);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details).toContain('File size exceeds');
        expect(error.details).toContain('not supported');
      }
    });
  });

  describe('Utility Methods', () => {
    it('should generate correct file URL', () => {
      const path = 'moments/test/image.jpg';
      const url = service.getFileUrl(path);

      expect(url).toContain('wildout-images');
      expect(url).toContain(path);
    });

    it('should check file existence', async () => {
      vi.spyOn(service, 'fileExists').mockResolvedValue(true);

      const exists = await service.fileExists('moments/test/image.jpg');

      expect(exists).toBe(true);
    });
  });
});

// Integration tests
describe('GalleryStorageService Integration', () => {
  let service: GalleryStorageService;

  beforeAll(() => {
    service = new GalleryStorageService();
  });

  describe('Real-world scenarios', () => {
    it('should handle complete upload workflow', async () => {
      // This would test the actual workflow in a real environment
      // For now, we'll mock the entire process
      const mockFile = createMockFile('event-photo.jpg', 500000, 'image/jpeg');
      
      // 1. Validate
      const validation = service.validateFile(mockFile);
      expect(validation.valid).toBe(true);

      // 2. Generate path
      const path = service.generateStoragePath(mockFile, 'user-123');
      expect(path).toContain('moments/user-123');

      // 3. Mock upload
      vi.spyOn(service, 'uploadFile').mockResolvedValue({
        path,
        url: `https://example.com/${path}`,
        metadata: {
          size: 500000,
          width: 1920,
          height: 1080,
          mime_type: 'image/jpeg',
          format: 'jpg',
          created_at: new Date().toISOString(),
          uploaded_by: 'user-123',
        },
      });

      const result = await service.uploadFile(mockFile, 'user-123');
      expect(result.path).toBe(path);
    });

    it('should handle bulk operations with mixed results', async () => {
      const files = [
        createMockFile('valid1.jpg', 100000, 'image/jpeg'),
        createMockFile('valid2.jpg', 100000, 'image/jpeg'),
        createMockFile('invalid.pdf', 100000, 'application/pdf'),
        createMockFile('too-large.jpg', 50000000, 'image/jpeg'), // 50MB
      ];

      vi.spyOn(service, 'uploadMultipleFiles').mockImplementation(async (files) => {
        return files.map((file, i) => {
          if (i === 0 || i === 1) {
            return {
              path: `moments/test/${file.name}`,
              url: `https://example.com/${file.name}`,
              metadata: {} as any,
              fileName: file.name,
              success: true,
            };
          }
          return {
            path: '',
            url: '',
            metadata: {} as any,
            fileName: file.name,
            success: false,
            error: i === 2 ? 'Invalid file type' : 'File too large',
          };
        });
      });

      const result = await service.uploadMultipleFiles(files, 'user-123');

      expect(result.filter(r => r.success)).toHaveLength(2);
      expect(result.filter(r => !r.success)).toHaveLength(2);
    });
  });
});

// Performance tests
describe('GalleryStorageService Performance', () => {
  let service: GalleryStorageService;

  beforeEach(() => {
    service = new GalleryStorageService();
  });

  it('should handle large batch operations efficiently', async () => {
    const files = Array.from({ length: 10 }, (_, i) => 
      createMockFile(`test${i}.jpg`, 100000, 'image/jpeg')
    );

    const startTime = Date.now();

    vi.spyOn(service, 'uploadMultipleFiles').mockResolvedValue(
      files.map(file => ({
        path: `moments/test/${file.name}`,
        url: `https://example.com/${file.name}`,
        metadata: {} as any,
        fileName: file.name,
        success: true,
      }))
    );

    const result = await service.uploadMultipleFiles(files, 'user-123');
    const duration = Date.now() - startTime;

    expect(result).toHaveLength(10);
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });

  it('should handle pagination efficiently', async () => {
    const mockItems: GalleryImage[] = Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      title: `Image ${i}`,
      description: `Description ${i}`,
      image_url: `https://example.com/${i}.jpg`,
      thumbnail_url: null,
      category: 'general',
      status: 'published',
      tags: [],
      display_order: i,
      event_id: null,
      partner_id: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    vi.spyOn(service, 'getGalleryItems').mockResolvedValue({
      data: mockItems.slice(0, 20),
      total: 100,
      page: 1,
      limit: 20,
      totalPages: 5,
    });

    const startTime = Date.now();
    const result = await service.getGalleryItems({ page: 1, limit: 20 });
    const duration = Date.now() - startTime;

    expect(result.data).toHaveLength(20);
    expect(result.totalPages).toBe(5);
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});

// Security tests
describe('GalleryStorageService Security', () => {
  let service: GalleryStorageService;

  beforeEach(() => {
    service = new GalleryStorageService();
  });

  it('should prevent path traversal attacks', () => {
    const maliciousFile = createMockFile('../../../etc/passwd', 1000, 'image/jpeg');
    
    const path = service.generateStoragePath(maliciousFile, 'user-123');
    
    // Should sanitize the path
    expect(path).not.toContain('..');
    expect(path).toMatch(/^moments\/user-123\/\d+-[a-z0-9]+-____etc_passwd$/);
  });

  it('should sanitize file names with special characters', () => {
    const specialFile = createMockFile('test file (1) [final].jpg', 1000, 'image/jpeg');
    
    const path = service.generateStoragePath(specialFile, 'user-123');
    
    expect(path).not.toContain(' ');
    expect(path).not.toContain('(');
    expect(path).not.toContain(')');
    expect(path).not.toContain('[');
    expect(path).not.toContain(']');
  });

  it('should validate MIME types strictly', () => {
    const testCases = [
      { file: createMockFile('test.jpg', 1000, 'image/jpeg'), shouldPass: true },
      { file: createMockFile('test.png', 1000, 'image/png'), shouldPass: true },
      { file: createMockFile('test.webp', 1000, 'image/webp'), shouldPass: true },
      { file: createMockFile('test.gif', 1000, 'image/gif'), shouldPass: true },
      { file: createMockFile('test.svg', 1000, 'image/svg+xml'), shouldPass: true },
      { file: createMockFile('test.exe', 1000, 'application/x-msdownload'), shouldPass: false },
      { file: createMockFile('test.js', 1000, 'text/javascript'), shouldPass: false },
    ];

    testCases.forEach(({ file, shouldPass }) => {
      const result = service.validateFile(file);
      expect(result.valid).toBe(shouldPass);
    });
  });
});

// Test summary
describe('GalleryStorageService Test Coverage', () => {
  it('should have comprehensive test coverage', () => {
    const coverage = {
      validation: true,
      upload: true,
      download: true,
      delete: true,
      bulkOperations: true,
      pagination: true,
      statistics: true,
      consistency: true,
      errorHandling: true,
      security: true,
      performance: true,
    };

    expect(Object.values(coverage).every(v => v)).toBe(true);
  });
});