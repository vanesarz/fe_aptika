"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createIntopMandateServiceSummary, createServiceCatalog, createIntegrationSummary } from "@/services/api";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const TEAM_LABEL = "Integrasi-Interoperabilitas";
const TEAM_BE_NAME = "Integrasi Interoperabilitas";

const S = {
  page: { fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px" } as React.CSSProperties,
  title: { fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.4px" } as React.CSSProperties,
  sub: { fontSize: "13px", color: "#94a3b8", marginTop: "4px", marginBottom: "24px" } as React.CSSProperties,
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px", alignItems: "start" } as React.CSSProperties,
  card: { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: "16px" } as React.CSSProperties,
  cardTitle: { fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" } as React.CSSProperties,
  dot: { width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #1d4ed8, #0891b2)", flexShrink: 0 } as React.CSSProperties,
  divider: { height: "1px", background: "#f1f5f9", margin: "0 0 18px" } as React.CSSProperties,
  sectionLabel: { fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase" as const, marginBottom: "10px", marginTop: "16px" } as React.CSSProperties,
  fieldGroup: { marginBottom: "12px" } as React.CSSProperties,
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase" as const, marginBottom: "6px" } as React.CSSProperties,
  inputWrap: (hasError: boolean) => ({ border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "10px", padding: "0 14px", height: "44px", display: "flex", alignItems: "center", background: hasError ? "#fff5f5" : "#f8fafc" }) as React.CSSProperties,
  input: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" } as React.CSSProperties,
  inputText: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", height: "44px", background: "#f8fafc", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", boxSizing: "border-box" as const } as React.CSSProperties,
  select: (hasError: boolean) => ({ width: "100%", border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "10px", padding: "10px 14px", height: "44px", background: hasError ? "#fff5f5" : "#f8fafc", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", cursor: "pointer", appearance: "none" as const }) as React.CSSProperties,
  errorText: { fontSize: "11px", color: "#ef4444", marginTop: "4px" } as React.CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" } as React.CSSProperties,
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" } as React.CSSProperties,
};

const SelectMonth = ({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) => (
  <div style={S.fieldGroup}>
    <label style={S.label}>Pilih Bulan <span style={{ color: "#ef4444" }}>*</span></label>
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...S.select(!!error), color: value ? "#0f172a" : "#94a3b8" }} className="select-field">
        <option value="">Pilih Bulan</option>
        {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
      </select>
      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
    </div>
    {error && <div style={S.errorText}>{error}</div>}
  </div>
);

const NumberField = ({ label, value, onChange, error, required }: { label: string; value: string; onChange: (v: string) => void; error?: string; required?: boolean }) => (
  <div style={S.fieldGroup}>
    <label style={S.label}>{label} {required && <span style={{ color: "#ef4444" }}>*</span>}</label>
    <div style={S.inputWrap(!!error)} className="input-wrap-focus">
      <input 
        type="text" 
        inputMode="numeric" 
        placeholder="0" 
        value={value} 
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))} 
        style={S.input} 
      />
    </div>
    {error && <div style={S.errorText}>{error}</div>}
  </div>
);

export default function InputPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  // Unified Period State
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));

  // Form 1 — Ekosistem Layanan SPLP
  const [layananAdm, setLayananAdm] = useState<string[]>([]);
  const [layananPublik, setLayananPublik] = useState<string[]>([]);

  // Form 2 — Jumlah Ekosistem Layanan
  const [layAdmPem, setLayAdmPem] = useState("");
  const [layPublik, setLayPublik] = useState("");
  const [targetKeterpaduan, setTargetKeterpaduan] = useState("");
  const [capaianKeterpaduan, setCapaianKeterpaduan] = useState("");

  // Form 3 — Rekap Aplikasi Terintegrasi
  const [kabKota, setKabKota] = useState("");
  const [kementerian, setKementerian] = useState("");
  const [pemprovJabar, setPemprovJabar] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedMonth) e.selectedMonth = "Bulan wajib dipilih";
    if (!layAdmPem) e.layAdmPem = "Wajib diisi";
    if (!layPublik) e.layPublik = "Wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const promises = [];
      const y = Number(selectedYear);
      const m = Number(selectedMonth);

      // Form 1: Mandate Service Summaries
      layananAdm.filter(l => l.trim() !== "").forEach((l) => {
        promises.push(createIntopMandateServiceSummary({ category: "administrasi", service_name: l, year: y }));
      });
      layananPublik.filter(l => l.trim() !== "").forEach((l) => {
        promises.push(createIntopMandateServiceSummary({ category: "publik", service_name: l, year: y }));
      });

      // Form 2: Service Catalogs
      promises.push(createServiceCatalog({
        month: m,
        year: y,
        adm_service_count: Number(layAdmPem),
        public_service_count: Number(layPublik),
        target_abs: Number(targetKeterpaduan) || 0,
        achievement_abs: Number(capaianKeterpaduan) || 0,
      }));

      // Form 3: Integration Summaries
      if (pemprovJabar) promises.push(createIntegrationSummary({ institution_id: 1, month: m, year: y, app_count: Number(pemprovJabar) }));
      if (kabKota) promises.push(createIntegrationSummary({ institution_id: 2, month: m, year: y, app_count: Number(kabKota) }));
      if (kementerian) promises.push(createIntegrationSummary({ institution_id: 4, month: m, year: y, app_count: Number(kementerian) }));

      await Promise.all(promises);

      setSuccess(true);
      setTimeout(() => router.push("/integrasiinteroperabilitas/dashboard"), 1500);
    } catch (err: any) {
      console.error(err);
      const serverMessage = err.response?.data?.errors?.month?.[0] || err.response?.data?.message || "Gagal menyimpan data.";
      alert(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .input-wrap-focus:focus-within { border-color: #1d4ed8 !important; background: white !important; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        .select-field:focus { border-color: #1d4ed8 !important; background: white !important; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        .layanan-input:focus { border-color: #1d4ed8 !important; background: white !important; outline: none; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={S.page}>
        <div style={S.title}>Isi Form Rekapitulasi</div>
        <div style={S.sub}>{TEAM_LABEL} · Input data bulan ini</div>

        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#166534", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            ✓ Data berhasil disimpan! Mengalihkan ke dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── 0: PERIODE DATA ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Pilih Periode Laporan</div>
            <div style={S.divider} />
            <div style={S.grid2}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Tahun <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={S.select(false)} className="select-field">
                    {[0, 1, 2, 3].map((offset) => {
                      const yearVal = new Date().getFullYear() - offset;
                      return <option key={yearVal} value={yearVal}>{yearVal}</option>;
                    })}
                  </select>
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
                </div>
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Bulan <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={S.select(false)} className="select-field">
                    <option value="">Pilih Bulan</option>
                    {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 1: Form SPLP (2 kolom) ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Form Ekosistem Layanan dan Interoperabilitas Data Melalui SPLP ({selectedYear})</div>
            <div style={S.divider} />

            <div style={S.row2}>
              {/* Layanan ADM */}
              <div>
                <div style={S.sectionLabel}>Layanan Administrasi Pemerintahan</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {layananAdm.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...layananAdm];
                          updated[i] = e.target.value;
                          setLayananAdm(updated);
                        }}
                        className="layanan-input"
                        style={{ ...S.inputText, flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => setLayananAdm(layananAdm.filter((_, idx) => idx !== i))}
                        style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fff5f5", color: "#ef4444", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      >×</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLayananAdm([...layananAdm, ""])}
                    style={{ padding: "8px 14px", borderRadius: "8px", border: "1.5px dashed #bfdbfe", background: "#eff6ff", color: "#1d4ed8", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: "4px" }}
                  >
                    + Tambah Data
                  </button>
                </div>
              </div>

              {/* Layanan Publik */}
              <div>
                <div style={S.sectionLabel}>Layanan Publik</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {layananPublik.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...layananPublik];
                          updated[i] = e.target.value;
                          setLayananPublik(updated);
                        }}
                        className="layanan-input"
                        style={{ ...S.inputText, flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => setLayananPublik(layananPublik.filter((_, idx) => idx !== i))}
                        style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fff5f5", color: "#ef4444", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      >×</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLayananPublik([...layananPublik, ""])}
                    style={{ padding: "8px 14px", borderRadius: "8px", border: "1.5px dashed #bfdbfe", background: "#eff6ff", color: "#1d4ed8", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: "4px" }}
                  >
                    + Tambah Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 2: Form Jumlah Ekosistem & Rekap Aplikasi (2 kolom) ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

            {/* Form Jumlah Ekosistem Layanan */}
            <div style={S.card}>
              <div style={S.cardTitle}><span style={S.dot} />Form Jumlah Ekosistem Layanan</div>
              <div style={S.divider} />

              <div style={S.grid2}>
                <NumberField label="Layanan ADM PEM" value={layAdmPem} onChange={(v) => { setLayAdmPem(v); setErrors((p) => ({ ...p, layAdmPem: "" })); }} error={errors.layAdmPem} required />
                <NumberField label="Layanan Publik" value={layPublik} onChange={(v) => { setLayPublik(v); setErrors((p) => ({ ...p, layPublik: "" })); }} error={errors.layPublik} required />
              </div>

              <div style={S.sectionLabel}>Target dan Capaian Keterpaduan Layanan Melalui SPLP</div>
              <div style={S.grid2}>
                <NumberField label="Target" value={targetKeterpaduan} onChange={setTargetKeterpaduan} />
                <NumberField label="Capaian" value={capaianKeterpaduan} onChange={setCapaianKeterpaduan} />
              </div>
            </div>

            {/* Form Rekap Jumlah Aplikasi Terintegrasi */}
            <div style={S.card}>
              <div style={S.cardTitle}><span style={S.dot} />Form Rekap Jumlah Aplikasi Terintegrasi</div>
              <div style={S.divider} />

              <NumberField label="Kabupaten/Kota" value={kabKota} onChange={setKabKota} />
              <NumberField label="Kementerian/Lembaga" value={kementerian} onChange={setKementerian} />
              <NumberField label="PEMPROV JABAR" value={pemprovJabar} onChange={setPemprovJabar} />
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" onClick={() => router.push("/integrasiinteroperabilitas/dashboard")} style={{ padding: "10px 22px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Batal
            </button>
            <button type="submit" disabled={loading || success} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: loading || success ? "#94a3b8" : "linear-gradient(135deg, #0f2540 0%, #1d4ed8 60%, #0891b2 100%)", color: "white", fontSize: "13px", fontWeight: "700", cursor: loading || success ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: "8px" }}>
              {loading && <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.65s linear infinite" }} />}
              {loading ? "Menyimpan..." : success ? "✓ Tersimpan" : "Simpan"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}