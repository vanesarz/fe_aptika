"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { getSpdList, deleteSpd, fromApiSpdItem, getDetailPerjalananList, fromApiDetailPerjalanan, updateDetailPerjalananStatus, deleteDetailPerjalanan, updateSpd } from "@/services/api";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGS", "SEP", "OKT", "NOV", "DES"];

const mockSpdData = [
  {
    id: 1,
    nama: "Ahmad Subarjo, S.Kom.",
    nip: "198804122015031002",
    tujuan: "Dinas Kominfo Kabupaten Bekasi",
    maksud: "Koordinasi integrasi aplikasi Smart Jabar",
    tglMulai: "2026-07-05",
    tglSelesai: "2026-07-07",
    status: "DISETUJUI",
    anggaran: 2500000
  },
  {
    id: 2,
    nama: "Dewi Lestari, M.T.",
    nip: "199108242018012003",
    tujuan: "Bappeda Provinsi Jawa Barat",
    maksud: "Rapat koordinasi rekayasa data spasial Jabar",
    tglMulai: "2026-07-12",
    tglSelesai: "2026-07-12",
    status: "DRAF",
    anggaran: 800000
  },
  {
    id: 3,
    nama: "Hendra Gunawan, S.E.",
    nip: "198501152010041001",
    tujuan: "Kementerian Kominfo RI, Jakarta",
    maksud: "Konsultasi regulasi Interoperabilitas SPBE",
    tglMulai: "2026-06-20",
    tglSelesai: "2026-06-23",
    status: "SELESAI",
    anggaran: 6200000
  },
  {
    id: 4,
    nama: "Siti Rahma, S.IP.",
    nip: "199402182020122005",
    tujuan: "Diskominfo Kota Bandung",
    maksud: "Monitoring penggunaan aplikasi Sada Jabar",
    tglMulai: "2026-07-15",
    tglSelesai: "2026-07-16",
    status: "DIAJUKAN",
    anggaran: 1200000
  }
];

