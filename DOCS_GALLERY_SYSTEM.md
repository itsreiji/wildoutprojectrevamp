# Sistem Manajemen Galeri - Dokumentasi Operasional

## 📋 Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Struktur Direktori](#struktur-direktori)
3. [Instalasi & Konfigurasi](#instalasi--konfigurasi)
4. [Standar Penamaan File](#standar-penamaan-file)
5. [Format File yang Didukung](#format-file-yang-didukung)
6. [Sistem Kategori](#sistem-kategori)
7. [Metadata Standar](#metadata-standar)
8. [Upload & Validasi](#upload--validasi)
9. [Sistem Permission](#sistem-permission)
10. [Pencarian & Filter](#pencarian--filter)
11. [Audit & Backup](#audit--backup)
12. [Optimasi & Watermark](#optimasi--watermark)
13. [Troubleshooting](#troubleshooting)
14. [Best Practices](#best-practices)

---

## 🎯 Gambaran Umum

Sistem manajemen galeri ini menyediakan solusi terstandarisasi untuk mengelola aset gambar dengan fitur lengkap termasuk upload batch, validasi, pencarian, permission, audit, dan backup otomatis.

### Fitur Utama
- ✅ Upload batch dengan validasi format dan ukuran
- ✅ Sistem kategori dan tags terstruktur
- ✅ Pencarian dan filter komprehensif
- ✅ Permission berbasis role
- ✅ Audit log lengkap
- ✅ Backup otomatis berkala
- ✅ Optimasi gambar otomatis
- ✅ Watermarking opsional
- ✅ Versiing untuk perubahan
- ✅ Antarmuka responsif

---

## 📁 Struktur Direktori

```
src/
├── lib/
│   └── gallery/
│       ├── constants.ts      # Konstanta dan konfigurasi
│       ├── types.ts          # Definisi tipe data
│       ├── validation.ts     # Validasi file dan metadata
│       ├── upload.ts         # Sistem upload batch
│       ├── search.ts         # Pencarian dan filter
│       ├── permissions.ts    # Sistem permission
│       └── audit.ts          # Audit log dan backup
├── components/
│   └── gallery/
│       ├── GalleryGrid.tsx   # Antarmuka utama
│       └── GalleryUpload.tsx # Komponen upload
└── supabase/
    ├── client.ts             # Supabase client
    └── types.ts              # Tipe database
```

### Database Schema
```sql
-- Tabel utama galeri
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  title TEXT,
  description TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'active',
  metadata JSONB,
  partner_id TEXT,
  event_id TEXT,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  user_id UUID,
  user_role TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel backup
CREATE TABLE gallery_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL,
  file_count INTEGER,
  total_size INTEGER,
  storage_path TEXT,
  created_by UUID REFERENCES auth.users(id),
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel maintenance
CREATE TABLE maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  status TEXT,
  progress INTEGER,
  result JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);
```

---

## 🔧 Instalasi & Konfigurasi

### 1. Persyaratan
- Node.js 18+
- Supabase project
- React 18+ (jika menggunakan frontend)

### 2. Konfigurasi Supabase

Pastikan environment variables terkonfigurasi:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Storage Setup

Buat bucket storage di Supabase:
```bash
# Bucket untuk galeri
supabase storage create bucket gallery

# Bucket untuk backup
supabase storage create bucket backups

# Set public access untuk galeri
supabase storage bucket update gallery --public
```

### 4. RLS (Row Level Security)

Aktifkan RLS dan buat policy:
```sql
-- Gallery items policies
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- View all
CREATE POLICY "View gallery items" ON gallery_items
  FOR SELECT USING (true);

-- Insert (authenticated only)
CREATE POLICY "Insert gallery items" ON gallery_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update own items or admin
CREATE POLICY "Update gallery items" ON gallery_items
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Delete own items or admin
CREATE POLICY "Delete gallery items" ON gallery_items
  FOR DELETE USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 📝 Standar Penamaan File

### Format File
```
{category}_{timestamp}_{originalName}.{ext}
```

### Contoh
```
event_20241221_143022_acara_tahun_baru.jpg
partner_20241221_143023_logo_perusahaan.png
team_20241221_143024_foto_kelompok.jpg
```

### Aturan Penamaan
1. **Kategori**: lowercase, tanpa spasi
2. **Timestamp**: `YYYYMMDD_HHmmss`
3. **Original name**: lowercase, spasi diganti underscore
4. **Ekstensi**: lowercase

### Karakter yang Diizinkan
- Huruf: a-z
- Angka: 0-9
- Separator: underscore (_), dash (-)
- Ekstensi: .jpg, .jpeg, .png, .webp

### Karakter yang Dilarang
- Spasi (diganti underscore)
- Karakter khusus: !@#$%^&*()+=[]{}|;:'",<>?/`
- Path traversal: ../, ./

---

## 🎨 Format File yang Didukung

### Gambar
| Format | MIME Type | Ekstensi | Ukuran Maks | Kualitas Default |
|--------|-----------|----------|-------------|------------------|
| JPEG | image/jpeg | .jpg, .jpeg | 5MB | 85% |
| PNG | image/png | .png | 5MB | 90% |
| WebP | image/webp | .webp | 5MB | 80% |

### Batasan Upload
- **Per file**: 5MB
- **Per batch**: 50MB
- **Jumlah file per batch**: 20 file
- **Total storage**: 100MB (default, bisa diubah)

### Validasi Otomatis
- ✅ Format file
- ✅ Ukuran file
- ✅ Dimensi gambar (min 100x100px, max 10000x10000px)
- ✅ Aspect ratio (0.2 - 5)
- ✅ Kualitas gambar (opsional)
- ✅ Karakter nama file

---

## 🏷️ Sistem Kategori

### Kategori Standar
| Kategori | Deskripsi | Contoh Penggunaan |
|----------|-----------|-------------------|
| `event` | Acara dan kegiatan | Foto event, konser, seminar |
| `partner` | Logo dan branding partner | Logo perusahaan, brand |
| `team` | Foto tim dan karyawan | Profil karyawan, team building |
| `product` | Foto produk | Katalog produk, showcase |
| `blog` | Gambar konten blog | Artikel, featured image |
| `other` | Kategori umum | Gambar lainnya |

### Kustomisasi Kategori
Anda dapat menambahkan kategori baru di `src/lib/gallery/constants.ts`:
```typescript
export const GALLERY_CATEGORIES = {
  ...EXISTING_CATEGORIES,
  CUSTOM: 'custom', // Tambahkan di sini
} as const;
```

---

## 📋 Metadata Standar

### Metadata Wajib
```typescript
interface GalleryMetadata {
  title?: string;           // Judul gambar
  description?: string;     // Deskripsi
  category?: string;        // Kategori
  tags?: string[];          // Tags (max 10)
  author?: string;          // User ID uploader
}
```

### Metadata Opsional
```typescript
{
  event_id?: string;        // ID event terkait
  partner_id?: string;      // ID partner terkait
  display_order?: number;   // Urutan tampilan (0-1000)
  watermark?: boolean;      // Tambah watermark
  optimize?: boolean;       // Optimasi gambar
  original_filename?: string; // Nama file asli
  file_size?: number;       // Ukuran file (bytes)
  dimensions?: {            // Dimensi gambar
    width: number;
    height: number;
  };
  color_profile?: string;   // Color profile
}
```

### Validasi Metadata
- **Judul**: 3-200 karakter
- **Deskripsi**: max 1000 karakter
- **Tags**: max 10 tags, masing-masing 2-50 karakter
- **Display order**: 0-1000
- **Category**: harus dari daftar standar

---

## ⬆️ Upload & Validasi

### Single Upload
```typescript
import { processFileUpload } from '@/lib/gallery/upload';

const result = await processFileUpload(
  {
    file: selectedFile,
    metadata: {
      title: 'Judul Gambar',
      category: 'event',
      tags: ['tag1', 'tag2'],
    }
  },
  userId,
  userRole,
  currentStorageUsage
);
```

### Batch Upload
```typescript
import { processBatchUpload } from '@/lib/gallery/upload';

const items = files.map(file => ({
  file,
  metadata: {
    category: 'event',
    tags: ['batch', 'upload'],
    watermark: true,
    optimize: true,
  }
}));

const result = await processBatchUpload(
  items,
  userId,
  userRole,
  (current, total, result) => {
    console.log(`Progress: ${current}/${total}`);
  }
);
```

### Proses Upload
1. **Validasi File**: Format, ukuran, dimensi
2. **Validasi Metadata**: Kategori, tags, format
3. **Optimasi**: Resize dan compress (jika diaktifkan)
4. **Watermark**: Tambah watermark (jika diaktifkan)
5. **Upload Storage**: Simpan ke Supabase
6. **Simpan Database**: Insert metadata
7. **Log Audit**: Catat aktivitas

### Error Handling
```typescript
const result = await processFileUpload(...);

if (!result.success) {
  console.error('Upload gagal:', result.error);
  // Tampilkan pesan ke user
  toast.error(result.error);
}
```

---

## 🔐 Sistem Permission

### Role dan Permission

| Role | View | Upload | Edit | Delete | Manage |
|------|------|--------|------|--------|--------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Contributor** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Guest** | ❌ | ❌ | ❌ | ❌ | ❌ |

### Cek Permission
```typescript
import { hasPermission, getCurrentUserPermissions } from '@/lib/gallery/permissions';

// Cek single permission
const canUpload = await hasPermission('editor', 'can_upload');

// Get all permissions
const permissions = await getCurrentUserPermissions();
if (permissions.can_upload) {
  // Tampilkan tombol upload
}
```

### Proteksi Komponen
```typescript
import { withPermissionGuard } from '@/lib/gallery/permissions';

const ProtectedGallery = withPermissionGuard(GalleryGrid, 'can_view');

// Gunakan seperti komponen biasa
<ProtectedGallery />
```

### Validasi Akses Item
```typescript
import { validateItemAccess } from '@/lib/gallery/permissions';

const validation = await validateItemAccess(itemId, userId, 'can_edit');

if (!validation.allowed) {
  toast.error(validation.reason);
  return;
}
```

---

## 🔍 Pencarian & Filter

### Basic Search
```typescript
import { searchGallery } from '@/lib/gallery/search';

const result = await searchGallery(
  {
    search_query: 'acara tahun baru',
    category: ['event'],
    status: ['active']
  },
  { field: 'created_at', direction: 'desc' },
  { page: 1, limit: 20 }
);
```

### Filter Komprehensif
```typescript
const filters = {
  // Pencarian text
  search_query: 'keyword',
  
  // Kategori
  category: ['event', 'product'],
  
  // Tags
  tags: ['tag1', 'tag2'],
  
  // Status
  status: ['active', 'pending'],
  
  // Tanggal
  date_from: '2024-01-01',
  date_to: '2024-12-31',
  
  // Relasi
  partner_id: 'partner-uuid',
  event_id: 'event-uuid',
  
  // Creator
  created_by: 'user-uuid',
};

const result = await searchGallery(filters, sort, pagination);
```

### Sorting
```typescript
const sort = {
  field: 'created_at', // created_at, title, category, display_order, file_size
  direction: 'desc'    // asc, desc
};
```

### Advanced Search
```typescript
import { advancedSearch } from '@/lib/gallery/search';

const result = await advancedSearch({
  search_query: 'keyword',
  min_size: 1024 * 1024,      // Min 1MB
  max_size: 5 * 1024 * 1024,  // Max 5MB
  min_width: 800,
  min_height: 600,
  has_metadata: true,
  has_tags: true,
});
```

### Search Suggestions
```typescript
import { getSearchSuggestions } from '@/lib/gallery/search';

const suggestions = await getSearchSuggestions('acara', 5);
// ['acara tahun baru', 'acara musik', ...]
```

### Aggregations
```typescript
// By date
import { searchWithDateAggregation } from '@/lib/gallery/search';
const byDate = await searchWithDateAggregation(filters, 'month');

// By category
import { searchWithCategoryBreakdown } from '@/lib/gallery/search';
const byCategory = await searchWithCategoryBreakdown(filters);

// By size
import { searchWithSizeAggregation } from '@/lib/gallery/search';
const bySize = await searchWithSizeAggregation(filters);
```

---

## 📊 Audit & Backup

### Audit Log

Semua aktivitas galeri otomatis tercatat:
- Upload (single & batch)
- Update metadata
- Delete (single & bulk)
- Restore backup
- Maintenance

### Melihat Audit Log
```typescript
import { getAuditLogs } from '@/lib/gallery/audit';

const logs = await getAuditLogs(
  {
    action: 'gallery_upload',
    user_id: 'user-uuid',
    date_from: '2024-01-01',
  },
  { page: 1, limit: 50 }
);
```

### Export Audit Log
```typescript
import { exportAuditLogs } from '@/lib/gallery/audit';

// JSON format
const json = await exportAuditLogs('json', {
  action: 'gallery_upload',
  date_from: '2024-01-01',
});

// CSV format
const csv = await exportAuditLogs('csv', {
  user_id: 'user-uuid',
});
```

### User Activity Summary
```typescript
import { getUserActivitySummary } from '@/lib/gallery/audit';

const summary = await getUserActivitySummary('user-uuid', 30);
// {
//   total_actions: 150,
//   actions_by_type: { gallery_upload: 100, gallery_delete: 50 },
//   recent_actions: [...],
//   storage_changes: 120
// }
```

### Backup System

#### Manual Backup
```typescript
import { createBackup } from '@/lib/gallery/backup';

const result = await createBackup('daily', userId);
if (result.success) {
  console.log('Backup created:', result.backupId);
}
```

#### Auto Backup
```typescript
import { runAutoBackup } from '@/lib/gallery/backup';

const result = await runAutoBackup(userId);
// Otomatis membuat backup yang jatuh tempo
```

#### Restore Backup
```typescript
import { restoreFromBackup } from '@/lib/gallery/backup';

const result = await restoreFromBackup('backup-uuid', userId);
if (result.success) {
  console.log('Restore berhasil');
}
```

#### Check Backup Schedule
```typescript
import { checkBackupSchedule } from '@/lib/gallery/backup';

const schedule = await checkBackupSchedule();
// {
//   due_daily: true,
//   due_weekly: false,
//   due_monthly: false,
//   last_backup: {...}
// }
```

### Maintenance Tasks
```typescript
import { runCleanupTask, createMaintenanceTask } from '@/lib/gallery/audit';

// Buat task
const task = await createMaintenanceTask('cleanup', userId);

// Jalankan cleanup
const result = await runCleanupTask(task.taskId, userId);
```

---

## 🖼️ Optimasi & Watermark

### Optimasi Gambar

**Default Settings**:
```typescript
const IMAGE_OPTIMIZATION = {
  THUMBNAIL: { width: 300, height: 300, quality: 80 },
  MEDIUM: { width: 800, height: 600, quality: 85 },
  LARGE: { width: 1920, height: 1080, quality: 90 },
};
```

**Upload dengan Optimasi**:
```typescript
const result = await processFileUpload(
  {
    file,
    metadata: {
      optimize: true,  // Aktifkan optimasi
      // ...
    }
  },
  userId,
  userRole,
  usage
);
```

### Watermark

**Posisi Watermark**:
- `top-left`
- `top-right`
- `bottom-left` (default)
- `bottom-right`
- `center`

**Upload dengan Watermark**:
```typescript
const result = await processFileUpload(
  {
    file,
    metadata: {
      watermark: true,
      watermark_position: 'bottom-right',
      // ...
    }
  },
  userId,
  userRole,
  usage
);
```

**Konfigurasi Watermark**:
```typescript
const watermarkConfig = {
  text: 'WildOut Project',
  position: 'bottom-right',
  opacity: 0.3,
  size: 48,
  color: '#FFFFFF',
};
```

---

## 🐛 Troubleshooting

### 1. Upload Gagal

**Masalah**: "Format file tidak didukung"
- **Solusi**: Pastikan file JPEG, PNG, atau WebP

**Masalah**: "File terlalu besar"
- **Solusi**: Compress gambar atau hubungi admin untuk peningkatan quota

**Masalah**: "Quota storage terlampaui"
- **Solusi**: Hapus file lama atau minta peningkatan quota

### 2. Permission Error

**Masalah**: "Tidak memiliki izin"
- **Solusi**: Hubungi admin untuk perubahan role

**Masalah**: "Bukan pemilik item"
- **Solusi**: Hanya admin atau pemilik yang bisa mengedit

### 3. Search Tidak Berfungsi

**Masalah**: Hasil pencarian kosong
- **Solusi**: Pastikan keyword tidak terlalu spesifik, coba filter yang lebih luas

**Masalah**: Filter tidak bekerja
- **Solusi**: Clear cache dan refresh halaman

### 4. Database Error

**Masalah**: "Connection timeout"
- **Solusi**: Cek koneksi internet, coba reload

**Masalah**: "RLS policy denied"
- **Solusi**: Pastikan user sudah login dan memiliki role yang benar

### 5. Storage Error

**Masalah**: "Storage unavailable"
- **Solusi**: Cek status Supabase, pastikan bucket sudah dibuat

**Masalah**: "File not found"
- **Solusi**: File mungkin sudah dihapus atau path salah

---

## ✅ Best Practices

### 1. Upload
- ✅ Selalu validasi file sebelum upload
- ✅ Gunakan kategori yang tepat
- ✅ Tambahkan tags untuk pencarian mudah
- ✅ Gunakan watermark untuk brand protection
- ✅ Optimasi gambar untuk performa

### 2. Metadata
- ✅ Gunakan judul yang deskriptif
- ✅ Tambahkan deskripsi untuk konteks
- ✅ Gunakan tags yang relevan (max 10)
- ✅ Urutkan display order dengan bijak

### 3. Permission
- ✅ Gunakan principle of least privilege
- ✅ Audit permission secara berkala
- ✅ Log semua perubahan permission
- ✅ Backup sebelum perubahan besar

### 4. Backup
- ✅ Jadwalkan backup harian
- ✅ Simpan backup di lokasi aman
- ✅ Test restore proses
- ✅ Monitor ukuran backup

### 5. Performance
- ✅ Gunakan pagination untuk list besar
- ✅ Cache hasil search
- ✅ Optimasi gambar di sisi server
- ✅ Gunakan thumbnail untuk preview

### 6. Security
- ✅ Validasi semua input user
- ✅ Sanitize filename
- ✅ Cek file type di server
- ✅ Monitor quota usage
- ✅ Log semua aktivitas

### 7. Maintenance
- ✅ Jalankan cleanup berkala
- ✅ Monitor storage usage
- ✅ Check backup schedule
- ✅ Review audit log mingguan

---

## 📞 Support

Untuk bantuan lebih lanjut:
1. Cek dokumentasi di folder `src/lib/gallery/`
2. Review contoh penggunaan di `src/components/gallery/`
3. Hubungi tim teknis untuk issue kritis

---

## 🔄 Update Log

### v1.0.0 (2024-12-21)
- ✅ Sistem upload batch
- ✅ Validasi komprehensif
- ✅ Permission berbasis role
- ✅ Audit log
- ✅ Backup otomatis
- ✅ Optimasi gambar
- ✅ Watermarking
- ✅ Pencarian & filter
- ✅ Antarmuka responsif

---

**Dokumentasi ini akan terus diperbarui sesuai dengan perkembangan sistem.**