/**
 * Gallery Batch Upload System
 * Sistem upload batch dengan validasi, optimasi, dan watermarking
 */

import { supabaseClient } from '@/supabase/client';
import {
  generateStandardFilename,
  comprehensiveValidation,
  validateStorageQuota
} from './validation';
import {
  FILE_SIZE_LIMITS,
  GALLERY_STATUSES,
  IMAGE_OPTIMIZATION,
  GALLERY_AUDIT_ACTIONS
} from './constants';
import type {
  BatchUploadItem,
  BatchUploadResult,
  BatchUploadSummary,
  GalleryMetadata,
  ImageOptimizationConfig,
  WatermarkConfig
} from './types';

/**
 * Upload single file to Supabase Storage
 */
export async function uploadToStorage(
  file: File,
  path: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabaseClient.storage
      .from('gallery')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('gallery')
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    return { success: false, error: 'Gagal mengupload ke storage' };
  }
}

/**
 * Optimize image before upload
 */
export async function optimizeImage(
  file: File,
  config: ImageOptimizationConfig
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Gagal membuat canvas'));
        return;
      }

      // Calculate dimensions
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (config.width || config.height) {
        const ratio = width / height;

        if (config.width && config.height) {
          width = config.width;
          height = config.height;
        } else if (config.width) {
          width = config.width;
          height = config.width / ratio;
        } else if (config.height) {
          height = config.height;
          width = config.height * ratio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Gagal mengkonversi gambar'));
            return;
          }

          const optimizedFile = new File(
            [blob],
            file.name,
            { type: `image/${config.format}`, lastModified: Date.now() }
          );

          URL.revokeObjectURL(url);
          resolve(optimizedFile);
        },
        `image/${config.format}`,
        config.quality / 100
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal memuat gambar'));
    };

    img.src = url;
  });
}

/**
 * Add watermark to image
 */
export async function addWatermark(
  file: File,
  watermarkConfig: WatermarkConfig
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Gagal membuat canvas'));
        return;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Add watermark
      ctx.globalAlpha = watermarkConfig.opacity || 0.3;

      if (watermarkConfig.text) {
        // Text watermark
        const fontSize = watermarkConfig.size || 48;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = watermarkConfig.color || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = watermarkConfig.text;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        let x = 0, y = 0;
        const padding = 50;

        switch (watermarkConfig.position) {
          case 'top-left':
            x = padding + textWidth / 2;
            y = padding + textHeight / 2;
            break;
          case 'top-right':
            x = canvas.width - padding - textWidth / 2;
            y = padding + textHeight / 2;
            break;
          case 'bottom-left':
            x = padding + textWidth / 2;
            y = canvas.height - padding - textHeight / 2;
            break;
          case 'bottom-right':
            x = canvas.width - padding - textWidth / 2;
            y = canvas.height - padding - textHeight / 2;
            break;
          case 'center':
            x = canvas.width / 2;
            y = canvas.height / 2;
            break;
          default:
            x = canvas.width - padding - textWidth / 2;
            y = canvas.height - padding - textHeight / 2;
        }

        // Add background for text
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#000000';
        ctx.fillRect(
          x - textWidth / 2 - 10,
          y - textHeight / 2 - 5,
          textWidth + 20,
          textHeight + 10
        );

        // Draw text
        ctx.globalAlpha = watermarkConfig.opacity || 0.3;
        ctx.fillStyle = watermarkConfig.color || '#FFFFFF';
        ctx.fillText(text, x, y);
      }

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Gagal menambahkan watermark'));
            return;
          }

          const watermarkedFile = new File(
            [blob],
            file.name,
            { type: file.type, lastModified: Date.now() }
          );

          URL.revokeObjectURL(url);
          resolve(watermarkedFile);
        },
        file.type,
        0.95
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal memuat gambar untuk watermark'));
    };

    img.src = url;
  });
}

/**
 * Process single file upload
 */
