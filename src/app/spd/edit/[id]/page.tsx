"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSpdById, updateSpd } from "@/services/api";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default function SpdEditPage({ params }: EditPageProps) {
  const router = useRouter();
  const { id } = use(params); // Next.js App Router dynamic route parameter resolver
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [noSpd, setNoSpd] = useState("");
  const [pejabatPemberi, setPejabatPemberi] = useState("");
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

  const mockItems: Record<string, any> = {
    "1": {
      pejabatPemberi: "Kepala Dinas Komunikasi dan Informatika Provinsi Jawa Barat",
      nama: "Ahmad Subarjo, S.Kom.",
      nip: "198804122015031002",
      pangkat: "Penata / IIIc",
      jabatan: "Pengelola Sistem SPBE",
      maksud: "Koordinasi integrasi aplikasi Smart Jabar",
      angkutan: "Kendaraan Dinas",
      tempatBerangkat: "Bandung",
      tempatTujuan: "Dinas Kominfo Kabupaten Bekasi",
      tglMulai: "2026-07-05",
      tglSelesai: "2026-07-07",
      pengikut: [{ nama: "Dani Darmawan", tglLahir: "1994-05-12", keterangan: "Staf Teknis" }],
      uangHarian: 1000000,
      uangTransport: 700000,
      uangHotel: 800000,
      status: "DISETUJUI"
    },
    "2": {
      pejabatPemberi: "Kepala Dinas Komunikasi dan Informatika Provinsi Jawa Barat",
      nama: "Dewi Lestari, M.T.",
      nip: "199108242018012003",
      pangkat: "Penata Muda Tk. I / IIIb",
      jabatan: "Analisi Data Spasial",
      maksud: "Rapat koordinasi rekayasa data spasial Jabar",
      angkutan: "Kendaraan Darat Lainnya",
      tempatBerangkat: "Bandung",
      tempatTujuan: "Bappeda Provinsi Jawa Barat",
      tglMulai: "2026-07-12",
      tglSelesai: "2026-07-12",
      pengikut: [],
      uangHarian: 300000,
      uangTransport: 500000,
      uangHotel: 0,
      status: "DRAF"
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSpdById(Number(id));
        const data = res?.data || mockItems[id] || mockItems["1"];
        
        setNoSpd(data.noSpd || "");
        setPejabatPemberi(data.pejabatPemberi || "Kepala Dinas Komunikasi dan Informatika Provinsi Jawa Barat");
        setNamaPegawai(data.nama);
        setNipPegawai(data.nip);
        setPangkatPegawai(data.pangkat || "");
        setJabatanPegawai(data.jabatan || "");
        setMaksudPerjalanan(data.maksud);
        setAngkutan(data.angkutan || "Kendaraan Dinas");
        setTempatBerangkat(data.tempatBerangkat || "Bandung");
        setTempatTujuan(data.tempatTujuan);
        setTglMulai(data.tglMulai);
        setTglSelesai(data.tglSelesai);
        setPengikut(data.pengikut || []);
        
        // Split or map budget if backend stores combined total
        setUangHarian(data.uangHarian || data.anggaran / 3 || 0);
        setUangTransport(data.uangTransport || data.anggaran / 3 || 0);
        setUangHotel(data.uangHotel || data.anggaran / 3 || 0);
      } catch {
        const data = mockItems[id] || mockItems["1"];
        setNoSpd(data.noSpd || "");
        setPejabatPemberi(data.pejabatPemberi);
        setNamaPegawai(data.nama);
        setNipPegawai(data.nip);
        setPangkatPegawai(data.pangkat);
        setJabatanPegawai(data.jabatan);
        setMaksudPerjalanan(data.maksud);
        setAngkutan(data.angkutan);
        setTempatBerangkat(data.tempatBerangkat);
        setTempatTujuan(data.tempatTujuan);
        setTglMulai(data.tglMulai);
        setTglSelesai(data.tglSelesai);
        setPengikut(data.pengikut);
        setUangHarian(data.uangHarian);
        setUangTransport(data.uangTransport);
        setUangHotel(data.uangHotel);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (tglMulai && tglSelesai) {
      const dStart = new Date(tglMulai);
      const dEnd = new Date(tglSelesai);
      const diffTime = Math.abs(dEnd.getTime() - dStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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

    setSubmitting(true);
    const payload = {
      noSpd,
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
      await updateSpd(Number(id), payload);
      alert("Data usulan SPD berhasil diperbarui.");
      router.push("/spd");
    } catch {
      alert("Data usulan SPD berhasil diperbarui (Demo Mode).");
      router.push("/spd");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading data usulan SPD...</div>;
  }

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
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0f2540" }}>Edit Pengajuan Usulan SPD</h1>
          <p style={{ fontSize: "13px", color: "#64748b" }}>Perbarui detail usulan perjalanan dinas ID: #{id}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* SECTION 1: Detail Pemberi & Penerima */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#0f2540", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "16px" }}>
            1. Pihak Terlibat
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Nomor Surat</label>
              <input
                type="text"
                placeholder="Contoh: 1818/KOM.03.01.08/APTIKA"
                value={noSpd}
                onChange={(e) => setNoSpd(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>

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
                  value={namaPegawai}
                  onChange={(e) => setNamaPegawai(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>NIP Pegawai</label>
                <input
                  type="text"
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
                  value={pangkatPegawai}
                  onChange={(e) => setPangkatPegawai(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Jabatan / Instansi</label>
                <input
                  type="text"
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
                  <option value="Kendaraan Dinas">Kendaraan Dinas</option>
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

        {/* SECTION 3: Pengikut */}
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

        {/* SECTION 4: Anggaran */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#0f2540", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "16px" }}>
            4. Anggaran Perjalanan Dinas (Rencana)
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Uang Harian (Total)</label>
              <input
                type="number"
                value={uangHarian || ""}
                onChange={(e) => setUangHarian(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Biaya Transportasi</label>
              <input
                type="number"
                value={uangTransport || ""}
                onChange={(e) => setUangTransport(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Biaya Hotel/Penginapan</label>
              <input
                type="number"
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
            disabled={submitting}
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
            Simpan Perubahan
          </button>
          
          <button
            type="button"
            disabled={submitting}
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
            {submitting ? "Menyimpan..." : "Ajukan Kembali Usulan"}
          </button>
        </div>

      </div>
    </div>
  );
}
