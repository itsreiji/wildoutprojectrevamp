/**
 * Gallery Permission System
 * Sistem permission berbasis role untuk galeri
 */

import React from 'react';
import { supabaseClient } from '@/supabase/client';
import type { GalleryPermission } from './types';

// Definisi role dan permission
export const ROLE_PERMISSIONS: Record<string, GalleryPermission> = {
  admin: {
    can_view: true,
    can_upload: true,
    can_edit: true,
    can_delete: true,
    can_manage: true,
  },
  editor: {
    can_view: true,
    can_upload: true,
    can_edit: true,
    can_delete: true,
    can_manage: false,
  },
  contributor: {
    can_view: true,
    can_upload: true,
    can_edit: false,
    can_delete: false,
    can_manage: false,
  },
  viewer: {
    can_view: true,
    can_upload: false,
    can_edit: false,
    can_delete: false,
    can_manage: false,
  },
  guest: {
    can_view: false,
    can_upload: false,
    can_edit: false,
    can_delete: false,
    can_manage: false,
  },
};

/**
 * Get user permissions based on role
 */
export function getPermissionsByRole(role: string): GalleryPermission {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.guest;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  userRole: string,
  permission: keyof GalleryPermission
): boolean {
  const permissions = getPermissionsByRole(userRole);
  return permissions[permission] || false;
}

/**
 * Get user role from session
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) return null;

    // Get user role from profiles table
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role || 'guest';
  } catch {
    return 'guest';
  }
}

/**
 * Get current user permissions
 */
export async function getCurrentUserPermissions(): Promise<GalleryPermission> {
  const role = await getUserRole();
  return getPermissionsByRole(role || 'guest');
}

/**
 * Validate access to gallery item
 */
export async function validateItemAccess(
  itemId: string,
  userId: string,
  action: keyof GalleryPermission
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Get item details
    const { data: item, error } = await supabaseClient
      .from('gallery_items')
      .select('created_by, status')
      .eq('id', itemId)
      .single();

    if (error) {
      return { allowed: false, reason: 'Item tidak ditemukan' };
    }

    // Get user permissions
    const permissions = await getCurrentUserPermissions();

    if (!permissions[action]) {
      return { allowed: false, reason: 'Tidak memiliki izin' };
    }

    // Check ownership for edit/delete
    if (action === 'can_edit' || action === 'can_delete') {
      if (item.created_by !== userId && !permissions.can_manage) {
        return { allowed: false, reason: 'Bukan pemilik item' };
      }
    }

    // Check status
    if (item.status === 'archived' && !permissions.can_manage) {
      return { allowed: false, reason: 'Item diarsipkan' };
    }

    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'Validasi gagal' };
  }
}

/**
 * Middleware untuk proteksi route
 */
export function withGalleryPermission(
  permission: keyof GalleryPermission,
  handler: (...args: any[]) => Promise<any>
) {
  return async (...args: any[]) => {
    const role = await getUserRole();
    const permissions = getPermissionsByRole(role || 'guest');

    if (!permissions[permission]) {
      throw new Error(`Akses ditolak. Diperlukan izin: ${permission}`);
    }

    return handler(...args);
  };
}

/**
 * Check batch operation permissions
 */
export async function validateBatchOperation(
  itemIds: string[],
  userId: string,
  action: keyof GalleryPermission
): Promise<{
  allowed: boolean;
  validItems: string[];
  invalidItems: Array<{ id: string; reason: string }>;
}> {
  const validItems: string[] = [];
  const invalidItems: Array<{ id: string; reason: string }> = [];

  for (const itemId of itemIds) {
    const validation = await validateItemAccess(itemId, userId, action);

    if (validation.allowed) {
      validItems.push(itemId);
    } else {
      invalidItems.push({
        id: itemId,
        reason: validation.reason || 'Tidak diizinkan',
      });
    }
  }

  return {
    allowed: validItems.length > 0,
    validItems,
    invalidItems,
  };
}

/**
 * Get permission matrix for UI
 */
export async function getPermissionMatrix(): Promise<{
  canView: boolean;
  canUpload: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
  role: string;
}> {
  const role = await getUserRole();
  const permissions = getPermissionsByRole(role || 'guest');

  return {
    canView: permissions.can_view,
    canUpload: permissions.can_upload,
    canEdit: permissions.can_edit,
    canDelete: permissions.can_delete,
    canManage: permissions.can_manage,
    role: role || 'guest',
  };
}

/**
 * Check storage quota permission
 */
export async function checkStorageQuotaPermission(
  userId: string,
  fileSize: number
): Promise<{ allowed: boolean; quota?: number; used?: number }> {
  try {
    // Get user quota from profiles
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('storage_quota, storage_used')
      .eq('id', userId)
      .single();

    const quota = profile?.storage_quota || 100 * 1024 * 1024; // Default 100MB
    const used = profile?.storage_used || 0;

    if (used + fileSize > quota) {
      return { allowed: false, quota, used };
    }

    return { allowed: true, quota, used };
  } catch {
    return { allowed: false };
  }
}

/**
 * Update storage usage
 */
