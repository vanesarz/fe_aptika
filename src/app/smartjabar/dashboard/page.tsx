"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Cell,
} from "recharts";
import {
  getSmartjabarJoinedApps,
  getSmartjabarStats,
  getOpdIdByName,
  exportSmartjabarReport,
} from "@/services/api";

const MONTHS_FULL = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const MONTHS_SHORT = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AGS","SEP","OKT","NOV","DES"];
const PERIOD_LABELS = ["Jan","Feb","Mar","Apr","Mei","Juni","Juli","Agst","Sept","Okt","Nov","Des"];
const MONTH_KEYS = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "ags", "sep", "okt", "nov", "des"];

const PD_LIST = [
  "Badan Penghubung",
  "Sekretariat DPRD",
  "Dinas Kependudukan dan Pencatatan Sipil",
  "Dinas Pemuda dan Olahraga",
  "Dinas Pemberdayaan Masyarakat dan Desa",
  "Badan Penanggulangan Bencana Daerah",
  "Inspektorat Daerah",
  "Badan Pengembangan Sumber Daya Manusia",
  "Satuan Polisi Pamong Praja",
  "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu",
  "Badan Kesatuan Bangsa dan Politik",
  "Badan Penelitian dan Pengembangan Daerah",
  "Badan Perencanaan Pembangunan Daerah",
  "Dinas Komunikasi dan Informatika",
  "Dinas Pariwisata dan Kebudayaan",
  "Dinas Sosial",
  "Badan Kepegawaian Daerah",
  "Dinas Kehutanan",
  "Dinas Perindustrian dan Perdagangan",
  "Dinas Perpustakaan dan Kearsipan Daerah",
  "Dinas Kelautan dan Perikanan",
  "Dinas Pemberdayaan Perempuan, Perlindungan Anak dan Keluarga Berencana",
  "Dinas Perkebunan",
  "Dinas Koperasi dan Usaha Kecil",
  "Dinas Ketahanan Pangan dan Peternakan",
  "Dinas Perhubungan",
  "Dinas Sumber Daya Air",
  "Dinas Bina Marga dan Penataan Ruang",
  "Dinas Tanaman Pangan dan Hortikultura",
  "Dinas Lingkungan Hidup",
  "Dinas Perumahan dan Permukiman",
  "Badan Pengelolaan Keuangan dan Aset Daerah",
  "Dinas Tenaga Kerja dan Transmigrasi",
  "Dinas Energi dan Sumber Daya Mineral",
  "Badan Pendapatan Daerah",
  "Sekretariat Daerah",
  "Dinas Kesehatan",
  "Dinas Pendidikan"
];

const CHART_COLORS = { primary: "#1d4ed8", orange: "#f97316" };

// ─── Component ─────────────────────────────────────────────────────────────

