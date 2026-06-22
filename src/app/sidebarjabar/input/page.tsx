"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSidebarMetric,
  createSidebarOpdUsage,
  createSidebarDocumentStat,
  getOpdIdByName,
  getDocTypeIdByName
} from "@/services/api";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const TEAM_BE_NAME = "SIDEBAR Jabar";

const PD_LIST = [
  "Dinas Komunikasi dan Informatika",
  "Dinas Pemuda dan Olahraga",
  "Dinas Lingkungan Hidup",
  "Dinas Tenaga Kerja dan Transmigrasi",
  "Dinas Koperasi dan Usaha Kecil",
  "Badan Penghubung",
  "Dinas Kependudukan dan Pencatatan Sipil",
  "Inspektorat Daerah",
  "Sekretariat DPRD",
  "Dinas Pemberdayaan Perempuan, Perlindungan Anak dan Keluarga Berencana",
  "Dinas Kelautan dan Perikanan",
  "Dinas Pemberdayaan Masyarakat dan Desa",
  "Dinas Kehutanan",
  "Dinas Perindustrian dan Perdagangan",
  "Dinas Sosial",
  "Dinas Sumber Daya Air",
  "Dinas Energi dan Sumber Daya Mineral",
  "Dinas Perhubungan",
  "Dinas Tanaman Pangan dan Hortikultura",
  "Dinas Ketahanan Pangan dan Peternakan",
  "Dinas Bina Marga dan Penataan Ruang",
  "Dinas Perumahan dan Permukiman",
  "Badan Kepegawaian Daerah",
  "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu",
  "Sekretariat Daerah",
  "Badan Pengembangan Sumber Daya Manusia",
  "Dinas Pariwisata dan Kebudayaan",
  "Badan Penanggulangan Bencana Daerah",
  "Dinas Perkebunan",
  "Dinas Pendidikan",
  "Badan Pengelolaan Keuangan dan Aset Daerah",
  "Dinas Perpustakaan dan Kearsipan Daerah",
  "Satuan Polisi Pamong Praja",
  "Dinas Kesehatan",
  "Badan Penelitian dan Pengembangan Daerah",
  "Badan Perencanaan Pembangunan Daerah",
  "Badan Pendapatan Daerah",
  "Badan Kesatuan Bangsa dan Politik",
];

