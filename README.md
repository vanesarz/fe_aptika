# Raptika Frontend Web App

Aplikasi Frontend untuk dashboard Raptika (Sistem Pendataan 6 Aplikasi di bawah Dinas Komunikasi dan Informatika Jawa Barat). Project ini dibangun menggunakan Next.js 16 (React 19) dan TypeScript serta dioptimalkan menggunakan Next.js standalone output.

Aplikasi ini menyajikan dashboard interaktif untuk memonitor data integrasi, replikasi aplikasi, mentoring perangkat daerah, interoperabilitas, hingga statistik keamanan aplikasi (vulnerabilities).

---

## Prasyarat
Sebelum memulai, pastikan Anda telah menginstal software berikut di laptop Anda:
1. **Docker Desktop** (Pastikan aplikasi Docker Desktop sudah dalam posisi Running)
2. **Git**

---

## Panduan Pemasangan & Menjalankan (Docker)

Ikuti langkah-langkah di bawah ini untuk menjalankan frontend:

### 1. Jalankan Container Docker
Bangun (build) dan jalankan container Next.js secara background:
```bash
cd raptika-fe
docker compose up -d --build
```
Perintah ini akan secara otomatis mengompilasi dan mengoptimalkan aset Next.js untuk lingkungan produksi.

### 2. Selesai!
Aplikasi dashboard Anda sekarang dapat diakses melalui browser di:
* **URL Dashboard**: http://localhost:3000

---

## Penyesuaian Environment API URL

Secara default, frontend di dalam Docker diarahkan untuk membaca API backend yang berjalan di http://localhost:8000/api. 

Jika backend Anda berjalan di alamat atau port yang berbeda:
1. Buka file `docker-compose.yml` di folder `raptika-fe`.
2. Ubah baris argumen `NEXT_PUBLIC_API_URL` dengan URL backend baru Anda:
   ```yaml
   args:
     - NEXT_PUBLIC_API_URL=http://alamat-backend-anda:port/api
   ```
3. Bangun ulang container Anda agar perubahan terkompilasi:
   ```bash
   docker compose up -d --build
   ```

---

## Perintah Penting Lainnya

* **Menghentikan Container**:
  ```bash
  docker compose down
  ```
* **Melihat Log Aplikasi**:
  ```bash
  docker compose logs -f
  ```
