"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getInventoryStats, createInventoryStat, updateInventoryStat,
  getTeamSupportFacilities, createTeamSupportFacility, updateTeamSupportFacility,
  getIntegrationMappings, createIntegrationMapping, updateIntegrationMapping,
  getDevelopmentTargets, createDevelopmentTarget, updateDevelopmentTarget,
  getAppVulnerabilities, createAppVulnerability, updateAppVulnerability,
  getKatalapsRegencies, createKatalapsRegency, updateKatalapsRegency, getKatalapsRegenciesCreate,
  getEmailManagementStats, createEmailManagementStat, updateEmailManagementStat,
  getDriveJabarStats, createDriveJabarStat, updateDriveJabarStat
} from "@/services/api";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

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

import { Suspense } from "react";

const S = {
  page: { fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px" } as React.CSSProperties,
  card: { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
  cardTitle: { fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" } as React.CSSProperties,
  dot: { width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #1d4ed8, #0891b2)", flexShrink: 0 } as React.CSSProperties,
  divider: { height: "1px", background: "#f1f5f9", margin: "0 0 18px" } as React.CSSProperties,
  fieldGroup: { marginBottom: "12px" } as React.CSSProperties,
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase" as const, marginBottom: "6px" } as React.CSSProperties,
  inputWrap: (e = false) => ({ border: `1.5px solid ${e ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "10px", padding: "0 14px", height: "44px", display: "flex", alignItems: "center", background: e ? "#fff5f5" : "#f8fafc" }) as React.CSSProperties,
  input: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" } as React.CSSProperties,
  inputText: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", height: "44px", background: "#f8fafc", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", boxSizing: "border-box" as const } as React.CSSProperties,
  select: (e = false) => ({ width: "100%", border: `1.5px solid ${e ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "10px", padding: "10px 14px", height: "44px", background: e ? "#fff5f5" : "#f8fafc", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", cursor: "pointer", appearance: "none" as const }) as React.CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" } as React.CSSProperties,
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" } as React.CSSProperties,
};

const TextField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
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

function EditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editYear = searchParams.get("year") || new Date().getFullYear().toString();
  const editMonth = searchParams.get("month") || "";

  const [selectedYear, setSelectedYear] = useState<number>(Number(editYear));
  const [selectedMonth, setSelectedMonth] = useState<string>(editMonth);

  const [jumlahAplikasi, setJumlahAplikasi] = useState("");
  const [profil, setProfil] = useState("");
  const [repository, setRepository] = useState("");
  const [terdaftarPse, setTerdaftarPse] = useState("");

  const [jumlahPD, setJumlahPD] = useState("");
  const [jumlahAplikasiTOT, setJumlahAplikasiTOT] = useState("");

  const [jumlahApl, setJumlahApl] = useState("");
  const [peluang, setPeluang] = useState("");
  const [sudah, setSudah] = useState("");

  const [luarDC, setLuarDC] = useState("");
  const [layananManual, setLayananManual] = useState("");

  const [kerentananJumlah, setKerentananJumlah] = useState("");

  const [katalaps, setKatalaps] = useState<Record<string, string>>(
    Object.fromEntries(KABKOTA_LIST.map((k) => [k, ""]))
  );

  const [userAsn, setUserAsn] = useState("");
  const [userLain, setUserLain] = useState("");
  const [userAktif, setUserAktif] = useState("");

  const [driveUser, setDriveUser] = useState("");

  const [inventoryId, setInventoryId] = useState<number | null>(null);
  const [facilityId, setFacilityId] = useState<number | null>(null);
  const [mappingId, setMappingId] = useState<number | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [vulnerabilityId, setVulnerabilityId] = useState<number | null>(null);
  const [emailId, setEmailId] = useState<number | null>(null);
  const [driveId, setDriveId] = useState<number | null>(null);
  const [regenciesList, setRegenciesList] = useState<any[]>([]);
  const [katalapsIds, setKatalapsIds] = useState<Record<string, number | null>>({});

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetching, setFetching] = useState(true);

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

  useEffect(() => {
    const prefill = async () => {
      setFetching(true);
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
          getInventoryStats(Number(selectedYear)),
          getTeamSupportFacilities(Number(selectedYear)),
          getIntegrationMappings(Number(selectedYear)),
          getDevelopmentTargets(Number(selectedYear)),
          getAppVulnerabilities(Number(selectedYear)),
          getKatalapsRegencies(Number(selectedYear)),
          getEmailManagementStats(Number(selectedYear)),
          getDriveJabarStats(Number(selectedYear))
        ]);

        // Prefill Section 1: Inventory Stats (Pendataan Aplikasi)
        const invEntry = inventoryRes?.data?.find((d: any) => Number(d.month) === Number(selectedMonth));
        if (invEntry) {
          setJumlahAplikasi(String(invEntry.total_apps));
          setProfil(String(invEntry.profile));
          setRepository(String(invEntry.repository));
          setTerdaftarPse(String(invEntry.registered_pse));
          setInventoryId(invEntry.id);
        } else {
          setJumlahAplikasi("");
          setProfil("");
          setRepository("");
          setTerdaftarPse("");
          setInventoryId(null);
        }

        // Prefill Section 2: Team Support Facilities (TOT)
        const facEntry = facilitiesRes?.data?.find((d: any) => Number(d.month) === Number(selectedMonth));
        if (facEntry) {
          setJumlahPD(String(facEntry.total_pd));
          setJumlahAplikasiTOT(String(facEntry.total_apps));
          setFacilityId(facEntry.id);
        } else {
          setJumlahPD("");
          setJumlahAplikasiTOT("");
          setFacilityId(null);
        }

        // Prefill Section 4: Integration Mappings (Pemetaan Integrasi)
        const mapEntry = integrationRes?.data?.find((d: any) => Number(d.month) === Number(selectedMonth));
        if (mapEntry) {
          setJumlahApl(String(mapEntry.total_apps));
          setPeluang(String(mapEntry.integration_opportunity));
          setSudah(String(mapEntry.integrated));
          setMappingId(mapEntry.id);
        } else {
          setJumlahApl("");
          setPeluang("");
          setSudah("");
          setMappingId(null);
        }

        // Prefill Section 5: Development Targets (Target Pengembangan)
        const tarEntry = devTargetsRes?.data?.find((d: any) => Number(d.month) === Number(selectedMonth));
        if (tarEntry) {
          setLuarDC(String(tarEntry.outside_dc_jabar));
          setLayananManual(String(tarEntry.manual_service));
          setTargetId(tarEntry.id);
        } else {
          setLuarDC("");
          setLayananManual("");
          setTargetId(null);
        }

        // Prefill Section 8: App Vulnerabilities (Kerentanan)
        const vulEntry = vulnerabilitiesRes?.data?.find((d: any) => Number(d.month) === Number(selectedMonth));
        if (vulEntry) {
          setKerentananJumlah(String(vulEntry.total_apps));
          setVulnerabilityId(vulEntry.id);
        } else {
          setKerentananJumlah("");
          setVulnerabilityId(null);
        }

        // Prefill Section 9: Katalaps Regencies
        const regEntries = regenciesRes?.data?.filter((d: any) => Number(d.month) === Number(selectedMonth)) || [];
        const newKatalaps: Record<string, string> = {};
        const newKatalapsIds: Record<string, number | null> = {};
        
        KABKOTA_LIST.forEach((kk) => {
          const found = regEntries.find((d: any) => {
            const rName = d.regency?.name || "";
            return rName.toLowerCase().replace(/[^a-z]/g, "") === kk.toLowerCase().replace(/[^a-z]/g, "");
          });
          if (found) {
            newKatalaps[kk] = String(found.app_count);
            newKatalapsIds[kk] = found.id;
          } else {
            newKatalaps[kk] = "";
            newKatalapsIds[kk] = null;
          }
        });
        setKatalaps(newKatalaps);
        setKatalapsIds(newKatalapsIds);

        // Prefill Section 10: Email Stats
        const emailEntry = emailRes?.data?.find((d: any) => Number(d.month) === Number(selectedMonth));
        if (emailEntry) {
          setUserAsn(String(emailEntry.user_asn));
          setUserLain(String(emailEntry.user_others));
          setUserAktif(String(emailEntry.active_user));
          setEmailId(emailEntry.id);
        } else {
          setUserAsn("");
          setUserLain("");
          setUserAktif("");
          setEmailId(null);
        }

        // Prefill Section 11: Drive Stats
        const driveEntry = driveRes?.data?.find((d: any) => Number(d.month) === Number(selectedMonth));
        if (driveEntry) {
          setDriveUser(String(driveEntry.total_users));
          setDriveId(driveEntry.id);
        } else {
          setDriveUser("");
          setDriveId(null);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    prefill();
  }, [selectedYear, selectedMonth]);

  const handleSubmit = async () => {
    if (!selectedMonth) {
      alert("Silakan pilih bulan terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const promises = [];
      const y = Number(selectedYear);
      const m = Number(selectedMonth);

      // 1. Inventory stats (Pendataan Aplikasi)
      const invPayload = {
        year: y,
        month: m,
        total_apps: Number(jumlahAplikasi) || 0,
        profile: Number(profil) || 0,
        repository: Number(repository) || 0,
        registered_pse: Number(terdaftarPse) || 0
      };
      if (inventoryId) {
        promises.push(updateInventoryStat(inventoryId, invPayload));
      } else {
        promises.push(createInventoryStat(invPayload));
      }

      // 2. Team support facilities (TOT)
      const facPayload = {
        year: y,
        month: m,
        total_pd: Number(jumlahPD) || 0,
        total_apps: Number(jumlahAplikasiTOT) || 0
      };
      if (facilityId) {
        promises.push(updateTeamSupportFacility(facilityId, facPayload));
      } else {
        promises.push(createTeamSupportFacility(facPayload));
      }

      // 3. Integration mappings (Pemetaan Integrasi)
      const mapPayload = {
        year: y,
        month: m,
        total_apps: Number(jumlahApl) || 0,
        integration_opportunity: Number(peluang) || 0,
        integrated: Number(sudah) || 0
      };
      if (mappingId) {
        promises.push(updateIntegrationMapping(mappingId, mapPayload));
      } else {
        promises.push(createIntegrationMapping(mapPayload));
      }

      // 4. Development targets (Target Pengembangan)
      const tarPayload = {
        year: y,
        month: m,
        outside_dc_jabar: Number(luarDC) || 0,
        manual_service: Number(layananManual) || 0
      };
      if (targetId) {
        promises.push(updateDevelopmentTarget(targetId, tarPayload));
      } else {
        promises.push(createDevelopmentTarget(tarPayload));
      }

      // 5. App vulnerabilities (Kerentanan)
      const vulPayload = {
        year: y,
        month: m,
        total_apps: Number(kerentananJumlah) || 0
      };
      if (vulnerabilityId) {
        promises.push(updateAppVulnerability(vulnerabilityId, vulPayload));
      } else {
        promises.push(createAppVulnerability(vulPayload));
      }

      // 6. Katalaps regencies
      Object.entries(katalaps).forEach(([kk, val]) => {
        const regency = regenciesList.find((r) => {
          const rName = r.name || "";
          return rName.toLowerCase().replace(/[^a-z]/g, "") === kk.toLowerCase().replace(/[^a-z]/g, "");
        });
        if (regency) {
          const regPayload = {
            year: y,
            month: m,
            regency_id: regency.id,
            app_count: Number(val) || 0
          };
          const recId = katalapsIds[kk];
          if (recId) {
            promises.push(updateKatalapsRegency(recId, regPayload));
          } else if (val) {
            promises.push(createKatalapsRegency(regPayload));
          }
        }
      });

      // 7. Email stats
      const emailPayload = {
        year: y,
        month: m,
        user_asn: Number(userAsn) || 0,
        user_others: Number(userLain) || 0,
        active_user: Number(userAktif) || 0
      };
      if (emailId) {
        promises.push(updateEmailManagementStat(emailId, emailPayload));
      } else {
        promises.push(createEmailManagementStat(emailPayload));
      }

      // 8. Drive stats
      const drivePayload = {
        year: y,
        month: m,
        total_users: Number(driveUser) || 0
      };
      if (driveId) {
        promises.push(updateDriveJabarStat(driveId, drivePayload));
      } else {
        promises.push(createDriveJabarStat(drivePayload));
      }

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

  const monthLabel = selectedMonth ? `${MONTHS[Number(selectedMonth) - 1]} ${selectedYear}` : "Data";

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
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.4px" }}>Edit {monthLabel}</div>
        <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", marginBottom: "24px" }}>Perbarui data rekapitulasi tim</div>

        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#166534", marginBottom: "16px" }}>
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
          <div style={S.cardTitle}><span style={S.dot} />Edit Pendataan Aplikasi {selectedYear} (Berdasarkan KATALAPS)</div>
          <div style={S.divider} />
          <div style={S.grid2}>
            <TextField label="Jumlah Aplikasi" value={jumlahAplikasi} onChange={setJumlahAplikasi} />
            <TextField label="Profil" value={profil} onChange={setProfil} />
            <TextField label="Repository" value={repository} onChange={setRepository} />
            <TextField label="Terdaftar PSE" value={terdaftarPse} onChange={setTerdaftarPse} />
          </div>
        </div>

        {/* ── 2: FASILITASI TOT ── */}
        <div style={S.card}>
          <div style={S.cardTitle}><span style={S.dot} />Edit Fasilitasi Dukungan Tim Pada Pengembangan Aplikasi Perangkat Daerah (TOT)</div>
          <div style={S.divider} />
          <div style={S.grid2}>
            <TextField label="Jumlah PD" value={jumlahPD} onChange={setJumlahPD} />
            <TextField label="Jumlah Aplikasi" value={jumlahAplikasiTOT} onChange={setJumlahAplikasiTOT} />
          </div>
        </div>

        {/* ── 4: PEMETAAN INTEGRASI ── */}
        <div style={S.card}>
          <div style={S.cardTitle}><span style={S.dot} />Edit Pemetaan Integrasi Aplikasi</div>
          <div style={S.divider} />
          <div style={S.grid3}>
            <TextField label="Jumlah Aplikasi" value={jumlahApl} onChange={setJumlahApl} />
            <TextField label="Peluang Integrasi" value={peluang} onChange={setPeluang} />
            <TextField label="Sudah Integrasi" value={sudah} onChange={setSudah} />
          </div>
        </div>

        {/* ── 5: TARGET PENGEMBANGAN ── */}
        <div style={S.card}>
          <div style={S.cardTitle}><span style={S.dot} />Edit Aplikasi/Layanan yang Menjadi Target Pengembangan</div>
          <div style={S.divider} />
          <div style={S.grid2}>
            <TextField label="Luar DC JABAR" value={luarDC} onChange={setLuarDC} />
            <TextField label="Layanan Manual" value={layananManual} onChange={setLayananManual} />
          </div>
        </div>

        {/* ── 8: KERENTANAN PEMPROV ── */}
        <div style={S.card}>
          <div style={S.cardTitle}><span style={S.dot} />Edit Kerentanan Pada Aplikasi PEMPROV JABAR</div>
          <div style={S.divider} />
          <TextField label="Jumlah Aplikasi" value={kerentananJumlah} onChange={setKerentananJumlah} />
        </div>

        {/* ── 9: KATALAPS KAB/KOTA ── */}
        <div style={S.card}>
          <div style={S.cardTitle}><span style={S.dot} />Edit KATALAPS Kabupaten Kota</div>
          <div style={S.divider} />
          <div style={S.grid2}>
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
            <div style={S.cardTitle}><span style={S.dot} />Edit Layanan Pengelolaan Email</div>
            <div style={S.divider} />
            <TextField label="Jumlah User (ASN)" value={userAsn} onChange={setUserAsn} />
            <TextField label="Jumlah User (Lainnya)" value={userLain} onChange={setUserLain} />
            <TextField label="Jumlah User Aktif" value={userAktif} onChange={setUserAktif} />
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot} />Edit Layanan Drive JABAR</div>
            <div style={S.divider} />
            <TextField label="Jumlah User" value={driveUser} onChange={setDriveUser} />
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={() => router.push("/pengelolaanaplikasi/dashboard")} style={{ padding: "10px 22px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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