// 82 unique items — no duplicates
const JENIS_DOK_LIST = [
  "BERITA_ACARA","BERITA_ACARA_GUBERNUR","BERITA_DAERAH","DAFTAR_HADIR",
  "DAFTAR_PENGELUARAN_RIIL_(DPR)","KENAIKAN_GAJI_BERKALA_(KGB)","KEPUTUSAN_GUBERNUR",
  "KEPUTUSAN_GUBERNUR_TTE_SETDA","LAMPIRAN_CHECKLIST_HASIL_VERIFIKASI_KELENGKAPAN_DOKUMEN_SPP",
  "LAMPIRAN_SURAT","LAPORAN","LAPORAN_GUBERNUR","LAPORAN_HASIL_PENGUJIAN_LABORATORIUM_BENIH",
  "LAPORAN_KEUANGAN_BUKU_KAS_UMUM_","LAPORAN_KEUANGAN_BUKU_PEMBANTU_PAJAK",
  "LAPORAN_KEUANGAN_BUKU_PEMBANTU_SUB_RINCIAN_OBJEK_BELANJA",
  "LAPORAN_KEUANGAN_DAFTAR_TRANSAKSI_HARIAN_BELANJA_DAERAH","LAPORAN_KEUANGAN_SPJ",
  "LAPORAN_KEUANGAN_SURAT_PERNYATAAN_TANGGUNG_JAWAB_BELANJA","LAPORAN_LANDSCAPE_A4",
  "LAPORAN_LANDSCAPE_F4","LEMBARAN_DAERAH","MEMO","NOTA_DINAS","NOTA_DINAS_GUBERNUR",
  "NOTA_PENCAIRAN_DANA_(NPD)","NOTULEN","PENGUMUMAN","PERATURAN_DAERAH","PERATURAN_GUBERNUR",
  "PERSETUJUAN_GUBERNUR_DENGAN_DPRD","PIAGAM","PROPOSAL","RADIOGRAM","REKAP_GAJI",
  "REKAP_TUNJANGAN_TAMBAHAN_PENGHASILAN","REKOMENDASI_GUBERNUR","RENCANA_RINCIAN_PENGUNAAN",
  "SASARAN_KINERJA_PEGAWAI_(SKP)","SERTIFIKAT","SERTIFIKAT_BENIH_UNGGUL","SURAT_BIASA",
  "SURAT_BIASA_GUBERNUR_/_WAKIL_GUBERNUR","SURAT_BIASA_GUBERNUR_ATAU_WAKIL_GUBERNUR",
  "SURAT_BIASA_SEKRETARIS_DAERAH___KEPALA_PERANGKAT_DAERAH_ATAS_NAMA_GUBERNUR",
  "SURAT_EDARAN","SURAT_EDARAN_GUBERNUR","SURAT_EDARAN_SEKRETARIS_DAERAH_ATAS_NAMA_GUBERNUR",
  "SURAT_INSTRUKSI","SURAT_IZIN","SURAT_IZIN_GUBERNUR",
  "SURAT_IZIN_SEKRETARIS_DAERAH___KEPALA_PERANGKAT_DAERAH_ATAS_NAMA_GUBERNUR",
  "SURAT_KEPUTUSAN","SURAT_KETERANGAN","SURAT_KETERANGAN_GUBERNUR",
  "SURAT_KETERANGAN_PEMBERHENTIAN_PEMBAYARAN_(SKPP)",
  "SURAT_KETERANGAN_PENETAPAN_ANGKA_KREDIT_(SK_PAK)",
  "SURAT_KETERANGAN_SEKRETARIS_DAERAH___KEPALA_PERANGKAT_DAERAH_ATAS_NAMA_GUBERNUR",
  "SURAT_PANGGILAN","SURAT_PANGGILAN_SEKRETARIS_DAERAH_ATAS_NAMA_GUBERNUR","SURAT_PENGANTAR",
  "SURAT_PERINTAH_GUBERNUR","SURAT_PERINTAH_MEMBAYAR_(SPM)","SURAT_PERINTAH_PENCAIRAN_DANA_(SP2D)",
  "SURAT_PERINTAH_PERANGKAT_DAERAH","SURAT_PERJALANAN_DINAS_","SURAT_PERMINTAAN_PEMBAYARAN_(SPP)",
  "SURAT_PERNYATAAN","SURAT_PERNYATAAN_MELAKSANAKAN_TUGAS","SURAT_PERNYATAAN_MELAKSANAKAN_TUGAS_GUBERNUR",
  "SURAT_PERNYATAAN_TANGGUNG_JAWAB_MUTLAK_(SPTJM)","SURAT_PERNYATAAN_VERIFIKASI_PPK_SKPD",
  "SURAT_PERNYATAAN_VERIFIKASI_PPK-SKPD",
  "SURAT_REKOMENDASI","SURAT_TANDA_REGISTRASI_TENAGA_TEKNIS_KEFARMASIAN_(STRTTK)",
  "SURAT_TANDA_TAMAT_PENDIDIKAN_DAN_PELATIHAN_(STTPP)","SURAT_UNDANGAN","SURAT_UNDANGAN_GUBERNUR",
  "SURAT_UNDANGAN_GUBERNUR_(PLAT_MERAH)",
  "SURAT_UNDANGAN_SEKRETARIS_DAERAH___KEPALA_PERANGKAT_DAERAH_ATAS_NAMA_GUBERNUR",
  "TELAAHAN_STAF","VISUM_SURAT_PERJALANAN_DINAS",
];