export async function updateStorageUsage(
  userId: string,
  fileSize: number,
  operation: 'add' | 'remove'
): Promise<boolean> {
  try {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('storage_used')
      .eq('id', userId)
      .single();

    const currentUsage = profile?.storage_used || 0;
    const newUsage = operation === 'add'
      ? currentUsage + fileSize
      : Math.max(0, currentUsage - fileSize);

    const { error } = await supabaseClient
      .from('profiles')
      .update({ storage_used: newUsage })
      .eq('id', userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Check rate limit
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const now = Date.now();
    const key = `rate_limit_${userId}_${action}`;

    // Get current rate limit data from localStorage (for demo)
    // In production, use Redis or similar
    const stored = localStorage.getItem(key);
    let data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };

    // Reset if window expired
    if (now > data.resetTime) {
      data = { count: 0, resetTime: now + windowMs };
    }

    if (data.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.resetTime,
      };
    }

    data.count++;
    localStorage.setItem(key, JSON.stringify(data));

    return {
      allowed: true,
      remaining: limit - data.count,
      resetTime: data.resetTime,
    };
  } catch {
    return { allowed: true, remaining: limit, resetTime: Date.now() + windowMs };
  }
}

/**
 * Validate ownership
 */
export async function validateOwnership(
  itemId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('gallery_items')
      .select('created_by')
      .eq('id', itemId)
      .single();

    if (error) return false;
    return data?.created_by === userId;
  } catch {
    return false;
  }
}

/**
 * Check admin access
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

/**
 * Check if user can manage system
 */
export async function canManageSystem(): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissions.can_manage;
}

/**
 * Get accessible items
 */
export async function getAccessibleItems(
  userId: string,
  items: string[]
): Promise<string[]> {
  const accessible: string[] = [];

  for (const itemId of items) {
    const validation = await validateItemAccess(itemId, userId, 'can_view');
    if (validation.allowed) {
      accessible.push(itemId);
    }
  }

  return accessible;
}

/**
 * Permission guard for components
 */
export function withPermissionGuard(
  Component: React.ComponentType<any>,
  requiredPermission: keyof GalleryPermission
) {
  return function ProtectedComponent(props: any) {
    const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      async function checkAccess() {
        const permissions = await getCurrentUserPermissions();
        setHasAccess(permissions[requiredPermission]);
        setLoading(false);
      }
      checkAccess();
    }, [requiredPermission]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!hasAccess) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-4xl mb-4">⛔</div>
          <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses fitur ini
          </p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Get permission summary
 */
export function getPermissionSummary(permissions: GalleryPermission): string[] {
  const summary: string[] = [];

  if (permissions.can_view) summary.push('Melihat galeri');
  if (permissions.can_upload) summary.push('Mengupload gambar');
  if (permissions.can_edit) summary.push('Mengedit metadata');
  if (permissions.can_delete) summary.push('Menghapus item');
  if (permissions.can_manage) summary.push('Mengatur sistem');

  return summary;
}

/**
 * Check feature access
 */
export function checkFeatureAccess(
  permissions: GalleryPermission,
  feature: 'upload' | 'edit' | 'delete' | 'manage' | 'view'
): boolean {
  const featureMap = {
    upload: 'can_upload',
    edit: 'can_edit',
    delete: 'can_delete',
    manage: 'can_manage',
    view: 'can_view',
  } as const;

  const permissionKey = featureMap[feature];
  return permissions[permissionKey] || false;
}

/**
 * Validate permission for UI elements
 */
export function validateUIPermission(
  userRole: string,
  action: string
): boolean {
  const permissionMap: Record<string, keyof GalleryPermission> = {
    'gallery-view': 'can_view',
    'gallery-upload': 'can_upload',
    'gallery-edit': 'can_edit',
    'gallery-delete': 'can_delete',
    'gallery-manage': 'can_manage',
  };

  const permissionKey = permissionMap[action];
  if (!permissionKey) return false;

  return hasPermission(userRole, permissionKey);
}

/**
 * Get role label
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrator',
    editor: 'Editor',
    contributor: 'Kontributor',
    viewer: 'Pemirsa',
    guest: 'Tamu',
  };

  return labels[role] || role;
}

/**
 * Check if user can perform action on item
 */
export async function canPerformAction(
  userId: string,
  itemId: string,
  action: keyof GalleryPermission
): Promise<boolean> {
  const validation = await validateItemAccess(itemId, userId, action);
  return validation.allowed;
}

/**
 * Get all users with gallery permissions
 */
export async function getUsersWithPermissions(): Promise<Array<{
  id: string;
  email: string;
  role: string;
  permissions: GalleryPermission;
}>> {
  try {
    const { data: { users }, error } = await supabaseClient.auth.admin.listUsers();

    if (error) {
      return [];
    }

    const usersWithPermissions = await Promise.all(
      users.map(async (user) => {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = profile?.role || 'guest';
        const permissions = getPermissionsByRole(role);

        return {
          id: user.id,
          email: user.email || '',
          role,
          permissions,
        };
      })
    );

    return usersWithPermissions;
  } catch {
    return [];
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  newRole: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Only admin can change roles
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
      return { success: false, error: 'Hanya admin yang dapat mengubah role' };
    }

    const { error } = await supabaseClient
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengubah role',
    };
  }
}

/**
 * Permission audit
 */
export async function logPermissionCheck(
  userId: string,
  action: string,
  allowed: boolean,
  reason?: string
): Promise<void> {
  try {
    await supabaseClient.from('permission_audit_log').insert({
      user_id: userId,
      action,
      allowed,
      reason,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Silent fail
  }
}