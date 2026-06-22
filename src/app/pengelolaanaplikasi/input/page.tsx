"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createInventoryStat,
  createTeamSupportFacility,
  createIntegrationMapping,
  createDevelopmentTarget,
  createAppVulnerability,
  createKatalapsRegency, getKatalapsRegenciesCreate,
  createEmailManagementStat,
  createDriveJabarStat
} from "@/services/api";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const TEAM_BE_NAME = "Pengelolaan Aplikasi";

const KABKOTA_LIST = [
  "Kabupaten Bogor","Kabupaten Subang","Kabupaten Indramayu","Kabupaten Pangandaran",
  "Kabupaten Cianjur","Kabupaten Ciamis","Kota Cimahi","Kota Sukabumi","Kota Tasikmalaya",
  "Kota Cirebon","Kabupaten Tasikmalaya","Kabupaten Sukabumi","Kota Bekasi",
  "Kabupaten Bandung Barat","Kabupaten Sumedang","Kabupaten Majalengka","Kabupaten Bandung",
  "Kabupaten Cirebon","Kota Bogor","Kabupaten Karawang","Kabupaten Kuningan",
  "Kabupaten Banjar","Kota Depok","Kabupaten Bekasi","Kabupaten Garut",
  "Kabupaten Purwakarta","Kota Bandung",
];

// Removed unneeded constants

