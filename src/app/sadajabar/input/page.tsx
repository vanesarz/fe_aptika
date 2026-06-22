"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSadajabarIntegrasi, createSadajabarEnkripsi } from "@/services/api";

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const S = {
  page:      { fontFamily:"'Plus Jakarta Sans', sans-serif", padding:"28px" } as React.CSSProperties,
  title:     { fontSize:"20px", fontWeight:"800", color:"#0f172a", letterSpacing:"-0.4px" } as React.CSSProperties,
  sub:       { fontSize:"13px", color:"#94a3b8", marginTop:"4px", marginBottom:"24px" } as React.CSSProperties,
  card:      { backgroundColor:"white", borderRadius:"14px", border:"1px solid #e2e8f0", padding:"22px 24px", marginBottom:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
  cardTitle: { fontSize:"14px", fontWeight: "700", color:"#0f172a", marginBottom: "18px", display:"flex", alignItems:"center", gap:"8px" } as React.CSSProperties,
  dot:       { width:"8px", height:"8px", borderRadius:"50%", background: "linear-gradient(135deg, #1d4ed8, #0891b2)", flexShrink:0 } as React.CSSProperties,
  divider:   { height:"1px", background:"#f1f5f9", margin:"0 0 18px" } as React.CSSProperties,
  fieldWrap: { marginBottom:"14px" } as React.CSSProperties,
  label:     { display:"block", fontSize:"11px", fontWeight:"700", color:"#475569", letterSpacing:"0.8px", textTransform:"uppercase" as const, marginBottom:"6px" } as React.CSSProperties,
  inputWrap: (err:boolean) => ({ border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}`, borderRadius:"10px", padding:"0 14px", height:"44px", display:"flex", alignItems:"center", background:err?"#fff5f5":"#f8fafc" }) as React.CSSProperties,
  input:     { flex:1, border:"none", outline:"none", background:"transparent", fontSize:"13.5px", color:"#0f172a", fontFamily:"'Plus Jakarta Sans', sans-serif", width:"100%" } as React.CSSProperties,
  select:    (err:boolean) => ({ width:"100%", border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}`, borderRadius:"10px", padding:"0 14px", height:"44px", background:err?"#fff5f5":"#f8fafc", fontSize:"13.5px", color:"#0f172a", fontFamily:"'Plus Jakarta Sans', sans-serif", outline:"none", cursor:"pointer", appearance:"none" as const }) as React.CSSProperties,
  errTxt:    { fontSize:"11px", color:"#ef4444", marginTop:"4px" } as React.CSSProperties,
  grid2:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" } as React.CSSProperties,
  grid3:     { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"14px" } as React.CSSProperties,
};

const SelectMonth = ({ value, onChange, error }: { value:string; onChange:(v:string)=>void; error?:string }) => (
  <div style={S.fieldWrap}>
    <label style={S.label}>Pilih Bulan <span style={{ color:"#ef4444" }}>*</span></label>
    <div style={{ position:"relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...S.select(!!error), color: value?"#0f172a":"#94a3b8" }} className="sada-select">
        <option value="">Pilih Bulan</option>
        {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
      </select>
      <span style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none", fontSize:"10px" }}>▼</span>
    </div>
    {error && <div style={S.errTxt}>{error}</div>}
  </div>
);

const Field = ({ label, value, onChange, error, required }: { label:string; value:string; onChange:(v:string)=>void; error?:string; required?:boolean }) => (
  <div style={S.fieldWrap}>
    <label style={S.label}>{label}{required && <span style={{ color:"#ef4444" }}> *</span>}</label>
    <div style={S.inputWrap(!!error)} className="sada-input-wrap">
      <input type="text" inputMode="numeric" placeholder="0" value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))} style={S.input} />
    </div>
    {error && <div style={S.errTxt}>{error}</div>}
  </div>
);

