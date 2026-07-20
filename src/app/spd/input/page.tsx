"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createDetailPerjalanan,
  getPegawaiList,
  createPegawai,
  createSpdPeserta,
  getRekeningList,
} from "@/services/api";

type StaffRow = { nama: string; nip: string; pangkat: string; jabatan: string };

const emptyStaff = (): StaffRow => ({ nama: "", nip: "", pangkat: "", jabatan: "" });

const formatRupiah = (val: number) =>
  val ? "Rp " + val.toLocaleString("id-ID") : "";

export default function SpdInputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ── [1] DETAIL PERJALANAN ─────────────────────────────
  const [kegiatan, setKegiatan] = useState("");
  const [subKegiatan, setSubKegiatan] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [tglBerangkat, setTglBerangkat] = useState("");
  const [tglKembali, setTglKembali] = useState("");
  const [uangHarian, setUangHarian] = useState<number>(0);
  const [rekeningId, setRekeningId] = useState<number | "">("");
  const [alatAngkutan, setAlatAngkutan] = useState("Kendaraan Dinas");
  const [deskripsi, setDeskripsi] = useState("");

  // ── [2] KABID (opsional, hanya 1) ────────────────────
  const [includeKabid, setIncludeKabid] = useState(false);
  const [kabid, setKabid] = useState<StaffRow>(emptyStaff());

  // ── [3] STAFF (min 1, maks 4) ────────────────────────
  const [staffList, setStaffList] = useState<StaffRow[]>([emptyStaff()]);

  // ── Data dari API ─────────────────────────────────────
  const [rekeningOptions, setRekeningOptions] = useState<any[]>([]);
  const [pegawaiOptions, setPegawaiOptions] = useState<any[]>([]);

  // ── Kalkulasi ─────────────────────────────────────────
  const lamaHari =
    tglBerangkat && tglKembali
      ? Math.max(
          1,
          Math.ceil(
            (new Date(tglKembali).getTime() - new Date(tglBerangkat).getTime()) /
              86400000
          ) + 1
        )
      : 0;

  const totalKabid = includeKabid && lamaHari ? lamaHari * uangHarian : 0;
  const validStaff = staffList.filter((s) => s.nama.trim());
  const totalStaff = validStaff.length * lamaHari * uangHarian;
  const grandTotal = totalKabid + totalStaff;

  // ── Fetch data rekening & pegawai ─────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rRes = await getRekeningList();
        setRekeningOptions(Array.isArray(rRes?.data) ? rRes.data : []);
      } catch {
        setRekeningOptions([]);
      }
      try {
        const pRes = await getPegawaiList();
        setPegawaiOptions(Array.isArray(pRes?.data) ? pRes.data : []);
      } catch {
        setPegawaiOptions([]);
      }
    };
    fetchData();
  }, []);

  // ── Staff handlers ────────────────────────────────────
  const addStaff = () => {
    if (staffList.length < 4) setStaffList((p) => [...p, emptyStaff()]);
  };
  const removeStaff = (i: number) =>
    setStaffList((p) => p.filter((_, idx) => idx !== i));
  const updateStaff = (i: number, field: keyof StaffRow, value: string) => {
    const updated = [...staffList];
    updated[i] = { ...updated[i], [field]: value };
    setStaffList(updated);
  };

  // ── Auto-fill from pegawai list ───────────────────────
  const autofillKabid = (nip: string) => {
    const found = pegawaiOptions.find((p) => p.nip === nip);
    if (found)
      setKabid({ nama: found.nama, nip: found.nip, pangkat: found.pangkat, jabatan: found.jabatan });
  };
  const autofillStaff = (i: number, nip: string) => {
    const found = pegawaiOptions.find((p) => p.nip === nip);
    if (found) {
      const updated = [...staffList];
      updated[i] = { nama: found.nama, nip: found.nip, pangkat: found.pangkat, jabatan: found.jabatan };
      setStaffList(updated);
    }
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async () => {
    const validS = staffList.filter((s) => s.nama.trim() && s.nip.trim());
    if (!kegiatan || !tujuan || !tglBerangkat || !tglKembali) {
      alert("Mohon lengkapi data detail perjalanan!");
      return;
    }
    if (validS.length < 1) {
      alert("Minimal 1 staff harus diisi!");
      return;
    }
    setLoading(true);
    let step = "init";
    try {
      // Step 1: Ambil daftar pegawai
      step = "getPegawaiList";
      const pRes = await getPegawaiList();
      const currentList: any[] = Array.isArray(pRes?.data) ? pRes.data : [];

      const getOrCreatePegawai = async (row: StaffRow, role: "kabid" | "staff") => {
        const existing = currentList.find((p) => p.nip === row.nip);
        if (existing) return existing.id as number;
        step = `createPegawai(${row.nama})`;
        const created = await createPegawai({
          nama: row.nama,
          nip: row.nip,
          pangkat: row.pangkat || "Golongan III",
          jabatan: row.jabatan || (role === "kabid" ? "Kepala Bidang" : "Staf"),
          tanggal_lahir: "1990-01-01",
          role,
        });
        return (created?.data?.id ?? created?.id) as number;
      };

      const participantIds: number[] = [];

      if (includeKabid && kabid.nama && kabid.nip) {
        const id = await getOrCreatePegawai(kabid, "kabid");
        participantIds.push(id);
      }
      for (const s of validS) {
        const id = await getOrCreatePegawai(s, "staff");
        participantIds.push(id);
      }

      // Step 2: Buat detail perjalanan
      step = "createDetailPerjalanan";
      const detailPayload: any = {
        kegiatan,
        sub_kegiatan: subKegiatan || kegiatan,
        tujuan,
        tanggal_berangkat: tglBerangkat,
        tanggal_kembali: tglKembali,
        uang_harian: uangHarian,
        alat_angkutan: alatAngkutan,
        deskripsi,
      };
      if (rekeningId) detailPayload.rekening_id = rekeningId;

      const detailRes = await createDetailPerjalanan(detailPayload);
      const detailId: number = detailRes?.data?.id ?? detailRes?.id;

      // Step 3: Daftarkan peserta
      step = "createSpdPeserta";
      if (detailId && participantIds.length > 0) {
        await createSpdPeserta({ detail_perjalanan_id: detailId, pegawai_id: participantIds });
      }

      alert("Usulan SPD berhasil diajukan!");
      router.push("/spd");
    } catch (err: any) {
      const apiData = err?.response?.data;
      const apiMsg =
        (typeof apiData?.errors === "string" ? apiData.errors : JSON.stringify(apiData?.errors)) ||
        apiData?.message ||
        err?.message ||
        "Unknown error";
      console.error(`[STEP: ${step}] Error:`, JSON.stringify(apiData, null, 2));
      alert(`Gagal di step: ${step}\n\nError: ${apiMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────
  const card: React.CSSProperties = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f2540",
    borderBottom: "2px solid #f1f5f9",
    paddingBottom: "10px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };
  const label: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    color: "#0f2540",
    backgroundColor: "white",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };
  const select: React.CSSProperties = { ...input, cursor: "pointer" };
  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };
  const grid4: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "960px", margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
        <button
          onClick={() => router.push("/spd")}
          style={{ backgroundColor: "white", border: "1px solid #e2e8f0", color: "#475569", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
        >
          ← Kembali
        </button>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f2540", margin: 0 }}>
            Buat Usulan SPD
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
            Isi semua bagian berikut untuk mengajukan Surat Perjalanan Dinas
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 1: Detail Perjalanan                   */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={card}>
          <h2 style={sectionTitle}>
            <span style={{ background: "#0f2540", color: "white", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>1</span>
            Detail Perjalanan Dinas
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Kegiatan & Sub Kegiatan */}
            <div style={grid2}>
              <div>
                <label style={label}>Kegiatan <span style={{ color: "red" }}>*</span></label>
                <input style={input} placeholder="Contoh: Workshop AI Nasional" value={kegiatan} onChange={(e) => setKegiatan(e.target.value)} />
              </div>
              <div>
                <label style={label}>Sub Kegiatan</label>
                <input style={input} placeholder="Contoh: Pelatihan Penggunaan AI" value={subKegiatan} onChange={(e) => setSubKegiatan(e.target.value)} />
              </div>
            </div>

            {/* Tujuan */}
            <div>
              <label style={label}>Tujuan (Instansi / Kota) <span style={{ color: "red" }}>*</span></label>
              <input style={input} placeholder="Contoh: Kementerian Kominfo RI, Jakarta" value={tujuan} onChange={(e) => setTujuan(e.target.value)} />
            </div>

            {/* Tanggal & Durasi */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", alignItems: "end" }}>
              <div>
                <label style={label}>Tanggal Berangkat <span style={{ color: "red" }}>*</span></label>
                <input style={input} type="date" value={tglBerangkat} onChange={(e) => setTglBerangkat(e.target.value)} />
              </div>
              <div>
                <label style={label}>Tanggal Kembali <span style={{ color: "red" }}>*</span></label>
                <input style={input} type="date" value={tglKembali} min={tglBerangkat} onChange={(e) => setTglKembali(e.target.value)} />
              </div>
              <div style={{ paddingBottom: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "2px" }}>Durasi</div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: lamaHari > 0 ? "#1d4ed8" : "#cbd5e1" }}>
                  {lamaHari > 0 ? `${lamaHari} Hari` : "—"}
                </div>
              </div>
            </div>

            {/* Uang Harian & Rekening & Angkutan */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: "16px" }}>
              <div>
                <label style={label}>Uang Harian (Rp)</label>
                <input
                  style={input}
                  type="number"
                  min={0}
                  placeholder="450000"
                  value={uangHarian || ""}
                  onChange={(e) => setUangHarian(Number(e.target.value))}
                />
              </div>
              <div>
                <label style={label}>Kode Rekening</label>
                <select style={select} value={rekeningId} onChange={(e) => setRekeningId(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">— Pilih Rekening —</option>
                  {rekeningOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.kode_rekening} · {r.nomor_rekening} · {r.nama_rekening}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>Alat Angkutan</label>
                <select style={select} value={alatAngkutan} onChange={(e) => setAlatAngkutan(e.target.value)}>
                  <option>Kendaraan Dinas</option>
                  <option>Pesawat Udara</option>
                  <option>Kereta Api</option>
                  <option>Kapal Laut</option>
                  <option>Kendaraan Darat Lainnya</option>
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label style={label}>Deskripsi / Maksud Perjalanan</label>
              <textarea
                style={{ ...input, resize: "none" }}
                rows={3}
                placeholder="Tuliskan ringkasan tujuan dan agenda perjalanan dinas..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 2: Kabid (Opsional, hanya 1)          */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={card}>
          <h2 style={sectionTitle}>
            <span style={{ background: "#7c3aed", color: "white", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>2</span>
            SPD Kepala Bidang (Kabid)
            <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 500, color: "#64748b" }}>Opsional</span>
          </h2>

          {/* Toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: includeKabid ? "20px" : "0", cursor: "pointer", userSelect: "none" }}>
            <div
              onClick={() => setIncludeKabid(!includeKabid)}
              style={{
                width: 44, height: 24, borderRadius: 12,
                backgroundColor: includeKabid ? "#7c3aed" : "#cbd5e1",
                position: "relative", cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: includeKabid ? 23 : 3,
                width: 18, height: 18, borderRadius: "50%", background: "white",
                transition: "left 0.2s",
              }} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
              {includeKabid ? "Kabid ikut dalam perjalanan ini" : "Kabid tidak ikut"}
            </span>
          </label>

          {includeKabid && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Autocomplete pilih dari daftar */}
              <div>
                <label style={label}>Pilih dari Daftar Pegawai (NIP)</label>
                <select style={select} onChange={(e) => autofillKabid(e.target.value)} defaultValue="">
                  <option value="">— Ketik manual atau pilih dari daftar —</option>
                  {pegawaiOptions.filter((p) => p.role === "kabid").map((p) => (
                    <option key={p.id} value={p.nip}>{p.nama} — {p.jabatan}</option>
                  ))}
                </select>
              </div>
              <div style={grid2}>
                <div>
                  <label style={label}>Nama <span style={{ color: "red" }}>*</span></label>
                  <input style={input} placeholder="Nama lengkap..." value={kabid.nama} onChange={(e) => setKabid({ ...kabid, nama: e.target.value })} />
                </div>
                <div>
                  <label style={label}>NIP <span style={{ color: "red" }}>*</span></label>
                  <input style={input} placeholder="18 digit NIP..." value={kabid.nip} onChange={(e) => setKabid({ ...kabid, nip: e.target.value })} />
                </div>
              </div>
              <div style={grid2}>
                <div>
                  <label style={label}>Pangkat / Golongan</label>
                  <input style={input} placeholder="Contoh: Pembina / IVa" value={kabid.pangkat} onChange={(e) => setKabid({ ...kabid, pangkat: e.target.value })} />
                </div>
                <div>
                  <label style={label}>Jabatan</label>
                  <input style={input} placeholder="Contoh: Kepala Bidang Aptika" value={kabid.jabatan} onChange={(e) => setKabid({ ...kabid, jabatan: e.target.value })} />
                </div>
              </div>
              {lamaHari > 0 && uangHarian > 0 && (
                <div style={{ backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "8px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#5b21b6" }}>{lamaHari} hari × {formatRupiah(uangHarian)}</span>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#4c1d95" }}>{formatRupiah(totalKabid)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 3: Staff (min 1, maks 4)              */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={card}>
          <h2 style={sectionTitle}>
            <span style={{ background: "#0891b2", color: "white", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>3</span>
            SPD Staff (Min. 1, Maks. 4)
            <span style={{ marginLeft: "auto", fontSize: "12px", color: "#0891b2", fontWeight: "600" }}>
              {staffList.length}/4 Staff · 1 No. SPD Bersama
            </span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {staffList.map((s, i) => (
              <div key={i} style={{ padding: "16px", border: "1px solid #e0f2fe", borderRadius: "10px", backgroundColor: "#f0f9ff", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0369a1" }}>Staff #{i + 1}</span>
                  {staffList.length > 1 && (
                    <button
                      onClick={() => removeStaff(i)}
                      style={{ background: "none", border: "none", color: "#ef4444", fontSize: "18px", cursor: "pointer", padding: "0 4px" }}
                    >×</button>
                  )}
                </div>

                {/* Autocomplete */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={label}>Pilih dari Daftar Pegawai</label>
                  <select style={select} onChange={(e) => autofillStaff(i, e.target.value)} defaultValue="">
                    <option value="">— Pilih untuk auto-isi —</option>
                    {pegawaiOptions.filter((p) => p.role === "staff").map((p) => (
                      <option key={p.id} value={p.nip}>{p.nama} — {p.jabatan}</option>
                    ))}
                  </select>
                </div>

                <div style={grid2}>
                  <div>
                    <label style={label}>Nama <span style={{ color: "red" }}>*</span></label>
                    <input style={input} placeholder="Nama lengkap..." value={s.nama} onChange={(e) => updateStaff(i, "nama", e.target.value)} />
                  </div>
                  <div>
                    <label style={label}>NIP <span style={{ color: "red" }}>*</span></label>
                    <input style={input} placeholder="18 digit NIP..." value={s.nip} onChange={(e) => updateStaff(i, "nip", e.target.value)} />
                  </div>
                </div>
                <div style={{ ...grid2, marginTop: "12px" }}>
                  <div>
                    <label style={label}>Pangkat / Golongan</label>
                    <input style={input} placeholder="Contoh: Penata / IIIc" value={s.pangkat} onChange={(e) => updateStaff(i, "pangkat", e.target.value)} />
                  </div>
                  <div>
                    <label style={label}>Jabatan</label>
                    <input style={input} placeholder="Contoh: Pranata Komputer" value={s.jabatan} onChange={(e) => updateStaff(i, "jabatan", e.target.value)} />
                  </div>
                </div>
                {lamaHari > 0 && uangHarian > 0 && (
                  <div style={{ marginTop: "12px", backgroundColor: "#e0f2fe", borderRadius: "6px", padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#0369a1" }}>{lamaHari} hari × {formatRupiah(uangHarian)}</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#0c4a6e" }}>{formatRupiah(lamaHari * uangHarian)}</span>
                  </div>
                )}
              </div>
            ))}

            {staffList.length < 4 && (
              <button
                onClick={addStaff}
                style={{ border: "2px dashed #bae6fd", borderRadius: "10px", backgroundColor: "transparent", padding: "14px", color: "#0891b2", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
              >
                + Tambah Staff (Maks. 4)
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* RINGKASAN TOTAL                               */}
        {/* ═══════════════════════════════════════════════ */}
        {lamaHari > 0 && uangHarian > 0 && (
          <div style={{ backgroundColor: "#0f2540", borderRadius: "12px", padding: "20px 24px", color: "white" }}>
            <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Ringkasan Perhitungan</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", opacity: 0.85 }}>
                <span>Durasi Perjalanan</span>
                <span style={{ fontWeight: "600" }}>{lamaHari} hari</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", opacity: 0.85 }}>
                <span>Uang Harian</span>
                <span style={{ fontWeight: "600" }}>{formatRupiah(uangHarian)}</span>
              </div>
              {includeKabid && kabid.nama && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", opacity: 0.85 }}>
                  <span>Kabid ({kabid.nama || "—"})</span>
                  <span style={{ fontWeight: "600" }}>{formatRupiah(totalKabid)}</span>
                </div>
              )}
              {validStaff.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", opacity: 0.85 }}>
                  <span>Staff ({validStaff.length} orang)</span>
                  <span style={{ fontWeight: "600" }}>{formatRupiah(totalStaff)}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: "8px", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "800" }}>
                <span>Total Anggaran</span>
                <span style={{ color: "#7dd3fc" }}>{formatRupiah(grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* ACTION BUTTONS                                 */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingBottom: "40px" }}>
          <button
            onClick={() => router.push("/spd")}
            style={{ padding: "12px 24px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "white", color: "#475569", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
          >
            Batal
          </button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            style={{
              padding: "12px 32px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: loading ? "#93c5fd" : "#0f2540",
              color: "white",
              fontWeight: "700",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {loading && (
              <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {loading ? "Menyimpan..." : "Ajukan SPD"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus, select:focus, textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
      `}</style>
    </div>
  );
}