const S = {
  page: { fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px" } as React.CSSProperties,
  card: { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
  cardTitle: { fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" } as React.CSSProperties,
  dot: { width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #1d4ed8, #0891b2)", flexShrink: 0 } as React.CSSProperties,
  divider: { height: "1px", background: "#f1f5f9", margin: "0 0 18px" } as React.CSSProperties,
  fieldGroup: { marginBottom: "12px" } as React.CSSProperties,
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase" as const, marginBottom: "6px" } as React.CSSProperties,
  inputWrap: () => ({ border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "0 14px", height: "44px", display: "flex", alignItems: "center", background: "#f8fafc" }) as React.CSSProperties,
  input: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" } as React.CSSProperties,
  inputText: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", height: "44px", background: "#f8fafc", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", boxSizing: "border-box" as const } as React.CSSProperties,
  select: () => ({ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", height: "44px", background: "#f8fafc", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", cursor: "pointer", appearance: "none" as const }) as React.CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" } as React.CSSProperties,
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" } as React.CSSProperties,
  btnHapus: { padding: "7px 14px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fff5f5", color: "#ef4444", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" } as React.CSSProperties,
  btnTambah: { padding: "7px 14px", borderRadius: "8px", border: "1.5px dashed #bfdbfe", background: "#eff6ff", color: "#1d4ed8", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" } as React.CSSProperties,
  btnX: { width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fff5f5", color: "#ef4444", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as React.CSSProperties,
};

const SelectMonth = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div style={S.fieldGroup}>
    <label style={S.label}>Pilih Bulan <span style={{ color: "#ef4444" }}>*</span></label>
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...S.select(), color: value ? "#0f172a" : "#94a3b8" }} className="select-field">
        <option value="">Pilih Bulan</option>
        {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
      </select>
      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
    </div>
  </div>
);

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div style={S.fieldGroup}>
    <label style={S.label}>{label}</label>
    <div style={S.inputWrap()} className="input-wrap-focus">
      <input 
        type="text" 
        inputMode="numeric" 
        placeholder="0" 
        value={value} 
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))} 
        style={S.input} 
      />
    </div>
  </div>
);

export default function InputPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [regenciesList, setRegenciesList] = useState<any[]>([]);

  useEffect(() => {
    const fetchRegencies = async () => {
      try {
        const res = await getKatalapsRegenciesCreate();
        setRegenciesList(res.regencies || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRegencies();
  }, []);

  // Section 0: Period
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));

  // Section 1
  const [jumlahAplikasi, setJumlahAplikasi] = useState("");
  const [profil, setProfil] = useState("");
  const [repository, setRepository] = useState("");
  const [terdaftarPse, setTerdaftarPse] = useState("");

  // Section 2
  const [jumlahPD, setJumlahPD] = useState("");
  const [jumlahAplikasiTOT, setJumlahAplikasiTOT] = useState("");

  // Section 4
  const [jumlahApl, setJumlahApl] = useState("");
  const [peluang, setPeluang] = useState("");
  const [sudah, setSudah] = useState("");

  // Section 5
  const [luarDC, setLuarDC] = useState("");
  const [layananManual, setLayananManual] = useState("");

  // Section 8
  const [kerentananJumlah, setKerentananJumlah] = useState("");

  // Section 9
  const [katalaps, setKatalaps] = useState<Record<string, string>>(
    Object.fromEntries(KABKOTA_LIST.map((k) => [k, ""]))
  );

  // Section 10
  const [userAsn, setUserAsn] = useState("");
  const [userLain, setUserLain] = useState("");
  const [userAktif, setUserAktif] = useState("");

  // Section 11
  const [driveUser, setDriveUser] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const promises = [];
      const y = Number(selectedYear);
      const m = Number(selectedMonth);

      // 1. Inventory stats (Pendataan Aplikasi)
      promises.push(createInventoryStat({
        year: y,
        month: m,
        total_apps: Number(jumlahAplikasi) || 0,
        profile: Number(profil) || 0,
        repository: Number(repository) || 0,
        registered_pse: Number(terdaftarPse) || 0
      }));

      // 2. Team support facilities (TOT)
      promises.push(createTeamSupportFacility({
        year: y,
        month: m,
        total_pd: Number(jumlahPD) || 0,
        total_apps: Number(jumlahAplikasiTOT) || 0
      }));

      // 3. Integration mappings (Pemetaan Integrasi)
      promises.push(createIntegrationMapping({
        year: y,
        month: m,
        total_apps: Number(jumlahApl) || 0,
        integration_opportunity: Number(peluang) || 0,
        integrated: Number(sudah) || 0
      }));

      // 4. Development targets (Target Pengembangan)
      promises.push(createDevelopmentTarget({
        year: y,
        month: m,
        outside_dc_jabar: Number(luarDC) || 0,
        manual_service: Number(layananManual) || 0
      }));

      // 5. App vulnerabilities (Kerentanan)
      promises.push(createAppVulnerability({
        year: y,
        month: m,
        total_apps: Number(kerentananJumlah) || 0
      }));

      // 6. Katalaps regencies
      Object.entries(katalaps).forEach(([kk, val]) => {
        const regency = regenciesList.find((r) => {
          const rName = r.name || "";
          return rName.toLowerCase().replace(/[^a-z]/g, "") === kk.toLowerCase().replace(/[^a-z]/g, "");
        });
        if (regency && val) {
          promises.push(createKatalapsRegency({
            year: y,
            month: m,
            regency_id: regency.id,
            app_count: Number(val) || 0
          }));
        }
      });

      // 7. Email stats
      promises.push(createEmailManagementStat({
        year: y,
        month: m,
        user_asn: Number(userAsn) || 0,
        user_others: Number(userLain) || 0,
        active_user: Number(userAktif) || 0
      }));

      // 8. Drive stats
      promises.push(createDriveJabarStat({
        year: y,
        month: m,
        total_users: Number(driveUser) || 0
      }));

      await Promise.all(promises);
      setSuccess(true);
      setTimeout(() => router.push("/pengelolaanaplikasi/dashboard"), 1500);
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
        .dyn-input:focus { border-color: #1d4ed8 !important; background: white !important; outline: none; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={S.page}>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.4px" }}>Isi Form Rekapitulasi</div>
        <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", marginBottom: "24px" }}>Pengelolaan Aplikasi · Input data bulan ini</div>

        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#166534", marginBottom: "16px" }}>
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
                  <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={S.select()} className="select-field">
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
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={S.select()} className="select-field">
                    <option value="">Pilih Bulan</option>
                    {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: "10px" }}>▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 1: PENDATAAN APLIKASI ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Form Pendataan Aplikasi {selectedYear} (Berdasarkan KATALAPS)</div>
            <div style={S.divider} />
            <div style={S.grid2}>
              <Field label="Jumlah Aplikasi" value={jumlahAplikasi} onChange={setJumlahAplikasi} />
              <Field label="Profil" value={profil} onChange={setProfil} />
              <Field label="Repository" value={repository} onChange={setRepository} />
              <Field label="Terdaftar PSE" value={terdaftarPse} onChange={setTerdaftarPse} />
            </div>
          </div>

          {/* ── 2: FASILITASI TOT ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Form Fasilitasi Dukungan Tim Pada Pengembangan Aplikasi Perangkat Daerah (TOT)</div>
            <div style={S.divider} />
            <div style={S.grid2}>
              <Field label="Jumlah PD" value={jumlahPD} onChange={setJumlahPD} />
              <Field label="Jumlah Aplikasi" value={jumlahAplikasiTOT} onChange={setJumlahAplikasiTOT} />
            </div>
          </div>

          {/* ── 4: PEMETAAN INTEGRASI ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Form Pemetaan Integrasi Aplikasi</div>
            <div style={S.divider} />
            <div style={S.grid3}>
              <Field label="Jumlah Aplikasi" value={jumlahApl} onChange={setJumlahApl} />
              <Field label="Peluang Integrasi" value={peluang} onChange={setPeluang} />
              <Field label="Sudah Integrasi" value={sudah} onChange={setSudah} />
            </div>
          </div>

          {/* ── 5: TARGET PENGEMBANGAN ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Form Aplikasi/Layanan yang Menjadi Target Pengembangan</div>
            <div style={S.divider} />
            <div style={S.grid2}>
              <Field label="Luar DC JABAR" value={luarDC} onChange={setLuarDC} />
              <Field label="Layanan Manual" value={layananManual} onChange={setLayananManual} />
            </div>
          </div>

          {/* ── 8: KERENTANAN PEMPROV ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Form Kerentanan Pada Aplikasi PEMPROV JABAR</div>
            <div style={S.divider} />
            <Field label="Jumlah Aplikasi" value={kerentananJumlah} onChange={setKerentananJumlah} />
          </div>

          {/* ── 9: KATALAPS KAB/KOTA ── */}
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Form KATALAPS Kabupaten Kota</div>
            <div style={S.divider} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {KABKOTA_LIST.map((kk) => (
                <div key={kk} style={S.fieldGroup}>
                  <label style={S.label}>{kk}</label>
                  <div style={S.inputWrap()} className="input-wrap-focus">
                    <input 
                      type="text" 
                      inputMode="numeric" 
                      placeholder="0" 
                      value={katalaps[kk] || ""} 
                      onChange={(e) => setKatalaps({ ...katalaps, [kk]: e.target.value.replace(/[^0-9]/g, "") })} 
                      style={S.input} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 10 & 11: EMAIL + DRIVE (2 kolom) ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div style={S.card}>
              <div style={S.cardTitle}><span style={S.dot} />Form Layanan Pengelolaan Email</div>
              <div style={S.divider} />
              <Field label="Jumlah User (ASN)" value={userAsn} onChange={setUserAsn} />
              <Field label="Jumlah User (Lainnya)" value={userLain} onChange={setUserLain} />
              <Field label="Jumlah User Aktif" value={userAktif} onChange={setUserAktif} />
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}><span style={S.dot} />Form Layanan Drive JABAR</div>
              <div style={S.divider} />
              <Field label="Jumlah User" value={driveUser} onChange={setDriveUser} />
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" onClick={() => router.push("/pengelolaanaplikasi/dashboard")} style={{ padding: "10px 22px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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