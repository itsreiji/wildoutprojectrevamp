/**
 * Gallery File Validation System
 * Validasi format, ukuran, dan kualitas file gambar
 */

import {
  SUPPORTED_FORMATS,
  FILE_SIZE_LIMITS,
  GALLERY_CATEGORIES
} from './constants';
import type { FileValidationResult, GalleryMetadata } from './types';

/**
 * Validasi format file
 */
export function validateFileFormat(file: File): FileValidationResult {
  const result: FileValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: {
      size: file.size,
      type: file.type,
      extension: '.' + file.name.split('.').pop()?.toLowerCase() || '',
      name: file.name,
    },
  };

  // Validasi tipe MIME
  if (!Object.values(SUPPORTED_FORMATS.IMAGE).includes(file.type as any)) {
    result.valid = false;
    result.errors.push(
      `Format file tidak didukung: ${file.type}. ` +
      `Format yang diizinkan: ${Object.keys(SUPPORTED_FORMATS.IMAGE).join(', ')}`
    );
  }

  // Validasi ekstensi
  const extension = result.info.extension;
  if (!SUPPORTED_FORMATS.EXTENSIONS.includes(extension as any)) {
    result.valid = false;
    result.errors.push(
      `Ekstensi file tidak valid: ${extension}. ` +
      `Ekstensi yang diizinkan: ${SUPPORTED_FORMATS.EXTENSIONS.join(', ')}`
    );
  }

  return result;
}

/**
 * Validasi ukuran file
 */
export function validateFileSize(file: File): FileValidationResult {
  const result: FileValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: {
      size: file.size,
      type: file.type,
      extension: '.' + file.name.split('.').pop()?.toLowerCase() || '',
      name: file.name,
    },
  };

  if (file.size > FILE_SIZE_LIMITS.SINGLE) {
    result.valid = false;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const limitMB = (FILE_SIZE_LIMITS.SINGLE / (1024 * 1024)).toFixed(0);
    result.errors.push(
      `File terlalu besar: ${sizeMB}MB. ` +
      `Maksimal yang diizinkan: ${limitMB}MB`
    );
  } else if (file.size > FILE_SIZE_LIMITS.SINGLE * 0.8) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    result.warnings.push(
      `File berukuran besar (${sizeMB}MB), ` +
      `proses upload mungkin memakan waktu lebih lama`
    );
  }

  if (file.size === 0) {
    result.valid = false;
    result.errors.push('File kosong (0 bytes)');
  }

  return result;
}

/**
 * Validasi metadata
 */
