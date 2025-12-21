/**
 * Gallery Audit and Backup System
 * Sistem audit log dan backup otomatis untuk galeri
 */

import { supabaseClient } from '@/supabase/client';
import { GALLERY_AUDIT_ACTIONS, BACKUP_INTERVALS } from './constants';
import type { GalleryAuditLog, GalleryBackup } from './types';

/**
 * Log audit untuk semua aktivitas galeri
 */
export async function logGalleryAudit(
  action: string,
  tableName: string,
  recordId: string,
  userId: string | null,
  userRole: string | null,
  oldData: any | null,
  newData: any
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('audit_log')
      .insert({
        action,
        table_name: tableName,
        record_id: recordId,
        user_id: userId,
        user_role: userRole,
        old_data: oldData,
        new_data: newData,
        ip_address: window?.location?.hostname || 'unknown',
        user_agent: navigator?.userAgent || 'unknown',
        session_id: localStorage.getItem('wildout_session_id') || null,
        timestamp: new Date().toISOString(),
      });

    return !error;
  } catch {
    return false;
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(
  filters: {
    action?: string;
    user_id?: string;
    table_name?: string;
    date_from?: string;
    date_to?: string;
  } = {},
  pagination: { page: number; limit: number } = { page: 1, limit: 50 }
): Promise<{
  logs: GalleryAuditLog[];
  count: number | null;
  error: string | null;
}> {
  try {
    let query = supabaseClient
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false });

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.table_name) {
      query = query.eq('table_name', filters.table_name);
    }

    if (filters.date_from) {
      query = query.gte('timestamp', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('timestamp', filters.date_to);
    }

    const offset = (pagination.page - 1) * pagination.limit;
    query = query.range(offset, offset + pagination.limit - 1);
    query = query.limit(pagination.limit);

    const { data, count, error } = await query;

    if (error) {
      return { logs: [], count: null, error: error.message };
    }

    return {
      logs: data || [],
      count,
      error: null,
    };
  } catch (error) {
    return {
      logs: [],
      count: null,
      error: error instanceof Error ? error.message : 'Failed to fetch audit logs',
    };
  }
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(
  userId: string,
  days: number = 30
): Promise<{
  total_actions: number;
  actions_by_type: Record<string, number>;
  recent_actions: GalleryAuditLog[];
  storage_changes: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: logs } = await supabaseClient
    .from('audit_log')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  const actionsByType: Record<string, number> = {};
  let storageChanges = 0;

  logs?.forEach(log => {
    actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;

    if (
      log.action === GALLERY_AUDIT_ACTIONS.UPLOAD ||
      log.action === GALLERY_AUDIT_ACTIONS.DELETE ||
      log.action === GALLERY_AUDIT_ACTIONS.BATCH_UPLOAD ||
      log.action === GALLERY_AUDIT_ACTIONS.BULK_DELETE
    ) {
      storageChanges++;
    }
  });

  return {
    total_actions: logs?.length || 0,
    actions_by_type: actionsByType,
    recent_actions: logs?.slice(0, 10) || [],
    storage_changes: storageChanges,
  };
}

/**
 * Create backup
 */
export async function createBackup(
  backupType: 'daily' | 'weekly' | 'monthly',
  userId: string
): Promise<{ success: boolean; backupId?: string; error?: string }> {
  try {
    // Get all gallery items
    const { data: items, error: itemsError } = await supabaseClient
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    // Get audit logs
    const { data: logs, error: logsError } = await supabaseClient
      .from('audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (logsError) {
      return { success: false, error: logsError.message };
    }

    // Create backup data
    const backupData = {
      items,
      logs,
      timestamp: new Date().toISOString(),
      backup_type: backupType,
      created_by: userId,
      version: '1.0',
    };

    // Store backup
    const { data: backup, error: backupError } = await supabaseClient
      .from('gallery_backups')
      .insert({
        backup_type: backupType,
        file_count: items?.length || 0,
        total_size: JSON.stringify(backupData).length,
        storage_path: `backups/gallery/${backupType}_${Date.now()}.json`,
        created_by: userId,
        status: 'completed',
      })
      .select()
      .single();

    if (backupError) {
      return { success: false, error: backupError.message };
    }

    // Upload backup file to storage
    const backupFile = new File(
      [JSON.stringify(backupData, null, 2)],
      `gallery_backup_${backupType}_${Date.now()}.json`,
      { type: 'application/json' }
    );

    const { error: uploadError } = await supabaseClient.storage
      .from('backups')
      .upload(backupFile.name, backupFile);

    if (uploadError) {
      // Update backup status to failed
      await supabaseClient
        .from('gallery_backups')
        .update({ status: 'failed' })
        .eq('id', backup.id);

      return { success: false, error: uploadError.message };
    }

    // Log backup action
    await logGalleryAudit(
      GALLERY_AUDIT_ACTIONS.BATCH_UPLOAD,
      'gallery_backups',
      backup.id,
      userId,
      'admin',
      null,
      { backup_type: backupType, file_count: items?.length || 0 }
    );

    return { success: true, backupId: backup.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Backup failed',
    };
  }
}

