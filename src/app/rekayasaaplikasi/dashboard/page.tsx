  "use client";

  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";
  import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Legend,
  } from "recharts";
  import { getAppReplicationsSummary, getAppReplications, getMentoringPerformances, exportRekayasaReport } from "@/services/api";

  const MONTHS = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AGS","SEP","OKT","NOV","DES"];

  const CHART_COLORS = {
    primary: "#1d4ed8",
    cyan: "#0891b2",
    amber: "#f59e0b",
    gray: "#94a3b8",
  };

  export default function DashboardPage() {
    const router = useRouter();
    const team = "rekayasaaplikasi";
    const teamLabel = "Rekayasa Aplikasi";
    const teamBEName = "Rekayasa Aplikasi";

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const [monthly, setMonthly] = useState<any[]>([]);
    const [rekap, setRekap] = useState<any[]>([]);
    const [progress, setProgress] = useState<any[]>([]);
    const [summaryYear, setSummaryYear] = useState(currentYear);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isDummy, setIsDummy] = useState(false);
    const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});

    useEffect(() => {
      const fetchSummary = async () => {
        setLoadingSummary(true);
        try {
          const summaryRes = await getAppReplicationsSummary(summaryYear);
          const summaryMonths = summaryRes?.data?.[0]?.months || [];
          const formattedMonthly = MONTHS.map((m, i) => {
            const found = summaryMonths.find((x: any) => Number(x.month) === i + 1);
            return { month: i + 1, total: found ? Number(found.total) : 0 };
          });
          setMonthly(formattedMonthly);
        } catch {
          const emptyMonthly = MONTHS.map((m, i) => ({ month: i + 1, total: 0 }));
          setMonthly(emptyMonthly);
        } finally {
          setLoadingSummary(false);
        }
      };
      fetchSummary();
    }, [summaryYear]);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const repsRes = await getAppReplications(currentYear);
          const mentorsRes = await getMentoringPerformances(currentYear);

          const repsData = repsRes?.data || [];
          const formattedRekap = MONTHS.map((m, i) => {
            const mData = repsData.filter((x: any) => Number(x.month) === i + 1);
            const getVal = (instId: number) => {
               const item = mData.find((x: any) => Number(x.institution_id) === instId);
               return item ? Number(item.total_replications) : 0;
            };
            return {
               month: m,
               perangkatDaerah: getVal(1),
               kabupatenKota: getVal(2),
               pemdaLainnya: getVal(3),
               klLainnya: getVal(4),
            };
          });
          setRekap(formattedRekap);

          const mentorsData = mentorsRes?.items || [];
          const formattedProgress = MONTHS.map((m, i) => {
             const found = mentorsData.find((x: any) => Number(x.month) === i + 1);
             return {
                month: m,
                jumlah: found ? Number(found.total_apps) : 0,
                target: found ? Number(found.target) : 0,
                realisasi: found ? Number(found.realization) : 0,
             };
          });
          setProgress(formattedProgress);
          setIsDummy(false);
        } catch {
          const emptyRekap = MONTHS.map(m => ({ month: m, perangkatDaerah: 0, kabupatenKota: 0, pemdaLainnya: 0, klLainnya: 0 }));
          const emptyProgress = MONTHS.map(m => ({ month: m, jumlah: 0, target: 0, realisasi: 0 }));
          setRekap(emptyRekap);
          setProgress(emptyProgress);
          setIsDummy(false);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [currentYear]);

    const prevMonthShort = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"][currentMonth === 0 ? 11 : currentMonth - 1];
    const prevRekap = rekap.find((r) => r.month?.toLowerCase() === prevMonthShort.toLowerCase()) || rekap[rekap.length - 1];
    const prevProgress = progress.find((p) => p.month?.toLowerCase() === prevMonthShort.toLowerCase()) || progress[progress.length - 1];

    const bulanLaluData = [
      { name: "Jumlah APL", value: prevProgress?.jumlah ?? 0 },
      { name: "Provinsi", value: prevRekap?.perangkatDaerah ?? 0 },
      { name: "Kab/Kota", value: prevRekap?.kabupatenKota ?? 0 },
      { name: "K/L/Lainnya", value: prevRekap?.klLainnya ?? 0 },
    ];

    const rekapAplikasiRow = MONTHS.map((_, i) => {
      const found = monthly.find((d) => Number(d.month) === i + 1);
      return found?.total ?? 0;
    });

    const rekapAplikasiChartData = MONTHS.map((m, i) => {
      const found = monthly.find((d) => Number(d.month) === i + 1);
      return { month: m, Aplikasi: found?.total ?? 0 };
    });

    const progressChartData = progress.map((p) => ({
      month: p.month,
      "Jumlah APL": p.jumlah ?? 0,
      Target: p.target ?? 0,
      Realisasi: p.realisasi ?? 0,
    }));

    const historyYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5];
    const toggleYear = (year: number) => setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));

    const handleUnduh = async () => {
      try {
        const blob = await exportRekayasaReport(currentYear);
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
        const blob = await exportRekayasaReport(year, month);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `APTIKA_Tools_${teamLabel}_${year}_${MONTHS[month - 1]}.xlsx`;
        a.click();
      } catch {
        alert("Gagal mengunduh data bulanan. Pastikan BE aktif.");
      }
    };

    const S = {
      page: { fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px", maxWidth: "1200px" } as React.CSSProperties,
      pageHeader: { marginBottom: "24px" } as React.CSSProperties,
      pageTitle: { fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.4px" } as React.CSSProperties,
      pageSub: { fontSize: "13px", color: "#94a3b8", marginTop: "4px" } as React.CSSProperties,
      card: { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
      sectionBadge: { display: "block", backgroundColor: "#fbbf24", color: "#78350f", fontSize: "11px", fontWeight: "700", padding: "10px 14px", borderRadius: "6px", letterSpacing: "0.5px", marginBottom: "14px", textAlign: "center" as const } as React.CSSProperties,
      sectionTitle: { fontSize: "13px", fontWeight: "700", color: "#0f172a", textAlign: "center" as const, textTransform: "uppercase" as const, letterSpacing: "0.3px", lineHeight: 1.6, marginBottom: "16px" } as React.CSSProperties,
      table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "12px" } as React.CSSProperties,
      th: { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "7px 10px", fontWeight: "700", color: "#475569", textAlign: "center" as const, fontSize: "11px", letterSpacing: "0.3px" } as React.CSSProperties,
      thLeft: { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "7px 10px", fontWeight: "700", color: "#475569", textAlign: "left" as const, fontSize: "11px" } as React.CSSProperties,
      td: { border: "1px solid #e2e8f0", padding: "7px 10px", textAlign: "center" as const, color: "#334155" } as React.CSSProperties,
      tdLeft: { border: "1px solid #e2e8f0", padding: "7px 10px", color: "#334155" } as React.CSSProperties,
    };

    const tooltipStyle = { fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" };
    const xAxisProps = { tick: { fontSize: 11, fill: "#64748b" }, axisLine: false, tickLine: false };
    const yAxisProps = { tick: { fontSize: 11, fill: "#64748b" }, axisLine: false, tickLine: false };

    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

        <div style={S.page}>

          {/* HEADER */}
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

          {/* REKAP APLIKASI */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ ...S.sectionBadge, marginBottom: 0 }}>REKAP APLIKASI</div>
              <select
                value={summaryYear}
                onChange={(e) => setSummaryYear(Number(e.target.value))}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", color: "#475569", outline: "none", cursor: "pointer" }}
              >
                {historyYears.map(y => <option key={y} value={y}>Tahun {y}</option>)}
              </select>
            </div>
            
            {loadingSummary ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "13px" }}>Memuat data rekap...</div>
            ) : (
              <>
                <div style={{ overflowX: "auto", marginBottom: "16px" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.thLeft}>TAHUN</th>
                    {MONTHS.map((m) => <th key={m} style={S.th}>{m}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={S.tdLeft}>{summaryYear}</td>
                    {rekapAplikasiRow.map((val, i) => <td key={i} style={S.td}>{val}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={rekapAplikasiChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Aplikasi" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
              </>
            )}
          </div>

          {/* REKAP PER INSTANSI */}
          <div style={S.card}>
            <div style={S.sectionBadge}>REKAP REPLIKASI PER KD/KABKO/LEMBAGA</div>
            <div style={{ overflowX: "auto", marginBottom: "16px" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.thLeft}>Kategori</th>
                    {rekap.map((r, i) => <th key={i} style={S.th}>{r.month}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Pemerintah Provinsi", key: "perangkatDaerah" },
                    { label: "Pemerintah Kabupaten/Kota", key: "kabupatenKota" },
                    { label: "Pemda Lainnya", key: "pemdaLainnya" },
                    { label: "K/L/LAINNYA", key: "klLainnya" },
                  ].map((row) => (
                    <tr key={row.key}>
                      <td style={S.tdLeft}>{row.label}</td>
                      {rekap.map((r, i) => <td key={i} style={S.td}>{r[row.key] ?? 0}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rekap} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="perangkatDaerah" name="Pemerintah Provinsi" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="kabupatenKota" name="Pemerintah Kab/Kota" fill={CHART_COLORS.cyan} radius={[4, 4, 0, 0]} />
                <Bar dataKey="pemdaLainnya" name="Pemda Lainnya" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
                <Bar dataKey="klLainnya" name="K/L/LAINNYA" fill={CHART_COLORS.gray} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* REKAP FASILITASI */}
          <div style={S.card}>
            <div style={S.sectionTitle}>
              Rekap Fasilitasi Layanan Pendampingan<br />
              Pembangunan/Pengembangan Aplikasi<br />
              Tahun {currentYear}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={progressChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Jumlah APL" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realisasi" fill={CHART_COLORS.gray} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ overflowX: "auto", marginTop: "16px" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>BULAN</th>
                    <th style={S.th}>JUMLAH APL</th>
                    <th style={S.th}>TARGET</th>
                    <th style={S.th}>REALISASI</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.map((p, i) => (
                    <tr key={i}>
                      <td style={S.td}>{p.month}</td>
                      <td style={S.td}>{p.jumlah ?? 0}</td>
                      <td style={S.td}>{p.target ?? 0}</td>
                      <td style={S.td}>{p.realisasi ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Form Data Bulan Ini</span>
              <span style={{ background: "#dcfce7", color: "#166534", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "999px" }}>✓ Sudah Diisi</span>
              <button onClick={() => router.push("/rekayasaaplikasi/edit")} style={{ background: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "999px", border: "none", cursor: "pointer" }}>Edit</button>
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            <button onClick={handleUnduh} style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ↓ Unduh Data
            </button>
            <button onClick={() => router.push("/rekayasaaplikasi/edit")} style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ✎ Edit
            </button>
            <button onClick={() => router.push("/rekayasaaplikasi/input")} style={{ background: "linear-gradient(135deg, #0f2540, #1d4ed8)", color: "white", border: "none", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              + Isi Form Rekapitulasi
            </button>
          </div>

          {/* RIWAYAT DATA */}
          <div style={S.card}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
              Riwayat Data {teamLabel}
            </div>
            {historyYears.map((year) => (
              <div key={year} style={{ marginBottom: "10px" }}>
                <button
                  onClick={() => toggleYear(year)}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", background: expandedYears[year] ? "#eff6ff" : "#f8fafc",
                    border: "1px solid", borderColor: expandedYears[year] ? "#bfdbfe" : "#e2e8f0",
                    borderRadius: expandedYears[year] ? "10px 10px 0 0" : "10px",
                    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "13px", fontWeight: "600", color: expandedYears[year] ? "#1d4ed8" : "#334155",
                  }}
                >
                  <span>{year}</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>{expandedYears[year] ? "▲ Tutup" : "▼ Pilih bulan"}</span>
                </button>
                {expandedYears[year] && (
                  <div style={{ border: "1px solid #bfdbfe", borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                    {MONTHS.map((m, i) => (
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