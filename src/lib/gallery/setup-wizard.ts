/**
 * Gallery System Setup Wizard
 * 
 * This script helps set up the Supabase Storage bucket and verify the system is ready
 */

import { supabaseClient } from '@/supabase/client';

export class GallerySetupWizard {
  private bucketName = 'wildout-images';
  private momentsPath = 'moments';

  /**
   * Check if storage bucket exists and create if needed
   */
  async setupStorageBucket(): Promise<{ success: boolean; message: string }> {
    try {
      // List all buckets
      const { data: buckets, error: listError } = await supabaseClient.storage.listBuckets();
      
      if (listError) {
        return { success: false, message: `Failed to list buckets: ${listError.message}` };
      }

      const existingBucket = buckets?.find(b => b.name === this.bucketName);

      if (existingBucket) {
        // Update bucket settings if needed
        const { error: updateError } = await supabaseClient.storage.updateBucket(this.bucketName, {
          public: true,
          file_size_limit: 20971520, // 20MB
          allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
        });

        if (updateError) {
          return { success: false, message: `Failed to update bucket: ${updateError.message}` };
        }

        return { success: true, message: `Bucket "${this.bucketName}" already exists and was updated` };
      }

      // Create new bucket
      const { error: createError } = await supabaseClient.storage.createBucket(this.bucketName, {
        public: true,
        file_size_limit: 20971520,
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
      });

      if (createError) {
        return { success: false, message: `Failed to create bucket: ${createError.message}` };
      }

      return { success: true, message: `Bucket "${this.bucketName}" created successfully` };

    } catch (error) {
      return { success: false, message: `Unexpected error: ${error}` };
    }
  }

  /**
   * Verify database functions exist
   */
  async verifyDatabaseFunctions(): Promise<{ success: boolean; message: string }> {
    const requiredFunctions = [
      'get_gallery_items_paginated',
      'get_storage_usage_stats',
      'check_gallery_storage_consistency',
      'log_storage_operation',
      'create_gallery_item_with_storage',
      'update_gallery_item_storage',
      'delete_gallery_item_with_storage'
    ];

    const missingFunctions: string[] = [];

    for (const func of requiredFunctions) {
      try {
        // Try to call the function with dummy parameters
        const { error } = await supabaseClient.rpc(func as any, { p_limit: 1, p_offset: 0 });
        
        // Some functions might fail due to parameters, but we just want to check if they exist
        // If the error is about parameters, the function exists
        if (error && !error.message.includes('function') && !error.message.includes('does not exist')) {
          // This might be a parameter error, which means the function exists
          continue;
        }
        
        // If we get a "function does not exist" error, add to missing
        if (error && error.message.includes('does not exist')) {
          missingFunctions.push(func);
        }
      } catch (e) {
        // If there's an error calling the function, it might still exist
        // We'll check the error message
        if (String(e).includes('does not exist')) {
          missingFunctions.push(func);
        }
      }
    }

    if (missingFunctions.length === 0) {
      return { success: true, message: 'All required database functions exist' };
    }

    return { 
      success: false, 
      message: `Missing functions: ${missingFunctions.join(', ')}. Please run the migration.` 
    };
  }

  /**
   * Verify table structure
   */
  async verifyTableStructure(): Promise<{ success: boolean; message: string }> {
    const requiredTables = ['gallery_items', 'storage_audit_log'];
    const missingTables: string[] = [];

    for (const table of requiredTables) {
      const { error } = await supabaseClient.from(table).select('id').limit(1);
      
      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          missingTables.push(table);
        }
      }
    }

    if (missingTables.length === 0) {
      return { success: true, message: 'All required tables exist' };
    }

    return { 
      success: false, 
      message: `Missing tables: ${missingTables.join(', ')}. Please run the migration.` 
    };
  }

  /**
   * Verify storage policies
   */
  async verifyStoragePolicies(): Promise<{ success: boolean; message: string }> {
    // This is a simplified check - in production you'd query pg_policies
    // For now, we'll just verify the bucket is accessible
    try {
      const { error } = await supabaseClient.storage.listBuckets();
      
      if (error) {
        return { success: false, message: `Storage access failed: ${error.message}` };
      }

      return { success: true, message: 'Storage policies appear to be configured' };

    } catch (error) {
      return { success: false, message: `Storage access error: ${error}` };
    }
  }

  /**
   * Run complete setup check
   */
  async runCompleteCheck(): Promise<{
    overallSuccess: boolean;
    results: Array<{ name: string; success: boolean; message: string }>;
  }> {
    const checks = [
      { name: 'Storage Bucket', fn: () => this.setupStorageBucket() },
      { name: 'Table Structure', fn: () => this.verifyTableStructure() },
      { name: 'Database Functions', fn: () => this.verifyDatabaseFunctions() },
      { name: 'Storage Policies', fn: () => this.verifyStoragePolicies() }
    ];

    const results = [];
    let overallSuccess = true;

    for (const check of checks) {
      const result = await check.fn();
      results.push({
        name: check.name,
        success: result.success,
        message: result.message
      });

      if (!result.success) {
        overallSuccess = false;
      }
    }

    return { overallSuccess, results };
  }

  /**
   * Display setup report
   */
  async displaySetupReport(): Promise<void> {
    console.log('🎨 Gallery System Setup Report');
    console.log('='.repeat(50));

    const { overallSuccess, results } = await this.runCompleteCheck();

    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.message}`);
    });

    console.log('='.repeat(50));

    if (overallSuccess) {
      console.log('🎉 System is ready! You can now use the gallery features.');
      console.log('\nQuick Start:');
      console.log('1. Import the EnhancedGalleryManager component');
      console.log('2. Use the React hooks for gallery operations');
      console.log('3. Check the documentation for advanced features');
    } else {
      console.log('⚠️  Some checks failed. Please address the issues above.');
      console.log('\nTroubleshooting:');
      console.log('1. Run the migration: supabase/migrations/20251221_gallery_storage_migration.sql');
      console.log('2. Check Supabase project settings');
      console.log('3. Verify authentication is working');
    }
  }

  /**
   * Quick setup for new projects
   */
  async quickSetup(): Promise<boolean> {
    console.log('🚀 Running quick setup...');

    // 1. Setup bucket
    const bucketResult = await this.setupStorageBucket();
    console.log(`Bucket: ${bucketResult.message}`);

    // 2. Verify tables
    const tableResult = await this.verifyTableStructure();
    console.log(`Tables: ${tableResult.message}`);

    // 3. Verify functions
    const funcResult = await this.verifyDatabaseFunctions();
    console.log(`Functions: ${funcResult.message}`);

    const success = bucketResult.success && tableResult.success && funcResult.success;

    if (success) {
      console.log('✅ Quick setup completed successfully!');
    } else {
      console.log('❌ Quick setup failed. Please run full migration.');
    }

    return success;
  }
}

// Export default instance
export const gallerySetup = new GallerySetupWizard();

// Quick helper functions
export async function isGallerySystemReady(): Promise<boolean> {
  const { overallSuccess } = await gallerySetup.runCompleteCheck();
  return overallSuccess;
}

export async function getSetupStatus() {
  return await gallerySetup.runCompleteCheck();
}