"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSpd } from "@/services/api";

export default function SpdInputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [pejabatPemberi, setPejabatPemberi] = useState("Kepala Dinas Komunikasi dan Informatika Provinsi Jawa Barat");
  const [namaPegawai, setNamaPegawai] = useState("");
  const [nipPegawai, setNipPegawai] = useState("");
  const [pangkatPegawai, setPangkatPegawai] = useState("");
  const [jabatanPegawai, setJabatanPegawai] = useState("");
  const [maksudPerjalanan, setMaksudPerjalanan] = useState("");
  const [angkutan, setAngkutan] = useState("Kendaraan Dinas");
  const [tempatBerangkat, setTempatBerangkat] = useState("Bandung");
  const [tempatTujuan, setTempatTujuan] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  const [durasiHari, setDurasiHari] = useState(0);

  // Companions (Pengikut)
  const [pengikut, setPengikut] = useState<any[]>([]);

  // Budget
  const [uangHarian, setUangHarian] = useState(0);
  const [uangTransport, setUangTransport] = useState(0);
  const [uangHotel, setUangHotel] = useState(0);

  // Auto calculate duration in days
  useEffect(() => {
    if (tglMulai && tglSelesai) {
      const dStart = new Date(tglMulai);
      const dEnd = new Date(tglSelesai);
      const diffTime = Math.abs(dEnd.getTime() - dStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
      setDurasiHari(isNaN(diffDays) ? 0 : diffDays);
    } else {
      setDurasiHari(0);
    }
  }, [tglMulai, tglSelesai]);

  const addPengikut = () => {
    setPengikut(prev => [...prev, { nama: "", tglLahir: "", keterangan: "" }]);
  };

  const removePengikut = (index: number) => {
    setPengikut(prev => prev.filter((_, idx) => idx !== index));
  };

  const handlePengikutChange = (index: number, field: string, value: string) => {
    const updated = [...pengikut];
    updated[index][field] = value;
    setPengikut(updated);
  };

  const handleSubmit = async (status: string) => {
    if (!namaPegawai || !nipPegawai || !tempatTujuan || !tglMulai || !tglSelesai) {
      alert("Mohon lengkapi data pegawai utama, tempat tujuan, dan tanggal perjalanan!");
      return;
    }

    setLoading(true);
    const payload = {
      pejabatPemberi,
      nama: namaPegawai,
      nip: nipPegawai,
      pangkat: pangkatPegawai,
      jabatan: jabatanPegawai,
      maksud: maksudPerjalanan,
      angkutan,
      tempatBerangkat,
      tempatTujuan,
      tglMulai,
      tglSelesai,
      durasi: durasiHari,
      pengikut,
      anggaran: Number(uangHarian) + Number(uangTransport) + Number(uangHotel),
      status
    };

    try {
      await createSpd(payload);
      alert(status === "DRAF" ? "Usulan berhasil disimpan sebagai DRAF." : "Usulan berhasil DIAJUKAN.");
      router.push("/spd");
    } catch {
      // Fallback for demo
      alert(status === "DRAF" ? "Usulan berhasil disimpan sebagai DRAF (Demo Mode)." : "Usulan berhasil DIAJUKAN (Demo Mode).");
      router.push("/spd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <button
          onClick={() => router.push("/spd")}
          style={{
            backgroundColor: "white",
            border: "1px solid #cbd5e1",
            color: "#475569",
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          &larr; Kembali
        </button>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0f2540" }}>Buat Pengajuan Usulan SPD</h1>
          <p style={{ fontSize: "13px", color: "#64748b" }}>Isi detail surat perjalanan dinas untuk diajukan persetujuan pimpinan</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* SECTION 1: Detail Pemberi & Penerima Perintah */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#0f2540", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "16px" }}>
            1. Pihak Terlibat
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Pejabat Pemberi Perintah</label>
              <input
                type="text"
                value={pejabatPemberi}
                onChange={(e) => setPejabatPemberi(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Nama Pegawai yang Diperintah</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap..."
                  value={namaPegawai}
                  onChange={(e) => setNamaPegawai(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>NIP Pegawai</label>
                <input
                  type="text"
                  placeholder="Masukkan NIP..."
                  value={nipPegawai}
                  onChange={(e) => setNipPegawai(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Pangkat / Golongan</label>
                <input
                  type="text"
                  placeholder="Contoh: Penata / IIIc..."
                  value={pangkatPegawai}
                  onChange={(e) => setPangkatPegawai(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Jabatan / Instansi</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengelola Sistem SPBE..."
                  value={jabatanPegawai}
                  onChange={(e) => setJabatanPegawai(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Detail Perjalanan */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#0f2540", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "16px" }}>
            2. Rincian Perjalanan
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Maksud Perjalanan Dinas</label>
              <textarea
                rows={3}
                placeholder="Tuliskan tujuan dan agenda tugas kedinasan..."
                value={maksudPerjalanan}
                onChange={(e) => setMaksudPerjalanan(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Tempat Berangkat</label>
                <input
                  type="text"
                  value={tempatBerangkat}
                  onChange={(e) => setTempatBerangkat(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Tempat Tujuan</label>
                <input
                  type="text"
                  placeholder="Masukkan dinas/kota tujuan..."
                  value={tempatTujuan}
                  onChange={(e) => setTempatTujuan(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Alat Transportasi</label>
                <select
                  value={angkutan}
                  onChange={(e) => setAngkutan(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", backgroundColor: "white" }}
                >
                  <option value="Kendaraan Dinas">Kendaraan Dinas Dinas</option>
                  <option value="Pesawat Udara">Pesawat Udara</option>
                  <option value="Kereta Api">Kereta Api</option>
                  <option value="Kendaraan Darat Lainnya">Kendaraan Darat Lainnya</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.5fr", gap: "12px", alignItems: "end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Tgl Mulai</label>
                  <input
                    type="date"
                    value={tglMulai}
                    onChange={(e) => setTglMulai(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Tgl Selesai</label>
                  <input
                    type="date"
                    value={tglSelesai}
                    onChange={(e) => setTglSelesai(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div style={{ paddingBottom: "10px", fontWeight: "700", color: "#1d4ed8", fontSize: "15px" }}>
                  {durasiHari} Hari
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Pengikut (Companions) */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#0f2540" }}>3. Pengikut Perjalanan (Opsional)</h2>
            <button
              type="button"
              onClick={addPengikut}
              style={{
                backgroundColor: "#f1f5f9",
                border: "1px solid #cbd5e1",
                color: "#475569",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              + Tambah Pengikut
            </button>
          </div>

          {pengikut.length === 0 ? (
            <p style={{ textAlign: "center", padding: "12px", color: "#94a3b8", fontSize: "13px" }}>Tidak ada pengikut perjalanan.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pengikut.map((item, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr auto", gap: "12px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Nama Pengikut..."
                    value={item.nama}
                    onChange={(e) => handlePengikutChange(idx, "nama", e.target.value)}
                    style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none" }}
                  />
                  <input
                    type="date"
                    value={item.tglLahir}
                    onChange={(e) => handlePengikutChange(idx, "tglLahir", e.target.value)}
                    style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none" }}
                  />
                  <input
                    type="text"
                    placeholder="Keterangan (Hubungan/Status)..."
                    value={item.keterangan}
                    onChange={(e) => handlePengikutChange(idx, "keterangan", e.target.value)}
                    style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => removePengikut(idx)}
                    style={{
                      backgroundColor: "#fecaca",
                      color: "#dc2626",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "700"
                    }}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: Estimasi Anggaran */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#0f2540", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "16px" }}>
            4. Anggaran Perjalanan Dinas (Rencana)
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Uang Harian (Total)</label>
              <input
                type="number"
                placeholder="Rp..."
                value={uangHarian || ""}
                onChange={(e) => setUangHarian(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Biaya Transportasi</label>
              <input
                type="number"
                placeholder="Rp..."
                value={uangTransport || ""}
                onChange={(e) => setUangTransport(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Biaya Hotel/Penginapan</label>
              <input
                type="number"
                placeholder="Rp..."
                value={uangHotel || ""}
                onChange={(e) => setUangHotel(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", fontWeight: "700", color: "#0f2540", fontSize: "15px" }}>
            Total Rencana Anggaran: Rp {(Number(uangHarian) + Number(uangTransport) + Number(uangHotel)).toLocaleString("id-ID")}
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px", marginBottom: "40px" }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit("DRAF")}
            style={{
              backgroundColor: "#f1f5f9",
              border: "1px solid #cbd5e1",
              color: "#475569",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Simpan Draf
          </button>
          
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit("DIAJUKAN")}
            style={{
              backgroundColor: "#1d4ed8",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
              boxShadow: "0 4px 6px -1px rgba(29, 78, 216, 0.2)"
            }}
          >
            {loading ? "Mengajukan..." : "Ajukan SPD"}
          </button>
        </div>

      </div>
    </div>
  );
}