export default function SpdDashboardPage() {
  const router = useRouter();
  const [spdList, setSpdList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Modal states for finished travel confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [selectedSpd, setSelectedSpd] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Coba gunakan API baru (detail-perjalanan) terlebih dahulu
        const res = await getDetailPerjalananList();
        if (res?.data && res.data.length > 0) {
          let data = res.data.map(fromApiDetailPerjalanan);
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter((item: any) =>
              (item.tujuan || "").toLowerCase().includes(term) ||
              (item.deskripsi || "").toLowerCase().includes(term) ||
              (item.travelCode || "").toLowerCase().includes(term)
            );
          }
          setSpdList(data);
        } else {
          // Fallback ke API lama
          const res2 = await getSpdList({ search: searchTerm });
          if (res2?.data && res2.data.length > 0) {
            setSpdList(res2.data.map(fromApiSpdItem));
          } else {
            let data = mockSpdData;
            if (searchTerm) {
              const term = searchTerm.toLowerCase();
              data = data.filter(item =>
                item.nama.toLowerCase().includes(term) ||
                item.nip.includes(term) ||
                item.tujuan.toLowerCase().includes(term)
              );
            }
            setSpdList(data.map(fromApiSpdItem));
          }
        }
      } catch {
        // Double fallback ke mock data jika semua API gagal
        let data = mockSpdData;
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          data = data.filter(item =>
            item.nama.toLowerCase().includes(term) ||
            item.nip.includes(term) ||
            item.tujuan.toLowerCase().includes(term)
          );
        }
        setSpdList(data.map(fromApiSpdItem));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data usulan SPD ini?")) {
      try {
        // Coba delete via API baru terlebih dahulu
        await deleteDetailPerjalanan(id);
        setSpdList(prev => prev.filter(item => item.id !== id));
      } catch {
        try {
          await deleteSpd(id);
        } catch {
          // Fallback for mock data deletion
        }
        setSpdList(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  // Chart data calculations
  const chartData = MONTHS.map((m, idx) => {
    const monthIndex = idx + 1;
    // Map mock data and real data to chart based on dates
    const count = spdList.filter(item => {
      const date = new Date(item.tglMulai);
      return date.getMonth() + 1 === monthIndex;
    }).length;

    return {
      name: m,
      "Jumlah Perjalanan": count
    };
  });

  // Calculate statistics
  const totalSpd = spdList.length;
  const drafCount = spdList.filter(item => item.status === "DRAF" || item.status === "BELUM SELESAI").length;
  const diajukanCount = spdList.filter(item => item.status === "DIAJUKAN").length;
  const disetujuiCount = spdList.filter(item => item.status === "DISETUJUI").length;
  const selesaiCount = spdList.filter(item => item.status === "SELESAI").length;

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f2540" }}>Dashboard Surat Perjalanan Dinas (SPD)</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Kelola pengajuan, visum, dan laporan hasil perjalanan dinas Aptika</p>
        </div>
        <button
          onClick={() => router.push("/spd/input")}
          style={{
            backgroundColor: "#1d4ed8",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            boxShadow: "0 4px 6px -1px rgba(29, 78, 216, 0.2)"
          }}
        >
          + Buat Usulan SPD
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total SPD", val: totalSpd, bg: "white", color: "#0f2540", border: "1px solid #e2e8f0" },
          { label: "Draf", val: drafCount, bg: "#f1f5f9", color: "#64748b", border: "none" },
          { label: "Diajukan", val: diajukanCount, bg: "#fef3c7", color: "#d97706", border: "none" },
          { label: "Disetujui", val: disetujuiCount, bg: "#dbeafe", color: "#1d4ed8", border: "none" },
          { label: "Selesai / LHPD", val: selesaiCount, bg: "#dcfce7", color: "#15803d", border: "none" }
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: stat.bg,
              border: stat.border,
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: stat.color, marginTop: "8px" }}>
              {stat.val}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f2540", marginBottom: "16px" }}>Frekuensi Perjalanan Dinas Bulanan</h2>
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="Jumlah Perjalanan" fill="#1d4ed8" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f2540" }}>Daftar Pengajuan SPD</h2>
          
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Cari Pegawai, NIP, atau Tujuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "1px solid #cbd5e1",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                width: "240px",
                outline: "none"
              }}
            />
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>NO</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>ID PERJALANAN</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>TUJUAN</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>DESKRIPSI</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>STATUS</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>Loading data...</td>
                </tr>
              ) : spdList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>Tidak ada data SPD ditemukan.</td>
                </tr>
              ) : (
                spdList.map((item, index) => {
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 8px", color: "#64748b" }}>{index + 1}</td>
                      <td style={{ padding: "12px 8px", color: "#0f2540", fontWeight: "600" }}>{item.travelCode || item.id}</td>
                      <td style={{ padding: "12px 8px", color: "#334155" }}>{item.tujuan}</td>
                      <td style={{ padding: "12px 8px", color: "#334155", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.deskripsi || item.maksud}
                      </td>
<td style={{ textAlign: "center", padding: "12px 8px" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          <label style={{ cursor: "pointer", display: "inline-block", position: "relative" }}>
                            <input
                              type="checkbox"
                              checked={item.status === "SELESAI"}
                              onChange={async () => {
                                setSelectedSpd(item);
                                if (item.status === "SELESAI") {
                                  setShowReopenModal(true);
                                  return;
                                }
                                try {
                                  await updateDetailPerjalananStatus(item.id, "selesai");
                                  router.push(`/spd/visum-form/${item.id}`);
                                } catch {
                                  setShowConfirmModal(true);
                                }
                              }}
                              style={{ display: "none" }}
                            />
                            <span style={{
                              display: "inline-block",
                              width: "20px",
                              height: "20px",
                              border: item.status === "SELESAI" ? "none" : "2px solid #cbd5e1",
                              borderRadius: "4px",
                              backgroundColor: item.status === "SELESAI" ? "#6d28d9" : "transparent",
                              position: "relative",
                              transition: "all 0.2s ease"
                            }}>
                              {item.status === "SELESAI" && (
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="white"
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{
                                    position: "absolute",
                                    top: "2px",
                                    left: "2px",
                                    width: "16px",
                                    height: "16px"
                                  }}
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </span>
                          </label>
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => router.push(`/spd/print/${item.id}`)}
                            title="Cetak"
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#1d4ed8",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 6 2 18 2 18 9"></polyline>
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                              <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                          </button>
                          <button
                            onClick={() => router.push(`/spd/edit/${item.id}`)}
                            title="Edit"
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#475569",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                            style={{
                              backgroundColor: "#fecaca",
                              color: "#dc2626",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal Konfirmasi Selesai Perjalanan */}
      {showConfirmModal && selectedSpd && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "32px",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            textAlign: "left"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#0f2540",
              marginBottom: "16px"
            }}>
              Konfirmasi Selesai Perjalanan
            </h3>
            <p style={{
              fontSize: "14px",
              color: "#64748b",
              lineHeight: "1.6",
              marginBottom: "24px"
            }}>
              Apakah Anda yakin ingin menyelesaikan perjalanan dinas ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedSpd(null);
                }}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #cbd5e1",
                  color: "#475569",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Tidak
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  router.push(`/spd/visum-form/${selectedSpd.id}`);
                }}
                style={{
                  backgroundColor: "#0f2540",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px -1px rgba(15, 37, 64, 0.2)"
                }}
              >
                Iya, Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Buka Kembali Perjalanan */}
      {showReopenModal && selectedSpd && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "32px",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            textAlign: "left"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#0f2540",
              marginBottom: "16px"
            }}>
              Konfirmasi Buka Kembali Perjalanan
            </h3>
            <p style={{
              fontSize: "14px",
              color: "#64748b",
              lineHeight: "1.6",
              marginBottom: "24px"
            }}>
              Apakah Anda yakin ingin membuka kembali perjalanan dinas ini? Status akan dikembalikan menjadi DISETUJUI.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => {
                  setShowReopenModal(false);
                  setSelectedSpd(null);
                }}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #cbd5e1",
                  color: "#475569",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  setShowReopenModal(false);
                  try {
                    await updateSpd(selectedSpd.id, { status: "approved" });
                    // Refresh data
                    const res = await getSpdList({ search: searchTerm });
                    if (res?.data) {
                      setSpdList(res.data.map(fromApiSpdItem));
                    } else {
                      setSpdList([]);
                    }
                  } catch (err) {
                    console.error("Gagal membuka kembali SPD:", err);
                    alert("Gagal membuka kembali SPD.");
                  } finally {
                    setSelectedSpd(null);
                  }
                }}
                style={{
                  backgroundColor: "#0f2540",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px -1px rgba(15, 37, 64, 0.2)"
                }}
              >
                Ya, Buka Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
