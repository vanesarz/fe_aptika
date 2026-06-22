"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getSmartjabarStats,
  getSmartjabarJoinedApps,
  createSmartjabarStat,
  updateSmartjabarStat,
  createSmartjabarJoinedApp,
  updateSmartjabarJoinedApp,
  getOpdIdByName,
  getOpdNameById,
  getFrontendOpdName
} from "@/services/api";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

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

import { Suspense } from "react";

const S = {
  page:      { fontFamily: "'Plus Jakarta Sans',sans-serif", padding: "28px" } as React.CSSProperties,
  card:      { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
  cardTitle: { fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" } as React.CSSProperties,
  dot:       { width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#0891b2)", flexShrink: 0 } as React.CSSProperties,
  divider:   { height: "1px", background: "#f1f5f9", margin: "0 0 18px" } as React.CSSProperties,
  fg:        { marginBottom: "12px", minWidth: 0 } as React.CSSProperties,
  label:     { display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase" as const, marginBottom: "6px", overflowWrap: "break-word" as const, wordBreak: "break-word" as const } as React.CSSProperties,
  iw:        { border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "0 14px", height: "44px", display: "flex", alignItems: "center", background: "#f8fafc" } as React.CSSProperties,
  inp:       { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans',sans-serif", width: "100%" } as React.CSSProperties,
  sel:       { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", height: "44px", background: "#f8fafc", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", cursor: "pointer", appearance: "none" as const } as React.CSSProperties,
  grid2:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" } as React.CSSProperties,
  bulkCard:  { background: "#eff6ff", border: "1px dashed #bfdbfe", padding: "16px", borderRadius: "10px", marginBottom: "20px" } as React.CSSProperties,
  btnBulk:   { background: "#1d4ed8", color: "white", border: "none", borderRadius: "8px", padding: "0 18px", height: "44px", fontSize: "12.5px", fontWeight: "700", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" } as React.CSSProperties,
};

const NumField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div style={S.fg}>
    <label style={S.label}>{label}</label>
    <div style={S.iw} className="apt-iw">
      <input type="text" inputMode="numeric" placeholder={placeholder ?? "0"} value={value} onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))} style={S.inp} />
    </div>
  </div>
);

function SmartEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editYear  = searchParams.get("year")  || new Date().getFullYear().toString();
  const editMonth = searchParams.get("month") || "";

  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [beOffline, setBeOffline] = useState(false);

  // Unified Period State
  const [selectedYear, setSelectedYear] = useState<number>(Number(editYear));
  const [selectedMonth, setSelectedMonth] = useState<string>(editMonth);

  // Bulk Fill inputs
  const [bulkAsn, setBulkAsn] = useState("");
  const [bulkAktif, setBulkAktif] = useState("");

  // Form 1
  const [pdJumlah,    setPdJumlah]    = useState<Record<string,string>>(Object.fromEntries(PD_LIST.map(k => [k, ""])));
  const [pdAktif,     setPdAktif]     = useState<Record<string,string>>(Object.fromEntries(PD_LIST.map(k => [k, ""])));
  const [statIds,     setStatIds]     = useState<Record<string, number>>({});

  // Form 2
  const [jumlahAplikasi, setJumlahAplikasi] = useState("");
  const [appRecordId,    setAppRecordId]    = useState<number | null>(null);

  // Apply default values to all OPDs in state
  const handleBulkFill = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!bulkAsn && !bulkAktif) return;
    
    const newJumlah = { ...pdJumlah };
    const newAktif = { ...pdAktif };
    
    PD_LIST.forEach(pd => {
      if (bulkAsn) newJumlah[pd] = bulkAsn;
      if (bulkAktif) newAktif[pd] = bulkAktif;
    });
    
    setPdJumlah(newJumlah);
    setPdAktif(newAktif);
  };

  useEffect(() => {
    const tryLoad = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          getSmartjabarStats(Number(selectedYear)),
          getSmartjabarJoinedApps(Number(selectedYear))
        ]);

        const curStats = statsRes?.data || [];
        const curApps = appsRes?.data || [];

        // Filter for specific selected month
        const filteredStats = curStats.filter((s: any) => Number(s.month) === Number(selectedMonth));
        const filteredApps = curApps.filter((a: any) => Number(a.month) === Number(selectedMonth));

        const updatedPdJumlah: Record<string, string> = Object.fromEntries(PD_LIST.map(k => [k, ""]));
        const updatedPdAktif: Record<string, string> = Object.fromEntries(PD_LIST.map(k => [k, ""]));
        const updatedStatIds: Record<string, number> = {};

        filteredStats.forEach((stat: any) => {
          const rawPdName = getOpdNameById(stat.opd_id);
          const pdName = getFrontendOpdName(rawPdName, PD_LIST);
          updatedPdJumlah[pdName] = String(stat.total_asn || 0);
          updatedPdAktif[pdName] = String(stat.active_users || 0);
          updatedStatIds[pdName] = stat.id;
        });

        setPdJumlah(updatedPdJumlah);
        setPdAktif(updatedPdAktif);
        setStatIds(updatedStatIds);

        if (filteredApps.length > 0) {
          const appEntry = filteredApps[0];
          setJumlahAplikasi(String(appEntry.total_apps || 0));
          setAppRecordId(appEntry.id);
        } else {
          setJumlahAplikasi("");
          setAppRecordId(null);
        }
      } catch (err) {
        console.error(err);
        setBeOffline(true);
      }
    };
    tryLoad();
  }, [selectedYear, selectedMonth]);

  const handleSubmit = async () => {
    if (!selectedMonth) {
      alert("Silakan pilih bulan terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const promises: Promise<any>[] = [];
      const y = Number(selectedYear);
      const m = Number(selectedMonth);

      // 1. Submit stats updates (Form 1) for ALL 38 OPDs
      PD_LIST.forEach(pd => {
        const total_asn = Number(pdJumlah[pd] || 0);
        const active_users = Number(pdAktif[pd] || 0);
        const payload = {
          opd_id: getOpdIdByName(pd),
          month: m,
          year: y,
          total_asn,
          active_users
        };

        const existingId = statIds[pd];
        if (existingId) {
          promises.push(updateSmartjabarStat(existingId, payload));
        } else {
          promises.push(createSmartjabarStat(payload));
        }
      });

      // 2. Submit joined apps updates (Form 2)
      if (jumlahAplikasi !== "") {
        const payload = {
          year: y,
          month: m,
          total_apps: Number(jumlahAplikasi)
        };

        if (appRecordId) {
          promises.push(updateSmartjabarJoinedApp(appRecordId, payload));
        } else {
          promises.push(createSmartjabarJoinedApp(payload));
        }
      }

      await Promise.all(promises);
      setSuccess(true);
      setTimeout(() => router.push("/smartjabar/dashboard"), 1500);
    } catch (err: any) {
      console.error(err);
      const serverMessage = err.response?.data?.errors?.month?.[0] || err.response?.data?.message || "Gagal memperbarui data. Pastikan semua field valid.";
      alert(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const monthLabel = selectedMonth
    ? `${MONTHS[Number(selectedMonth) - 1] ?? ""} ${selectedYear}`
    : "SMART Jabar";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .apt-iw:focus-within { border-color: #1d4ed8 !important; background: white !important; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        .apt-sel:focus { border-color: #1d4ed8 !important; background: white !important; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={S.page}>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.4px" }}>Edit Data · {monthLabel}</div>
        <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", marginBottom: "24px" }}>SMART Jabar — Perbarui data rekapitulasi</div>

        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#166534", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            ✓ Data berhasil disimpan! Mengalihkan ke dashboard...
          </div>
        )}

        {/* ── 0: PERIODE DATA ── */}
        <div style={S.card}>
          <div style={S.cardTitle}><span style={S.dot} />Pilih Periode Laporan</div>
          <div style={S.divider} />
          <div style={S.grid2}>
            <div style={S.fg}>
              <label style={S.label}>Tahun <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={S.sel} className="apt-sel">
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
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={S.sel} className="apt-sel">
                  <option value="">Pilih Bulan</option>
                  {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
                </select>
                <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FORM 1: Edit Aplikasi Tergabung ── */}
        <div style={S.card}>
          <div style={S.cardTitle}><span style={S.dot} />Form Aplikasi Tergabung SMART Jabar</div>
          <div style={S.divider} />
          <NumField label="Jumlah" value={jumlahAplikasi} onChange={setJumlahAplikasi} />
        </div>

        {/* ── FORM 2: Edit Presentase per PD ── */}
        <div style={S.card}>
          <div style={S.cardTitle}><span style={S.dot} />Edit Pengguna SMART Jabar Pada PD</div>
          <div style={S.divider} />

          {/* BULK FILL / ISI MASAL UTILITY */}
          <div style={S.bulkCard}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#1e40af", marginBottom: "8px" }}>⚡ Isi Cepat / Bulk Fill (Semua OPD)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "flex-end" }}>
              <div style={S.fg}>
                <label style={{ ...S.label, color: "#1e40af" }}>Default Jumlah ASN</label>
                <div style={S.iw} className="apt-iw">
                  <input type="text" inputMode="numeric" placeholder="500" value={bulkAsn} onChange={e => setBulkAsn(e.target.value.replace(/[^0-9]/g, ''))} style={S.inp} />
                </div>
              </div>
              <div style={S.fg}>
                <label style={{ ...S.label, color: "#1e40af" }}>Default User Aktif</label>
                <div style={S.iw} className="apt-iw">
                  <input type="text" inputMode="numeric" placeholder="250" value={bulkAktif} onChange={e => setBulkAktif(e.target.value.replace(/[^0-9]/g, ''))} style={S.inp} />
                </div>
              </div>
              <button type="button" onClick={handleBulkFill} style={S.btnBulk}>
                Terapkan ke Semua OPD
              </button>
            </div>
          </div>

          <div style={S.grid2}>
            {PD_LIST.map((pd, i) => {
              const total_asn = Number(pdJumlah[pd] || 0);
              const active_users = Number(pdAktif[pd] || 0);
              const percent = total_asn > 0 ? ((active_users / total_asn) * 100).toFixed(2) : "0.00";

              return (
                <React.Fragment key={i}>
                  <div style={S.fg}>
                    <label style={S.label}>{pd}</label>
                    <div style={S.iw} className="apt-iw">
                      <input type="text" inputMode="numeric" placeholder="0" value={pdJumlah[pd] || ""} onChange={e => setPdJumlah({ ...pdJumlah, [pd]: e.target.value.replace(/[^0-9]/g, '') })} style={S.inp} />
                    </div>
                  </div>
                  <div style={S.fg}>
                    <label style={S.label}>User Aktif (Persentase: {percent}%)</label>
                    <div style={S.iw} className="apt-iw">
                      <input type="text" inputMode="numeric" placeholder="0" value={pdAktif[pd] || ""} onChange={e => setPdAktif({ ...pdAktif, [pd]: e.target.value.replace(/[^0-9]/g, '') })} style={S.inp} />
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {/* Calculated Totals Row (Read-only) */}
            {(() => {
              const totalAsn = PD_LIST.reduce((sum, pd) => sum + Number(pdJumlah[pd] || 0), 0);
              const totalActive = PD_LIST.reduce((sum, pd) => sum + Number(pdAktif[pd] || 0), 0);
              const totalPercent = totalAsn > 0 ? ((totalActive / totalAsn) * 100).toFixed(2) : "0.00";

              return (
                <React.Fragment>
                  <div style={{ ...S.fg, gridColumn: "span 2", background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                    <span>Kalkulasi Total OPD Bulan Ini:</span>
                    <span>Total ASN: {totalAsn} | Total User Aktif: {totalActive} | Rata-rata: {totalPercent}%</span>
                  </div>
                </React.Fragment>
              );
            })()}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button type="button" onClick={() => router.push("/smartjabar/dashboard")} style={{ padding: "10px 22px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={loading || success} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: loading || success ? "#94a3b8" : "linear-gradient(135deg,#0f2540 0%,#1d4ed8 60%,#0891b2 100%)", color: "white", fontSize: "13px", fontWeight: "700", cursor: loading || success ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", gap: "8px" }}>
            {loading && <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.65s linear infinite" }} />}
            {loading ? "Menyimpan..." : success ? "✓ Tersimpan" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function SmartEditPage() {
  return (
    <Suspense fallback={<div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px", color: "#94a3b8" }}>Memuat halaman...</div>}>
      <SmartEditPageContent />
    </Suspense>
  );
}