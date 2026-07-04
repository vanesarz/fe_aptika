"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSpdById, fromApiSpdItem, updateSpd, getDetailPerjalananById, fromApiDetailPerjalanan, updateDetailPerjalananStatus } from "@/services/api";

type VisumPreviewProps = {
  params: Promise<{ id: string }>;
};

function VisumPreviewContent({ params }: VisumPreviewProps) {
  const router = useRouter();
  const { id } = use(params);
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [spd, setSpd] = useState<any>(null);

  // Read query parameters passed from the form
  const lokasi = searchParams.get("lokasi") || "";
  const tglBerangkat = searchParams.get("tglBerangkat") || "";
  const tglKedatangan = searchParams.get("tglKedatangan") || "";
  const nama = searchParams.get("nama") || "";
  const nip = searchParams.get("nip") || "";
  const pangkat = searchParams.get("pangkat") || "";
  const jabatan = searchParams.get("jabatan") || "";

  const mockItems: Record<string, any> = {
    "1": { id: 1, tempatBerangkat: "Bandung", tujuan: "Dinas Kominfo Kabupaten Bekasi" },
    "2": { id: 2, tempatBerangkat: "Bandung", tujuan: "Bappeda Provinsi Jawa Barat" },
    "3": { id: 3, tempatBerangkat: "Bandung", tujuan: "Kementerian Kominfo RI, Jakarta" },
    "4": { id: 4, tempatBerangkat: "Bandung", tujuan: "Diskominfo Kota Bandung" },
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Coba API baru (detail-perjalanan) terlebih dahulu
        const res = await getDetailPerjalananById(Number(id));
        setSpd(fromApiDetailPerjalanan(res));
      } catch {
        try {
          // Fallback ke API lama
          const res = await getSpdById(Number(id));
          setSpd(fromApiSpdItem(res));
        } catch {
          setSpd(mockItems[id] || mockItems["1"]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = async () => {
    try {
      // Simpan status selesai ke database via API baru
      await updateDetailPerjalananStatus(Number(id), "selesai");
    } catch {
      try {
        // Fallback ke API lama jika API baru gagal
        if (spd) {
          await updateSpd(Number(id), { ...spd, status: "completed" });
        }
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    }
    window.print();
    window.location.href = "/spd";
  };

  const formatDateIndonesian = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Loading pratinjau visum...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Sembunyikan sidebar & toolbar */
          .no-print,
          .sidebar-layout-wrapper,
          nav,
          aside {
            display: none !important;
          }
          /* Hapus padding wrapper halaman */
          .visum-page-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            min-height: unset !important;
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
          }
          .layout-root {
            display: block !important;
          }
          .main-layout-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            width: 100% !important;
          }
          /* Fit tepat A4 landscape: 297 x 210mm */
          .print-container {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            min-width: unset !important;
            max-width: 297mm !important;
            position: relative !important;
            overflow: visible !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      <div className="visum-page-wrapper" style={{ padding: "32px", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
        {/* Breadcrumb (Screen only) */}
        <div className="no-print" style={{ display: "flex", gap: "6px", fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>
          <span>Surat Perjalanan Dinas</span>
          <span>/</span>
          <span>Buat Surat</span>
          <span>/</span>
          <span>Rangkuman Perjalanan</span>
          <span>/</span>
          <span style={{ fontWeight: "700", color: "#0f2540" }}>Preview Surat Visum</span>
        </div>

        {/* Toolbar (Screen only) */}
        <div className="no-print" style={{
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: "#b91c1c",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(185,28,28,0.1)"
              }}
            >
              Print All Documents
            </button>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: "white",
                border: "1px solid #cbd5e1",
                color: "#1e293b",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Download PDF
            </button>
            <button
              onClick={() => router.push("/spd")}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginLeft: "8px"
              }}
            >
              Cancel
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#15803d" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span style={{ fontSize: "14px", fontWeight: "700" }}>Tanda Tangan Elektronik Valid</span>
          </div>
        </div>

        {/* Badge (Screen only) */}
        <div className="no-print" style={{ marginBottom: "20px" }}>
          <div style={{
            backgroundColor: "#0f2540",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "700",
            display: "inline-block"
          }}>
            Dokumen Penanda Tangan
          </div>
        </div>

        {/* Document Sheet Preview Container */}
        <div className="print-container" style={{
          position: "relative",
          backgroundColor: "white",
          width: "297mm",
          height: "210mm",
          margin: "0 auto",
          border: "1px solid #cbd5e1",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
          fontFamily: "Inter, sans-serif",
          boxSizing: "border-box",
          overflow: "hidden"
        }}>

          {/* Left Signature Block (Main Area) */}
          <div style={{
            position: "absolute",
            top: "125px",
            left: "58%",
            width: "220px",
            fontSize: "11px",
            fontFamily: "Arial, sans-serif",
            lineHeight: "1.7",
            color: "#000",
            zIndex: 10
          }}>
            <div>{lokasi || "Kota Cimahi"}</div>
            <div>{formatDateIndonesian(tglKedatangan) || "26 November 2025"}</div>
            <div style={{ visibility: "hidden" }}>-</div> {/* Empty row to align with NIP on the right */}
            <div>{jabatan || "Front Desk Attendant"}</div>
            <div style={{ height: "55px" }}></div>
            <div style={{ fontWeight: "bold" }}>{nama || "Irna"}</div>
          </div>
 
          {/* Right Signature Block (Stub Area) */}
          <div style={{
            position: "absolute",
            top: "125px",
            left: "82.5%",
            width: "180px",
            fontSize: "11px",
            fontFamily: "Arial, sans-serif",
            lineHeight: "1.7",
            color: "#000",
            zIndex: 10
          }}>
            <div>{lokasi || "Kota Cimahi"}</div>
            <div>{spd?.tempatBerangkat || "Bandung"}</div>
            <div>{nip || "45989"}</div>
            <div>{jabatan || "Front Desk Attendant"}</div>
            <div style={{ height: "55px" }}></div>
            <div style={{ fontWeight: "bold" }}>{nama || "Irna"}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VisumPreviewPage({ params }: VisumPreviewProps) {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading pratinjau visum...</div>}>
      <VisumPreviewContent params={params} />
    </Suspense>
  );
}