/**
 * Get backup history
 */
export async function getBackupHistory(
  limit: number = 10
): Promise<GalleryBackup[]> {
  try {
    const { data, error } = await supabaseClient
      .from('gallery_backups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

/**
 * Restore from backup
 */
export async function restoreFromBackup(
  backupId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get backup details
    const { data: backup, error: backupError } = await supabaseClient
      .from('gallery_backups')
      .select('storage_path')
      .eq('id', backupId)
      .single();

    if (backupError || !backup) {
      return { success: false, error: 'Backup tidak ditemukan' };
    }

    // Download backup file
    const { data: backupFile, error: downloadError } = await supabaseClient.storage
      .from('backups')
      .download(backup.storage_path);

    if (downloadError) {
      return { success: false, error: downloadError.message };
    }

    const backupData = JSON.parse(await backupFile.text());

    // Clear existing data (with caution)
    const { error: clearError } = await supabaseClient
      .from('gallery_items')
      .delete()
      .neq('id', ''); // Delete all

    if (clearError) {
      return { success: false, error: 'Gagal membersihkan data lama' };
    }

    // Restore items
    const { error: restoreError } = await supabaseClient
      .from('gallery_items')
      .insert(backupData.items);

    if (restoreError) {
      return { success: false, error: restoreError.message };
    }

    // Log restore action
    await logGalleryAudit(
      'gallery_restore',
      'gallery_items',
      backupId,
      userId,
      'admin',
      null,
      { restored_count: backupData.items.length }
    );

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Restore failed',
    };
  }
}

/**
 * Check backup schedule
 */
export async function checkBackupSchedule(): Promise<{
  due_daily: boolean;
  due_weekly: boolean;
  due_monthly: boolean;
  last_backup: GalleryBackup | null;
}> {
  try {
    const { data: backups } = await supabaseClient
      .from('gallery_backups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    const lastBackup = backups?.[0] || null;
    const now = new Date();

    if (!lastBackup) {
      return {
        due_daily: true,
        due_weekly: true,
        due_monthly: true,
        last_backup: null,
      };
    }

    const lastBackupDate = new Date(lastBackup.created_at);
    const hoursSinceLastBackup = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60);

    return {
      due_daily: hoursSinceLastBackup >= BACKUP_INTERVALS.DAILY,
      due_weekly: hoursSinceLastBackup >= BACKUP_INTERVALS.WEEKLY,
      due_monthly: hoursSinceLastBackup >= BACKUP_INTERVALS.MONTHLY,
      last_backup: lastBackup,
    };
  } catch {
    return {
      due_daily: false,
      due_weekly: false,
      due_monthly: false,
      last_backup: null,
    };
  }
}

/**
 * Auto backup scheduler
 */
export async function runAutoBackup(userId: string): Promise<{
  success: boolean;
  backups_created: Array<{ type: string; success: boolean; backupId?: string }>;
}> {
  const schedule = await checkBackupSchedule();
  const results: Array<{ type: string; success: boolean; backupId?: string }> = [];

  if (schedule.due_daily) {
    const result = await createBackup('daily', userId);
    results.push({
      type: 'daily',
      success: result.success,
      backupId: result.backupId,
    });
  }

  if (schedule.due_weekly) {
    const result = await createBackup('weekly', userId);
    results.push({
      type: 'weekly',
      success: result.success,
      backupId: result.backupId,
    });
  }

  if (schedule.due_monthly) {
    const result = await createBackup('monthly', userId);
    results.push({
      type: 'monthly',
      success: result.success,
      backupId: result.backupId,
    });
  }

  return {
    success: results.every(r => r.success),
    backups_created: results,
  };
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(
  days: number = 30
): Promise<{
  total_actions: number;
  actions_by_day: Record<string, number>;
  top_users: Array<{ user_id: string; count: number }>;
  most_common_actions: Array<{ action: string; count: number }>;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: logs } = await supabaseClient
    .from('audit_log')
    .select('*')
    .gte('timestamp', startDate.toISOString());

  const actionsByDay: Record<string, number> = {};
  const userCounts: Record<string, number> = {};
  const actionCounts: Record<string, number> = {};

  logs?.forEach(log => {
    // By day
    const day = log.timestamp?.split('T')[0];
    if (day) {
      actionsByDay[day] = (actionsByDay[day] || 0) + 1;
    }

    // By user
    if (log.user_id) {
      userCounts[log.user_id] = (userCounts[log.user_id] || 0) + 1;
    }

    // By action
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });

  const topUsers = Object.entries(userCounts)
    .map(([user_id, count]) => ({ user_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const mostCommonActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    total_actions: logs?.length || 0,
    actions_by_day: actionsByDay,
    top_users: topUsers,
    most_common_actions: mostCommonActions,
  };
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(
  format: 'json' | 'csv',
  filters: {
    action?: string;
    user_id?: string;
    date_from?: string;
    date_to?: string;
  } = {}
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    let query = supabaseClient
      .from('audit_log')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.date_from) {
      query = query.gte('timestamp', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('timestamp', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    if (format === 'json') {
      return {
        success: true,
        data: JSON.stringify(data, null, 2),
      };
    } else if (format === 'csv') {
      if (!data || data.length === 0) {
        return { success: true, data: '' };
      }

      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header as keyof typeof row];
            if (typeof value === 'object') {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        ),
      ].join('\n');

      return { success: true, data: csv };
    }

    return { success: false, error: 'Format tidak didukung' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

/**
 * Clean old audit logs
 */
export async function cleanOldAuditLogs(
  daysToKeep: number = 90
): Promise<{ success: boolean; deleted_count?: number; error?: string }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error } = await supabaseClient
      .from('audit_log')
      .delete()
      .lt('timestamp', cutoffDate.toISOString());

    if (error) {
      return { success: false, error: error.message };
    }

    // Get count of deleted items (approximate)
    const { data: countData } = await supabaseClient
      .from('audit_log')
      .select('id', { count: 'exact' })
      .lt('timestamp', cutoffDate.toISOString());

    return {
      success: true,
      deleted_count: countData?.length || 0,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed',
    };
  }
}

/**
 * Get system health report
 */
export async function getSystemHealthReport(): Promise<{
  database: 'healthy' | 'degraded' | 'down';
  storage: 'healthy' | 'degraded' | 'down';
  backup: 'healthy' | 'degraded' | 'down';
  last_check: string;
  issues: string[];
}> {
  const issues: string[] = [];

  // Check database
  let database: 'healthy' | 'degraded' | 'down' = 'healthy';
  try {
    const { error } = await supabaseClient.from('gallery_items').select('id').limit(1);
    if (error) {
      database = 'degraded';
      issues.push('Database connection issue');
    }
  } catch {
    database = 'down';
    issues.push('Database unavailable');
  }

  // Check storage
  let storage: 'healthy' | 'degraded' | 'down' = 'healthy';
  try {
    const { error } = await supabaseClient.storage.list('gallery');
    if (error) {
      storage = 'degraded';
      issues.push('Storage access issue');
    }
  } catch {
    storage = 'down';
    issues.push('Storage unavailable');
  }

  // Check backup
  let backup: 'healthy' | 'degraded' | 'down' = 'healthy';
  try {
    const schedule = await checkBackupSchedule();
    if (schedule.due_weekly && schedule.last_backup) {
      backup = 'degraded';
      issues.push('Backup overdue');
    } else if (!schedule.last_backup) {
      backup = 'degraded';
      issues.push('No backup found');
    }
  } catch {
    backup = 'down';
    issues.push('Backup system error');
  }

  return {
    database,
    storage,
    backup,
    last_check: new Date().toISOString(),
    issues,
  };
}

/**
 * Monitor storage usage
 */
export async function monitorStorageUsage(): Promise<{
  used: number;
  limit: number;
  percentage: number;
  warning: boolean;
}> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return { used: 0, limit: 0, percentage: 0, warning: false };
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('storage_used, storage_quota')
      .eq('id', user.id)
      .single();

    const used = profile?.storage_used || 0;
    const limit = profile?.storage_quota || 100 * 1024 * 1024; // 100MB default
    const percentage = (used / limit) * 100;
    const warning = percentage > 80;

    return {
      used,
      limit,
      percentage,
      warning,
    };
  } catch {
    return { used: 0, limit: 0, percentage: 0, warning: false };
  }
}

/**
 * Get maintenance tasks status
 */
export async function getMaintenanceTasks(): Promise<Array<{
  id: string;
  type: string;
  status: string;
  progress: number;
  started_at: string;
  completed_at?: string;
}>> {
  try {
    const { data, error } = await supabaseClient
      .from('maintenance_tasks')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);

    if (error) {
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

/**
 * Create maintenance task
 */
export async function createMaintenanceTask(
  type: 'cleanup' | 'optimize' | 'backup' | 'restore'
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    const { data, error } = await supabaseClient
      .from('maintenance_tasks')
      .insert({
        type,
        status: 'pending',
        progress: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, taskId: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    };
  }
}

/**
 * Update maintenance task progress
 */
export async function updateMaintenanceTask(
  taskId: string,
  progress: number,
  status: string,
  result?: any
): Promise<boolean> {
  try {
    const updates: any = {
      progress,
      status,
    };

    if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }

    if (result) {
      updates.result = result;
    }

    const { error } = await supabaseClient
      .from('maintenance_tasks')
      .update(updates)
      .eq('id', taskId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Run cleanup task
 */
export async function runCleanupTask(
  taskId: string,
  userId: string
): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    await updateMaintenanceTask(taskId, 10, 'running');

    // Remove orphaned items (items with no corresponding storage file)
    const { data: items } = await supabaseClient
      .from('gallery_items')
      .select('id, image_url');

    let removedCount = 0;
    const orphanedIds: string[] = [];

    if (items) {
      for (const item of items) {
        if (!item.image_url) {
          orphanedIds.push(item.id);
          continue;
        }

        // Check if file exists in storage
        const path = item.image_url.split('/').slice(-2).join('/');
        const { error } = await supabaseClient.storage
          .from('gallery')
          .list(path.split('/')[0], { search: path.split('/')[1] });

        if (error) {
          orphanedIds.push(item.id);
        }
      }

      await updateMaintenanceTask(taskId, 50, 'running');

      // Delete orphaned items
      if (orphanedIds.length > 0) {
        await supabaseClient
          .from('gallery_items')
          .delete()
          .in('id', orphanedIds);

        removedCount = orphanedIds.length;
      }
    }

    await updateMaintenanceTask(taskId, 100, 'completed', {
      removed_orphaned: removedCount,
      timestamp: new Date().toISOString(),
    });

    // Log cleanup action
    await logGalleryAudit(
      'maintenance_cleanup',
      'gallery_items',
      taskId,
      userId,
      'admin',
      null,
      { removed_count: removedCount }
    );

    return {
      success: true,
      result: { removed_orphaned: removedCount },
    };
  } catch (error) {
    await updateMaintenanceTask(taskId, 100, 'failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed',
    };
  }
}

/**
 * Get audit summary for dashboard
 */
export async function getAuditSummary(
  days: number = 7
): Promise<{
  total_actions: number;
  unique_users: number;
  storage_operations: number;
  failed_operations: number;
  peak_hour: string;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: logs } = await supabaseClient
    .from('audit_log')
    .select('*')
    .gte('timestamp', startDate.toISOString());

  if (!logs || logs.length === 0) {
    return {
      total_actions: 0,
      unique_users: 0,
      storage_operations: 0,
      failed_operations: 0,
      peak_hour: 'N/A',
    };
  }

  const uniqueUsers = new Set<string>();
  let storageOps = 0;
  let failedOps = 0;
  const hourCounts: Record<string, number> = {};

  logs.forEach(log => {
    if (log.user_id) uniqueUsers.add(log.user_id);

    if (
      log.action === GALLERY_AUDIT_ACTIONS.UPLOAD ||
      log.action === GALLERY_AUDIT_ACTIONS.DELETE ||
      log.action === GALLERY_AUDIT_ACTIONS.BATCH_UPLOAD ||
      log.action === GALLERY_AUDIT_ACTIONS.BULK_DELETE
    ) {
      storageOps++;
    }

    // Check for errors in new_data
    if (log.new_data && typeof log.new_data === 'object') {
      if (log.new_data.error || log.new_data.success === false) {
        failedOps++;
      }
    }

    if (log.timestamp) {
      const hour = new Date(log.timestamp).getHours().toString().padStart(2, '0') + ':00';
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return {
    total_actions: logs.length,
    unique_users: uniqueUsers.size,
    storage_operations: storageOps,
    failed_operations: failedOps,
    peak_hour: peakHour,
  };
}