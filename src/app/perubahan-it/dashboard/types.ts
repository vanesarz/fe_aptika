export type StatusType = 'Baru' | 'Nonaktif' | 'Migrasi';

export interface FormPerubahanIT {
  id: number;
  no_rfc?: string;
  pemohon: string;
  unit_kerja?: string;
  perangkat_daerah_id?: number;
  nama_perangkat_daerah?: string;
  nomor_kontak: string;
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
  tanggal_permohonan: string;
  created_at?: string;
}