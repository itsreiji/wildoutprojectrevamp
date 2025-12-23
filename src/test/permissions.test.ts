
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateItemAccess } from '../lib/gallery/permissions';

// Use vi.hoisted to create the mock object before the mock factory is evaluated
const mockSupabase = vi.hoisted(() => ({
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
}));

vi.mock('@/supabase/client', () => ({
  supabaseClient: mockSupabase,
  default: mockSupabase,
}));

describe('Gallery Permissions - validateItemAccess', () => {
  const userId = 'user-123';
  const otherUserId = 'user-456';
  const itemId = 'item-789';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserRole = (role: string) => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: userId } } });
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        mockSupabase.select.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role } }),
          }),
        });
      } else if (table === 'gallery_items') {
        mockSupabase.select.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {} }),
          }),
        });
      }
      return mockSupabase;
    });
  };

  const mockItem = (itemData: any) => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'gallery_items') {
        mockSupabase.select.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: itemData, error: null }),
          }),
        });
      } else if (table === 'profiles') {
        mockSupabase.select.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: 'viewer' } }),
          }),
        });
      }
      return mockSupabase;
    });
  };

  const mockItemError = () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'gallery_items') {
          mockSupabase.select.mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
            }),
          });
        }
        return mockSupabase;
      });
  };


  it('should return false if item is not found', async () => {
    mockItemError();
    const result = await validateItemAccess(itemId, userId, 'can_view');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Item tidak ditemukan');
  });

  it('should return false if user does not have basic permission', async () => {
     // Mock anonymous/guest role which has no view permission
     mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: userId } } });
     mockSupabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
          mockSupabase.select.mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { role: 'guest' } }) }) });
      } else if (table === 'gallery_items') {
          mockSupabase.select.mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { created_by: otherUserId, status: 'published' } }) }) });
      }
      return mockSupabase;
     });

    const result = await validateItemAccess(itemId, userId, 'can_view');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Tidak memiliki izin');
  });

  it('should allow owner to edit their item', async () => {
    // Role: editor (can_edit=true)
     mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: userId } } });
     mockSupabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
          mockSupabase.select.mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { role: 'editor' } }) }) });
      } else if (table === 'gallery_items') {
          mockSupabase.select.mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { created_by: userId, status: 'published' } }) }) });
      }
      return mockSupabase;
     });

    const result = await validateItemAccess(itemId, userId, 'can_edit');
    expect(result.allowed).toBe(true);
  });

  it('should deny non-owner from editing item (if not manager)', async () => {
    // Role: editor (can_manage=false)
     mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: userId } } });
     mockSupabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
          mockSupabase.select.mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { role: 'editor' } }) }) });
      } else if (table === 'gallery_items') {
          mockSupabase.select.mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { created_by: otherUserId, status: 'published' } }) }) });
      }
      return mockSupabase;
     });

    const result = await validateItemAccess(itemId, userId, 'can_edit');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Bukan pemilik item');
  });

  it('should allow manager to edit any item', async () => {
    // Role: admin (can_manage=true)
     mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: userId } } });
     mockSupabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
          mockSupabase.select.mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { role: 'admin' } }) }) });
      } else if (table === 'gallery_items') {
          mockSupabase.select.mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { created_by: otherUserId, status: 'published' } }) }) });
      }
      return mockSupabase;
     });

    const result = await validateItemAccess(itemId, userId, 'can_edit');
    expect(result.allowed).toBe(true);
  });
});
