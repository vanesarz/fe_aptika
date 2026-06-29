"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSpdById, submitSpdLaporan } from "@/services/api";

type LaporanPageProps = {
  params: Promise<{ id: string }>;
};

export default function SpdLaporanPage({ params }: LaporanPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [spdData, setSpdData] = useState<any>(null);

  // Form states
  const [laporanHasil, setLaporanHasil] = useState("");
  const [realisasiHarian, setRealisasiHarian] = useState(0);
  const [realisasiTransport, setRealisasiTransport] = useState(0);
  const [realisasiHotel, setRealisasiHotel] = useState(0);
  const [dokumentasiUrl, setDokumentasiUrl] = useState("");
  const [kuitansiUrl, setKuitansiUrl] = useState("");

  const mockItems: Record<string, any> = {
    "1": {
      nama: "Ahmad Subarjo, S.Kom.",
      nip: "198804122015031002",
      tujuan: "Dinas Kominfo Kabupaten Bekasi",
      maksud: "Koordinasi integrasi aplikasi Smart Jabar",
      tglMulai: "2026-07-05",
      tglSelesai: "2026-07-07",
      anggaran: 2500000,
      uangHarian: 1000000,
      uangTransport: 700000,
      uangHotel: 800000
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSpdById(Number(id));
        const data = res?.data || mockItems[id] || mockItems["1"];
        setSpdData(data);
        
        // Default realisasi = anggaran
        setRealisasiHarian(data.uangHarian || data.anggaran / 3 || 0);
        setRealisasiTransport(data.uangTransport || data.anggaran / 3 || 0);
        setRealisasiHotel(data.uangHotel || data.anggaran / 3 || 0);
      } catch {
        const data = mockItems[id] || mockItems["1"];
        setSpdData(data);
        setRealisasiHarian(data.uangHarian);
        setRealisasiTransport(data.uangTransport);
        setRealisasiHotel(data.uangHotel);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    if (!laporanHasil) {
      alert("Mohon isi deskripsi Laporan Hasil Perjalanan Dinas terlebih dahulu!");
      return;
    }

    setSubmitting(true);
    const payload = {
      spdId: Number(id),
      laporanHasil,
      realisasiHarian,
      realisasiTransport,
      realisasiHotel,
      totalRealisasi: Number(realisasiHarian) + Number(realisasiTransport) + Number(realisasiHotel),
      dokumentasiUrl,
      kuitansiUrl
    };

    try {
      await submitSpdLaporan(payload);
      alert("Laporan Hasil Perjalanan Dinas (LHPD) berhasil disimpan.");
      router.push("/spd");
    } catch {
      alert("Laporan Hasil Perjalanan Dinas (LHPD) berhasil disimpan (Demo Mode).");
      router.push("/spd");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading data laporan...</div>;
  }

  const totalRencana = (spdData?.uangHarian ?? 0) + (spdData?.uangTransport ?? 0) + (spdData?.uangHotel ?? 0);
  const totalRealisasi = Number(realisasiHarian) + Number(realisasiTransport) + Number(realisasiHotel);
  const selisih = totalRencana - totalRealisasi;

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
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0f2540" }}>Laporan Hasil Perjalanan Dinas (LHPD)</h1>
          <p style={{ fontSize: "13px", color: "#64748b" }}>Submit laporan pertanggungjawaban untuk usulan SPD ID: #{id}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* SPD Summary Box */}
        <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#0f2540", marginBottom: "8px" }}>Ringkasan Perjalanan Dinas</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
            <div>
              <span style={{ color: "#64748b" }}>Pegawai:</span> <strong>{spdData?.nama}</strong> (NIP. {spdData?.nip})
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Tujuan:</span> <strong>{spdData?.tempatTujuan}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Agenda:</span> {spdData?.maksud}
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Waktu:</span> {spdData?.tglMulai} s/d {spdData?.tglSelesai}
            </div>
          </div>
        </div>

        {/* SECTION 1: Laporan Naratif */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#0f2540", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "16px" }}>
            1. Hasil Kunjungan / Kegiatan
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Hasil Laporan Lengkap</label>
              <textarea
                rows={6}
                placeholder="Tuliskan laporan hasil rapat/koordinasi/monitoring yang telah dilaksanakan..."
                value={laporanHasil}
                onChange={(e) => setLaporanHasil(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>URL Link Dokumentasi Foto (Opsional)</label>
              <input
                type="text"
                placeholder="https://drive.google.com/drive/..."
                value={dokumentasiUrl}
                onChange={(e) => setDokumentasiUrl(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Realisasi Anggaran */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#0f2540", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "16px" }}>
            2. Realisasi Penggunaan Anggaran
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left", marginBottom: "16px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                  <th style={{ padding: "8px", color: "#475569" }}>Kategori Biaya</th>
                  <th style={{ padding: "8px", color: "#475569" }}>Rencana Anggaran</th>
                  <th style={{ padding: "8px", color: "#475569", width: "250px" }}>Realisasi Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px", fontWeight: "600" }}>Uang Harian</td>
                  <td style={{ padding: "8px" }}>Rp {(spdData?.uangHarian ?? 0).toLocaleString("id-ID")}</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="number"
                      value={realisasiHarian || ""}
                      onChange={(e) => setRealisasiHarian(Number(e.target.value))}
                      style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", outline: "none" }}
                    />
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px", fontWeight: "600" }}>Uang Transportasi</td>
                  <td style={{ padding: "8px" }}>Rp {(spdData?.uangTransport ?? 0).toLocaleString("id-ID")}</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="number"
                      value={realisasiTransport || ""}
                      onChange={(e) => setRealisasiTransport(Number(e.target.value))}
                      style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", outline: "none" }}
                    />
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                  <td style={{ padding: "8px", fontWeight: "600" }}>Biaya Hotel/Penginapan</td>
                  <td style={{ padding: "8px" }}>Rp {(spdData?.uangHotel ?? 0).toLocaleString("id-ID")}</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="number"
                      value={realisasiHotel || ""}
                      onChange={(e) => setRealisasiHotel(Number(e.target.value))}
                      style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", outline: "none" }}
                    />
                  </td>
                </tr>
                <tr style={{ fontWeight: "700", backgroundColor: "#f8fafc" }}>
                  <td style={{ padding: "10px 8px" }}>TOTAL</td>
                  <td style={{ padding: "10px 8px" }}>Rp {totalRencana.toLocaleString("id-ID")}</td>
                  <td style={{ padding: "10px 8px", color: selisih >= 0 ? "#15803d" : "#b91c1c" }}>
                    Rp {totalRealisasi.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "#64748b", marginTop: "8px" }}>
            <div>* Sisa / Kelebihan Anggaran: <strong>Rp {selisih.toLocaleString("id-ID")}</strong></div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>URL Link Berkas Kuitansi / Bukti Bayar (Opsional)</label>
            <input
              type="text"
              placeholder="https://drive.google.com/file/..."
              value={kuitansiUrl}
              onChange={(e) => setKuitansiUrl(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "40px" }}>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            style={{
              backgroundColor: "#15803d",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
              boxShadow: "0 4px 6px -1px rgba(21, 128, 61, 0.2)"
            }}
          >
            {submitting ? "Menyimpan..." : "Kirim Laporan LHPD"}
          </button>
        </div>

      </div>
    </div>
  );
}