export default function InputPage() {
  const router      = useRouter();
  const team        = "sadajabar";
  const teamLabel   = "SADAjabar";
  const currentYear  = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1);

  // Unified Period State
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  // Section 1
  const [jumlahData, setJumlahData] = useState("");

  // Section 2
  const [pemprov,  setPemprov]  = useState("");
  const [kabko,    setKabko]    = useState("");
  const [lainnya,  setLainnya]  = useState("");

  const [errors,  setErrors]  = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!selectedMonth) e.selectedMonth = "Bulan wajib dipilih";
    if (!jumlahData) e.jumlahData = "Wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const promises = [];
      const y = Number(selectedYear);
      const m = Number(selectedMonth);

      // Enkripsi
      promises.push(createSadajabarEnkripsi({
        year: y,
        month: m,
        app_count: Number(jumlahData),
      }));

      // Integrasi Pemprov
      promises.push(createSadajabarIntegrasi({
        year: y,
        month: m,
        app_count: Number(pemprov) || 0,
        institution_id: 1,
      }));

      // Integrasi Kabko
      promises.push(createSadajabarIntegrasi({
        year: y,
        month: m,
        app_count: Number(kabko) || 0,
        institution_id: 2,
      }));

      // Integrasi Lainnya
      promises.push(createSadajabarIntegrasi({
        year: y,
        month: m,
        app_count: Number(lainnya) || 0,
        institution_id: 4,
      }));

      await Promise.all(promises);

      setSuccess(true);
      setTimeout(() => router.push(`/sadajabar/dashboard`), 1500);
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
        .sada-input-wrap:focus-within { border-color:#1d4ed8 !important; background:white !important; box-shadow:0 0 0 3px rgba(29,78,216,0.09); }
        .sada-select:focus { border-color:#1d4ed8 !important; background:white !important; box-shadow:0 0 0 3px rgba(29,78,216,0.09); }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      <div style={S.page}>
        <div style={S.title}>Isi Form Rekapitulasi</div>
        <div style={S.sub}>{teamLabel} · Input data bulan ini</div>

        {success && (
          <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:"10px", padding:"12px 16px", fontSize:"13px", color:"#166534", marginBottom:"16px", display:"flex", alignItems:"center", gap:"8px" }}>
            ✓ Data berhasil disimpan! Mengalihkan ke dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── 0: PERIODE DATA ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Pilih Periode Laporan</div>
            <div style={S.divider} />
            <div style={S.grid2 || { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={S.fieldWrap}>
                <label style={S.label}>Tahun <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={S.select(false)} className="sada-select">
                    {[0, 1, 2, 3].map((offset) => {
                      const yearVal = new Date().getFullYear() - offset;
                      return <option key={yearVal} value={yearVal}>{yearVal}</option>;
                    })}
                  </select>
                  <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
                </div>
              </div>

              <div style={S.fieldWrap}>
                <label style={S.label}>Bulan <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={S.select(false)} className="sada-select">
                    <option value="">Pilih Bulan</option>
                    {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 1: Data Terekam & Terenkripsi ── */}
          <div style={S.card}>
            <div style={S.cardTitle}>
              <span style={S.dot} />
              Form Rekapitulasi Data Terekam dan Terenkripsi
            </div>
            <div style={S.divider} />
            <Field
              label="Jumlah Data"
              value={jumlahData}
              onChange={(v) => { setJumlahData(v); setErrors(p => ({ ...p, jumlahData:"" })); }}
              error={errors.jumlahData}
              required
            />
          </div>

          {/* ── CARD 2: Aplikasi Terintegrasi ── */}
          <div style={S.card}>
            <div style={S.cardTitle}>
              <span style={S.dot} />
              Form Rekapitulasi Aplikasi Terintegrasi SADAjabar
            </div>
            <div style={S.divider} />
            <div style={S.grid3}>
              <Field label="PEMPROV (PD)" value={pemprov} onChange={setPemprov} />
              <Field label="KABKO"        value={kabko}   onChange={setKabko}   />
              <Field label="K/L/Lainnya" value={lainnya} onChange={setLainnya} />
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
            <button
              type="button"
              onClick={() => router.push(`/sadajabar/dashboard`)}
              style={{ padding:"10px 22px", borderRadius:"10px", border:"1.5px solid #e2e8f0", background:"white", color:"#64748b", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif" }}
            >Batal</button>
            <button
              type="submit"
              disabled={loading || success}
              style={{ padding:"10px 24px", borderRadius:"10px", border:"none", background: loading||success ? "#94a3b8" : "linear-gradient(135deg, #0f2540 0%, #1d4ed8 60%, #0891b2 100%)", color:"white", fontSize:"13px", fontWeight:"700", cursor: loading||success ? "not-allowed" : "pointer", fontFamily:"'Plus Jakarta Sans', sans-serif", display:"flex", alignItems:"center", gap:"8px" }}
            >
              {loading && <span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", display:"inline-block", animation:"spin 0.65s linear infinite" }} />}
              {loading ? "Menyimpan..." : success ? "✓ Tersimpan" : "Simpan"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}