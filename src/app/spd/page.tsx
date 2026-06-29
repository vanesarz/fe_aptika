"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from "recharts";
import { getSpdList, deleteSpd } from "@/services/api";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGS", "SEP", "OKT", "NOV", "DES"];

export default function SpdDashboardPage() {
  const router = useRouter();
  const [spdList, setSpdList] = useState<any[]>([]);
  const [filteredList, setFilteredList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Mock data for fallback
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSpdList();
        if (Array.isArray(res)) {
          setSpdList(res.length > 0 ? res : []); // Atur ke array kosong jika tidak ada data dari backend (bukan pakai mock)
        } else {
          setSpdList(mockSpdData);
        }
      } catch {
        setSpdList(mockSpdData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = spdList;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.nama.toLowerCase().includes(term) ||
        item.nip.includes(term) ||
        item.tujuan.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(item => item.status === statusFilter);
    }

    setFilteredList(result);
  }, [searchTerm, statusFilter, spdList]);

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data usulan SPD ini?")) {
      try {
        await deleteSpd(id);
        setSpdList(prev => prev.filter(item => item.id !== id));
        alert("Data berhasil dihapus!");
      } catch (err: any) {
        console.error("Gagal menghapus:", err);
        const errMsg = err.response?.data?.message || err.message || "Unknown error";
        const errStatus = err.response?.status || "No Status";
        alert(`Gagal menghapus data dari server! (Status: ${errStatus}, Pesan: ${errMsg})`);
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
  const drafCount = spdList.filter(item => item.status === "DRAF").length;
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
          { label: "Selesai", val: selesaiCount, bg: "#dcfce7", color: "#15803d", border: "none" }
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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                border: "1px solid #cbd5e1",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "white"
              }}
            >
              <option value="ALL">Semua Status</option>
              <option value="DRAF">Draf</option>
              <option value="DIAJUKAN">Diajukan</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>No</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>Pegawai</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>Maksud Perjalanan</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>Tujuan</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>Tanggal</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "12px 8px", color: "#475569", fontWeight: "600", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>Loading data...</td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>Tidak ada data SPD ditemukan.</td>
                </tr>
              ) : (
                filteredList.map((item, index) => {
                  let badgeBg = "#f1f5f9";
                  let badgeColor = "#64748b";
                  if (item.status === "DIAJUKAN") { badgeBg = "#fef3c7"; badgeColor = "#d97706"; }
                  else if (item.status === "DISETUJUI") { badgeBg = "#dbeafe"; badgeColor = "#1d4ed8"; }
                  else if (item.status === "SELESAI") { badgeBg = "#dcfce7"; badgeColor = "#15803d"; }

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 8px", color: "#64748b" }}>{index + 1}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ fontWeight: "600", color: "#0f2540" }}>{item.nama}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>NIP. {item.nip}</div>
                      </td>
                      <td style={{ padding: "12px 8px", color: "#334155", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.maksud}
                      </td>
                      <td style={{ padding: "12px 8px", color: "#334155" }}>{item.tujuan}</td>
                      <td style={{ padding: "12px 8px", color: "#475569" }}>
                        <div>{item.tglMulai}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>s/d {item.tglSelesai}</div>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          padding: "4px 8px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: "700"
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => router.push(`/spd/edit/${item.id}`)}
                            style={{
                              backgroundColor: "transparent",
                              border: "1px solid #cbd5e1",
                              color: "#475569",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600"
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => router.push(`/spd/print/${item.id}`)}
                            style={{
                              backgroundColor: "#0f2540",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600"
                            }}
                          >
                            Cetak
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            style={{
                              backgroundColor: "#fecaca",
                              color: "#dc2626",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600"
                            }}
                          >
                            Hapus
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
    </div>
  );
}
