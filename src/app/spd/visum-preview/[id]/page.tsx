"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSpdById, fromApiSpdItem, updateSpd } from "@/services/api";

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
        const res = await getSpdById(Number(id));
        setSpd(fromApiSpdItem(res));
      } catch {
        setSpd(mockItems[id] || mockItems["1"]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = async () => {
    window.print();
    try {
      if (spd) {
        await updateSpd(Number(id), { ...spd, status: "completed" });
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
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
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
          }
        }
      `}</style>

      <div style={{ padding: "32px", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
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
          width: "210mm",
          height: "297mm",
          margin: "0 auto",
          border: "1px solid #cbd5e1",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
          backgroundImage: `
            linear-gradient(to right, rgba(226, 232, 240, 0.6) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.6) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          fontFamily: "Inter, sans-serif",
          boxSizing: "border-box",
          overflow: "hidden"
        }}>
          {/* Watermark "Page 3" */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "120px",
            fontWeight: "800",
            color: "#e2e8f0",
            opacity: 0.8,
            pointerEvents: "none",
            zIndex: 1,
            userSelect: "none"
          }}>
            Page 3
          </div>

          {/* Blue dashed vertical break line */}
          <div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "70%",
            borderLeft: "2px dashed #3b82f6",
            zIndex: 5
          }} />

          {/* Main Area Signature Block (Left side of dashed line) */}
          <div style={{
            position: "absolute",
            top: "160px",
            right: "33%",
            width: "260px",
            textAlign: "left",
            fontSize: "13px",
            color: "#1e293b",
            lineHeight: "1.6",
            zIndex: 10
          }}>
            <div>{lokasi}</div>
            <div>{formatDateIndonesian(tglKedatangan)}</div>
            <div style={{ marginTop: "6px" }}>{jabatan}</div>
            <div style={{ height: "70px" }}></div>
            <div style={{ fontWeight: "700" }}>{nama}</div>
          </div>

          {/* Stub Area Signature Block (Right side of dashed line) */}
          <div style={{
            position: "absolute",
            top: "160px",
            left: "73%",
            width: "200px",
            textAlign: "left",
            fontSize: "12px",
            color: "#1e293b",
            lineHeight: "1.6",
            zIndex: 10
          }}>
            <div>{lokasi}</div>
            <div>{spd?.tempatBerangkat || "Bandung"}</div>
            <div>{nip}</div>
            <div style={{ marginTop: "6px" }}>{jabatan}</div>
            <div style={{ height: "50px" }}></div>
            <div style={{ fontWeight: "700" }}>{nama}</div>
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