export async function processFileUpload(
  item: BatchUploadItem,
  userId: string,
  userRole: string,
  currentStorageUsage: number
): Promise<BatchUploadResult> {
  try {
    // Validasi storage quota
    const quotaValidation = await validateStorageQuota(
      currentStorageUsage,
      item.file.size,
      FILE_SIZE_LIMITS.BATCH * 2 // 2x batch limit for total quota
    );

    if (!quotaValidation.valid) {
      return {
        success: false,
        error: quotaValidation.error!,
        original_file: item.file.name,
      };
    }

    // Validasi komprehensif
    const validation = await comprehensiveValidation(item.file, item.metadata);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        original_file: item.file.name,
      };
    }

    let processedFile = item.file;

    // Optimasi gambar jika diaktifkan
    if (item.metadata.optimize !== false) {
      const format = item.file.type === 'image/png' ? 'png' : 'jpeg';
      const optimizationConfig: ImageOptimizationConfig = {
        format: format as any,
        quality: IMAGE_OPTIMIZATION.MEDIUM.quality,
        width: IMAGE_OPTIMIZATION.MEDIUM.width,
        height: IMAGE_OPTIMIZATION.MEDIUM.height,
        fit: 'cover',
      };

      try {
        processedFile = await optimizeImage(processedFile, optimizationConfig);
      } catch (error) {
        console.warn('Optimasi gagal, menggunakan file asli:', error);
      }
    }

    // Tambah watermark jika diaktifkan
    if (item.metadata.watermark) {
      try {
        const watermarkConfig: WatermarkConfig = {
          text: 'WildOut Project',
          position: item.metadata.watermark_position || 'bottom-right',
          opacity: 0.3,
          size: 48,
          color: '#FFFFFF',
        };

        processedFile = await addWatermark(processedFile, watermarkConfig);
      } catch (error) {
        console.warn('Watermark gagal:', error);
      }
    }

    // Generate nama file standar
    const standardFilename = generateStandardFilename(
      item.file.name,
      item.metadata.category || 'other'
    );

    // Upload ke Supabase Storage
    const uploadResult = await uploadToStorage(
      processedFile,
      `gallery/${item.metadata.category || 'other'}/${standardFilename}`
    );

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error!,
        original_file: item.file.name,
      };
    }

    // Simpan metadata ke database
    const metadataWithUrl: GalleryMetadata = {
      ...item.metadata,
      original_filename: item.file.name,
      file_size: processedFile.size,
      dimensions: validation.dimensions,
    };

    const { error: dbError } = await supabaseClient
      .from('gallery_items')
      .insert({
        image_url: uploadResult.url!,
        thumbnail_url: uploadResult.url!, // Bisa diubah nanti untuk thumbnail terpisah
        category: item.metadata.category || 'other',
        title: item.metadata.title || item.file.name,
        description: item.metadata.description,
        tags: item.metadata.tags || [],
        status: GALLERY_STATUSES.PUBLISHED,
        metadata: metadataWithUrl,
        partner_id: item.metadata.partner_id,
        event_id: item.metadata.event_id,
        display_order: item.metadata.display_order || 0,
      });

    if (dbError) {
      // Hapus file yang sudah terupload jika database gagal
      await supabaseClient.storage
        .from('gallery')
        .remove([`gallery/${item.metadata.category || 'other'}/${standardFilename}`]);

      return {
        success: false,
        error: `Database error: ${dbError.message}`,
        original_file: item.file.name,
      };
    }

    // Log audit
    await logGalleryAudit(
      GALLERY_AUDIT_ACTIONS.UPLOAD,
      'gallery_items',
      uploadResult.url!,
      userId,
      userRole,
      null,
      { ...metadataWithUrl, filename: standardFilename }
    );

    return {
      success: true,
      item_id: uploadResult.url,
      original_file: item.file.name,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload gagal',
      original_file: item.file.name,
    };
  }
}

/**
 * Batch upload processor
 */
export async function processBatchUpload(
  items: BatchUploadItem[],
  userId: string,
  userRole: string,
  onProgress?: (current: number, total: number, result: BatchUploadResult) => void
): Promise<BatchUploadSummary> {
  const results: BatchUploadResult[] = [];
  let successful = 0;
  let failed = 0;

  // Get current storage usage
  const { data: storageData } = await supabaseClient.storage
    .from('gallery')
    .list('', { limit: 1000 });

  const currentUsage = storageData?.reduce((sum: number, file: any) => sum + (file.metadata?.size || 0), 0) || 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const result = await processFileUpload(item, userId, userRole, currentUsage);

    results.push(result);

    if (result.success) {
      successful++;
    } else {
      failed++;
    }

    if (onProgress) {
      onProgress(i + 1, items.length, result);
    }
  }

  // Log batch upload
  if (successful > 0) {
    await logGalleryAudit(
      GALLERY_AUDIT_ACTIONS.BATCH_UPLOAD,
      'gallery_items',
      `batch_${Date.now()}`,
      userId,
      userRole,
      null,
      { count: successful, files: results.map(r => r.original_file) }
    );
  }

  return {
    total_files: items.length,
    successful,
    failed,
    results,
  };
}

/**
 * Log audit untuk gallery
 */
async function logGalleryAudit(
  action: string,
  tableName: string,
  recordId: string,
  userId: string,
  userRole: string,
  oldData: any | null,
  newData: any
) {
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
      });

    if (error) {
      console.warn('Audit log gagal:', error);
    }
  } catch (error) {
    console.warn('Audit log error:', error);
  }
}

/**
 * Generate thumbnail URL (placeholder untuk implementasi thumbnail terpisah)
 */
export function generateThumbnailUrl(imageUrl: string, _size: 'small' | 'medium' | 'large' = 'medium'): string {
  // Untuk sementara, return URL asli
  // Diimplementasikan nanti dengan image processing service
  return imageUrl;
}

/**
 * Upload dengan preview
 */
export async function uploadWithPreview(
  file: File,
  metadata: Partial<GalleryMetadata>
): Promise<{
  success: boolean;
  previewUrl?: string;
  error?: string;
}> {
  try {
    // Buat preview lokal
    const previewUrl = URL.createObjectURL(file);

    // Validasi
    const validation = await comprehensiveValidation(file, metadata);

    if (!validation.valid) {
      URL.revokeObjectURL(previewUrl);
      return { success: false, error: validation.errors.join(', ') };
    }

    return {
      success: true,
      previewUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal membuat preview',
    };
  }
}

/**
 * Cancel upload
 */
export function cancelUpload(previewUrl: string) {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
}