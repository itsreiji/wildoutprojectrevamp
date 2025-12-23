
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SupabaseGalleryProvider, useSupabaseGallery } from '../contexts/SupabaseGalleryContext';
import * as Permissions from '../lib/gallery/permissions';

// Mock AuthContext
const mockUser = vi.hoisted(() => ({ id: 'user-123' }));
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock Supabase Client
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    delete: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
    update: vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => ({ data: {}, error: null })) })) })) })),
    insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => ({ data: {}, error: null })) })) })),
  })),
}));
vi.mock('@/supabase/client', () => ({
  supabaseClient: mockSupabase,
}));

// Mock Permissions
vi.mock('../lib/gallery/permissions', async (importOriginal) => {
  const actual = await importOriginal<typeof Permissions>();
  return {
    ...actual,
    validateItemAccess: vi.fn(),
    hasPermission: vi.fn(),
    getCurrentUserPermissions: vi.fn().mockResolvedValue({ can_upload: true }),
  };
});

// Mock Storage Service
vi.mock('@/lib/gallery/enhanced-storage-service', () => {
  return {
    EnhancedGalleryStorageService: class {
      getGalleryItems = vi.fn().mockResolvedValue({ data: [{ id: 'item-1', storage_path: 'path/to/file' }], total: 1 });
      getStorageStats = vi.fn().mockResolvedValue({});
      getStorageAnalytics = vi.fn().mockResolvedValue({});
      getStorageHealth = vi.fn().mockResolvedValue({});
      deleteStorageFile = vi.fn().mockResolvedValue(true);
      uploadMultipleFiles = vi.fn().mockResolvedValue([]);
      fileExists = vi.fn().mockResolvedValue(true);
      getFileUrl = vi.fn().mockReturnValue('http://url');
    }
  };
});

// Mock Enhanced Hooks
vi.mock('@/lib/gallery/enhanced-hooks', () => ({
  useEnhancedGalleryManager: vi.fn().mockReturnValue({
    items: [{ id: 'item-1', storage_path: 'path/to/file' }],
    isLoading: false,
    monitoring: {},
  }),
}));

describe('SupabaseGalleryContext - Permission Checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deleteGalleryImage should throw error if permission denied', async () => {
    // Setup validation failure
    vi.mocked(Permissions.validateItemAccess).mockResolvedValue({ allowed: false, reason: 'Denied' });

    const { result } = renderHook(() => useSupabaseGallery(), {
      wrapper: SupabaseGalleryProvider,
    });

    // Need to wait for initial load? Mock implementation handles it.
    
    await expect(result.current.deleteGalleryImage('item-1')).rejects.toThrow('Denied');
    
    expect(Permissions.validateItemAccess).toHaveBeenCalledWith('item-1', 'user-123', 'can_delete');
    expect(mockSupabase.from).not.toHaveBeenCalled(); 
  });

  it('deleteGalleryImage should succeed if permission allowed', async () => {
    // Setup validation success
    vi.mocked(Permissions.validateItemAccess).mockResolvedValue({ allowed: true });

    const { result } = renderHook(() => useSupabaseGallery(), {
      wrapper: SupabaseGalleryProvider,
    });

    await result.current.deleteGalleryImage('item-1');
    
    expect(Permissions.validateItemAccess).toHaveBeenCalledWith('item-1', 'user-123', 'can_delete');
    expect(mockSupabase.from).toHaveBeenCalled();
  });
});
