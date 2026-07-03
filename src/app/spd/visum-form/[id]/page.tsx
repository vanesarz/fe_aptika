"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSpdById, fromApiSpdItem } from "@/services/api";

type VisumFormPageProps = {
  params: Promise<{ id: string }>;
};

export default function VisumFormPage({ params }: VisumFormPageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [spd, setSpd] = useState<any>(null);

  // Form states
  const [lokasi, setLokasi] = useState("");
  const [tglBerangkat, setTglBerangkat] = useState("");
  const [tglKedatangan, setTglKedatangan] = useState("");

  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  const [pangkat, setPangkat] = useState("");
  const [jabatan, setJabatan] = useState("");

  const mockItems: Record<string, any> = {
    "1": {
      id: 1,
      tujuan: "Dinas Kominfo Kabupaten Bekasi",
      tglMulai: "2026-07-05",
      tglSelesai: "2026-07-07",
    },
    "2": {
      id: 2,
      tujuan: "Bappeda Provinsi Jawa Barat",
      tglMulai: "2026-07-12",
      tglSelesai: "2026-07-12",
    },
    "3": {
      id: 3,
      tujuan: "Kementerian Kominfo RI, Jakarta",
      tglMulai: "2026-06-20",
      tglSelesai: "2026-06-23",
    },
    "4": {
      id: 4,
      tujuan: "Diskominfo Kota Bandung",
      tglMulai: "2026-07-15",
      tglSelesai: "2026-07-16",
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSpdById(Number(id));
        const item = fromApiSpdItem(res);
        setSpd(item);
        setLokasi(item.tujuan || "");
        setTglBerangkat(item.tglMulai || "");
        setTglKedatangan(item.tglSelesai || "");
      } catch {
        const item = mockItems[id] || mockItems["1"];
        setSpd(item);
        setLokasi(item.tujuan || "");
        setTglBerangkat(item.tglMulai || "");
        setTglKedatangan(item.tglSelesai || "");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCetak = () => {
    if (!lokasi || !tglBerangkat || !tglKedatangan || !nama || !nip || !pangkat || !jabatan) {
      alert("Mohon lengkapi semua field formulir!");
      return;
    }

    const query = new URLSearchParams({
      lokasi,
      tglBerangkat,
      tglKedatangan,
      nama,
      nip,
      pangkat,
      jabatan
    }).toString();

    router.push(`/spd/visum-preview/${id}?${query}`);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Loading data perjalanan...
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: "6px", fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>
        <span>Surat Perjalanan Dinas</span>
        <span>/</span>
        <span style={{ fontWeight: "700", color: "#0f2540" }}>Buat Surat</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f2540", margin: 0 }}>
          Formulir Cetak Nama Penanda Tangan Surat Visum
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
          Lengkapi data penanda tangan.
        </p>
      </div>

      {/* Main card panel */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "32px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "32px"
      }}>
        {/* Section 1: Detail Perjalanan Dinas */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{
              backgroundColor: "#0f2540",
              color: "white",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f2540", margin: 0 }}>
              Detail Perjalanan Dinas
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Lokasi
              </label>
              <input
                type="text"
                placeholder="Kota / Instansi Tujuan"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1e293b",
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Tanggal Berangkat
              </label>
              <input
                type="date"
                value={tglBerangkat}
                onChange={(e) => setTglBerangkat(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1e293b",
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Tanggal Kedatangan
              </label>
              <input
                type="date"
                value={tglKedatangan}
                onChange={(e) => setTglKedatangan(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1e293b",
                  outline: "none"
                }}
              />
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div style={{ height: "1px", backgroundColor: "#f1f5f9" }}></div>

        {/* Section 2: Data Penanda Tangan */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{
              backgroundColor: "#0f2540",
              color: "white",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700"
            }}>
              01
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f2540", margin: 0 }}>
              Data Penanda Tangan
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1e293b",
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                NIP
              </label>
              <input
                type="text"
                placeholder="19XXXXXXXXXXXXXX"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1e293b",
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Pangkat / Gol
              </label>
              <input
                type="text"
                placeholder="Pembina / IVa"
                value={pangkat}
                onChange={(e) => setPangkat(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1e293b",
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Jabatan
              </label>
              <input
                type="text"
                placeholder="Analisis Kebijakan"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1e293b",
                  outline: "none"
                }}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "16px" }}>
          <button
            onClick={() => router.push("/spd")}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "10px 20px"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCetak}
            style={{
              backgroundColor: "#0f2540",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 6px -1px rgba(15, 37, 64, 0.2)"
            }}
          >
            Cetak
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
