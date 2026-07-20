export type StatusType = 'Menunggu' | 'Ditolak' | 'Selesai' | 'Disetujui' | 'Pengerjaan';

export interface FormPerubahanIT {
  id: number;
  no_rfc?: string;
  pemohon: string;
  unit_kerja?: string;
  perangkat_daerah_id?: number;
  nama_perangkat_daerah?: string;
  nomor_kontak: string;
  email_dinas?: string;
  jenis_perubahan: string[];
  jenis_permohonan: string[];
  nama_aplikasi: string;
  deskripsi_aplikasi?: string;
  alamat_aplikasi: string;
  alamat_repository?: string;
  latar_belakang?: string;
  rincian_perubahan?: string;
  risiko_tidak_dilakukan?: string;
  kriteria_risiko: string[];
  keterangan?: string;
  solusi_diharapkan?: string;
  risiko_perubahan?: string;
  alternatif_perubahan?: string;
  biaya_perubahan?: string;
  waktu_perubahan?: string;
  // Field lama (tidak dipakai di BE terbaru, dijaga kompatibilitas)
  lampiran?: string;
  status?: string;
  tanggal_permohonan: string;
  created_at?: string;
  // Field dari BE: path file di storage
  tanda_tangan_file?: string;
  // dokumen_pendukung_file dari BE adalah JSON string array path, contoh: '["dokumen_pendukung/a.pdf"]'
  dokumen_pendukung_file?: string;
  // Field dari BE: URL lengkap siap pakai untuk <img> dan <a>
  tanda_tangan_url?: string;
  // FIX: BE mengirim array (jamak, multi-file), bukan single string
  dokumen_pendukung_urls?: string[];
}