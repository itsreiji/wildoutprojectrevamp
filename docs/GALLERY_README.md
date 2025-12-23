# Panduan Penggunaan Sistem Galeri

## 🚀 Cepat Mulai

### 1. Akses Galeri

Buka halaman galeri di aplikasi Anda. Pastikan Anda sudah login dengan role yang sesuai.

### 2. Upload Gambar

**Single Upload:**
1. Klik tombol "Upload"
2. Pilih file gambar (JPEG, PNG, WebP)
3. Isi metadata (judul, kategori, tags)
4. Klik "Upload"

**Batch Upload:**
1. Klik tombol "Upload"
2. Pilih multiple file (Ctrl/Cmd + Click)
3. Atur metadata untuk semua file
4. Klik "Upload"
5. Tunggu proses selesai

### 3. Cari Gambar

Gunakan search bar untuk mencari berdasarkan:
- Judul
- Deskripsi
- Tags
- Kategori

### 4. Filter & Sort

**Filter:**
- Kategori: Event, Partner, Team, Product, Blog, Other
- Status: Active, Inactive, Archived, Pending

**Sort:**
- Tanggal upload
- Judul
- Kategori
- Display order
- Ukuran file

### 5. Edit & Hapus

**Edit:**
1. Klik menu (⋮) pada item
2. Pilih "Edit Metadata"
3. Ubah informasi
4. Simpan perubahan

**Hapus:**
1. Klik menu (⋮) pada item
2. Pilih "Hapus"
3. Konfirmasi penghapusan

**Bulk Delete:**
1. Centang multiple items
2. Klik tombol "Hapus"
3. Konfirmasi

---

## 📋 Format File

### Didukung
- **JPEG/JPG**: `.jpg`, `.jpeg`
- **PNG**: `.png`
- **WebP**: `.webp`

### Batasan
- **Ukuran per file**: 5MB
- **Ukuran per batch**: 50MB
- **Jumlah per batch**: 20 file
- **Dimensi minimal**: 100x100px
- **Dimensi maksimal**: 10000x10000px

---

## 🏷️ Kategori

| Kategori | Kode | Kegunaan |
|----------|------|----------|
| Event | `event` | Foto acara, kegiatan |
| Partner | `partner` | Logo, branding |
| Team | `team` | Foto tim, karyawan |
| Product | `product` | Foto produk |
| Blog | `blog` | Konten artikel |
| Other | `other` | Lainnya |

---

## 🔐 Permission

### Role Pengguna

| Role | Melihat | Upload | Edit | Hapus | Manage |
|------|---------|--------|------|-------|--------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ | ✅ | ❌ |
| Contributor | ✅ | ✅ | ❌ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

### Cek Permission
```typescript
import { getCurrentUserPermissions } from '@/lib/gallery/permissions';

const permissions = await getCurrentUserPermissions();
if (permissions.can_upload) {
  // Tampilkan tombol upload
}
```

---

## 🔍 Tips Pencarian

### Cari Cepat
- Gunakan keyword sederhana
- Coba variasi kata
- Gunakan filter untuk hasil lebih spesifik

### Filter Efektif
- Kombinasikan kategori + tags
- Gunakan rentang tanggal
- Filter berdasarkan status

### Contoh Search
```
"acara tahun baru" → Cari di judul & deskripsi
"logo partner" → Cari di kategori partner
"tag1 tag2" → Cari item dengan tags tersebut
```

---

## ⚙️ Pengaturan Opsi

### Optimasi Gambar
- **Aktifkan**: File lebih kecil, upload lebih cepat
- **Nonaktifkan**: Kualitas asli terjaga

### Watermark
- **Aktifkan**: Lindungi hak cipta
- **Posisi**: Pilih lokasi watermark
- **Nonaktifkan**: Tidak ada watermark

### Display Order
- **Urutan**: 0-1000 (semakin kecil, semakin atas)
- **Default**: 0
- **Tips**: Gunakan kelipatan 10 untuk mudah diubah

---

## 📊 Statistik & Monitoring

### Storage Usage
Cek penggunaan storage di profil:
- Total file
- Space terpakai
- Space tersedia

### Activity Log
Lihat semua aktivitas:
- Upload terakhir
- Perubahan metadata
- Penghapusan

---

## 🛠️ Troubleshooting

### Upload Gagal
```
❌ Format tidak didukung
   → Gunakan JPEG, PNG, atau WebP

❌ File terlalu besar
   → Compress gambar atau hubungi admin

❌ Quota penuh
   → Hapus file lama atau minta peningkatan
```

### Tidak Bisa Edit
```
❌ "Bukan pemilik"
   → Hanya pemilik/admin yang bisa edit

❌ "Tidak memiliki izin"
   → Hubungi admin untuk perubahan role
```

### Search Tidak Hasil
```
❌ Keyword terlalu spesifik
   → Coba keyword yang lebih umum

❌ Filter terlalu ketat
   → Kurangi filter yang digunakan
```

---

## 💡 Best Practices

### Upload
1. **Pilih kategori tepat** → Memudahkan pencarian
2. **Tambahkan tags** → Meningkatkan discoverability
3. **Gunakan judul deskriptif** → Mudah diingat
4. **Optimasi gambar** → Hemat storage
5. **Watermark jika perlu** → Lindungi konten

### Organisasi
1. **Display order** → Atur urutan tampilan
2. **Konsisten naming** → Standar penamaan
3. **Batch upload** → Efisien untuk banyak file
4. **Backup rutin** → Amankan data

### Maintenance
1. **Hapus file tidak terpakai** → Hemat space
2. **Review audit log** → Monitor aktivitas
3. **Cek backup** → Pastikan data aman
4. **Update metadata** → Jaga relevansi

---

## 📞 Bantuan

### Error Umum
- **"Connection error"**: Cek koneksi internet
- **"Permission denied"**: Hubungi admin
- **"Storage full"**: Hapus file atau minta quota

### Kontak Support
- Dokumen: `DOCS_GALLERY_SYSTEM.md`
- Kode: `src/lib/gallery/`
- Komponen: `src/components/gallery/`

---

## 🎯 Checklist Sebelum Upload

- [ ] File format benar (JPEG/PNG/WebP)
- [ ] Ukuran ≤ 5MB
- [ ] Dimensi ≥ 100x100px
- [ ] Kategori sudah dipilih
- [ ] Judul sudah diisi
- [ ] Tags relevan (opsional)
- [ ] Watermark jika perlu
- [ ] Optimasi diaktifkan

---

## 📝 Contoh Penggunaan

### Event Photography
```
Kategori: event
Judul: "Konser Musik 2024"
Tags: ["musik", "live", "2024"]
Display Order: 10
Watermark: ✅
Optimasi: ✅
```

### Product Showcase
```
Kategori: product
Judul: "Produk Premium X"
Tags: ["premium", "produk-x", "showcase"]
Display Order: 5
Watermark: ❌
Optimasi: ✅
```

### Team Photo
```
Kategori: team
Judul: "Foto Tim Marketing"
Tags: ["marketing", "team", "2024"]
Display Order: 20
Watermark: ✅
Optimasi: ✅
```

---

**Untuk informasi lebih detail, lihat: `DOCS_GALLERY_SYSTEM.md`**