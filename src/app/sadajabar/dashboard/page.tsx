"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import { getSadajabarIntegrasi, getSadajabarEnkripsi, exportSadajabarReport } from "@/services/api";

const MONTHS     = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AGS","SEP","OKT","NOV","DES"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];

const CHART_COLORS = { primary:"#1d4ed8", cyan:"#0891b2", amber:"#f59e0b" };

// Format angka penuh pakai titik (no toLocaleString → no hydration error)
function fmtFull(n: number | ""): string {
  if (n === "" || n === undefined || n === null) return "";
  return Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Format Y-axis label — angka penuh pakai titik
function fmtAxis(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function DashboardPage() {
  const router     = useRouter();
  const team       = "sada";
  const teamLabel  = "SADAjabar";
  const teamBEName = "SADAjabar";
  const currentYear = new Date().getFullYear();

  const [terekamChart,   setTerekamChart]   = useState<any[]>([]);
  const [terekamCols,    setTerekamCols]    = useState<string[]>([]);
  const [terekamRow,     setTerekamRow]     = useState<Record<string, number | "">>({});
  const [integrasiChart, setIntegrasiChart] = useState<any[]>([]);
  const [integrasiCols,  setIntegrasiCols]  = useState<string[]>([]);
  const [integrasiRows,  setIntegrasiRows]  = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [isDummy,        setIsDummy]        = useState(false);
  const [expandedYears,  setExpandedYears]  = useState<Record<number,boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [enkripsiCurrent, integrasiCurrent] = await Promise.all([
          getSadajabarEnkripsi(currentYear),
          getSadajabarIntegrasi(currentYear),
        ]);

        const currentData = enkripsiCurrent?.data || [];
        const currentInt = integrasiCurrent?.data || [];

        // ─── TEREKAM / ENKRIPSI STATS ───
        const tCols = [...MONTHS];
        setTerekamCols(tCols);

        const tRow: Record<string, number | ""> = {};
        MONTHS.forEach((m, idx) => {
          const mNum = idx + 1;
          const entry = currentData.find((d: any) => Number(d.month) === mNum);
          tRow[m] = entry ? entry.app_count : "";
        });
        setTerekamRow(tRow);

        const tChart: any[] = [];
        MONTHS.forEach((m, idx) => {
          const mNum = idx + 1;
          const entry = currentData.find((d: any) => Number(d.month) === mNum);
          tChart.push({ month: m, "JUMLAH DATA": entry ? entry.app_count : 0 });
        });
        setTerekamChart(tChart);

        // ─── INTEGRASI APLIKASI ───
        const iCols = [...MONTHS];
        setIntegrasiCols(iCols);

        const categories = [
          { label: "PEMPROV (PD)", id: 1 },
          { label: "KABKO", id: 2 },
          { label: "K/L/LAINNYA", id: 4 }
        ];

        const iRows = categories.map(cat => {
          const colsObj: Record<string, number | ""> = {};

          MONTHS.forEach((m, idx) => {
            const mNum = idx + 1;
            const entry = currentInt.find((d: any) => Number(d.institution_id) === cat.id && Number(d.month) === mNum);
            colsObj[m] = entry ? entry.app_count : "";
          });

          return { label: cat.label, cols: colsObj };
        });
        setIntegrasiRows(iRows);

        const iChart: any[] = [];
        MONTHS.forEach((m, idx) => {
          const mNum = idx + 1;
          const entries = currentInt.filter((d: any) => Number(d.month) === mNum);
          const chartObj: any = { month: m };
          categories.forEach(cat => {
            const entry = entries.find((d: any) => Number(d.institution_id) === cat.id);
            chartObj[cat.label] = entry ? entry.app_count : 0;
          });
          iChart.push(chartObj);
        });
        setIntegrasiChart(iChart);

        setIsDummy(false);
      } catch (err) {
        console.error(err);
        setTerekamChart([]);
        setTerekamCols([]);
        setTerekamRow({});
        setIntegrasiChart([]);
        setIntegrasiCols([]);
        setIntegrasiRows([]);
        setIsDummy(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentYear]);

  const toggleYear = (year: number) =>
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));

  const handleUnduh = async () => {
    try {
      const blob = await exportSadajabarReport(currentYear);
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `APTIKA_Tools_${teamLabel}_${currentYear}.xlsx`; a.click();
    } catch { alert("Gagal mengunduh. Pastikan BE aktif."); }
  };

  const handleUnduhBulanan = async (year: number, month: number) => {
    try {
      const blob = await exportSadajabarReport(year, month);
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `APTIKA_Tools_${teamLabel}_${year}_${MONTHS[month - 1]}.xlsx`;
      a.click();
    } catch {
      alert("Gagal mengunduh data bulanan. Pastikan BE aktif.");
    }
  };

  const historyYears = [currentYear, currentYear-1, currentYear-2, currentYear-3];

  const tooltipStyle = { fontSize:12, borderRadius:8, border:"1px solid #e2e8f0" };
  const xAxisProps   = { tick:{ fontSize:11, fill:"#64748b" }, axisLine:false, tickLine:false };
  const yAxisBig     = { tick:{ fontSize:10, fill:"#64748b" }, axisLine:false, tickLine:false, tickFormatter:fmtAxis, width:95 };
  const yAxisSmall   = { tick:{ fontSize:11, fill:"#64748b" }, axisLine:false, tickLine:false };

  const S = {
    page:      { fontFamily:"'Plus Jakarta Sans', sans-serif", padding:"28px", maxWidth:"1200px" } as React.CSSProperties,
    pageTitle: { fontSize:"20px", fontWeight:"800", color:"#0f172a", letterSpacing:"-0.4px" } as React.CSSProperties,
    pageSub:   { fontSize:"13px", color:"#94a3b8", marginTop:"4px", marginBottom:"24px" } as React.CSSProperties,
    card:      { backgroundColor:"white", borderRadius:"14px", border:"1px solid #e2e8f0", padding:"20px 24px", marginBottom:"20px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
    badge:     { display:"block", backgroundColor:"#fbbf24", color:"#78350f", fontSize:"11px", fontWeight:"700", padding:"10px 14px", borderRadius:"6px", letterSpacing:"0.5px", marginBottom:"14px", textAlign:"center" as const } as React.CSSProperties,
    table:     { width:"100%", borderCollapse:"collapse" as const, fontSize:"11px" } as React.CSSProperties,
    th:        { backgroundColor:"#f8fafc", border:"1px solid #e2e8f0", padding:"6px 8px", fontWeight:"700", color:"#475569", textAlign:"center" as const, fontSize:"10px", whiteSpace:"nowrap" as const } as React.CSSProperties,
    thLeft:    { backgroundColor:"#f8fafc", border:"1px solid #e2e8f0", padding:"6px 8px", fontWeight:"700", color:"#475569", textAlign:"left" as const, fontSize:"10px", whiteSpace:"nowrap" as const } as React.CSSProperties,
    td:        { border:"1px solid #e2e8f0", padding:"6px 8px", textAlign:"center" as const, color:"#334155", whiteSpace:"nowrap" as const } as React.CSSProperties,
    tdLeft:    { border:"1px solid #e2e8f0", padding:"6px 8px", color:"#334155", fontWeight:"600", whiteSpace:"nowrap" as const } as React.CSSProperties,
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={S.page}>

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

        {/* ── CARD 1: REKAP DATA TEREKAM DAN TERENKRIPSI ── */}
        <div style={S.card}>
          <div style={S.badge}>REKAP DATA TEREKAM DAN TERENKRIPSI</div>
          {loading ? (
            <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", fontSize:"13px" }}>Memuat data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={terekamChart} margin={{ top:5, right:20, left:10, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis {...yAxisBig} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v:any) => [fmtFull(v), "Jumlah Data"]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize:11 }} />
                <Bar dataKey="JUMLAH DATA" fill={CHART_COLORS.primary} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ overflowX:"auto", marginTop:"16px" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thLeft}></th>
                  {terekamCols.map((col) => <th key={col} style={S.th}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.tdLeft}>JUMLAH DATA</td>
                  {terekamCols.map((col) => (
                    <td key={col} style={S.td}>{fmtFull(terekamRow[col] ?? "")}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CARD 2: REKAP APLIKASI TERINTEGRASI SADAJABAR ── */}
        <div style={S.card}>
          <div style={S.badge}>REKAP APLIKASI TERINTEGRASI SADAJABAR</div>
          {loading ? (
            <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", fontSize:"13px" }}>Memuat data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={integrasiChart} margin={{ top:5, right:20, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis {...yAxisSmall} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconSize={10} wrapperStyle={{ fontSize:11 }} />
                <Bar dataKey="PEMPROV (PD)" fill={CHART_COLORS.primary} radius={[4,4,0,0]} />
                <Bar dataKey="KABKO"        fill={CHART_COLORS.cyan}    radius={[4,4,0,0]} />
                <Bar dataKey="K/L/LAINNYA" fill={CHART_COLORS.amber}   radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ overflowX:"auto", marginTop:"16px" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thLeft}></th>
                  {integrasiCols.map((col) => <th key={col} style={S.th}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {integrasiRows.map((row, ri) => (
                  <tr key={ri}>
                    <td style={S.tdLeft}>{row.label}</td>
                    {integrasiCols.map((col) => (
                      <td key={col} style={S.td}>{row.cols?.[col] ?? ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FORM DATA BULAN INI ── */}
        <div style={{ ...S.card, marginBottom:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"12px", fontWeight:"600", color:"#475569" }}>Form Data Bulan Ini</span>
            <span style={{ background:"#dcfce7", color:"#166534", fontSize:"11px", fontWeight:"700", padding:"3px 10px", borderRadius:"999px" }}>✓ Sudah Diisi</span>
            <button onClick={() => router.push("/sadajabar/edit")} style={{ background:"#fef3c7", color:"#92400e", fontSize:"11px", fontWeight:"700", padding:"3px 10px", borderRadius:"999px", border:"none", cursor:"pointer" }}>Edit</button>
          </div>
        </div>

        {/* ── TOMBOL AKSI ── */}
        <div style={{ display:"flex", gap:"10px", marginBottom:"24px" }}>
          <button onClick={handleUnduh} style={{ background:"#f1f5f9", color:"#475569", border:"1px solid #e2e8f0", padding:"9px 18px", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>↓ Unduh Data</button>
          <button onClick={() => router.push("/sadajabar/edit")} style={{ background:"#fef3c7", color:"#92400e", border:"1px solid #fcd34d", padding:"9px 18px", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>✎ Edit</button>
          <button onClick={() => router.push("/sadajabar/input")} style={{ background:"linear-gradient(135deg, #0f2540 0%, #1d4ed8 60%, #0891b2 100%)", color:"white", border:"none", padding:"9px 18px", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>+ Isi Form Rekapitulasi</button>
        </div>

        {/* ── RIWAYAT DATA ── */}
        <div style={S.card}>
          <div style={{ fontSize:"13px", fontWeight:"700", color:"#0f172a", marginBottom:"16px" }}>Riwayat Data {teamLabel}</div>
          {historyYears.map((year) => (
            <div key={year} style={{ marginBottom:"10px" }}>
              <button
                onClick={() => toggleYear(year)}
                style={{
                  width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"10px 14px",
                  background:   expandedYears[year] ? "#eff6ff" : "#f8fafc",
                  border:       "1px solid",
                  borderColor:  expandedYears[year] ? "#bfdbfe" : "#e2e8f0",
                  borderRadius: expandedYears[year] ? "10px 10px 0 0" : "10px",
                  cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif",
                  fontSize:"13px", fontWeight:"600",
                  color: expandedYears[year] ? "#1d4ed8" : "#334155",
                }}
              >
                <span>{year}</span>
                <span style={{ fontSize:"11px", color:"#94a3b8" }}>{expandedYears[year] ? "▲ Tutup" : "▼ Pilih bulan"}</span>
              </button>
              {expandedYears[year] && (
                <div style={{ border:"1px solid #bfdbfe", borderTop:"none", borderRadius:"0 0 10px 10px", overflow:"hidden" }}>
                  {MONTHS.map((m, i) => (
                    <div key={m} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 14px", borderBottom: i<11 ? "1px solid #f1f5f9" : "none", background:"white" }}>
                      <span style={{ fontSize:"12px", color:"#475569", fontWeight:"500" }}>{MONTHS_SHORT[i]} {year}</span>
                      <div style={{ display:"flex", gap:"6px" }}>
                        <button onClick={() => handleUnduhBulanan(year, i + 1)} style={{ background:"#ecfdf5", color:"#047857", border:"1px solid #a7f3d0", padding:"4px 12px", borderRadius:"6px", fontSize:"11px", fontWeight:"600", cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Unduh</button>
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