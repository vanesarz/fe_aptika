"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import { getIntopMandateServiceSummaries, getServiceCatalogs, getIntegrationSummaries, exportIntopReport } from "@/services/api";

const MONTHS = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AGS","SEP","OKT","NOV","DES"];

const TEAM_LABEL = "Integrasi-Interoperabilitas";
const TEAM_BE_NAME = "Integrasi Interoperabilitas";
const TEAM_ROUTE = "integrasiinteroperabilitas";


const C = {
  primary: "#1d4ed8",
  orange: "#f97316",
  amber: "#f59e0b",
  cyan: "#0891b2",
  gray: "#94a3b8",
};

export default function DashboardIntegrasi() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [ekosistem, setEkosistem] = useState<any[]>([]);
  const [aplikasi, setAplikasi] = useState<any[]>([]);
  const [layananAdm, setLayananAdm] = useState<string[]>([]);
  const [layananPublik, setLayananPublik] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mandatesRes, catalogsRes, integrationsRes] = await Promise.all([
          getIntopMandateServiceSummaries(currentYear),
          getServiceCatalogs(currentYear),
          getIntegrationSummaries(currentYear),
        ]);

        // Form 1: Mandate Services (Data Tahun Ini table)
        const mandateData = mandatesRes?.data || [];
        setLayananAdm(mandateData.filter((x: any) => x.category === "administrasi").map((x: any) => x.service_name));
        setLayananPublik(mandateData.filter((x: any) => x.category === "publik").map((x: any) => x.service_name));

        // Form 2: Service Catalogs (Ekosistem Layanan charts/tables)
        const catalogData = catalogsRes || [];
        const formattedEkosistem = MONTHS.map((m, i) => {
          const found = catalogData.find((x: any) => Number(x.month) === i + 1);
          return {
            bulan: m,
            layAdmPem: found ? Number(found.adm_service_count) : 0,
            layPublik: found ? Number(found.public_service_count) : 0,
            target: found ? Number(found.target_abs) : 0,
            capaian: found ? Number(found.achievement_abs) : 0,
            targetPct: found ? Number(found.target_percentage) : 0,
            capaianPct: found ? Number(found.achievement_percentage) : 0,
          };
        });
        setEkosistem(formattedEkosistem);

        // Form 3: Integration Summaries (Rekap Jumlah Aplikasi)
        const integrationData = integrationsRes?.items || [];

        console.log("integrationsRes", integrationsRes);
        console.log("integrationData", integrationData);

        const formattedAplikasi = MONTHS.map((m, i) => {
          const mData = integrationData.filter((x: any) => Number(x.month) === i + 1);
          const getVal = (instId: number) => {
             const item = mData.find((x: any) => Number(x.institution_id) === instId);
             return item ? Number(item.app_count) : 0;
          };
          const kabKota = getVal(2);
          const kementerian = getVal(4);
          const pemprovJabar = getVal(1);
          // total can be sum or from API if there's a specific logic. Let's assume sum or if there's an endpoint for total
          const total = kabKota + kementerian + pemprovJabar + getVal(3);
          return {
            bulan: m,
            total,
            kabKota,
            kementerian,
            pemprovJabar,
          };
        });
        setAplikasi(formattedAplikasi);

      } catch {
        // Fallbacks
        const emptyEko = MONTHS.map((m) => ({ bulan: m, layAdmPem: 0, layPublik: 0, target: 0, capaian: 0, targetPct: 0, capaianPct: 0 }));
        const emptyApp = MONTHS.map((m) => ({ bulan: m, total: 0, kabKota: 0, kementerian: 0, pemprovJabar: 0 }));
        setEkosistem(emptyEko);
        setAplikasi(emptyApp);
        setLayananAdm([]);
        setLayananPublik([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentYear]);

  const historyYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const toggle = (y: number) => setExpandedYears((p) => ({ ...p, [y]: !p[y] }));

  const handleUnduh = async () => {
    try {
      const blob = await exportIntopReport(currentYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `APTIKA_Tools_${TEAM_LABEL}_${currentYear}.xlsx`;
      a.click();
    } catch { alert("Gagal mengunduh. Pastikan BE aktif."); }
  };

  const handleUnduhBulanan = async (year: number, month: number) => {
    try {
      const blob = await exportIntopReport(year, month);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `APTIKA_Tools_${TEAM_LABEL}_${year}_${MONTHS[month - 1]}.xlsx`;
      a.click();
    } catch {
      alert("Gagal mengunduh data bulanan. Pastikan BE aktif.");
    }
  };

  // Style helpers
  const S = {
    page: { fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px" } as React.CSSProperties,
    card: { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
    badge: { display: "block", backgroundColor: "#fbbf24", color: "#78350f", fontSize: "11px", fontWeight: "700", padding: "10px 14px", borderRadius: "6px", letterSpacing: "0.5px", marginBottom: "14px", textAlign: "center" as const } as React.CSSProperties,
    chartTitle: { fontSize: "12px", fontWeight: "700", color: "#0f172a", textAlign: "center" as const, textTransform: "uppercase" as const, lineHeight: 1.6, marginBottom: "14px" } as React.CSSProperties,
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "12px" } as React.CSSProperties,
    th: { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "7px 10px", fontWeight: "700", color: "#475569", textAlign: "center" as const, fontSize: "11px" } as React.CSSProperties,
    thL: { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "7px 10px", fontWeight: "700", color: "#475569", textAlign: "left" as const, fontSize: "11px" } as React.CSSProperties,
    td: { border: "1px solid #e2e8f0", padding: "7px 10px", textAlign: "center" as const, color: "#334155", fontSize: "11px" } as React.CSSProperties,
    tdL: { border: "1px solid #e2e8f0", padding: "7px 10px", color: "#334155", fontSize: "11px" } as React.CSSProperties,
    tdNo: { border: "1px solid #e2e8f0", padding: "7px 6px", textAlign: "center" as const, color: "#94a3b8", fontSize: "10px", width: "28px" } as React.CSSProperties,
  };

  const xAxis = { tick: { fontSize: 11, fill: "#64748b" }, axisLine: false as const, tickLine: false as const };
  const yAxis = { tick: { fontSize: 11, fill: "#64748b" }, axisLine: false as const, tickLine: false as const };
  const tip = { fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" };

  const emptyCols = MONTHS.slice(ekosistem.length - 1);
  const emptyColsAplikasi = MONTHS.slice(aplikasi.length - 1);

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
            {TEAM_LABEL}
          </span>
        </div>

        {/* ── DATA TAHUN INI: TABEL LAYANAN ── */}
        <div style={S.card}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>Data Tahun Ini</div>
          <div style={S.badge}>EKOSISTEM LAYANAN TERINTEGRASI DAN INTEROPERABILITAS DATA MELALUI SPLP ({currentYear})</div>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.tdNo}>NO</th>
                  <th style={S.thL}>LAYANAN ADMINISTRASI PEMERINTAHAN</th>
                  <th style={S.tdNo}>No</th>
                  <th style={S.thL}>LAYANAN PUBLIK</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>Memuat data...</td></tr>
                ) : (
                  Array.from({ length: Math.max(layananAdm.length, layananPublik.length) || 1 }).map((_, i) => (
                    <tr key={i}>
                      <td style={S.tdNo}>{i < layananAdm.length ? i + 1 : ""}</td>
                      <td style={S.tdL}>{layananAdm[i] ?? ""}</td>
                      <td style={S.tdNo}>{i < layananPublik.length ? i + 1 : ""}</td>
                      <td style={S.tdL}>{layananPublik[i] ?? ""}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CHART 1: LAY ADM PEM vs LAY PUBLIK ── */}
        <div style={S.card}>
          <div style={S.chartTitle}>
            REKAP EKOSISTEM LAYANAN<br />
            HASIL INTEGRASI APLIKASI DAN INTEROPERABILITAS DATA MELALUI SPLP<br />
            TAHUN {currentYear}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ekosistem.map((d) => ({ bulan: d.bulan, "LAY. ADM PEM": d.layAdmPem, "LAY. PUBLIK": d.layPublik }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" {...xAxis} />
              <YAxis {...yAxis} />
              <Tooltip contentStyle={tip} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="LAY. ADM PEM" fill={C.primary} radius={[4,4,0,0]} />
              <Bar dataKey="LAY. PUBLIK" fill={C.orange} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── CHART 2: TARGET vs CAPAIAN ── */}
        <div style={S.card}>
          <div style={S.chartTitle}>
            REKAP EKOSISTEM LAYANAN<br />
            HASIL INTEGRASI APLIKASI DAN INTEROPERABILITAS DATA MELALUI SPLP<br />
            TAHUN {currentYear}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ekosistem.map((d) => ({ bulan: d.bulan, TARGET: d.target, CAPAIAN: d.capaian }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" {...xAxis} />
              <YAxis {...yAxis} />
              <Tooltip contentStyle={tip} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="TARGET" fill={C.primary} radius={[4,4,0,0]} />
              <Bar dataKey="CAPAIAN" fill={C.orange} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── CHART 3: PROSENTASE ── */}
        <div style={S.card}>
          <div style={S.chartTitle}>
            PROSENTASE CAPAIAN KETERPADUAN LAYANAN<br />
            DENGAN INTEGRASI APLIKASI DAN INTEROPERABILITAS DATA MELALUI SPLP<br />
            TAHUN {currentYear}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ekosistem.map((d) => ({ bulan: d.bulan, "TARGET %": d.targetPct, "CAPAIAN %": d.capaianPct }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" {...xAxis} />
              <YAxis {...yAxis} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tip} formatter={(v: any) => `${v*10}%`} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="TARGET %" fill={C.primary} radius={[4,4,0,0]} />
              <Bar dataKey="CAPAIAN %" fill={C.orange} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── TABEL REKAP LENGKAP ── */}
        <div style={S.card}>
          <div style={S.badge}>JUMLAH EKOSISTEM LAYANAN</div>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thL}></th>
                  {ekosistem.map((d, i) => <th key={i} style={S.th}>{d.bulan}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "LAY. ADM PEM", key: "layAdmPem" },
                  { label: "LAY PUBLIK", key: "layPublik" },
                ].map((row) => (
                  <tr key={row.key}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    {ekosistem.map((d, i) => <td key={i} style={S.td}>{(d as any)[row.key]}</td>)}
                  </tr>
                ))}
                <tr>
                  <td colSpan={ekosistem.length + 1} style={{ ...S.td, backgroundColor: "#f0fdf4", fontWeight: "700", fontSize: "10px", color: "#166534", textAlign: "center" }}>
                    TARGET DAN CAPAIAN KETERPADUAN LAYANAN MELALUI SPLP
                  </td>
                </tr>
                {[
                  { label: "TARGET", key: "target" },
                  { label: "CAPAIAN", key: "capaian" },
                ].map((row) => (
                  <tr key={row.key}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    {ekosistem.map((d, i) => <td key={i} style={S.td}>{(d as any)[row.key]}</td>)}
                  </tr>
                ))}
                <tr>
                  <td colSpan={ekosistem.length + 1} style={{ ...S.td, backgroundColor: "#f0fdf4", fontWeight: "700", fontSize: "10px", color: "#166534", textAlign: "center" }}>
                    TARGET DAN CAPAIAN KETERPADUAN LAYANAN MELALUI SPLP (%)
                  </td>
                </tr>
                {[
                  { label: "TARGET", key: "targetPct", pct: true },
                  { label: "CAPAIAN", key: "capaianPct", pct: true },
                ].map((row) => (
                  <tr key={row.key}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    {ekosistem.map((d, i) => <td key={i} style={S.td}>{(d as any)[row.key]*10}%</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Form Data Bulan Ini</span>
            <span style={{ background: "#dcfce7", color: "#166534", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "999px" }}>✓ Sudah Diisi</span>
            <button onClick={() => router.push("/integrasiinteroperabilitas/edit")} style={{ background: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "999px", border: "none", cursor: "pointer" }}>Edit</button>
          </div>
        </div>

        {/* ── CHART 4 + TABEL: REKAP APLIKASI TERINTEGRASI ── */}
        <div style={S.card}>
          <div style={S.chartTitle}>
            REKAP JUMLAH APLIKASI TERINTEGRASI PEMPROV JABAR,<br />
            KABUPATEN/KOTA DAN KEMENTERIAN/LEMBAGA<br />
            SD. TAHUN {currentYear}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={aplikasi.map((d) => ({ bulan: d.bulan, TOTAL: d.total, "KAB/KOTA": d.kabKota, KEMENTERIAN: d.kementerian, "PEMPROV JABAR": d.pemprovJabar }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" {...xAxis} />
              <YAxis {...yAxis} />
              <Tooltip contentStyle={tip} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="TOTAL" fill={C.primary} radius={[4,4,0,0]} />
              <Bar dataKey="KAB/KOTA" fill={C.orange} radius={[4,4,0,0]} />
              <Bar dataKey="KEMENTERIAN" fill={C.amber} radius={[4,4,0,0]} />
              <Bar dataKey="PEMPROV JABAR" fill={C.cyan} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ ...S.badge, marginTop: "16px" }}>REKAP JUMLAH APLIKASI TERINTEGRASI</div>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thL}></th>
                  {aplikasi.map((d, i) => <th key={i} style={S.th}>{d.bulan}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "TOTAL", key: "total" },
                  { label: "KABUPATEN/KOTA", key: "kabKota" },
                  { label: "KEMENTERIAN/LEMBAGA", key: "kementerian" },
                  { label: "PEMPROV JABAR", key: "pemprovJabar" },
                ].map((row) => (
                  <tr key={row.key}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    {aplikasi.map((d, i) => <td key={i} style={S.td}>{(d as any)[row.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── TOMBOL AKSI ── */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          <button onClick={handleUnduh} style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>↓ Unduh Data</button>
          <button onClick={() => router.push("/integrasiinteroperabilitas/edit")} style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✎ Edit</button>
          <button onClick={() => router.push("/integrasiinteroperabilitas/input")} style={{ background: "linear-gradient(135deg, #0f2540, #1d4ed8)", color: "white", border: "none", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ Isi Form Rekapitulasi</button>
        </div>

        {/* ── RIWAYAT DATA ── */}
        <div style={S.card}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>Riwayat Data {TEAM_LABEL}</div>
          {historyYears.map((year) => (
            <div key={year} style={{ marginBottom: "10px" }}>
              <button onClick={() => toggle(year)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: expandedYears[year] ? "#eff6ff" : "#f8fafc", border: "1px solid", borderColor: expandedYears[year] ? "#bfdbfe" : "#e2e8f0", borderRadius: expandedYears[year] ? "10px 10px 0 0" : "10px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", fontWeight: "600", color: expandedYears[year] ? "#1d4ed8" : "#334155" }}>
                <span>{year}</span>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{expandedYears[year] ? "▲ Tutup" : "▼ Pilih bulan"}</span>
              </button>
              {expandedYears[year] && (
                <div style={{ border: "1px solid #bfdbfe", borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                  {MONTHS.map((m, i) => (
                    <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: i < 11 ? "1px solid #f1f5f9" : "none", background: "white" }}>
                      <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>{m} {year}</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => handleUnduhBulanan(year, i + 1)} style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Unduh</button>
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