"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getDetailPerjalananById, fromApiDetailPerjalanan, getSpdById, fromApiSpdItem } from "@/services/api";

type SummaryPageProps = {
  params: Promise<{ id: string }>;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr.includes("T") ? dateStr.split("T")[0] : dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

export default function SpdSummaryPage({ params }: SummaryPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getDetailPerjalananById(Number(id));
        setData(fromApiDetailPerjalanan(res));
      } catch {
        try {
          const res = await getSpdById(Number(id));
          setData(fromApiSpdItem(res));
        } catch {
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading dokumen...</div>;
  }

  if (!data) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Data tidak ditemukan.</div>;
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "24px", fontFamily: "'Inter', sans-serif" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>
        Surat Perjalanan Dinas <span style={{ margin: "0 4px" }}>/</span> Buat Surat <span style={{ margin: "0 4px" }}>/</span> <span style={{ fontWeight: "600", color: "#0f2540" }}>Rangkuman Perjalanan</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#0f2540", marginBottom: "4px" }}>Rangkuman Pengajuan Surat Perjalanan Dinas</h1>
          <p style={{ fontSize: "13px", color: "#64748b" }}>Harap tinjau kembali data perjalanan dinas sebelum mencetak dokumen resmi.</p>
        </div>
      </div>

      {/* Detail Section */}
      <div style={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "24px", overflow: "hidden" }}>
        <div style={{ backgroundColor: "#f1f5f9", padding: "12px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f2540" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f2540", letterSpacing: "0.5px" }}>DETAIL PERJALANAN DINAS</span>
        </div>
        <div style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>NOMOR SURAT</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{data?.noSpd || "-"}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>KEGIATAN</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{data?.kegiatan || "-"}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>SUB KEGIATAN</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{data?.subKegiatan || "-"}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>UANG HARIAN</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>Rp {data?.anggaran ? data.anggaran.toLocaleString("id-ID") : "430.000"}</div>
            </div>
          </div>
          
          <div style={{ borderTop: "1px solid #f1f5f9", margin: "0 -20px 20px -20px" }}></div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>TUJUAN / LOKASI</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{data?.tempatTujuan || "-"}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>TANGGAL BERANGKAT</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {formatDate(data?.tglMulai)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>TANGGAL KEMBALI</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {formatDate(data?.tglSelesai)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>KODE REKENING</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{data?.kodeRekening || "-"}</div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", margin: "0 -20px 20px -20px" }}></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>DESKRIPSI</div>
              <div style={{ fontSize: "13px", color: "#475569", fontStyle: "italic" }}>"{data?.deskripsi || data?.maksud || "-"}"</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>ALAT ANGKUTAN</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{data?.angkutan || "-"}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px" }}>
        {/* Kepala Bidang */}
        <div style={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#fef2f2", padding: "12px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ backgroundColor: "#dc2626", color: "white", width: "24px", height: "24px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
            </div>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#b91c1c", letterSpacing: "0.5px" }}>KEPALA BIDANG<br/>(KABID)</span>
          </div>
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>NAMA</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f2540" }}>{data?.nama || "-"}</div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>NIP</div>
              <div style={{ fontSize: "13px", color: "#334155" }}>{data?.nip || "-"}</div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>PANGKAT / GOL</div>
              <div style={{ fontSize: "13px", color: "#334155" }}>{data?.pangkat || "-"}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>JABATAN</div>
              <div style={{ fontSize: "12px", color: "#334155" }}>{data?.jabatan || "-"}</div>
            </div>
          </div>
        </div>

        {/* Staff / Pengikut */}
        <div style={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#f1f5f9", padding: "12px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ backgroundColor: "#0f2540", color: "white", width: "24px", height: "24px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f2540", letterSpacing: "0.5px" }}>STAFF / PENGIKUT</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "10px", fontWeight: "700", color: "#94a3b8", width: "40px" }}>#</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "10px", fontWeight: "700", color: "#94a3b8" }}>NAMA PEGAWAI</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "10px", fontWeight: "700", color: "#94a3b8" }}>NIP</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "10px", fontWeight: "700", color: "#94a3b8" }}>GOL</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "10px", fontWeight: "700", color: "#94a3b8" }}>JABATAN</th>
              </tr>
            </thead>
            <tbody>
              {data?.pengikut && data.pengikut.length > 0 ? (
                data.pengikut.map((p: any, index: number) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 20px", color: "#64748b" }}>{String(index + 1).padStart(2, '0')}</td>
                    <td style={{ padding: "16px 20px", fontWeight: "600", color: "#334155" }}>{p.nama || "-"}</td>
                    <td style={{ padding: "16px 20px", color: "#475569" }}>{p.nip || "-"}</td>
                    <td style={{ padding: "16px 20px", color: "#475569" }}>{p.pangkat || "-"}</td>
                    <td style={{ padding: "16px 20px", color: "#475569" }}>{p.jabatan || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>Tidak ada staff / pengikut</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", marginTop: "32px", padding: "20px 0", borderTop: "1px solid #e2e8f0" }}>
        <button
          onClick={() => router.push("/spd")}
          style={{ padding: "10px 16px", backgroundColor: "transparent", border: "none", color: "#64748b", fontWeight: "600", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}
        >
          Cancel
        </button>
        <button
          onClick={() => router.push(`/spd/print/${id}`)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", backgroundColor: "#0f2540", border: "none", borderRadius: "6px", color: "white", fontWeight: "600", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(15, 37, 64, 0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          CETAK SP
        </button>
        <button
          onClick={() => router.push(`/spd/visum-form/${id}`)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", backgroundColor: "#b91c1c", border: "none", borderRadius: "6px", color: "white", fontWeight: "600", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          CETAK VISUM
        </button>
      </div>
    </div>
  );
}
