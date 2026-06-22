"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import {
  getSidebarMetrics,
  getSidebarOpdUsages,
  getSidebarDocumentStats,
  getOpdIdByName,
  getOpdNameById,
  getFrontendOpdName,
  getDocTypeIdByName,
  getDocTypeNameById,
  exportSidebarReport
} from "@/services/api";

const MONTHS = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AGS","SEP","OKT","NOV","DES"];
const MONTHS_FULL = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const PERANGKAT_DAERAH = [
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

const JENIS_DOKUMEN = [
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

const CHART_COLORS = { primary: "#1d4ed8", orange: "#f97316" };

// ─── Component ─────────────────────────────────────────────────────────────

export default function DashboardSidebar() {
  const router = useRouter();
  const team       = "SIDEBAR Jabar";
  const teamLabel  = "SIDEBAR Jabar"; 
  const teamBEName = "SIDEBAR Jabar";

  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [pengguna,  setPengguna]  = useState<any[]>([]);
  const [pdRendah,  setPdRendah]  = useState<any[]>([]);
  const [pdTinggi,  setPdTinggi]  = useState<any[]>([]);
  const [pdList,    setPdList]    = useState<(string|number)[][]>([]);
  const [jenisDok,  setJenisDok]  = useState<(string|number)[][]>([]);
  const [loading,   setLoading]   = useState(true);
  const [isDummy,   setIsDummy]   = useState(false);
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          metricsCurrent,
          usagesCurrent,
          docStatsCurrent,
        ] = await Promise.all([
          getSidebarMetrics(currentYear),
          getSidebarOpdUsages(currentYear),
          getSidebarDocumentStats(currentYear),
        ]);

        const curMetrics = metricsCurrent?.items || [];
        const curUsages = usagesCurrent?.items || [];
        const curDocStats = docStatsCurrent?.items || [];

        // 1. Calculate pengguna (All 12 months of current year)
        const compPengguna: any[] = [];
        MONTHS.forEach((m, idx) => {
          const mNum = idx + 1;
          const entry = curMetrics.find((met: any) => Number(met.month) === mNum);
          compPengguna.push({
            month: m,
            jmlUser: entry ? Number(entry.total_users || 0) : 0,
            jmlAktif: entry ? Number(entry.active_users || 0) : 0,
            jmlDok: entry ? Number(entry.document_created || 0) : 0,
            hasData: !!entry
          });
        });
        setPengguna(compPengguna);

        // 2. Calculate pdList (Remove previous year column)
        const compPdList = PERANGKAT_DAERAH.map(pd => {
          const opdId = getOpdIdByName(pd);
          const pdCurUsages = curUsages.filter((u: any) => Number(u.opd_id) === opdId);

          const monthVals = MONTHS.map((m, idx) => {
            const mNum = idx + 1;
            const entry = pdCurUsages.find((u: any) => Number(u.month) === mNum);
            return entry ? Number(entry.active_count) : "";
          });

          return [pd, ...monthVals];
        });
        setPdList(compPdList);

        // 3. Calculate pdRendah and pdTinggi based on latest active month usage stats
        const maxMonth = curUsages.length > 0 ? Math.max(...curUsages.map((u: any) => Number(u.month))) : 0;
        const latestUsages = curUsages.filter((u: any) => Number(u.month) === maxMonth);
        
        const pdTotals = PERANGKAT_DAERAH.map(pd => {
          const opdId = getOpdIdByName(pd);
          const entry = latestUsages.find((u: any) => Number(u.opd_id) === opdId);
          return { pd, jml: entry ? Number(entry.active_count) : 0 };
        });

        const sortedPd = [...pdTotals].sort((a, b) => a.jml - b.jml);
        setPdRendah(sortedPd.slice(0, 5));
        
        const sortedPdDesc = [...pdTotals].sort((a, b) => b.jml - a.jml);
        setPdTinggi(sortedPdDesc.slice(0, 5));

        // 4. Calculate jenisDok (Remove previous year column)
        const compJenisDok = JENIS_DOKUMEN.map(dok => {
          const docTypeId = getDocTypeIdByName(dok);
          const docCurStats = curDocStats.filter((d: any) => Number(d.document_type_id) === docTypeId);

          const monthVals = MONTHS.map((m, idx) => {
            const mNum = idx + 1;
            const entry = docCurStats.find((d: any) => Number(d.month) === mNum);
            return entry ? Number(entry.total_count) : "";
          });

          return [dok, ...monthVals];
        });
        setJenisDok(compJenisDok);

        setIsDummy(false);
      } catch (err) {
        console.error(err);
        setPengguna([]);
        setPdRendah([]);
        setPdTinggi([]);
        setPdList([]);
        setJenisDok([]);
        setIsDummy(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentYear]);

  const historyYears = [currentYear, currentYear-1, currentYear-2, currentYear-3];
  const toggleYear   = (y: number) => setExpandedYears(p => ({ ...p, [y]: !p[y] }));

  const handleUnduh = async () => {
    try {
      const blob = await exportSidebarReport(currentYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `APTIKA_Tools_${teamLabel}_${currentYear}.xlsx`;
      a.click();
    } catch {
      alert("Gagal mengunduh. Pastikan BE aktif.");
    }
  };

  const handleUnduhBulanan = async (year: number, month: number) => {
    try {
      const blob = await exportSidebarReport(year, month);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `APTIKA_Tools_${teamLabel}_${year}_${MONTHS[month - 1]}.xlsx`;
      a.click();
    } catch {
      alert("Gagal mengunduh data bulanan. Pastikan BE aktif.");
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────
  const S = {
    page:       { fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px", maxWidth: "1200px" } as React.CSSProperties,
    card:       { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
    badge:      { display: "block", backgroundColor: "#fbbf24", color: "#78350f", fontSize: "11px", fontWeight: "700", padding: "10px 14px", borderRadius: "6px", letterSpacing: "0.5px", marginBottom: "14px", textAlign: "center" as const } as React.CSSProperties,
    secTitle:   { fontSize: "12px", fontWeight: "700", color: "#0f172a", textAlign: "center" as const, textTransform: "uppercase" as const, lineHeight: 1.6, marginBottom: "14px" } as React.CSSProperties,
    tbl:        { width: "100%", borderCollapse: "collapse" as const, fontSize: "10px" } as React.CSSProperties,
    th:         { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 7px", fontWeight: "700", color: "#475569", textAlign: "center" as const, fontSize: "9px" } as React.CSSProperties,
    thL:        { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 7px", fontWeight: "700", color: "#475569", textAlign: "left"   as const, fontSize: "9px" } as React.CSSProperties,
    thY:        { backgroundColor: "#fbbf24", border: "1px solid #e2e8f0", padding: "5px 7px", fontWeight: "700", color: "#78350f", textAlign: "center" as const, fontSize: "9px" } as React.CSSProperties,
    thYL:       { backgroundColor: "#fbbf24", border: "1px solid #e2e8f0", padding: "5px 7px", fontWeight: "700", color: "#78350f", textAlign: "left"   as const, fontSize: "9px" } as React.CSSProperties,
    td:         { border: "1px solid #e2e8f0", padding: "4px 7px", textAlign: "center" as const, color: "#334155", fontSize: "10px" } as React.CSSProperties,
    tdL:        { border: "1px solid #e2e8f0", padding: "4px 7px", color: "#334155", fontSize: "10px" } as React.CSSProperties,
    g2:         { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" } as React.CSSProperties,
  };

  const tooltipStyle = { fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" };
  const xAxisProps   = { tick: { fontSize: 9, fill: "#64748b" }, axisLine: false, tickLine: false };
  const yAxisProps   = { tick: { fontSize: 9, fill: "#64748b" }, axisLine: false, tickLine: false };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={S.page}>

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div style={{
          background: "rgba(15, 23, 42, 0.03)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          padding: "12px 20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.3px" }}>
            {teamLabel}
          </span>
        </div>

        {/* ── CARD 1: CHART PENGGUNA + DOKUMEN ────────────────────────── */}
        <div style={S.card}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "14px" }}>Data Bulan Lalu</div>

          {loading ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "13px" }}>Memuat data...</div>
          ) : (
            <>
              <div style={S.secTitle}>JUMLAH PENGGUNA SIDEBAR</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pengguna} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" {...xAxisProps} />
                  <YAxis {...yAxisProps} domain={[0, 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="jmlUser"  name="Jml User"           fill={CHART_COLORS.primary} radius={[3,3,0,0]} />
                  <Bar dataKey="jmlAktif" name="Jml Pengguna Aktif" fill={CHART_COLORS.orange}  radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>

              <div style={{ ...S.secTitle, marginTop: "24px" }}>JUMLAH DOKUMEN YANG DIBUAT DI SIDEBAR</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pengguna} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" {...xAxisProps} />
                  <YAxis {...yAxisProps} domain={[0, 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="jmlDok" name="Jml Dokumen di SIDEBAR" fill={CHART_COLORS.orange} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Tabel pengguna & dokumen */}
              <div style={{ overflowX: "auto", marginTop: "16px" }}>
                <table style={S.tbl}>
                  <thead>
                    <tr>
                      <th style={{ ...S.thYL, textAlign: "center" }} colSpan={1 + pengguna.length}>
                        TABEL PENGGUNA DAN DOKUMEN SIDEBAR
                      </th>
                    </tr>
                    <tr>
                      <th style={S.thL}>Bulan</th>
                      {pengguna.map((d, i) => <th key={i} style={S.th}>{d.month ?? d.bulan}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Jml User",                         key: "jmlUser"  },
                      { label: "Jml Pengguna Aktif",               key: "jmlAktif" },
                      { label: "Jml Dokumen dibuat di SIDEBAR",    key: "jmlDok"   },
                    ].map(row => (
                      <tr key={row.key}>
                        <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                        {pengguna.map((d, i) => (
                          <td key={i} style={S.td}>
                            {d.hasData ? d[row.key] : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ── CARD 2: CHART TERENDAH & TERTINGGI ──────────────────────── */}
        <div style={S.card}>
          <div style={S.g2}>
            <div>
              <div style={S.secTitle}>PRODUKSI DOKUMEN TERENDAH</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pdRendah} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="pd" hide />
                  <YAxis {...yAxisProps} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="jml" name="Jml Dokumen" fill={CHART_COLORS.primary} radius={[3,3,0,0]} label={{ position: "top", fontSize: 9, fill: "#475569" }} />
                </BarChart>
              </ResponsiveContainer>
              <table style={{ ...S.tbl, marginTop: "4px" }}>
                <tbody>
                  <tr>{pdRendah.map((r, i) => <td key={i} style={{ ...S.td, fontSize: "8px", verticalAlign: "top", width: `${100/pdRendah.length}%` }}>{r.pd}</td>)}</tr>
                  <tr>{pdRendah.map((r, i) => <td key={i} style={{ ...S.td, fontWeight: "700" }}>{r.jml}</td>)}</tr>
                </tbody>
              </table>
            </div>
            <div>
              <div style={S.secTitle}>PRODUKSI DOKUMEN TERTINGGI</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pdTinggi} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="pd" hide />
                  <YAxis {...yAxisProps} domain={[0, 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="jml" name="Jml Dokumen" fill={CHART_COLORS.primary} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <table style={{ ...S.tbl, marginTop: "4px" }}>
                <tbody>
                  <tr>{pdTinggi.map((r, i) => <td key={i} style={{ ...S.td, fontSize: "8px", verticalAlign: "top", width: `${100/pdTinggi.length}%` }}>{r.pd}</td>)}</tr>
                  <tr>{pdTinggi.map((r, i) => <td key={i} style={{ ...S.td, fontWeight: "700" }}>{r.jml}</td>)}</tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── CARD 3: TABEL PD MENERAPKAN SIDEBAR ─────────────────────── */}
        <div style={S.card}>
          <div style={{ overflowX: "auto" }}>
            <table style={S.tbl}>
              <thead>
                <tr><th style={S.thYL} colSpan={1 + MONTHS.length}>TABEL PERANGKAT DAERAH YANG MENERAPKAN SIDEBAR</th></tr>
                <tr>
                  <th style={S.thL}>Perangkat Daerah</th>
                  {MONTHS.map(m => <th key={m} style={S.th}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {pdList.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                    <td style={S.tdL}>{row[0] as string}</td>
                    {MONTHS.map((m, idx) => (
                      <td key={m} style={S.td}>{row[1 + idx]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CARD 4: SUMMARY TERENDAH & TERTINGGI ────────────────────── */}
        <div style={S.card}>
          <div style={S.g2}>
            <table style={S.tbl}>
              <thead>
                <tr>
                  <th style={S.thYL}>TABEL PD PRODUKSI DOKUMEN TERENDAH</th>
                  <th style={S.thY}>Jml</th>
                </tr>
              </thead>
              <tbody>
                {pdRendah.map((r, i) => <tr key={i}><td style={S.tdL}>{r.pd}</td><td style={S.td}>{r.jml}</td></tr>)}
              </tbody>
            </table>
            <table style={S.tbl}>
              <thead>
                <tr>
                  <th style={S.thYL}>TABEL PD PRODUKSI DOKUMEN TERTINGGI</th>
                  <th style={S.thY}>Jml</th>
                </tr>
              </thead>
              <tbody>
                {pdTinggi.map((r, i) => <tr key={i}><td style={S.tdL}>{r.pd}</td><td style={S.td}>{r.jml}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CARD 5: JENIS DOKUMEN ────────────────────────────────────── */}
        <div style={S.card}>
          <div style={{ overflowX: "auto" }}>
            <table style={S.tbl}>
              <thead>
                <tr><th style={S.thYL} colSpan={1 + MONTHS.length}>JENIS DOKUMEN SIDEBAR</th></tr>
                <tr>
                  <th style={S.thL}>Jenis Dokumen</th>
                  {MONTHS.map(m => <th key={m} style={S.th}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {jenisDok.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                    <td style={S.tdL}>{row[0] as string}</td>
                    {MONTHS.map((m, idx) => (
                      <td key={m} style={S.td}>{row[1 + idx] || ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── TOMBOL AKSI ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button
            onClick={handleUnduh}
            style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            ↓ Unduh Data
          </button>
          <button
            onClick={() => router.push(`/sidebarjabar/edit?year=${currentYear}&month=${currentMonth}`)}
            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            ✎ Edit
          </button>
          <button
            onClick={() => router.push("/sidebarjabar/input")}
            style={{ background: "linear-gradient(135deg, #0f2540, #1d4ed8)", color: "white", border: "none", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            + Isi Form Rekapitulasi
          </button>
        </div>

        {/* ── RIWAYAT DATA ─────────────────────────────────────────────── */}
        <div style={S.card}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>Riwayat Data {teamLabel}</div>
          {historyYears.map(year => (
            <div key={year} style={{ marginBottom: "10px" }}>
              <button
                onClick={() => toggleYear(year)}
                style={{
                  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px",
                  background: expandedYears[year] ? "#eff6ff" : "#f8fafc",
                  border: "1px solid", borderColor: expandedYears[year] ? "#bfdbfe" : "#e2e8f0",
                  borderRadius: expandedYears[year] ? "10px 10px 0 0" : "10px",
                  cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "13px", fontWeight: "600",
                  color: expandedYears[year] ? "#1d4ed8" : "#334155",
                }}
              >
                <span>{year}</span>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{expandedYears[year] ? "▲ Tutup" : "▼ Pilih bulan"}</span>
              </button>
              {expandedYears[year] && (
                <div style={{ border: "1px solid #bfdbfe", borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                  {MONTHS_FULL.map((m, i) => (
                    <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: i < 11 ? "1px solid #f1f5f9" : "none", background: "white" }}>
                      <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>{m} {year}</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => handleUnduhBulanan(year, i + 1)}
                          style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >Unduh</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </>
  );
}