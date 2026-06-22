"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import {
  exportAppmanReport,
  getInventoryStats,
  getTeamSupportFacilities,
  getIntegrationMappings,
  getDevelopmentTargets,
  getAppVulnerabilities,
  getKatalapsRegencies,
  getEmailManagementStats,
  getDriveJabarStats
} from "@/services/api";

const MONTHS = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AGS","SEP","OKT","NOV","DES"];
const TEAM_LABEL = "Pengelolaan Aplikasi";
const TEAM_ROUTE = "pengelolaanaplikasi";

// ── State Hooks ─────────────────────────────────────────────

export default function DashboardPengelolaan() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
  const historyYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const toggle = (y: number) => setExpandedYears((p) => ({ ...p, [y]: !p[y] }));

  const [pendataan, setPendataan] = useState<any[]>([]);
  const [totDetail, setTotDetail] = useState<any[]>([]);
  const [totChart, setTotChart] = useState<any[]>([]);
  const [fasilitasi, setFasilitasi] = useState<any[]>([
    { label: "JUMLAH PD", values: Array(12).fill("") },
    { label: "JUMLAH APLIKASI", values: Array(12).fill("") },
    { label: "TOTAL", values: Array(12).fill("") },
  ]);
  const [integrasi, setIntegrasi] = useState<any[]>([]);
  const [layananLuar, setLayananLuar] = useState<any[]>([]);
  const [layananBelum, setLayananBelum] = useState<any[]>([]);
  const [blmDigital, setBlmDigital] = useState<any[]>([
    { label: "LUAR DC JABAR", values: Array(12).fill("") },
    { label: "LAYANAN MANUAL", values: Array(12).fill("") },
  ]);
  const [kerentananSummary, setKerentananSummary] = useState<any[]>([]);
  const [kerentananPD, setKerentananPD] = useState<any[]>([]);
  const [katalaps, setKatalaps] = useState<any[]>([]);
  const [email, setEmail] = useState<any[]>([]);
  const [drive, setDrive] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          inventoryRes,
          facilitiesRes,
          integrationRes,
          devTargetsRes,
          vulnerabilitiesRes,
          regenciesRes,
          emailRes,
          driveRes
        ] = await Promise.all([
          getInventoryStats(currentYear),
          getTeamSupportFacilities(currentYear),
          getIntegrationMappings(currentYear),
          getDevelopmentTargets(currentYear),
          getAppVulnerabilities(currentYear),
          getKatalapsRegencies(currentYear),
          getEmailManagementStats(currentYear),
          getDriveJabarStats(currentYear)
        ]);

        const formatMonthlyData = (apiData: any[], valueKeysMap: Record<string, string>) => {
          return MONTHS.map((m, i) => {
            const found = apiData?.find((x: any) => Number(x.month) === i + 1);
            const result: any = { bulan: m };
            Object.entries(valueKeysMap).forEach(([frontendKey, backendKey]) => {
              result[frontendKey] = found ? Number(found[backendKey]) : 0;
            });
            return result;
          });
        };

        // 1. Inventory stats (Pendataan Aplikasi)
        setPendataan(formatMonthlyData(inventoryRes?.data || [], {
          jumlah: "total_apps",
          profil: "profile",
          repository: "repository",
          pse: "registered_pse"
        }));

        // 2. Team support facilities (TOT)
        const facilitiesData = facilitiesRes?.data || [];
        const formattedFasilitasi = [
          { label: "JUMLAH PD", values: Array(12).fill("") },
          { label: "JUMLAH APLIKASI", values: Array(12).fill("") },
          { label: "TOTAL", values: Array(12).fill("") },
        ];
        facilitiesData.forEach((item: any) => {
          const monthIdx = Number(item.month) - 1;
          if (monthIdx >= 0 && monthIdx < 12) {
            formattedFasilitasi[0].values[monthIdx] = item.total_pd;
            formattedFasilitasi[1].values[monthIdx] = item.total_apps;
            formattedFasilitasi[2].values[monthIdx] = item.total;
          }
        });
        setFasilitasi(formattedFasilitasi);

        // 3. Integration mappings
        setIntegrasi(formatMonthlyData(integrationRes?.data || [], {
          jumlah: "total_apps",
          peluang: "integration_opportunity",
          sudah: "integrated",
          belum: "not_integrated"
        }));

        // 4. Development targets (Aplikasi/layanan target pengembangan)
        const devTargetsData = devTargetsRes?.data || [];
        const formattedBlmDigital = [
          { label: "LUAR DC JABAR", values: Array(12).fill("") },
          { label: "LAYANAN MANUAL", values: Array(12).fill("") },
        ];
        devTargetsData.forEach((item: any) => {
          const monthIdx = Number(item.month) - 1;
          if (monthIdx >= 0 && monthIdx < 12) {
            formattedBlmDigital[0].values[monthIdx] = item.outside_dc_jabar;
            formattedBlmDigital[1].values[monthIdx] = item.manual_service;
          }
        });
        setBlmDigital(formattedBlmDigital);

        // 5. App vulnerabilities (Kerentanan)
        setKerentananSummary(formatMonthlyData(vulnerabilitiesRes?.data || [], {
          jumlah: "total_apps"
        }));

        // 6. Katalaps regencies
        const regenciesData = regenciesRes?.data || [];
        const regencyMap: Record<string, Record<number, number>> = {};
        regenciesData.forEach((item: any) => {
          const regencyName = item.regency?.name || `OPD ${item.regency_id}`;
          if (!regencyMap[regencyName]) {
            regencyMap[regencyName] = {};
          }
          regencyMap[regencyName][Number(item.month)] = Number(item.app_count);
        });
        const sortedRegencies = Object.keys(regencyMap).sort();
        const formattedKatalaps = sortedRegencies.map((name, index) => {
          const row: any = {
            no: index + 1,
            kabkota: name,
          };
          for (let m = 1; m <= 12; m++) {
            row[m] = regencyMap[name][m] !== undefined ? regencyMap[name][m] : "";
          }
          return row;
        });
        setKatalaps(formattedKatalaps);

        // 7. Email stats
        setEmail(formatMonthlyData(emailRes?.data || [], {
          userAsn: "user_asn",
          userLain: "user_others",
          userAktif: "active_user"
        }));

        // 8. Drive stats
        setDrive(formatMonthlyData(driveRes?.data || [], {
          user: "total_users"
        }));

      } catch (err) {
        console.error("Gagal memuat data pengelolaan aplikasi:", err);
      }
    };

    fetchData();
  }, [currentYear]);

  const handleUnduh = async () => {
    try {
      const blob = await exportAppmanReport(currentYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `APTIKA_Tools_${TEAM_LABEL}_${currentYear}.xlsx`;
      a.click();
    } catch {
      alert("Gagal mengunduh. Pastikan BE aktif.");
    }
  };

  const handleUnduhBulanan = async (year: number, month: number) => {
    try {
      const blob = await exportAppmanReport(year, month);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `APTIKA_Tools_${TEAM_LABEL}_${year}_${MONTHS[month - 1]}.xlsx`;
      a.click();
    } catch {
      alert("Gagal mengunduh data bulanan. Pastikan BE aktif.");
    }
  };

  const S = {
    page: { fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px" } as React.CSSProperties,
    card: { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
    badge: (color = "#fbbf24") => ({ display: "block", backgroundColor: color, color: color === "#fbbf24" ? "#78350f" : "white", fontSize: "11px", fontWeight: "700", padding: "10px 14px", borderRadius: "6px", letterSpacing: "0.5px", marginBottom: "14px", textAlign: "center" as const }) as React.CSSProperties,
    chartTitle: { fontSize: "12px", fontWeight: "700", color: "#0f172a", textAlign: "center" as const, textTransform: "uppercase" as const, lineHeight: 1.6, marginBottom: "14px" } as React.CSSProperties,
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "11px" } as React.CSSProperties,
    th: { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 8px", fontWeight: "700", color: "#475569", textAlign: "center" as const, fontSize: "10px" } as React.CSSProperties,
    thL: { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 8px", fontWeight: "700", color: "#475569", textAlign: "left" as const, fontSize: "10px" } as React.CSSProperties,
    thG: (color: string) => ({ backgroundColor: color, border: "1px solid #e2e8f0", padding: "6px 8px", fontWeight: "700", color: "white", textAlign: "center" as const, fontSize: "10px", letterSpacing: "0.3px" }) as React.CSSProperties,
    td: { border: "1px solid #e2e8f0", padding: "6px 8px", textAlign: "center" as const, color: "#334155", fontSize: "11px" } as React.CSSProperties,
    tdL: { border: "1px solid #e2e8f0", padding: "6px 8px", color: "#334155", fontSize: "11px" } as React.CSSProperties,
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" } as React.CSSProperties,
  };

  const xAxis = { tick: { fontSize: 10, fill: "#64748b" }, axisLine: false as const, tickLine: false as const };
  const yAxis = { tick: { fontSize: 10, fill: "#64748b" }, axisLine: false as const, tickLine: false as const };
  const tip = { fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" };


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

        {/* ── SECTION 1: DATA BULAN LALU ── */}
        <div style={S.card}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "14px" }}>Data Bulan Lalu</div>
          <div style={S.chartTitle}>REKAPITULASI PENDATAAN APLIKASI PEMPROV JABAR<br />TAHUN {currentYear}</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pendataan} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" {...xAxis} />
              <YAxis {...yAxis} />
              <Tooltip contentStyle={tip} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="jumlah" name="JUMLAH APLIKASI" fill="#1d4ed8" radius={[3,3,0,0]} />
              <Bar dataKey="profil" name="PROFIL" fill="#f97316" radius={[3,3,0,0]} />
              <Bar dataKey="repository" name="REPOSITORY" fill="#94a3b8" radius={[3,3,0,0]} />
              <Bar dataKey="pse" name="TERDAFTAR PSE" fill="#f59e0b" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ ...S.badge(), marginTop: "16px" }}>PENDATAAN APLIKASI {currentYear} (BERDASARKAN KATALAPS)</div>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thL}></th>
                  {pendataan.map((d, i) => <th key={i} style={S.th}>{d.bulan}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "JUMLAH APLIKASI", key: "jumlah" },
                  { label: "PROFIL", key: "profil" },
                  { label: "REPOSITORY", key: "repository" },
                  { label: "TERDAFTAR PSE", key: "pse" },
                ].map((row) => (
                  <tr key={row.key}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    {pendataan.map((d, i) => <td key={i} style={S.td}>{(d as any)[row.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FASILITASI DUKUNGAN TIM PADA PENGEMBANGAN APLIKASI PERANGKAT DAERAH (TOT) ── */}
        <div style={S.card}>
          <div style={{ ...S.badge() }}>FASILITASI DUKUNGAN TIM PADA PENGEMBANGAN APLIKASI PERANGKAT DAERAH (TOT) ({currentYear})</div>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thL}></th>
                  {["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGS", "SEP", "OKT", "NOV", "DES"].map((m) => (
                    <th key={m} style={S.th}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fasilitasi.map((row) => (
                  <tr key={row.label}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    {row.values.map((val: any, idx: number) => (
                      <td key={idx} style={S.td}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>



        {/* ── SECTION 2: TOT PENGEMBANGAN APLIKASI ── */}
        {/* <div style={S.card}>
          <div style={{ ...S.badge("#16a34a") }}>TOT PENGEMBANGAN APLIKASI</div>
          <div style={{ overflowX: "auto", marginBottom: "20px" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thG("#16a34a")}>Bulan</th>
                  <th style={S.thG("#16a34a")}>Perangkat Daerah</th>
                  <th style={S.thG("#16a34a")}>Nama Aplikasi dan uraian</th>
                </tr>
              </thead>
              <tbody>
                {totDetail.map((row, i) => (
                  <tr key={i}>
                    <td style={S.td}>{row.bulan}</td>
                    <td style={S.tdL}>{row.pd}</td>
                    <td style={S.tdL}>{row.aplikasi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={S.grid2}>
            <div>
              <div style={S.chartTitle}>TOT PENGEMBANGAN APLIKASI<br />TAHUN {currentYear}</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={totChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" {...xAxis} />
                  <YAxis {...yAxis} />
                  <Tooltip contentStyle={tip} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="jumlahPD" name="JUMLAH PD" fill="#1d4ed8" radius={[3,3,0,0]} />
                  <Bar dataKey="jumlahAplikasi" name="JUMLAH APLIKASI" fill="#f97316" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div style={S.chartTitle}>JUMLAH APLIKASI HASIL PENGEMBANGAN TOT<br />TAHUN {currentYear}</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={totChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" {...xAxis} />
                  <YAxis {...yAxis} />
                  <Tooltip contentStyle={tip} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="jumlahAplikasi" name="JUMLAH APLIKASI" fill="#1d4ed8" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...S.badge("#16a34a"), marginTop: "16px" }}>FASILITASI DUKUNGAN TIM PADA PENGEMBANGAN APLIKASI PERANGKAT DAERAH (TOT)</div>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thL}></th>
                  {["JAN","FEB","MAR"].map((m) => <th key={m} style={S.th}>{m}</th>)}
                  {MONTHS.slice(3).map((m) => <th key={m} style={S.th}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {fasilitasi.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    <td style={S.td}>{row.jan}</td>
                    <td style={S.td}>{row.feb}</td>
                    <td style={S.td}>{row.mar}</td>
                    {MONTHS.slice(3).map((m) => <td key={m} style={S.td}></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}

        {/* ── SECTION 3: PEMETAAN INTEGRASI APLIKASI ── */}
        <div style={S.card}>
          <div style={S.chartTitle}>PEMETAAN INTEGRASI APLIKASI</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={integrasi} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" {...xAxis} />
              <YAxis {...yAxis} />
              <Tooltip contentStyle={tip} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="jumlah" name="JUMLAH APLIKASI" fill="#1d4ed8" radius={[3,3,0,0]} />
              <Bar dataKey="peluang" name="PELUANG INTEGRASI" fill="#f97316" radius={[3,3,0,0]} />
              <Bar dataKey="sudah" name="SUDAH INTEGRASI" fill="#94a3b8" radius={[3,3,0,0]} />
              <Bar dataKey="belum" name="BELUM INTEGRASI" fill="#f59e0b" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ overflowX: "auto", marginTop: "16px" }}>
            <div style={S.badge()}>PEMETAAN INTEGRASI APLIKASI</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thL}></th>
                  {integrasi.map((d, i) => <th key={i} style={S.th}>{d.bulan}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "JUMLAH APLIKASI", key: "jumlah" },
                  { label: "PELUANG INTEGRASI", key: "peluang" },
                  { label: "SUDAH INTEGRASI", key: "sudah" },
                  { label: "BELUM INTEGRASI", key: "belum" },
                ].map((row) => (
                  <tr key={row.key}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    {integrasi.map((d, i) => <td key={i} style={S.td}>{(d as any)[row.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── APLIKASI/LAYANAN YANG MENJADI TARGET PENGEMBANGAN ── */}
        <div style={S.card}>
          <div style={{ ...S.badge() }}>APLIKASI/LAYANAN YANG MENJADI TARGET PENGEMBANGAN ({currentYear})</div>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thL}></th>
                  {["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGS", "SEP", "OKT", "NOV", "DES"].map((m) => (
                    <th key={m} style={S.th}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blmDigital.map((row) => (
                  <tr key={row.label}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    {row.values.map((val: any, idx: number) => (
                      <td key={idx} style={S.td}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 4: LAYANAN DI LUAR PEMPROV & BELUM TERDIGITALISASI ── */}
        {/* <div style={S.card}>
          <div style={S.grid2}>
            <div>
              <div style={S.badge("#16a34a")}>LAYANAN DI LUAR PEMPROV</div>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.thG("#16a34a")}>PD PENGAMPU</th>
                    <th style={S.thG("#16a34a")}>NAMA LAYANAN/APLIKASI</th>
                  </tr>
                </thead>
                <tbody>
                  {layananLuar.map((row, i) => (
                    <tr key={i}>
                      <td style={S.tdL}>{row.pd}</td>
                      <td style={S.tdL}>{row.layanan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div style={S.badge("#f59e0b")}>LAYANAN BELUM TERDIGITALISASI</div>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.thG("#f59e0b")}>PD PENGAMPU</th>
                    <th style={S.thG("#f59e0b")}>NAMA LAYANAN/APLIKASI</th>
                  </tr>
                </thead>
                <tbody>
                  {layananBelum.map((row, i) => (
                    <tr key={i}>
                      <td style={S.tdL}>{row.pd}</td>
                      <td style={S.tdL}>{row.layanan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div> */}

        {/* ── SECTION 5: LAYANAN BLM TERDIGITALISASI ── */}
        {/* <div style={S.card}>
          <div style={S.chartTitle}>JUMLAH LAYANNAN BLM TERDIGITALISASI<br />TAHUN {currentYear}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={blmDigital} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" {...xAxis} />
              <YAxis {...yAxis} />
              <Tooltip contentStyle={tip} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="luarDC" name="LUAR DC JABAR" fill="#1d4ed8" radius={[3,3,0,0]} />
              <Bar dataKey="manual" name="LAYANAN MANUAL" fill="#f97316" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ overflowX: "auto", marginTop: "16px" }}>
            <div style={S.badge()}>APLIKASI/LAYANAN YANG MENJADI TARGET PENGEMBANGAN</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thL}></th>
                  {blmDigital.map((d, i) => <th key={i} style={S.th}>{d.bulan}</th>)}
                  {MONTHS.slice(3).map((m) => <th key={m} style={S.th}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "LUAR DC JABAR", key: "luarDC" },
                  { label: "LAYANAN MANUAL", key: "manual" },
                ].map((row) => (
                  <tr key={row.key}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    {blmDigital.map((d, i) => <td key={i} style={S.td}>{(d as any)[row.key]}</td>)}
                    {MONTHS.slice(3).map((m) => <td key={m} style={S.td}></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}

        {/* ── SECTION 6: KERENTANAN APLIKASI ── */}
        <div style={S.card}>
          <div style={S.chartTitle}>REKAP KERENTANAN PADA APLIKASI PEMPROV JABAR<br />TAHUN {currentYear}</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={kerentananSummary} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" {...xAxis} />
              <YAxis {...yAxis} />
              <Tooltip contentStyle={tip} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="jumlah" name="JUMLAH APLIKASI" fill="#1d4ed8" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* <div style={{ marginTop: "20px" }}>
          <div style={S.badge()}>REKAP KERENTANAN APLIKASI PER PERANGKAT DAERAH</div>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.thL}>PERANGKAT DAERAH</th>
                    {["JAN","FEB","MAR"].map((m) => <th key={m} style={S.th}>{m}</th>)}
                    {MONTHS.slice(3).map((m) => <th key={m} style={S.th}>{m}</th>)}
                    <th style={S.th}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {kerentananPD.map((row, i) => (
                    <tr key={i}>
                      <td style={S.tdL}>{row.pd}</td>
                      <td style={S.td}>{row.jan || ""}</td>
                      <td style={S.td}>{row.feb || ""}</td>
                      <td style={S.td}>{row.mar || ""}</td>
                      {MONTHS.slice(3).map((m) => <td key={m} style={S.td}></td>)}
                      <td style={{ ...S.td, fontWeight: "600" }}>{row.jan + row.feb + row.mar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div> */}

          <div style={{ overflowX: "auto", marginTop: "16px" }}>
            <div style={S.badge()}>KERENTANAN PADA APLIKASI PEMPROV JABAR</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thL}></th>
                  {kerentananSummary.map((d, i) => <th key={i} style={S.th}>{d.bulan}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...S.tdL, fontWeight: "600" }}>JUMLAH APLIKASI</td>
                  {kerentananSummary.map((d, i) => <td key={i} style={S.td}>{d.jumlah}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 7: KATALAPS KAB/KOTA ── */}
        <div style={S.card}>
          <div style={S.chartTitle}>REKAPITULASI PENDATAAN<br />APLIKASI KABUPATEN/KOTA MELALUI KATALAPS<br />TAHUN {currentYear}</div>
          <div style={{ overflowX: "auto" }}>
            <div style={S.badge()}>KATALAPS KABUPATEN KOTA</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>No</th>
                  <th style={S.thL}>KABUPATEN/KOTA</th>
                  {["JAN","FEB","MAR"].map((m) => <th key={m} style={S.th}>{m}</th>)}
                  {MONTHS.slice(3).map((m) => <th key={m} style={S.th}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {katalaps.map((row) => (
                  <tr key={row.no}>
                    <td style={S.td}>{row.no}</td>
                    <td style={S.tdL}>{row.kabkota}</td>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <td key={i} style={S.td}>{row[i + 1]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 8: EMAIL & DRIVE JABAR ── */}
        <div style={S.card}>
          <div style={S.chartTitle}>LAYANAN PENGELOLAAN EMAIL jabarprov.go.id<br />TAHUN {currentYear}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={email} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" {...xAxis} />
              <YAxis {...yAxis} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip contentStyle={tip} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="userAsn" name="JUMLAH USER (ASN)" fill="#1d4ed8" radius={[3,3,0,0]} />
              <Bar dataKey="userLain" name="JUMLAH USER (LAINNYA)" fill="#f97316" radius={[3,3,0,0]} />
              <Bar dataKey="userAktif" name="JUMLAH USER AKTIF" fill="#94a3b8" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ overflowX: "auto", marginTop: "12px" }}>
            <div style={S.badge()}>LAYANAN PENGELOLAAN EMAIL</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.thL}></th>
                  {email.map((d, i) => <th key={i} style={S.th}>{d.bulan}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "JUMLAH USER ASN", key: "userAsn" },
                  { label: "JUMLAH USER (LAINNYA)", key: "userLain" },
                  { label: "JUMLAH USER AKTIF", key: "userAktif" },
                ].map((row) => (
                  <tr key={row.key}>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>{row.label}</td>
                    {email.map((d, i) => <td key={i} style={S.td}>{(d as any)[row.key].toLocaleString()}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "24px" }}>
            <div style={S.chartTitle}>LAYANAN DRIVE JABAR<br />TAHUN {currentYear}</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={drive} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bulan" {...xAxis} />
                <YAxis {...yAxis} />
                <Tooltip contentStyle={tip} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="user" name="JUMLAH USER" fill="#16a34a" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ overflowX: "auto", marginTop: "12px" }}>
              <div style={S.badge()}>LAYANAN DRIVE JABAR</div>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.thL}></th>
                    {drive.map((d, i) => <th key={i} style={S.th}>{d.bulan}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ ...S.tdL, fontWeight: "600" }}>JUMLAH USER</td>
                    {drive.map((d, i) => <td key={i} style={S.td}>{d.user.toLocaleString()}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Data Bulan Ini */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Form Data Bulan Ini</span>
            <button onClick={handleUnduh} style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "4px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Unduh Data</button>
            <button onClick={() => router.push("/pengelolaanaplikasi/edit")} style={{ background: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: "700", padding: "4px 14px", borderRadius: "6px", border: "1px solid #fcd34d", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit</button>
          </div>
        </div>

        {/* ── TOMBOL AKSI ── */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          <button onClick={handleUnduh} style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>↓ Unduh Data</button>
          <button onClick={() => router.push("/pengelolaanaplikasi/edit")} style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✎ Edit</button>
          <button onClick={() => router.push("/pengelolaanaplikasi/input")} style={{ background: "linear-gradient(135deg, #0f2540, #1d4ed8)", color: "white", border: "none", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ Isi Form Rekapitulasi</button>
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