export default function DashboardSmart() {
  const router = useRouter();
  const team       = "SMART Jabar";
  const teamLabel  = "SMART Jabar";
  const teamBEName = "SMART Jabar";

  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [pdPersentase,    setPdPersentase]    = useState<any[]>([]);
  const [totalPengguna,   setTotalPengguna]   = useState<any[]>([]);
  const [aplikasi,        setAplikasi]        = useState<any[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [isDummy,         setIsDummy]         = useState(false);
  const [expandedYears,   setExpandedYears]   = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const prevYear = currentYear - 1;
        const [statsCurrent, appsCurrent] = await Promise.all([
          getSmartjabarStats(currentYear),
          getSmartjabarJoinedApps(currentYear),
        ]);

        const curStats = statsCurrent?.data || [];
        const curApps = appsCurrent?.data || [];

        // 1. Compute pdPersentase
        const computedPdPersentase = PD_LIST.map(pd => {
          const opdId = getOpdIdByName(pd);
          const pdCurStats = curStats.filter((item: any) => Number(item.opd_id) === opdId);
          
          // Latest ASN number from the records, default to 0
          const latestStat = pdCurStats.reduce((latest: any, item: any) => {
            if (!latest || (Number(item.year) > Number(latest.year)) || 
                (Number(item.year) === Number(latest.year) && Number(item.month) > Number(latest.month))) {
              return item;
            }
            return latest;
          }, null);
          const asnJumlah = latestStat ? Number(latestStat.total_asn) : 0;

          const monthValues: Record<string, number | ""> = {};
          MONTH_KEYS.forEach((key, idx) => {
            const mNum = idx + 1;
            const entry = pdCurStats.find((item: any) => Number(item.month) === mNum);
            monthValues[key] = entry ? Number(entry.active_users) : "";
          });

          const latestActive = latestStat ? Number(latestStat.active_users) : 0;
          const persen = asnJumlah > 0 ? (latestActive / asnJumlah) * 100 : 0;

          return {
            pd,
            asnJumlah,
            ...monthValues,
            persen
          };
        });
        setPdPersentase(computedPdPersentase);

        // 2. Compute totalPengguna
        const compTotalPengguna: any[] = [];
        MONTH_KEYS.forEach((key, idx) => {
          const mNum = idx + 1;
          const monthStats = curStats.filter((item: any) => Number(item.month) === mNum);
          const sumActive = monthStats.reduce((sum: number, item: any) => sum + Number(item.active_users), 0);
          compTotalPengguna.push({ label: PERIOD_LABELS[idx], jumlah: sumActive });
        });
        setTotalPengguna(compTotalPengguna);

        // 3. Compute aplikasi (Joined Apps)
        const compAplikasi: any[] = [];
        MONTH_KEYS.forEach((key, idx) => {
          const mNum = idx + 1;
          const entry = curApps.find((item: any) => Number(item.month) === mNum);
          compAplikasi.push({ period: PERIOD_LABELS[idx], jumlah: entry ? Number(entry.total_apps) : 0 });
        });
        setAplikasi(compAplikasi);

        setIsDummy(false);
      } catch (err) {
        console.error(err);
        setPdPersentase([]);
        setTotalPengguna([]);
        setAplikasi([]);
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
      const blob = await exportSmartjabarReport(currentYear);
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
      const blob = await exportSmartjabarReport(year, month);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `APTIKA_Tools_${teamLabel}_${year}_${MONTHS_SHORT[month - 1]}.xlsx`;
      a.click();
    } catch {
      alert("Gagal mengunduh data bulanan. Pastikan BE aktif.");
    }
  };

  // months with data vs empty
  const filledMonths = MONTHS_SHORT.slice(0, aplikasi.length - 1);
  const emptyMonths  = MONTHS_SHORT.slice(aplikasi.length - 1);

  // ── Styles ──────────────────────────────────────────────────────────────
  const S = {
    page:     { fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px", maxWidth: "1200px" } as React.CSSProperties,
    card:     { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
    badge:    { display: "block", backgroundColor: "#fbbf24", color: "#78350f", fontSize: "11px", fontWeight: "700", padding: "10px 14px", borderRadius: "6px", letterSpacing: "0.5px", marginBottom: "14px", textAlign: "center" as const } as React.CSSProperties,
    secTitle: { fontSize: "12px", fontWeight: "700", color: "#0f172a", textAlign: "center" as const, textTransform: "uppercase" as const, lineHeight: 1.6, marginBottom: "14px" } as React.CSSProperties,
    tbl:      { width: "100%", borderCollapse: "collapse" as const, fontSize: "10px" } as React.CSSProperties,
    th:       { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 7px", fontWeight: "700", color: "#475569", textAlign: "center" as const, fontSize: "9px" } as React.CSSProperties,
    thL:      { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 7px", fontWeight: "700", color: "#475569", textAlign: "left"   as const, fontSize: "9px" } as React.CSSProperties,
    thY:      { backgroundColor: "#fbbf24", border: "1px solid #e2e8f0", padding: "5px 7px", fontWeight: "700", color: "#78350f", textAlign: "center" as const, fontSize: "9px" } as React.CSSProperties,
    thYL:     { backgroundColor: "#fbbf24", border: "1px solid #e2e8f0", padding: "5px 7px", fontWeight: "700", color: "#78350f", textAlign: "left"   as const, fontSize: "9px" } as React.CSSProperties,
    td:       { border: "1px solid #e2e8f0", padding: "4px 7px", textAlign: "center" as const, color: "#334155", fontSize: "10px" } as React.CSSProperties,
    tdL:      { border: "1px solid #e2e8f0", padding: "4px 7px", color: "#334155", fontSize: "10px" } as React.CSSProperties,
    g2:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" } as React.CSSProperties,
  };

  const tooltipStyle = { fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" };
  const xAxisProps   = { tick: { fontSize: 9, fill: "#64748b" }, axisLine: false, tickLine: false };
  const yAxisProps   = { tick: { fontSize: 9, fill: "#64748b" }, axisLine: false, tickLine: false };

  const btnUnduh: React.CSSProperties  = { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" };
  const btnEdit: React.CSSProperties   = { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", padding: "6px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" };
  const btnUnduhSm: React.CSSProperties = { ...btnUnduh, padding: "4px 12px" };
  const btnEditSm: React.CSSProperties  = { ...btnEdit,  padding: "4px 12px" };

  // horizontal bar chart data — sorted ascending by persen
  const barData = [...pdPersentase].sort((a, b) => a.persen - b.persen);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={S.page}>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
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

   {/* ── CARD 3: Tabel Presentase per PD ─────────────────────────── */}
        <div style={S.card}>
          <div style={{ overflowX: "auto" }}>
            <table style={S.tbl}>
              <thead>
                <tr>
                  <th style={{ ...S.thYL, textAlign: "center" }} colSpan={3 + PERIOD_LABELS.length + 1}>
                    PRESENTASE PENGGUNA SMART JABAR PADA PD
                  </th>
                </tr>
                <tr>
                  <th style={{ ...S.th, width: "24px" }}>No</th>
                  <th style={S.thL}>OPD</th>
                  <th style={S.th}>JUMLAH ASN</th>
                  {PERIOD_LABELS.map(m => <th key={m} style={S.th}>{m}</th>)}
                  <th style={{ ...S.th, backgroundColor: "#fbbf24", color: "#78350f" }}>% PENGGUNA</th>
                </tr>
              </thead>
              <tbody>
                {pdPersentase.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                    <td style={{ ...S.td, color: "#94a3b8" }}>{i + 1}</td>
                    <td style={S.tdL}>{row.pd}</td>
                    <td style={S.td}>{row.asnJumlah}</td>
                    {MONTH_KEYS.map(key => (
                      <td key={key} style={S.td}>{row[key] || ""}</td>
                    ))}
                    <td style={{ ...S.td, fontWeight: "700", color: row.persen >= 100 ? "#16a34a" : "#1d4ed8" }}>
                      {row.persen?.toFixed(2)}%
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr style={{ background: "#fbbf24" }}>
                  <td style={{ ...S.td, fontWeight: "700" }} colSpan={2}>TOTAL PENGGUNA SMARTJABAR</td>
                  <td style={{ ...S.td, fontWeight: "700" }}>{pdPersentase.reduce((s, r) => s + (r.asnJumlah || 0), 0)}</td>
                  {MONTH_KEYS.map(key => {
                    const totalMonth = pdPersentase.reduce((s, r) => s + (Number(r[key]) || 0), 0);
                    return <td key={key} style={{ ...S.td, fontWeight: "700" }}>{totalMonth || ""}</td>;
                  })}
                  <td style={{ ...S.td, fontWeight: "700" }}>
                    {(() => {
                      const totalAsn = pdPersentase.reduce((s, r) => s + (r.asnJumlah || 0), 0);
                      const activeSums = MONTH_KEYS.map(key => pdPersentase.reduce((s, r) => s + (Number(r[key]) || 0), 0));
                      const latestActiveSum = activeSums.reduce((latest, current) => current || latest, 0);
                      return totalAsn > 0 ? `${Math.round((latestActiveSum / totalAsn) * 100)}%` : "0%";
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* ── CARD 1: Data Bulan Lalu ─────────────────────────────────── */}
        <div style={S.card}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "14px" }}>Data Bulan Lalu</div>

          {loading ? (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "13px" }}>Memuat data...</div>
          ) : (
            <>
              {/* Horizontal bar chart — persentase per PD */}
              <div style={S.secTitle}>PENGGUNA SMARTJABAR</div>
              <ResponsiveContainer width="100%" height={barData.length * 24 + 20}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 4, right: 50, left: 4, bottom: 4 }}
                  barSize={11}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} {...xAxisProps} tickFormatter={(v: any) => `${v}%`} />
                  <YAxis
                    type="category"
                    dataKey="pd"
                    tick={{ fontSize: 8, fill: "#475569" }}
                    axisLine={false}
                    tickLine={false}
                    width={320}
                    tickFormatter={(v: string) => v.length > 45 ? v.slice(0, 45) + "…" : v}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Persentase"]} />
                  <Bar dataKey="persen" fill={CHART_COLORS.primary} radius={[0,3,3,0]}>
                    {barData.map((_, i) => <Cell key={i} fill={CHART_COLORS.primary} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* ── CARD 2: Total Pengguna SmartJabar bar chart ─────────────── */}
        <div style={S.card}>
          <div style={S.secTitle}>TOTAL PENGGUNA SMARTJABAR</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={totalPengguna} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" {...xAxisProps} />
              <YAxis {...yAxisProps} domain={[0, 'auto']} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="jumlah" name="TOTAL PENGGUNA SMARTJABAR" fill={CHART_COLORS.primary} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

     

        {/* ── CARD 4: Aplikasi Tergabung ───────────────────────────────── */}
        <div style={S.card}>
          <div>
            <div style={S.secTitle}>APLIKASI TERGABUNG SMARTJABAR</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={aplikasi} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" {...xAxisProps} />
                <YAxis {...yAxisProps} domain={[0, 'auto']} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="jumlah" name="Jumlah" fill={CHART_COLORS.primary} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <table style={{ ...S.tbl, marginTop: "4px" }}>
              <tbody>
                <tr>
                  <td style={{ ...S.tdL, fontSize: "9px", fontWeight: "600" }}>■ Jumlah</td>
                  {aplikasi.map((d: any, i: number) => <td key={i} style={S.td}>{d.jumlah}</td>)}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabel di bawah */}
          <div style={{ marginTop: "24px" }}>
            <table style={S.tbl}>
              <thead>
                <tr><th style={S.thYL} colSpan={2}>Aplikasi Tergabung SmartJabar</th></tr>
                <tr>
                  <th style={S.thL}>Bulan</th>
                  <th style={S.th}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {PERIOD_LABELS.map((p, i) => {
                  const found = aplikasi.find((d: any) => d.period === p);
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                      <td style={S.tdL}>{p}</td>
                      <td style={S.td}>{found?.jumlah ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FORM DATA BULAN INI ───────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Form Data Bulan Ini</span>
          <span style={{ background: "#dcfce7", color: "#166534", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "999px" }}>✓ Sudah Diisi</span>
          <button
            onClick={() => router.push(`/smartjabar/edit?year=${currentYear}&month=${currentMonth}`)}
            style={{ background: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "999px", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
          >
            Edit
          </button>
        </div>

        {/* ── TOMBOL AKSI ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button
            onClick={() => handleUnduh()}
            style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
          >
            ↓ Unduh Data
          </button>
          <button
            onClick={() => router.push(`/smartjabar/edit?year=${currentYear}&month=${currentMonth}`)}
            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
          >
            ✎ Edit
          </button>
          <button
            onClick={() => router.push("/smartjabar/input")}
            style={{ background: "linear-gradient(135deg, #0f2540, #1d4ed8)", color: "white", border: "none", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
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
                  {MONTHS_SHORT.map((m, i) => (
                    <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: i < 11 ? "1px solid #f1f5f9" : "none", background: "white" }}>
                      <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>{m} {year}</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => handleUnduhBulanan(year, i + 1)}
                          style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                        >
                          Unduh
                        </button>
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