export function validateMetadata(metadata: Partial<GalleryMetadata>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validasi judul
  if (metadata.title) {
    if (metadata.title.length < 3) {
      errors.push('Judul minimal 3 karakter');
    }
    if (metadata.title.length > 200) {
      errors.push('Judul maksimal 200 karakter');
    }
  }

  // Validasi deskripsi
  if (metadata.description) {
    if (metadata.description.length > 1000) {
      errors.push('Deskripsi maksimal 1000 karakter');
    }
  }

  // Validasi kategori
  if (metadata.category) {
    const validCategories = Object.values(GALLERY_CATEGORIES);
    if (!validCategories.includes(metadata.category as any)) {
      errors.push(
        `Kategori tidak valid: ${metadata.category}. ` +
        `Kategori yang diizinkan: ${validCategories.join(', ')}`
      );
    }
  }

  // Validasi tags
  if (metadata.tags && Array.isArray(metadata.tags)) {
    if (metadata.tags.length > 10) {
      errors.push('Maksimal 10 tags per item');
    }

    metadata.tags.forEach((tag, index) => {
      if (typeof tag !== 'string' || tag.length < 2) {
        errors.push(`Tag ke-${index + 1} minimal 2 karakter`);
      }
      if (tag.length > 50) {
        errors.push(`Tag ke-${index + 1} maksimal 50 karakter`);
      }
    });
  }

  // Validasi display order
  if (metadata.display_order !== undefined) {
    if (metadata.display_order < 0) {
      errors.push('Display order tidak boleh negatif');
    }
    if (metadata.display_order > 1000) {
      errors.push('Display order maksimal 1000');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validasi batch upload
 */
export function validateBatchUpload(files: File[], metadata: Partial<GalleryMetadata>): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validasi jumlah file
  if (files.length === 0) {
    errors.push('Tidak ada file untuk diupload');
    return { valid: false, errors, warnings };
  }

  if (files.length > FILE_SIZE_LIMITS.MAX_FILES) {
    errors.push(
      `Terlalu banyak file: ${files.length}. ` +
      `Maksimal: ${FILE_SIZE_LIMITS.MAX_FILES}`
    );
  }

  // Validasi total ukuran
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > FILE_SIZE_LIMITS.BATCH) {
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    const limitMB = (FILE_SIZE_LIMITS.BATCH / (1024 * 1024)).toFixed(0);
    errors.push(
      `Total ukuran batch terlalu besar: ${totalMB}MB. ` +
      `Maksimal: ${limitMB}MB`
    );
  }

  // Validasi per file
  files.forEach((file, index) => {
    const formatValidation = validateFileFormat(file);
    const sizeValidation = validateFileSize(file);

    if (!formatValidation.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${formatValidation.errors.join(', ')}`);
    }

    if (!sizeValidation.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${sizeValidation.errors.join(', ')}`);
    }

    // Peringatan
    if (sizeValidation.warnings.length > 0) {
      warnings.push(`File ${index + 1} (${file.name}): ${sizeValidation.warnings.join(', ')}`);
    }
  });

  // Validasi metadata
  const metadataValidation = validateMetadata(metadata);
  if (!metadataValidation.valid) {
    errors.push(...metadataValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validasi nama file untuk keamanan
 */
export function sanitizeFilename(filename: string): string {
  // Hapus karakter berbahaya
  let sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Hapus path traversal
  sanitized = sanitized.replace(/\.\.\//g, '');
  sanitized = sanitized.replace(/^\//g, '');

  // Batasi panjang
  if (sanitized.length > 100) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, sanitized.length - (ext?.length || 0) - 1);
    sanitized = name.substring(0, 80) + '.' + ext;
  }

  return sanitized;
}

/**
 * Generate nama file standar
 */
export function generateStandardFilename(
  originalName: string,
  category: string,
  timestamp?: string
): string {
  const sanitized = sanitizeFilename(originalName);
  const ext = sanitized.split('.').pop();
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));

  const ts = timestamp || new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);

  return `${category}_${ts}_${nameWithoutExt}.${ext}`;
}

/**
 * Validasi ukuran gambar (memerlukan gambar sebagai input)
 */
export async function validateImageDimensions(
  file: File
): Promise<{ width: number; height: number; valid: boolean; errors: string[] }> {
  // Skip validation in non-browser environments
  if (typeof window === 'undefined' || !window.Image) {
    return { width: 0, height: 0, valid: true, errors: [] };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const errors: string[] = [];

      // Validasi minimum dimensions
      if (width < 100 || height < 100) {
        errors.push('Resolusi terlalu rendah (minimal 100x100px)');
      }

      // Validasi maximum dimensions (prevent memory issues)
      if (width > 10000 || height > 10000) {
        errors.push('Resolusi terlalu tinggi (maksimal 10000x10000px)');
      }

      // Validasi aspect ratio (opsional)
      const ratio = width / height;
      if (ratio > 5 || ratio < 0.2) {
        errors.push('Aspect ratio tidak wajar');
      }

      URL.revokeObjectURL(url);
      resolve({ width, height, valid: errors.length === 0, errors });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0, valid: false, errors: ['Gagal membaca gambar'] });
    };

    img.src = url;
  });
}

/**
 * Validasi kualitas gambar (deteksi gambar buram/blur)
 */
export async function validateImageQuality(file: File): Promise<{ valid: boolean; warnings: string[] }> {
  // Skip validation in non-browser environments
  if (typeof window === 'undefined' || !window.Image || typeof document === 'undefined') {
    return { valid: true, warnings: [] };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve({ valid: true, warnings: [] });
      return;
    }

    img.onload = () => {
      // Buat versi kecil untuk analisis
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;

      // Hitung kontras
      let totalContrast = 0;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        totalContrast += Math.abs(brightness - 128);
      }
      const avgContrast = totalContrast / (data.length / 4);

      const warnings: string[] = [];

      // Deteksi gambar gelap
      if (avgContrast < 20) {
        warnings.push('Gambar terlihat gelap, mungkin perlu pencahayaan');
      }

      // Deteksi gambar terang berlebihan
      if (avgContrast > 100) {
        warnings.push('Kontras tinggi, mungkin ada overexposure');
      }

      URL.revokeObjectURL(url);
      resolve({ valid: true, warnings });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: true, warnings: [] });
    };

    img.src = url;
  });
}

