import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://beaptika-production.up.railway.app/api",
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

// ✅ Auto-attach token ke setiap request
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Auto-redirect ke login kalau token expired (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ────────────────────────────────────────────────
export const login = async (email: string, password: string) => {
  const res = await api.post("/login", { email, password });
  return res.data; // expects { token, user }
};

export const logout = async () => {
  await api.post("/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ─── SPD ────────────────────────────────────────────────
export const normalizeSpdStatus = (status?: string) => {
  const normalized = (status || "").toLowerCase();

  switch (normalized) {
    case "draf":
    case "draft":
      return "draft";
    case "diajukan":
    case "submitted":
      return "submitted";
    case "disetujui":
    case "approved":
      return "approved";
    case "dalam proses":
    case "in_progress":
    case "in progress":
      return "in_progress";
    case "selesai":
    case "completed":
      return "completed";
    default:
      return "draft";
  }
};

export const fromApiSpdItem = (item: any) => {
  const source = item?.data && typeof item.data === "object" && !Array.isArray(item.data) ? item.data : item;
  const status = String(source?.status || "draft");
  const displayStatus = status === "draft"
    ? "DRAF"
    : status === "submitted"
      ? "DIAJUKAN"
      : status === "approved"
        ? "DISETUJUI"
        : status === "completed"
          ? "SELESAI"
          : status === "in_progress"
            ? "DALAM PROSES"
            : status.toUpperCase();

  const followers = Array.isArray(source?.followers) ? source.followers : Array.isArray(source?.pengikut) ? source.pengikut : [];
  const mappedPengikut = followers.map((follower: any) => ({
    nama: follower?.name || follower?.nama || "",
    tglLahir: follower?.nip || follower?.tglLahir || "",
    keterangan: follower?.position || follower?.keterangan || "",
  }));

  return {
    id: source?.id,
    pejabatPemberi: source?.orderer_name || source?.pejabatPemberi || "",
    ordererNip: source?.orderer_nip || source?.ordererNip || "",
    ordererPosition: source?.orderer_position || source?.ordererPosition || "",
    nama: source?.employee_name || source?.nama || "",
    nip: source?.employee_nip || source?.nip || "",
    pangkat: source?.employee_rank || source?.pangkat || "",
    jabatan: source?.employee_position || source?.jabatan || "",
    maksud: source?.purpose || source?.maksud || "",
    angkutan: source?.transportation || source?.angkutan || "",
    tempatBerangkat: source?.departure_place || source?.tempatBerangkat || "",
    tempatTujuan: source?.destination || source?.tempatTujuan || "",
    tujuan: source?.destination || source?.tempatTujuan || "",
    tglMulai: source?.start_date || source?.tglMulai || "",
    tglSelesai: source?.end_date || source?.tglSelesai || "",
    durasi: source?.durasi || source?.duration || 0,
    pengikut: mappedPengikut,
    anggaran: source?.budget_estimate ?? source?.anggaran ?? 0,
    status: displayStatus,
    rawStatus: source?.status || "draft",
    raw: source,
  };
};

export const toApiSpdPayload = (payload: any) => {
  const result: any = {};
  
  if (payload.pejabatPemberi !== undefined || payload.orderer_name !== undefined) {
    result.orderer_name = payload.pejabatPemberi ?? payload.orderer_name ?? "";
  }
  if (payload.ordererNip !== undefined || payload.orderer_nip !== undefined) {
    result.orderer_nip = payload.ordererNip ?? payload.orderer_nip ?? "";
  }
  if (payload.ordererPosition !== undefined || payload.orderer_position !== undefined) {
    result.orderer_position = payload.ordererPosition ?? payload.orderer_position ?? "";
  }
  if (payload.nama !== undefined || payload.employee_name !== undefined) {
    result.employee_name = payload.nama ?? payload.employee_name ?? "";
  }
  if (payload.nip !== undefined || payload.employee_nip !== undefined) {
    result.employee_nip = payload.nip ?? payload.employee_nip ?? "";
  }
  if (payload.pangkat !== undefined || payload.employee_rank !== undefined) {
    result.employee_rank = payload.pangkat ?? payload.employee_rank ?? "";
  }
  if (payload.jabatan !== undefined || payload.employee_position !== undefined) {
    result.employee_position = payload.jabatan ?? payload.employee_position ?? "";
  }
  if (payload.maksud !== undefined || payload.purpose !== undefined) {
    result.purpose = payload.maksud ?? payload.purpose ?? "";
  }
  if (payload.angkutan !== undefined || payload.transportation !== undefined) {
    result.transportation = payload.angkutan ?? payload.transportation ?? "";
  }
  if (payload.tempatBerangkat !== undefined || payload.departure_place !== undefined) {
    result.departure_place = payload.tempatBerangkat ?? payload.departure_place ?? "";
  }
  if (payload.tempatTujuan !== undefined || payload.destination !== undefined) {
    result.destination = payload.tempatTujuan ?? payload.destination ?? "";
    result.tempatTujuan = payload.tempatTujuan ?? payload.destination ?? "";
  }
  if (payload.tglMulai !== undefined || payload.start_date !== undefined) {
    result.start_date = payload.tglMulai ?? payload.start_date ?? "";
  }
  if (payload.tglSelesai !== undefined || payload.end_date !== undefined) {
    result.end_date = payload.tglSelesai ?? payload.end_date ?? "";
  }
  if (payload.anggaran !== undefined || payload.budget_estimate !== undefined) {
    result.budget_estimate = Number(payload.anggaran ?? payload.budget_estimate ?? 0);
  }
  if (payload.pengikut !== undefined || payload.followers !== undefined) {
    result.followers = (payload.pengikut ?? payload.followers ?? []).map((follower: any) => ({
      name: follower?.name || follower?.nama || "",
      nip: follower?.nip || follower?.tglLahir || "",
      position: follower?.position || follower?.keterangan || "",
    }));
  }
  if (payload.status !== undefined) {
    result.status = normalizeSpdStatus(payload.status);
  }
  
  return result;
};

export const getSpdList = async (params?: { search?: string; status?: string }) => {
  const res = await api.get("/spd", { params });
  return res.data;
};

export const getSpdById = async (id: number) => {
  const res = await api.get(`/spd/${id}`);
  return res.data;
};

export const createSpd = async (payload: any) => {
  const res = await api.post("/spd", toApiSpdPayload(payload));
  return res.data;
};

export const updateSpd = async (id: number, payload: any) => {
  const res = await api.put(`/spd/${id}`, toApiSpdPayload(payload));
  return res.data;
};

export const deleteSpd = async (id: number) => {
  // Menggunakan POST dengan method spoofing untuk mengakali bug PHP 8.2 pada package Symfony
  const res = await api.post(`/spd/${id}`, { _method: "DELETE" });
  return res.data;
};

export const getSpdStats = async () => {
  const res = await api.get("/spd/stats");
  return res.data;
};

// ─── SPD DETAIL PERJALANAN (API Baru) ──────────────────────
export const getDetailPerjalananList = async (params?: { search?: string }) => {
  const res = await api.get("/spd/detail-perjalanan", { params });
  return res.data;
};

export const getDetailPerjalananById = async (id: number) => {
  const res = await api.get(`/spd/detail-perjalanan/${id}`);
  return res.data;
};

export const fromApiDetailPerjalanan = (item: any) => {
  const source =
    item?.data && typeof item.data === "object" && !Array.isArray(item.data)
      ? item.data
      : item;

  const pesertaList = Array.isArray(source?.peserta) ? source.peserta : [];
  const mainPeserta = pesertaList[0]?.pegawai || {};
  const followers = pesertaList.slice(1).map((p: any) => ({
    nama: p?.pegawai?.nama || "",
    nip: p?.pegawai?.nip || "",
    pangkat: p?.pegawai?.pangkat || "",
    jabatan: p?.pegawai?.jabatan || "",
    role: p?.pegawai?.role || "staff",
    nomorSpd: p?.nomor_spd || "",
    tglLahir: p?.pegawai?.tanggal_lahir || "",
    keterangan: p?.pegawai?.nip || "",
  }));

  const participants = pesertaList.map((p: any) => ({
    id: p?.id,
    nomorSpd: p?.nomor_spd || source?.travel_code || "",
    nama: p?.pegawai?.nama || "",
    nip: p?.pegawai?.nip || "",
    pangkat: p?.pegawai?.pangkat || "",
    jabatan: p?.pegawai?.jabatan || "",
    role: p?.pegawai?.role || "staff",
    tglLahir: p?.pegawai?.tanggal_lahir || "",
    keterangan: p?.pegawai?.nip || "",
  }));

  return {
    id: source?.id,
    travelCode: source?.travel_code || source?.travelCode || "",
    noSpd: source?.peserta?.[0]?.nomor_spd || source?.travel_code || "",
    tujuan: source?.tujuan || source?.destination || "",
    tempatTujuan: source?.tujuan || source?.destination || "",
    deskripsi: source?.deskripsi || source?.description || "",
    maksud: source?.deskripsi || source?.description || "",
    tempatBerangkat:
      source?.tempat_berangkat ||
      source?.departure_place ||
      source?.tempatBerangkat ||
      "Bandung",
    tglMulai:
      source?.tanggal_berangkat ||
      source?.tanggal_mulai ||
      source?.start_date ||
      source?.tglMulai ||
      "",
    tglSelesai:
      source?.tanggal_kembali ||
      source?.tanggal_selesai ||
      source?.end_date ||
      source?.tglSelesai ||
      "",
    status:
      source?.status === "selesai"
        ? "SELESAI"
        : source?.status === "belum_selesai"
        ? "BELUM SELESAI"
        : (source?.status || "").toUpperCase(),
    rawStatus: source?.status,
    nama: mainPeserta?.nama || "",
    nip: mainPeserta?.nip || "",
    pangkat: mainPeserta?.pangkat || "",
    jabatan: mainPeserta?.jabatan || "",
    role: mainPeserta?.role || "staff",
    pengikut: followers,
    participants: participants,
    kegiatan: source?.kegiatan || "",
    subKegiatan: source?.sub_kegiatan || "",
    kodeRekening: source?.rekening?.kode_rekening || "",
    pejabatPemberi: source?.rekening?.nama_rekening || "Sekretaris Dinas Komunikasi dan Informatika Provinsi Jawa Barat",
    angkutan: source?.alat_angkutan || "Kendaraan Dinas",
    raw: source,
  };
};

export const createDetailPerjalanan = async (payload: any) => {
  const res = await api.post("/spd/detail-perjalanan", payload);
  return res.data;
};

export const updateDetailPerjalanan = async (id: number, payload: any) => {
  const res = await api.put(`/spd/detail-perjalanan/${id}`, payload);
  return res.data;
};

export const updateDetailPerjalananStatus = async (id: number, status: "belum_selesai" | "selesai") => {
  const res = await api.patch(`/spd/detail-perjalanan/${id}/status`, { status });
  return res.data;
};

export const deleteDetailPerjalanan = async (id: number) => {
  const res = await api.delete(`/spd/detail-perjalanan/${id}`);
  return res.data;
};
 
export const getPegawaiList = async () => {
  const res = await api.get("/spd/pegawai");
  return res.data;
};

export const createPegawai = async (payload: any) => {
  const res = await api.post("/spd/pegawai", payload);
  return res.data;
};

export const createSpdPeserta = async (payload: { detail_perjalanan_id: number; pegawai_id: number[] }) => {
  const res = await api.post("/spd/spd-peserta", payload);
  return res.data;
};

export const getRekeningList = async () => {
  const res = await api.get("/spd/rekening");
  return res.data;
};


// ─── REPORTS ─────────────────────────────────────────────
export const getReports = async (team: string, year?: number) => {
  const res = await api.get("/reports", {
    params: { team, year },
  });
  return res.data;
};

export const getReportByMonth = async (
  team: string,
  year: number,
  month: number
) => {
  const res = await api.get("/reports", {
    params: { team, year, month },
  });
  return res.data;
};

export const createReport = async (payload: any) => {
  const res = await api.post("/reports", payload);
  return res.data;
};

export const updateReport = async (id: number, payload: any) => {
  const res = await api.put(`/reports/${id}`, payload);
  return res.data;
};

export const deleteReport = async (id: number) => {
  const res = await api.delete(`/reports/${id}`);
  return res.data;
};

// ─── EXPORT ──────────────────────────────────────────────
export const exportReport = async (team: string, year: number) => {
  const res = await api.get("/export", {
    params: { team, year },
    responseType: "blob",
  });
  return res.data;
};

export const exportIntopReport = async (year: number, month?: number) => {
  const res = await api.get("/intop/export", {
    params: { year, month },
    responseType: "blob",
  });
  return res.data;
};

export const exportRekayasaReport = async (year: number, month?: number) => {
  const res = await api.get("/rekayasa/export", {
    params: { year, month },
    responseType: "blob",
  });
  return res.data;
};

export const exportSmartjabarReport = async (year: number, month?: number) => {
  const res = await api.get("/smartjabar/export", {
    params: { year, month },
    responseType: "blob",
  });
  return res.data;
};

export const exportSidebarReport = async (year: number, month?: number) => {
  const res = await api.get("/sidebar/export", {
    params: { year, month },
    responseType: "blob",
  });
  return res.data;
};

export const exportAppmanReport = async (year: number, month?: number) => {
  const res = await api.get("/appman/export", {
    params: { year, month },
    responseType: "blob",
  });
  return res.data;
};

// ─── REKAYASA APLIKASI ──────────────────────────────────
export const getAppReplicationsSummary = async (year?: number) => {
  const res = await api.get("/rekayasa/application-replications/summary", { params: { year } });
  return res.data;
};

export const getAppReplications = async (year?: number) => {
  const res = await api.get("/rekayasa/application-replications", { params: { year } });
  return res.data;
};

export const createAppReplication = async (payload: any) => {
  const res = await api.post("/rekayasa/application-replications", payload);
  return res.data;
};

export const updateAppReplication = async (id: number, payload: any) => {
  const res = await api.put(`/rekayasa/application-replications/${id}`, payload);
  return res.data;
};

export const deleteAppReplication = async (id: number) => {
  const res = await api.delete(`/rekayasa/application-replications/${id}`);
  return res.data;
};

export const getMentoringPerformances = async (year?: number) => {
  const res = await api.get("/rekayasa/mentoring-performances", { params: { year } });
  return res.data;
};

export const createMentoringPerformance = async (payload: any) => {
  const res = await api.post("/rekayasa/mentoring-performances", payload);
  return res.data;
};

export const updateMentoringPerformance = async (id: number, payload: any) => {
  const res = await api.put(`/rekayasa/mentoring-performances/${id}`, payload);
  return res.data;
};

export const deleteMentoringPerformance = async (id: number) => {
  const res = await api.delete(`/rekayasa/mentoring-performances/${id}`);
  return res.data;
};

// ==========================================
// 6. Integrasi Interoperabilitas (Intop)
// ==========================================

export const getIntopMandateServiceSummaries = async (year: number) => {
  const res = await api.get(`/intop/intop-mandate-service-summaries?year=${year}`);
  return res.data;
};
export const createIntopMandateServiceSummary = async (data: any) => {
  const res = await api.post("/intop/intop-mandate-service-summaries", data);
  return res.data;
};
export const updateIntopMandateServiceSummary = async (id: number, data: any) => {
  const res = await api.put(`/intop/intop-mandate-service-summaries/${id}`, data);
  return res.data;
};
export const deleteIntopMandateServiceSummary = async (id: number) => {
  const res = await api.delete(`/intop/intop-mandate-service-summaries/${id}`);
  return res.data;
};

export const getServiceCatalogs = async (year: number) => {
  const res = await api.get(`/intop/service-catalogs?year=${year}`);
  return res.data;
};
export const createServiceCatalog = async (data: any) => {
  const res = await api.post("/intop/service-catalogs", data);
  return res.data;
};
export const updateServiceCatalog = async (id: number, data: any) => {
  const res = await api.put(`/intop/service-catalogs/${id}`, data);
  return res.data;
};
export const deleteServiceCatalog = async (id: number) => {
  const res = await api.delete(`/intop/service-catalogs/${id}`);
  return res.data;
};

export const getIntegrationSummaries = async (year: number) => {
  const res = await api.get(`/intop/integration-summaries?year=${year}`);
  return res.data;
};
export const createIntegrationSummary = async (data: any) => {
  const res = await api.post("/intop/integration-summaries", data);
  return res.data;
};
export const updateIntegrationSummary = async (id: number, data: any) => {
  const res = await api.put(`/intop/integration-summaries/${id}`, data);
  return res.data;
};
export const deleteIntegrationSummary = async (id: number) => {
  const res = await api.delete(`/intop/integration-summaries/${id}`);
  return res.data;
};

// ==========================================
// Sada Jabar
// ==========================================
export const getSadajabarIntegrasi = async (year?: number) => {
  const res = await api.get("/sadajabar/integrasi", { params: { year } });
  return res.data;
};

export const createSadajabarIntegrasi = async (payload: any) => {
  const res = await api.post("/sadajabar/integrasi", payload);
  return res.data;
};

export const updateSadajabarIntegrasi = async (id: number, payload: any) => {
  const res = await api.put(`/sadajabar/integrasi/${id}`, payload);
  return res.data;
};

export const deleteSadajabarIntegrasi = async (id: number) => {
  const res = await api.delete(`/sadajabar/integrasi/${id}`);
  return res.data;
};

export const getSadajabarEnkripsi = async (year?: number) => {
  const res = await api.get("/sadajabar/enkripsi", { params: { year } });
  return res.data;
};

export const createSadajabarEnkripsi = async (payload: any) => {
  const res = await api.post("/sadajabar/enkripsi", payload);
  return res.data;
};

export const updateSadajabarEnkripsi = async (id: number, payload: any) => {
  const res = await api.put(`/sadajabar/enkripsi/${id}`, payload);
  return res.data;
};

export const deleteSadajabarEnkripsi = async (id: number) => {
  const res = await api.delete(`/sadajabar/enkripsi/${id}`);
  return res.data;
};

export const exportSadajabarReport = async (year: number, month?: number) => {
  const res = await api.get("/sadajabar/export", {
    params: { year, month },
    responseType: "blob",
  });
  return res.data;
};

// ==========================================
// Helper OPD & Document Type Mapping
// ==========================================
export const BACKEND_OPD_MAP: Record<string, number> = {
  "BADAN PENGHUBUNG": 1,
  "SEKRETARIAT DPRD": 2,
  "DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL": 3,
  "DINAS PEMUDA DAN OLAHRAGA": 4,
  "DINAS PEMBERDAYAAN MASYARAKAT DAN DESA": 5,
  "BADAN PENANGGULANGAN BENCANA DAERAH": 6,
  "INSPEKTORAT DAERAH": 7,
  "BADAN PENGEMBANGAN SUMBER DAYA MANUSIA": 8,
  "SATUAN POLISI PAMONG PRAJA": 9,
  "DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU": 10,
  "BADAN KESATUAN BANGSA DAN POLITIK": 11,
  "BADAN PENELITIAN DAN PENGEMBANGAN DAERAH": 12,
  "BADAN PERENCANAAN PEMBANGUNAN DAERAH": 13,
  "DINAS KOMUNIKASI DAN INFORMATIKA": 14,
  "DINAS PARIWISATA DAN KEBUDAYAAN": 15,
  "DINAS SOSIAL": 16,
  "BADAN KEPEGAWAIAN DAERAH": 17,
  "DINAS KEHUTANAN": 18,
  "DINAS PERINDUSTRIAN DAN PERDAGANGAN": 19,
  "DINAS PERPUSTAKAAN DAN KEARSIPAN DAERAH": 20,
  "DINAS KELAUTAN DAN PERIKANAN": 21,
  "DINAS PEMBERDAYAAN PEREMPUAN, PERLINDUNGAN ANAK, DAN KELUARGA BERENCANA": 22,
  "DINAS PERKEBUNAN": 23,
  "DINAS KOPERASI DAN USAHA KECIL": 24,
  "DINAS KETAHANAN PANGAN DAN PETERNAKAN": 25,
  "DINAS PERHUBUNGAN": 26,
  "DINAS SUMBER DAYA AIR": 27,
  "DINAS BINA MARGA DAN PENATAAN RUANG": 28,
  "DINAS TANAMAN PANGAN DAN HORTIKULTURA": 29,
  "DINAS LINGKUNGAN HIDUP": 30,
  "DINAS PERUMAHAN DAN PERMUKIMAN": 31,
  "BADAN PENGELOLAAN KEUANGAN DAN ASET DAERAH": 32,
  "DINAS TENAGA KERJA DAN TRANSMIGRASI": 33,
  "DINAS ENERGI DAN SUMBER DAYA MINERAL": 34,
  "BADAN PENDAPATAN DAERAH": 35,
  "SEKRETARIAT DAERAH": 36,
  "DINAS KESEHATAN": 37,
  "DINAS PENDIDIKAN": 38
};

export const BACKEND_DOC_TYPES = [
  'BERITA_ACARA',
  'BERITA_ACARA_GUBERNUR',
  'BERITA_DAERAH',
  'DAFTAR_HADIR',
  'DAFTAR_PENGELUARAN_RIIL_(DPR)',
  'KENAIKAN_GAJI_BERKALA_(KGB)',
  'KEPUTUSAN_GUBERNUR',
  'KEPUTUSAN_GUBERNUR_TTE_SETDA',
  'LAMPIRAN_CHECKLIST_HASIL_VERIFIKASI_KELENGKAPAN_DOKUMEN_SPP',
  'LAMPIRAN_SURAT',
  'LAPORAN',
  'LAPORAN_GUBERNUR',
  'LAPORAN_HASIL_PENGUJIAN_LABORATORIUM_BENIH',
  'LAPORAN_KEUANGAN_BUKU_KAS_UMUM_',
  'LAPORAN_KEUANGAN_BUKU_PEMBANTU_PAJAK',
  'LAPORAN_KEUANGAN_BUKU_PEMBANTU_SUB_RINCIAN_OBJEK_BELANJA',
  'LAPORAN_KEUANGAN_DAFTAR_TRANSAKSI_HARIAN_BELANJA_DAERAH',
  'LAPORAN_KEUANGAN_SPJ',
  'LAPORAN_KEUANGAN_SURAT_PERNYATAAN_TANGGUNG_JAWAB_BELANJA',
  'LAPORAN_LANDSCAPE_A4',
  'LAPORAN_LANDSCAPE_F4',
  'LEMBARAN_DAERAH',
  'MEMO',
  'NOTA_DINAS',
  'NOTA_DINAS_GUBERNUR',
  'NOTA_PENCAIRAN_DANA_(NPD)',
  'NOTULEN',
  'PENGUMUMAN',
  'PERATURAN_DAERAH',
  'PERATURAN_GUBERNUR',
  'PERSETUJUAN_GUBERNUR_DENGAN_DPRD',
  'PIAGAM',
  'PROPOSAL',
  'RADIOGRAM',
  'REKAP_GAJI',
  'REKAP_TUNJANGAN_TAMBAHAN_PENGHASILAN',
  'REKOMENDASI_GUBERNUR',
  'RENCANA_RINCIAN_PENGUNAAN',
  'SASARAN_KINERJA_PEGAWAI_(SKP)',
  'SERTIFIKAT',
  'SERTIFIKAT_BENIH_UNGGUL',
  'SURAT_BIASA',
  'SURAT_BIASA_GUBERNUR_/_WAKIL_GUBERNUR',
  'SURAT_BIASA_GUBERNUR_ATAU_WAKIL_GUBERNUR',
  'SURAT_BIASA_SEKRETARIS_DAERAH___KEPALA_PERANGKAT_DAERAH_ATAS_NAMA_GUBERNUR',
  'SURAT_EDARAN',
  'SURAT_EDARAN_GUBERNUR',
  'SURAT_EDARAN_SEKRETARIS_DAERAH_ATAS_NAMA_GUBERNUR',
  'SURAT_INSTRUKSI',
  'SURAT_IZIN',
  'SURAT_IZIN_GUBERNUR',
  'SURAT_IZIN_SEKRETARIS_DAERAH___KEPALA_PERANGKAT_DAERAH_ATAS_NAMA_GUBERNUR',
  'SURAT_KEPUTUSAN',
  'SURAT_KETERANGAN',
  'SURAT_KETERANGAN_GUBERNUR',
  'SURAT_KETERANGAN_PEMBERHENTIAN_PEMBAYARAN_(SKPP)',
  'SURAT_KETERANGAN_PENETAPAN_ANGKA_KREDIT_(SK_PAK)',
  'SURAT_KETERANGAN_SEKRETARIS_DAERAH___KEPALA_PERANGKAT_DAERAH_ATAS_NAMA_GUBERNUR',
  'SURAT_PANGGILAN',
  'SURAT_PANGGILAN_SEKRETARIS_DAERAH_ATAS_NAMA_GUBERNUR',
  'SURAT_PENGANTAR',
  'SURAT_PERINTAH_GUBERNUR',
  'SURAT_PERINTAH_MEMBAYAR_(SPM)',
  'SURAT_PERINTAH_PENCAIRAN_DANA_(SP2D)',
  'SURAT_PERINTAH_PERANGKAT_DAERAH',
  'SURAT_PERJALANAN_DINAS_',
  'SURAT_PERMINTAAN_PEMBAYARAN_(SPP)',
  'SURAT_PERNYATAAN',
  'SURAT_PERNYATAAN_MELAKSANAKAN_TUGAS',
  'SURAT_PERNYATAAN_MELAKSANAKAN_TUGAS_GUBERNUR',
  'SURAT_PERNYATAAN_TANGGUNG_JAWAB_MUTLAK_(SPTJM)',
  'SURAT_PERNYATAAN_VERIFIKASI_PPK_SKPD',
  'SURAT_PERNYATAAN_VERIFIKASI_PPK-SKPD',
  'SURAT_REKOMENDASI',
  'SURAT_TANDA_REGISTRASI_TENAGA_TEKNIS_KEFARMASIAN_(STRTTK)',
  'SURAT_TANDA_TAMAT_PENDIDIKAN_DAN_PELATIHAN_(STTPP)',
  'SURAT_UNDANGAN',
  'SURAT_UNDANGAN_GUBERNUR',
  'SURAT_UNDANGAN_GUBERNUR_(PLAT_MERAH)',
  'SURAT_UNDANGAN_SEKRETARIS_DAERAH___KEPALA_PERANGKAT_DAERAH_ATAS_NAMA_GUBERNUR',
  'TELAAHAN_STAF',
  'VISUM_SURAT_PERJALANAN_DINAS',
];

export const getOpdIdByName = (name: string): number => {
  const normalize = (str: string) =>
    str
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const normalizedInput = normalize(name);
  for (const [key, id] of Object.entries(BACKEND_OPD_MAP)) {
    if (normalize(key) === normalizedInput) {
      return id;
    }
  }
  // Custom manual mappings for slightly truncated names:
  if (normalizedInput.includes("PEMBERDAYAAN PEREMPUAN")) {
    return 22; // Dinas Pemberdayaan Perempuan, Perlindungan Anak, dan Keluarga Berencana
  }
  console.warn(`Could not find OPD ID for name: ${name}`);
  return 1;
};

export const getOpdNameById = (id: number): string => {
  const entry = Object.entries(BACKEND_OPD_MAP).find(([_, val]) => val === id);
  return entry ? entry[0] : `OPD ${id}`;
};

export const getFrontendOpdName = (backendName: string, pdList: string[]): string => {
  const normalize = (str: string) =>
    str
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const normBackend = normalize(backendName);
  const found = pdList.find(pd => normalize(pd) === normBackend);
  return found || backendName;
};

export const getDocTypeIdByName = (name: string): number => {
  const index = BACKEND_DOC_TYPES.indexOf(name);
  if (index !== -1) {
    return index + 1;
  }
  const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  const normInput = norm(name);
  const foundIndex = BACKEND_DOC_TYPES.findIndex(t => norm(t) === normInput);
  if (foundIndex !== -1) return foundIndex + 1;

  console.warn(`Could not find Document Type ID for name: ${name}`);
  return 1;
};

export const getDocTypeNameById = (id: number): string => {
  return BACKEND_DOC_TYPES[id - 1] || `DOCUMENT_TYPE_${id}`;
};

// ==========================================
// Smart Jabar
// ==========================================
export const getSmartjabarJoinedApps = async (year?: number) => {
  const res = await api.get("/smartjabar/joined-apps", { params: { year } });
  return res.data;
};

export const createSmartjabarJoinedApp = async (payload: any) => {
  const res = await api.post("/smartjabar/joined-apps", payload);
  return res.data;
};

export const updateSmartjabarJoinedApp = async (id: number, payload: any) => {
  const res = await api.put(`/smartjabar/joined-apps/${id}`, payload);
  return res.data;
};

export const deleteSmartjabarJoinedApp = async (id: number) => {
  const res = await api.delete(`/smartjabar/joined-apps/${id}`);
  return res.data;
};

export const getSmartjabarStats = async (year?: number) => {
  const res = await api.get("/smartjabar/stats", { params: { year } });
  return res.data;
};

export const createSmartjabarStat = async (payload: any) => {
  const res = await api.post("/smartjabar/stats", payload);
  return res.data;
};

export const updateSmartjabarStat = async (id: number, payload: any) => {
  const res = await api.put(`/smartjabar/stats/${id}`, payload);
  return res.data;
};

export const deleteSmartjabarStat = async (id: number) => {
  const res = await api.delete(`/smartjabar/stats/${id}`);
  return res.data;
};

// ==========================================
// Sidebar Jabar
// ==========================================
export const getSidebarDocumentStats = async (year?: number) => {
  const res = await api.get("/sidebar/document-stats", { params: { year } });
  return res.data;
};

export const createSidebarDocumentStat = async (payload: any) => {
  const res = await api.post("/sidebar/document-stats", payload);
  return res.data;
};

export const updateSidebarDocumentStat = async (id: number, payload: any) => {
  const res = await api.put(`/sidebar/document-stats/${id}`, payload);
  return res.data;
};

export const deleteSidebarDocumentStat = async (id: number) => {
  const res = await api.delete(`/sidebar/document-stats/${id}`);
  return res.data;
};

export const getSidebarMetrics = async (year?: number) => {
  const res = await api.get("/sidebar/metrics", { params: { year } });
  return res.data;
};

export const createSidebarMetric = async (payload: any) => {
  const res = await api.post("/sidebar/metrics", payload);
  return res.data;
};

export const updateSidebarMetric = async (id: number, payload: any) => {
  const res = await api.put(`/sidebar/metrics/${id}`, payload);
  return res.data;
};

export const deleteSidebarMetric = async (id: number) => {
  const res = await api.delete(`/sidebar/metrics/${id}`);
  return res.data;
};

export const getSidebarOpdUsages = async (year?: number) => {
  const res = await api.get("/sidebar/opd-usages", { params: { year } });
  return res.data;
};

export const createSidebarOpdUsage = async (payload: any) => {
  const res = await api.post("/sidebar/opd-usages", payload);
  return res.data;
};

export const updateSidebarOpdUsage = async (id: number, payload: any) => {
  const res = await api.put(`/sidebar/opd-usages/${id}`, payload);
  return res.data;
};

export const deleteSidebarOpdUsage = async (id: number) => {
  const res = await api.delete(`/sidebar/opd-usages/${id}`);
  return res.data;
};

// ==========================================
// Appman (Pengelolaan Aplikasi)
// ==========================================
export const getInventoryStats = async (year: number) => {
  const res = await api.get(`/appman/inventory-stats?year=${year}`);
  return res.data;
};

export const getTeamSupportFacilities = async (year: number) => {
  const res = await api.get(`/appman/team-support-facilities?year=${year}`);
  return res.data;
};

export const getIntegrationMappings = async (year: number) => {
  const res = await api.get(`/appman/integration-mappings?year=${year}`);
  return res.data;
};

export const getDevelopmentTargets = async (year: number) => {
  const res = await api.get(`/appman/development-targets?year=${year}`);
  return res.data;
};

export const getAppVulnerabilities = async (year: number) => {
  const res = await api.get(`/appman/app-vulnerabilities?year=${year}`);
  return res.data;
};

export const getKatalapsRegencies = async (year: number) => {
  const res = await api.get(`/appman/katalaps-regencies?year=${year}`);
  return res.data;
};

export const getEmailManagementStats = async (year: number) => {
  const res = await api.get(`/appman/email-management-stats?year=${year}`);
  return res.data;
};

export const getDriveJabarStats = async (year: number) => {
  const res = await api.get(`/appman/drive-jabar-stats?year=${year}`);
  return res.data;
};

export const createInventoryStat = async (payload: any) => {
  const res = await api.post("/appman/inventory-stats", payload);
  return res.data;
};
export const updateInventoryStat = async (id: number, payload: any) => {
  const res = await api.put(`/appman/inventory-stats/${id}`, payload);
  return res.data;
};

export const createTeamSupportFacility = async (payload: any) => {
  const res = await api.post("/appman/team-support-facilities", payload);
  return res.data;
};
export const updateTeamSupportFacility = async (id: number, payload: any) => {
  const res = await api.put(`/appman/team-support-facilities/${id}`, payload);
  return res.data;
};

export const createIntegrationMapping = async (payload: any) => {
  const res = await api.post("/appman/integration-mappings", payload);
  return res.data;
};
export const updateIntegrationMapping = async (id: number, payload: any) => {
  const res = await api.put(`/appman/integration-mappings/${id}`, payload);
  return res.data;
};

export const createDevelopmentTarget = async (payload: any) => {
  const res = await api.post("/appman/development-targets", payload);
  return res.data;
};
export const updateDevelopmentTarget = async (id: number, payload: any) => {
  const res = await api.put(`/appman/development-targets/${id}`, payload);
  return res.data;
};

export const createAppVulnerability = async (payload: any) => {
  const res = await api.post("/appman/app-vulnerabilities", payload);
  return res.data;
};
export const updateAppVulnerability = async (id: number, payload: any) => {
  const res = await api.put(`/appman/app-vulnerabilities/${id}`, payload);
  return res.data;
};

export const getKatalapsRegenciesCreate = async () => {
  const res = await api.get("/appman/katalaps-regencies/create");
  return res.data;
};
export const createKatalapsRegency = async (payload: any) => {
  const res = await api.post("/appman/katalaps-regencies", payload);
  return res.data;
};
export const updateKatalapsRegency = async (id: number, payload: any) => {
  const res = await api.put(`/appman/katalaps-regencies/${id}`, payload);
  return res.data;
};

export const createEmailManagementStat = async (payload: any) => {
  const res = await api.post("/appman/email-management-stats", payload);
  return res.data;
};
export const updateEmailManagementStat = async (id: number, payload: any) => {
  const res = await api.put(`/appman/email-management-stats/${id}`, payload);
  return res.data;
};

export const createDriveJabarStat = async (payload: any) => {
  const res = await api.post("/appman/drive-jabar-stats", payload);
  return res.data;
};
export const updateDriveJabarStat = async (id: number, payload: any) => {
  const res = await api.put(`/appman/drive-jabar-stats/${id}`, payload);
  return res.data;
};

// ==========================================
// Admin User Management
// ==========================================
export const getAdminUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

export const createAdminUser = async (payload: any) => {
  const res = await api.post("/admin/users", payload);
  return res.data;
};

export const updateAdminUser = async (id: number, payload: any) => {
  const res = await api.put(`/admin/users/${id}`, payload);
  return res.data;
};

export const deleteAdminUser = async (id: number) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

// ==========================================
// Projects & Tasks API (Manajemen Tugas Digital)
// ==========================================

export const getProjects = async () => {
  const res = await api.get("/task-management/boards");
  return res.data;
};

export const createProject = async (payload: { name: string; description: string; deadline: string }) => {
  // Map frontend form properties to backend Board model
  const backendPayload = {
    name: payload.name,
    description: payload.description,
    end_date: payload.deadline,
    status: "active",
    visibility: "public"
  };
  const res = await api.post("/task-management/boards", backendPayload);
  return res.data;
};

export const joinProject = async (id: number) => {
  const res = await api.post(`/task-management/boards/${id}/members/join`);
  return res.data;
};