const S = {
  page:     { fontFamily: "'Plus Jakarta Sans',sans-serif", padding: "28px" } as React.CSSProperties,
  card:     { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
  cardTitle:{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" } as React.CSSProperties,
  dot:      { width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#0891b2)", flexShrink: 0 } as React.CSSProperties,
  divider:  { height: "1px", background: "#f1f5f9", margin: "0 0 18px" } as React.CSSProperties,
  fg:       { marginBottom: "12px", minWidth: 0 } as React.CSSProperties,
  label:    { display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase" as const, marginBottom: "6px", overflowWrap: "break-word" as const, wordBreak: "break-word" as const } as React.CSSProperties,
  iw:       (err: boolean) => ({ border: `1.5px solid ${err ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "10px", padding: "0 14px", height: "44px", display: "flex", alignItems: "center", background: err ? "#fff5f5" : "#f8fafc" }) as React.CSSProperties,
  inp:      { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans',sans-serif", width: "100%" } as React.CSSProperties,
  sel:      (err: boolean) => ({ width: "100%", border: `1.5px solid ${err ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "10px", padding: "10px 14px", height: "44px", background: err ? "#fff5f5" : "#f8fafc", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", cursor: "pointer", appearance: "none" as const }) as React.CSSProperties,
  grid2:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" } as React.CSSProperties,
  errTxt:   { fontSize: "11px", color: "#ef4444", marginTop: "4px" } as React.CSSProperties,
};

const SelectMonth = ({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) => (
  <div style={S.fg}>
    <label style={S.label}>Pilih Bulan <span style={{ color: "#ef4444" }}>*</span></label>
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...S.sel(!!error), color: value ? "#0f172a" : "#94a3b8" }} className="sel-f">
        <option value="">Pilih Bulan</option>
        {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
      </select>
      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
    </div>
    {error && <div style={S.errTxt}>{error}</div>}
  </div>
);

const Field = ({ label, value, onChange, error, required }: { label: string; value: string; onChange: (v: string) => void; error?: string; required?: boolean }) => (
  <div style={S.fg}>
    <label style={S.label}>{label} {required && <span style={{ color: "#ef4444" }}>*</span>}</label>
    <div style={S.iw(!!error)} className="iw-f">
      <input type="text" inputMode="numeric" placeholder="0" value={value} onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))} style={S.inp} />
    </div>
    {error && <div style={S.errTxt}>{error}</div>}
  </div>
);

export default function InputPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  // Unified Period State
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));

  const [jumlahUser, setJumlahUser] = useState("");
  const [jumlahAktif, setJumlahAktif] = useState("");
  const [jumlahDok, setJumlahDok] = useState("");

  const [pdValues, setPdValues] = useState<Record<string,string>>(
    Object.fromEntries(PD_LIST.map(k => [k, ""]))
  );

  const [dokValues, setDokValues] = useState<Record<string,string>>(
    Object.fromEntries(JENIS_DOK_LIST.map(k => [k, ""]))
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedMonth) e.selectedMonth = "Bulan wajib dipilih";
    if (!jumlahUser) e.jumlahUser = "Wajib diisi";
    if (!jumlahAktif) e.jumlahAktif = "Wajib diisi";
    if (!jumlahDok) e.jumlahDok = "Wajib diisi";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const promises: Promise<any>[] = [];
      const y = Number(selectedYear);
      const m = Number(selectedMonth);

      // 1. Submit metrics (Form 1)
      promises.push(
        createSidebarMetric({
          month: m,
          year: y,
          total_users: Number(jumlahUser || 0),
          active_users: Number(jumlahAktif || 0),
          document_created: Number(jumlahDok || 0)
        })
      );

      // 2. Submit OPD usages (Form 2)
      PD_LIST.forEach(pd => {
        const val = Number(pdValues[pd] || 0);
        if (val > 0) {
          promises.push(
            createSidebarOpdUsage({
              opd_id: getOpdIdByName(pd),
              month: m,
              year: y,
              active_count: val
            })
          );
        }
      });

      // 3. Submit Document Stats (Form 3)
      JENIS_DOK_LIST.forEach(dok => {
        const val = Number(dokValues[dok] || 0);
        if (val > 0) {
          promises.push(
            createSidebarDocumentStat({
              document_type_id: getDocTypeIdByName(dok),
              month: m,
              year: y,
              total_count: val
            })
          );
        }
      });

      await Promise.all(promises);

      setSuccess(true);
      setTimeout(() => router.push("/sidebarjabar/dashboard"), 1500);
    } catch (err: any) {
      console.error(err);
      const serverMessage = err.response?.data?.errors?.month?.[0] || err.response?.data?.message || "Gagal menyimpan data rekapitulasi Sidebar Jabar.";
      alert(serverMessage);
    } finally { setLoading(false); }
  };



  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .iw-f:focus-within { border-color: #1d4ed8 !important; background: white !important; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        .sel-f:focus { border-color: #1d4ed8 !important; background: white !important; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={S.page}>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.4px" }}>Isi Form Rekapitulasi</div>
        <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", marginBottom: "24px" }}>SIDEBAR Jabar · Input data bulan ini</div>

        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#166534", marginBottom: "16px" }}>
            ✓ Data berhasil disimpan! Mengalihkan ke dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── 0: PERIODE DATA ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Pilih Periode Laporan</div>
            <div style={S.divider} />
            <div style={S.grid2}>
              <div style={S.fg}>
                <label style={S.label}>Tahun <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={S.sel(false)} className="sel-f">
                    {[0, 1, 2, 3].map((offset) => {
                      const yearVal = new Date().getFullYear() - offset;
                      return <option key={yearVal} value={yearVal}>{yearVal}</option>;
                    })}
                  </select>
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
                </div>
              </div>

              <div style={S.fg}>
                <label style={S.label}>Bulan <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={S.sel(false)} className="sel-f">
                    <option value="">Pilih Bulan</option>
                    {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── FORM 1: PENGGUNA & DOKUMEN ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Form Tabel Pengguna dan Dokumen SIDEBAR</div>
            <div style={S.divider} />
            <div style={S.grid2}>
              <Field label="Jumlah User" value={jumlahUser} onChange={(v) => { setJumlahUser(v); setErrors(prev => ({ ...prev, jumlahUser: "" })); }} error={errors.jumlahUser} required />
              <Field label="Jumlah Pengguna Aktif" value={jumlahAktif} onChange={(v) => { setJumlahAktif(v); setErrors(prev => ({ ...prev, jumlahAktif: "" })); }} error={errors.jumlahAktif} required />
            </div>
            <Field label="Jumlah Dokumen yang Dibuat di SIDEBAR" value={jumlahDok} onChange={(v) => { setJumlahDok(v); setErrors(prev => ({ ...prev, jumlahDok: "" })); }} error={errors.jumlahDok} required />
          </div>

          {/* ── FORM 2: 38 PD — 2 kolom ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Form Tabel Perangkat Daerah yang Menerapkan SIDEBAR</div>
            <div style={S.divider} />
            <div style={S.grid2}>
              {PD_LIST.map((pd, i) => (
                <div key={i} style={S.fg}>
                  <label style={S.label}>{pd}</label>
                  <div style={S.iw(false)} className="iw-f">
                    <input type="text" inputMode="numeric" placeholder="0" value={pdValues[pd] || ""} onChange={e => setPdValues({ ...pdValues, [pd]: e.target.value.replace(/[^0-9]/g, '') })} style={S.inp} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FORM 3: JENIS DOKUMEN — 2 kolom ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Form Jumlah Tiap Jenis Dokumen SIDEBAR</div>
            <div style={S.divider} />
            <div style={S.grid2}>
              {JENIS_DOK_LIST.map((dok, i) => (
                <div key={i} style={S.fg}>
                  <label style={S.label}>{dok}</label>
                  <div style={S.iw(false)} className="iw-f">
                    <input type="text" inputMode="numeric" placeholder="0" value={dokValues[dok] || ""} onChange={e => setDokValues({ ...dokValues, [dok]: e.target.value.replace(/[^0-9]/g, '') })} style={S.inp} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" onClick={() => router.push("/sidebarjabar/dashboard")} style={{ padding: "10px 22px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Batal
            </button>
            <button type="submit" disabled={loading || success} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: loading || success ? "#94a3b8" : "linear-gradient(135deg,#0f2540 0%,#1d4ed8 60%,#0891b2 100%)", color: "white", fontSize: "13px", fontWeight: "700", cursor: loading || success ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", gap: "8px" }}>
              {loading && <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.65s linear infinite" }} />}
              {loading ? "Menyimpan..." : success ? "✓ Tersimpan" : "Simpan"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}