/**
 * Validasi komprehensif untuk upload
 */
export async function comprehensiveValidation(
  file: File,
  metadata: Partial<GalleryMetadata>
): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
  dimensions?: { width: number; height: number };
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validasi dasar
  const formatValidation = validateFileFormat(file);
  const sizeValidation = validateFileSize(file);
  const metadataValidation = validateMetadata(metadata);

  if (!formatValidation.valid) {
    errors.push(...formatValidation.errors);
  }

  if (!sizeValidation.valid) {
    errors.push(...sizeValidation.errors);
  }

  if (!metadataValidation.valid) {
    errors.push(...metadataValidation.errors);
  }

  warnings.push(...formatValidation.warnings);
  warnings.push(...sizeValidation.warnings);

  // Validasi lanjutan jika file valid
  if (errors.length === 0) {
    try {
      // Validasi dimensi
      const dimensionsValidation = await validateImageDimensions(file);
      if (!dimensionsValidation.valid) {
        errors.push(...dimensionsValidation.errors);
      } else {
        // Validasi kualitas
        const qualityValidation = await validateImageQuality(file);
        warnings.push(...qualityValidation.warnings);

        return {
          valid: errors.length === 0,
          errors,
          warnings,
          dimensions: {
            width: dimensionsValidation.width,
            height: dimensionsValidation.height,
          },
        };
      }
    } catch {
      warnings.push('Gagal melakukan validasi kualitas gambar');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validasi quota storage
 */
export async function validateStorageQuota(
  currentUsage: number,
  newFileSize: number,
  quotaLimit: number
): Promise<{ valid: boolean; error?: string }> {
  const projectedUsage = currentUsage + newFileSize;

  if (projectedUsage > quotaLimit) {
    const usedMB = (currentUsage / (1024 * 1024)).toFixed(2);
    const newMB = (newFileSize / (1024 * 1024)).toFixed(2);
    const limitMB = (quotaLimit / (1024 * 1024)).toFixed(0);

    return {
      valid: false,
      error: `Quota storage akan terlampaui. ` +
             `Saat ini: ${usedMB}MB, Ditambah: ${newMB}MB, ` +
             `Maksimal: ${limitMB}MB`
    };
  }

  return { valid: true };
}

/**
 * Validasi ekstensi untuk keamanan
 */
export function validateExtensionSecurity(filename: string): { valid: boolean; error?: string } {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (!ext) {
    return { valid: false, error: 'File tidak memiliki ekstensi' };
  }

  // Daftar ekstensi berbahaya
  const dangerousExtensions = [
    'exe', 'bat', 'cmd', 'sh', 'php', 'js', 'html', 'css',
    'sql', 'db', 'config', 'env', 'ini'
  ];

  if (dangerousExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Ekstensi ${ext} tidak diizinkan karena alasan keamanan`
    };
  }

  return { valid: true };
}

/**
 * Validasi karakter khusus dalam metadata
 */
export function validateSpecialCharacters(text: string, field: string): { valid: boolean; error?: string } {
  // Karakter yang diizinkan: huruf, angka, spasi, tanda baca umum
  const allowedPattern = /^[a-zA-Z0-9\s.,!?'"()-_]+$/;

  if (!allowedPattern.test(text)) {
    return {
      valid: false,
      error: `Field ${field} mengandung karakter khusus yang tidak diizinkan`
    };
  }

  return { valid: true };
}

/**
 * Validasi batch dengan progress tracking
 */
export async function validateBatchWithProgress(
  files: File[],
  metadata: Partial<GalleryMetadata>,
  onProgress?: (current: number, total: number) => void
): Promise<{
  valid: boolean;
  results: Array<{
    file: File;
    valid: boolean;
    errors: string[];
    warnings: string[];
    dimensions?: { width: number; height: number };
  }>;
}> {
  const results: Array<{
    file: File;
    valid: boolean;
    errors: string[];
    warnings: string[];
    dimensions?: { width: number; height: number };
  }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await comprehensiveValidation(file, metadata);

    results.push({
      file,
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
      dimensions: result.dimensions,
    });

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  const allValid = results.every(r => r.valid);

  return {
    valid: allValid,
    results,
  };
}