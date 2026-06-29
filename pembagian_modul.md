# Rencana Pengembangan Modular: Fitur Surat Perjalanan Dinas (SPD)

Dokumen ini berisi panduan pembagian kerja untuk tim pengembang front-end khusus untuk fitur baru **Surat Perjalanan Dinas (SPD)**. Fitur ini dirancang secara modular agar dapat dikerjakan oleh beberapa developer secara bersamaan tanpa saling mengganggu kode masing-masing.

---

## 1. Rencana Struktur Route & Halaman (`src/app/spd/`)

Fitur SPD akan ditempatkan pada folder rute baru `src/app/spd/` dengan struktur sebagai berikut:

```
src/app/spd/
├── layout.tsx          <-- Membungkus halaman SPD dengan Sidebar global
├── page.tsx            <-- Dashboard statistik & Tabel Daftar Usulan SPD
├── input/page.tsx      <-- Form pengajuan usulan SPD Baru
├── edit/[id]/page.tsx  <-- Form perubahan/edit usulan SPD
├── print/[id]/page.tsx <-- Tampilan Cetak Dokumen Resmi SPD & Lembar Visum (Figma Layout)
└── laporan/[id]/page.tsx <-- Form Laporan Hasil & Realisasi Pengeluaran (LHPD)
```

---

## 2. Pembagian Tugas Developer (Modular Tasks)

Fitur SPD ini dapat dipecah menjadi **4 Sub-Modul Mandiri** agar dapat dikerjakan secara paralel:

### **SUB-MODUL 1: Dashboard & List Usulan SPD (Halaman Utama)**
*   **Tanggung Jawab:** Membuat halaman utama untuk memantau status SPD dan daftar usulan.
*   **Cakupan Pekerjaan:**
    *   Membuat halaman `src/app/spd/page.tsx`.
    *   Membuat grafik statistik perjalanan dinas (contoh: jumlah perjalanan per bulan, anggaran terpakai) menggunakan Recharts.
    *   Membuat tabel daftar usulan SPD lengkap dengan filter pencarian, filter status (Draf, Diajukan, Disetujui, Berjalan, Selesai), dan tombol aksi (Edit, Detail, Cetak, Input Laporan).

### **SUB-MODUL 2: Form Usulan SPD (Input & Edit)**
*   **Tanggung Jawab:** Membuat form interaktif untuk pengisian data pengajuan perjalanan dinas.
*   **Cakupan Pekerjaan:**
    *   Membuat halaman `src/app/spd/input/page.tsx` dan `src/app/spd/edit/[id]/page.tsx`.
    *   Menyusun field form: Pejabat pemberi perintah, Pegawai yang diperintah (nama, NIP, pangkat, jabatan), Maksud Perjalanan Dinas, Alat Angkutan, Tempat Berangkat & Tujuan, serta Tanggal Mulai/Selesai.
    *   Membuat input dinamis untuk "Pengikut" (bisa tambah/hapus baris pegawai pendamping).
    *   Validasi form sebelum data dikirim ke backend.

### **SUB-MODUL 3: Template Cetak Resmi (Print-Ready Document)**
*   **Tanggung Jawab:** Menyusun tampilan cetak dokumen fisik resmi SPD yang presisi sesuai standar KOP Pemprov Jawa Barat (seperti gambar halaman cetak bertumpuk di Figma).
*   **Cakupan Pekerjaan:**
    *   Membuat halaman `src/app/spd/print/[id]/page.tsx`.
    *   Menyusun CSS khusus cetak (`@media print`, penentuan ukuran kertas A4, margin, dan *page-break*).
    *   **Halaman 1 (Depan):** Kop dinas, rincian pejabat, pegawai yang diperintah, maksud perjalanan, rute, lama perjalanan, anggaran, dan kolom tanda tangan pejabat berwenang di kanan bawah.
    *   **Halaman 2 (Belakang - Visum):** Kolom stempel kedatangan/keberangkatan instansi tujuan (Tiba di..., Berangkat dari...).

### **SUB-MODUL 4: Laporan Kegiatan & Realisasi Pengeluaran (LHPD)**
*   **Tanggung Jawab:** Membuat form setelah perjalanan selesai untuk melaporkan hasil kegiatan dan kuitansi pengeluaran.
*   **Cakupan Pekerjaan:**
    *   Membuat halaman `src/app/spd/laporan/[id]/page.tsx`.
    *   Form pengisian deskripsi kegiatan (Hasil kunjungan, kendala, dokumentasi foto).
    *   Form input pengeluaran riil (Uang harian, penginapan, tiket perjalanan) dan unggah kuitansi lampiran.

---

## 3. Skenario Alokasi Developer Tim

### **Skenario A: Jika dikerjakan oleh 2 Developer**
*   **Developer 1 (Data & Form):** Mengerjakan **SUB-MODUL 1** (Dashboard & List Usulan) dan **SUB-MODUL 2** (Form Usulan Input & Edit).
*   **Developer 2 (Dokumen & Laporan):** Mengerjakan **SUB-MODUL 3** (Template Cetak Resmi) dan **SUB-MODUL 4** (Laporan Hasil & Kuitansi).

### **Skenario B: Jika dikerjakan oleh 3 Developer (Rekomendasi)**
*   **Developer 1 (Tampilan & Dashboard):** Mengerjakan **SUB-MODUL 1** (Dashboard & List Usulan).
*   **Developer 2 (Form & Bisnis Logik):** Mengerjakan **SUB-MODUL 2** (Form Usulan Input & Edit) dan **SUB-MODUL 4** (Laporan Hasil & Kuitansi).
*   **Developer 3 (Spesialis Layout Cetak):** Mengerjakan **SUB-MODUL 3** (Template Cetak Resmi) karena pengerjaan cetak PDF/Print membutuhkan fokus tinggi pada penataan letak CSS agar presisi seperti di Figma.

---

## 4. Cara Kolaborasi Agar Tidak Terjadi Conflict
1.  **Gunakan Mock Data Lebih Dulu:** Developer 3 yang membuat template cetak dan Developer 1 yang membuat dashboard tidak perlu menunggu form input selesai. Gunakan file dummy JSON/Mock data lokal dengan struktur objek yang disepakati bersama.
2.  **Pemisahan API Endpoint:**
    *   Meskipun API diletakkan di `src/services/api.ts`, tambahkan function khusus SPD di baris paling bawah secara terpisah (misal: `getSpdList`, `createSpd`, `getSpdPrintData`), sehingga tidak mengganggu endpoint lama.
