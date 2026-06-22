"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateAppReplication, updateMentoringPerformance, getAppReplications, getMentoringPerformances, createAppReplication, createMentoringPerformance } from "@/services/api";

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

const S = {
  page: { fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px" } as React.CSSProperties,
  title: { fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.4px" } as React.CSSProperties,
  sub: { fontSize: "13px", color: "#94a3b8", marginTop: "4px", marginBottom: "24px" } as React.CSSProperties,
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px", alignItems: "stretch" } as React.CSSProperties,
  card: { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" as const } as React.CSSProperties,
  cardTitle: { fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" } as React.CSSProperties,
  dot: { width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #1d4ed8, #0891b2)", flexShrink: 0, marginTop: "2px" } as React.CSSProperties,
  divider: { height: "1px", background: "#f1f5f9", margin: "0 0 18px" } as React.CSSProperties,
  fieldGroup: { marginBottom: "14px" } as React.CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" } as React.CSSProperties,
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" } as React.CSSProperties,
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase" as const, marginBottom: "6px" } as React.CSSProperties,
  inputWrap: (hasError: boolean) => ({ border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "10px", padding: "0 14px", height: "44px", display: "flex", alignItems: "center", background: hasError ? "#fff5f5" : "#f8fafc" }) as React.CSSProperties,
  input: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" } as React.CSSProperties,
  select: (hasError: boolean) => ({ width: "100%", border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "10px", padding: "10px 14px", height: "44px", background: hasError ? "#fff5f5" : "#f8fafc", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", cursor: "pointer", appearance: "none" as const }) as React.CSSProperties,
  errorText: { fontSize: "11px", color: "#ef4444", marginTop: "4px" } as React.CSSProperties,
};

const InputField = ({ label, value, onChange, error, required }: { label: string; value: string; onChange: (v: string) => void; error?: string; required?: boolean }) => (
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

function EditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const team = "rekayasaaplikasi";
  const teamLabel = "Rekayasa Aplikasi";

  const initialMonth = searchParams?.get("month") || "";
  const initialYear = searchParams?.get("year") ? Number(searchParams.get("year")) : new Date().getFullYear();

  // Unified Period State
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [repsIds, setRepsIds] = useState<Record<number, number | null>>({ 1: null, 2: null, 3: null, 4: null });
  const [mentorId, setMentorId] = useState<number | null>(null);

  const [form, setForm] = useState({
    jumlah_aplikasi: "",
    perangkat_daerah: "",
    kabupaten: "",
    pemda: "",
    kementerian: "",
    jumlah_apl: "",
    target: "",
    realisasi: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  useEffect(() => {
    const fetchExistingData = async () => {
      setLoadingData(true);
      try {
        const repsRes = await getAppReplications(Number(selectedYear));
        const mentorsRes = await getMentoringPerformances(Number(selectedYear));

        const repsData = repsRes?.data || [];
        const mentorsData = mentorsRes?.items || [];

        const newForm = {
          jumlah_aplikasi: "",
          perangkat_daerah: "",
          kabupaten: "",
          pemda: "",
          kementerian: "",
          jumlah_apl: "",
          target: "",
          realisasi: "",
        };
        const newRepsIds: Record<number, number | null> = { 1: null, 2: null, 3: null, 4: null };
        let newMentorId = null;

        if (selectedMonth) {
          const m2Reps = repsData.filter((x: any) => Number(x.month) === Number(selectedMonth));
          m2Reps.forEach((r: any) => {
            newRepsIds[Number(r.institution_id)] = r.id;
            if (Number(r.institution_id) === 1) newForm.perangkat_daerah = String(r.total_replications);
            if (Number(r.institution_id) === 2) newForm.kabupaten = String(r.total_replications);
            if (Number(r.institution_id) === 3) newForm.pemda = String(r.total_replications);
            if (Number(r.institution_id) === 4) newForm.kementerian = String(r.total_replications);
          });

          const m3Mentor = mentorsData.find((x: any) => Number(x.month) === Number(selectedMonth));
          if (m3Mentor) {
            newMentorId = m3Mentor.id;
            newForm.jumlah_apl = String(m3Mentor.total_apps);
            newForm.target = String(m3Mentor.target);
            newForm.realisasi = String(m3Mentor.realization);
          }
        }

        setRepsIds(newRepsIds);
        setMentorId(newMentorId);
        setForm(newForm);
      } catch (err) {
        console.error("Failed to load existing data", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchExistingData();
  }, [selectedYear, selectedMonth]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedMonth) e.selectedMonth = "Bulan wajib dipilih";
    if (!form.jumlah_apl) e.jumlah_apl = "Wajib diisi";
    if (!form.target) e.target = "Wajib diisi";
    if (!form.realisasi) e.realisasi = "Wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const promises = [];
      const y = Number(selectedYear);
      const m = Number(selectedMonth);

      if (selectedMonth) {
        // App Replication
        const pdPayload = { institution_id: 1, month: m, year: y, total_replications: Number(form.perangkat_daerah) || 0 };
        if (repsIds[1]) {
          promises.push(updateAppReplication(repsIds[1], pdPayload));
        } else if (form.perangkat_daerah) {
          promises.push(createAppReplication(pdPayload));
        }

        const kabPayload = { institution_id: 2, month: m, year: y, total_replications: Number(form.kabupaten) || 0 };
        if (repsIds[2]) {
          promises.push(updateAppReplication(repsIds[2], kabPayload));
        } else if (form.kabupaten) {
          promises.push(createAppReplication(kabPayload));
        }

        const pemdaPayload = { institution_id: 3, month: m, year: y, total_replications: Number(form.pemda) || 0 };
        if (repsIds[3]) {
          promises.push(updateAppReplication(repsIds[3], pemdaPayload));
        } else if (form.pemda) {
          promises.push(createAppReplication(pemdaPayload));
        }

        const kemPayload = { institution_id: 4, month: m, year: y, total_replications: Number(form.kementerian) || 0 };
        if (repsIds[4]) {
          promises.push(updateAppReplication(repsIds[4], kemPayload));
        } else if (form.kementerian) {
          promises.push(createAppReplication(kemPayload));
        }

        // Mentoring
        const mentorPayload = {
          month: m,
          year: y,
          total_apps: Number(form.jumlah_apl),
          target: Number(form.target),
          realization: Number(form.realisasi),
        };
        if (mentorId) {
          promises.push(updateMentoringPerformance(mentorId, mentorPayload));
        } else {
          promises.push(createMentoringPerformance(mentorPayload));
        }
      }

      await Promise.all(promises);

      setSuccess(true);
      setTimeout(() => router.push(`/${team}/dashboard`), 1500);
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
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={S.page}>
        <div style={S.title}>Edit Data · {teamLabel}</div>
        <div style={S.sub}>Perbarui data rekapitulasi tim</div>

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

        {/* ── ROW 1 ── */}
        <div style={{ marginBottom: "16px", opacity: loadingData ? 0.6 : 1, pointerEvents: loadingData ? "none" : "auto" }}>
          {/* Card */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Edit Rekapitulasi Per KD/KABKO/Lembaga</div>
            <div style={S.divider} />
            <div style={S.grid2}>
              <InputField label="Perangkat Daerah" value={form.perangkat_daerah} onChange={(v) => handleChange("perangkat_daerah", v)} error={errors.perangkat_daerah} />
              <InputField label="Kabupaten/Kota" value={form.kabupaten} onChange={(v) => handleChange("kabupaten", v)} error={errors.kabupaten} />
              <InputField label="PEMDA Lainnya" value={form.pemda} onChange={(v) => handleChange("pemda", v)} error={errors.pemda} />
              <InputField label="Kementerian/Lembaga" value={form.kementerian} onChange={(v) => handleChange("kementerian", v)} error={errors.kementerian} />
            </div>
          </div>
        </div>

        {/* ── ROW 2: Section 3 full width ── */}
        <div style={{ marginBottom: "16px", opacity: loadingData ? 0.6 : 1, pointerEvents: loadingData ? "none" : "auto" }}>
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Edit Progress Pendampingan Aplikasi</div>
            <div style={S.divider} />
            <div style={S.grid3}>
              <InputField label="Jumlah APL" value={form.jumlah_apl} onChange={(v) => handleChange("jumlah_apl", v)} error={errors.jumlah_apl} required />
              <InputField label="Target" value={form.target} onChange={(v) => handleChange("target", v)} error={errors.target} required />
              <InputField label="Realisasi" value={form.realisasi} onChange={(v) => handleChange("realisasi", v)} error={errors.realisasi} required />
            </div>
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={() => router.push(`/${team}/dashboard`)} style={{ padding: "10px 22px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={loading || success} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: loading || success ? "#94a3b8" : "linear-gradient(135deg, #0f2540 0%, #1d4ed8 60%, #0891b2 100%)", color: "white", fontSize: "13px", fontWeight: "700", cursor: loading || success ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: "8px" }}>
            {loading && <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.65s linear infinite" }} />}
            {loading ? "Menyimpan..." : success ? "✓ Tersimpan" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px", color: "#94a3b8" }}>Memuat halaman...</div>}>
      <EditPageContent />
    </Suspense>
  );
}