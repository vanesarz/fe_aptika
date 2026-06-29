"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSpdById } from "@/services/api";

type PrintPageProps = {
  params: Promise<{ id: string }>;
};

export default function SpdPrintPage({ params }: PrintPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      durasi: 3,
      pengikut: [{ nama: "Dani Darmawan", tglLahir: "1994-05-12", keterangan: "Staf Teknis" }],
      anggaran: 2500000,
      noSpd: "094/SPD-0182/APTIKA/2026",
      tingkatBiaya: "Tingkat C",
      tanggalSpd: "2026-07-02"
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSpdById(Number(id));
        // getSpdById already returns the data payload from the API
        setData(res || mockItems[id] || mockItems["1"]);
      } catch {
        setData(mockItems[id] || mockItems["1"]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleBeforePrint = () => {
      if (data && data.noSpd) {
        const sanitizedNoSpd = data.noSpd.replace(/\//g, "_");
        document.title = `SPD_${sanitizedNoSpd}`;
      } else if (data && data.nama) {
        document.title = `SPD_${data.nama.replace(/\s+/g, "_")}`;
      }
    };

    const handleAfterPrint = () => {
      document.title = "Aptika Tools";
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [data]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading dokumen SPD...</div>;
  }

  return (
    <>
      <style>{`
        /* Print Styles */
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            padding: 0 !important;
          }
        }

        /* Screen Preview Styles */
        .print-container {
          background-color: white;
          width: 210mm;
          min-height: 297mm;
          margin: 30px auto;
          padding: 20mm;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          border: 1px solid #cbd5e1;
          color: black;
          font-family: Arial, sans-serif;
          line-height: 1.4;
          box-sizing: border-box;
          font-size: 12px;
        }

        .kop-surat {
          display: flex;
          align-items: center;
          border-bottom: 3px solid black;
          padding-bottom: 8px;
          margin-bottom: 2px;
        }
        
        .kop-surat-inner {
          border-bottom: 1px solid black;
          margin-bottom: 15px;
        }

        .kop-logo {
          width: 80px;
          height: auto;
          margin-right: 15px;
        }

        .kop-teks {
          text-align: center;
          flex-grow: 1;
        }
        
        .surat-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 12px;
        }

        .surat-table td {
          padding: 4px;
          vertical-align: top;
        }
        
        .col-label {
          width: 80px;
        }
        .col-colon {
          width: 10px;
          text-align: center;
        }
        
        .person-table td {
          padding: 2px 4px;
          border: none;
        }
        
        .signature-box {
          border: 1px solid black;
          border-radius: 8px;
          padding: 10px;
          width: 300px;
          font-size: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
      `}</style>

      {/* Control Bar (Screen Only) */}
      <div className="no-print" style={{
        backgroundColor: "#0f2540",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div>
          <span style={{ fontWeight: "700" }}>Pratinjau Dokumen Cetak SPD</span>
          <span style={{ marginLeft: "8px", fontSize: "12px", opacity: 0.8 }}>ID: #{id}</span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => router.push("/spd")}
            style={{
              backgroundColor: "transparent",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            Kembali
          </button>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: "#38bdf8",
              color: "#0f2540",
              border: "none",
              padding: "6px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "700"
            }}
          >
            Cetak Dokumen (Print / PDF)
          </button>
        </div>
      </div>

      {/* SURAT PERINTAH PAGE */}
      <div className="print-container">
        {/* Kop Dinas */}
        <div className="kop-surat-inner">
          <div className="kop-surat">
            <img 
              src="/logo-jabar.png" 
              alt="Logo Jabar" 
              className="kop-logo"
              onError={(e) => { 
                const t = e.target as HTMLImageElement;
                if (!t.dataset.fallback) {
                  t.dataset.fallback = "1";
                  t.src = "https://upload.wikimedia.org/wikipedia/commons/0/07/West_Java_coa.png";
                }
              }} 
            />
            <div className="kop-teks">
              <div style={{ fontSize: "14px", fontWeight: "normal" }}>PEMERINTAH DAERAH PROVINSI JAWA BARAT</div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>DINAS KOMUNIKASI DAN INFORMATIKA</div>
              <div style={{ fontSize: "11px" }}>Jalan Tamansari No. 55 Telp. (022) 2502898 Faksimili (022) 2511505</div>
              <div style={{ fontSize: "11px" }}>website : https://diskominfo.jabarprov.go.id email : diskominfo@jabarprov.go.id</div>
              <div style={{ fontSize: "11px" }}>Bandung 40132</div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "2px" }}>SURAT PERINTAH</div>
          <div style={{ fontSize: "12px" }}>Nomor : {data?.noSpd || "1818/KOM.03.01.08/APTIKA"}</div>
        </div>

        {/* Body */}
        <table className="surat-table">
          <tbody>
            <tr>
              <td className="col-label">Dasar</td>
              <td className="col-colon">:</td>
              <td>
                <ol style={{ margin: 0, paddingLeft: "15px" }}>
                  <li style={{ paddingBottom: "4px" }}>Peraturan Daerah Provinsi Jawa Barat Nomor 10 Tahun 2022 tanggal 15 Desember 2022 Tentang Anggaran Pendapatan dan Belanja Daerah Tahun Anggaran 2023</li>
                  <li>Peraturan Gubernur Jawa Barat Nomor 118 Tahun 2022 tanggal 16 Desember Tahun 2022 tentang Penjabaran Anggaran Pendapatan dan Belanja Daerah Tahun Anggaran 2023.</li>
                </ol>
              </td>
            </tr>
            
            <tr>
              <td colSpan={3} style={{ textAlign: "center", fontWeight: "bold", padding: "20px 0", letterSpacing: "2px" }}>
                MEMERINTAHKAN
              </td>
            </tr>

            <tr>
              <td className="col-label">Kepada</td>
              <td className="col-colon">:</td>
              <td>
                <ol style={{ margin: 0, paddingLeft: "15px", listStyleType: "decimal" }}>
                  <li style={{ paddingBottom: "8px" }}>
                    <table className="person-table">
                      <tbody>
                        <tr><td style={{ width: "60px" }}>Nama</td><td>: <strong>{data?.nama}</strong></td></tr>
                        <tr><td>NIP</td><td>: {data?.nip}</td></tr>
                        <tr><td>Pangkat</td><td>: {data?.pangkat || "-"}</td></tr>
                        <tr><td>Jabatan</td><td>: {data?.jabatan || "-"}</td></tr>
                      </tbody>
                    </table>
                  </li>
                  
                  {data?.pengikut?.map((p: any, idx: number) => (
                    <li key={idx} style={{ paddingBottom: "8px" }}>
                      <table className="person-table">
                        <tbody>
                          <tr><td style={{ width: "60px" }}>Nama</td><td>: <strong>{p.nama}</strong></td></tr>
                          <tr><td>NIP</td><td>: {p.nip || p.tglLahir || "-"}</td></tr>
                          <tr><td>Pangkat</td><td>: {p.pangkat || "-"}</td></tr>
                          <tr><td>Jabatan</td><td>: {p.jabatan || p.keterangan || "-"}</td></tr>
                        </tbody>
                      </table>
                    </li>
                  ))}
                </ol>
              </td>
            </tr>

            <tr>
              <td className="col-label">Untuk</td>
              <td className="col-colon">:</td>
              <td>
                <ol style={{ margin: 0, paddingLeft: "15px", listStyleType: "decimal" }}>
                  <li style={{ paddingBottom: "8px" }}>
                    Melaksanakan perjalanan dinas<br/>
                    <table className="person-table" style={{ marginTop: "4px" }}>
                      <tbody>
                        <tr><td style={{ width: "100px" }}>Pada tanggal</td><td>: {data?.tglMulai || "-"}</td></tr>
                        <tr><td>Dalam rangka</td><td>: {data?.maksud || "-"}</td></tr>
                        <tr><td></td><td>  ke {data?.tempatTujuan || "-"}</td></tr>
                      </tbody>
                    </table>
                  </li>
                  <li style={{ paddingBottom: "8px" }}>
                    Pembiayaan dibebankan pada DPA-SKPD Dinas Komunikasi dan Informatika Provinsi Jawa Barat Tahun Anggaran 2026 pada :<br/>
                    <table className="person-table" style={{ marginTop: "4px" }}>
                      <tbody>
                        <tr><td style={{ width: "100px" }}>Kegiatan</td><td>: Pengelolaan Nama Domain yang telah ditetapkan oleh Pemerintah Pusat dan Sub Domain di lingkup Pemerintah Daerah Provinsi</td></tr>
                        <tr><td>Sub Kegiatan</td><td>: Penatalaksanaan dan Pengawasan Nama Domain dan Sub Domain dalam Penyelenggaraan Pemerintahan Daerah Provinsi</td></tr>
                        <tr><td>Kode Rekening</td><td>: 2.16.03.1 01.02 5.1.02.04.01 0001</td></tr>
                      </tbody>
                    </table>
                  </li>
                  <li>
                    Melaksanakan tugas ini dengan sebaik-baiknya dengan penuh rasa tanggung jawab serta memberikan laporan kegiatan sesuai dengan ketentuan yang berlaku.
                  </li>
                </ol>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "40px" }}>
          <div style={{ width: "350px", textAlign: "left" }}>
            <table style={{ border: "none" }}>
              <tbody>
                <tr><td style={{ width: "90px" }}>Ditetapkan di</td><td>: Bandung</td></tr>
                <tr><td>Pada Tanggal</td><td>: {data?.tanggalSpd || "6 Maret 2023"}</td></tr>
              </tbody>
            </table>
            
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <div>a.n KEPALA DINAS KOMUNIKASI DAN INFORMATIKA</div>
              <div>PROVINSI JAWA BARAT</div>
              <div>SEKRETARIS,</div>
              
              <div className="signature-box" style={{ marginTop: "20px", textAlign: "left" }}>
                <div style={{ flexShrink: 0 }}>
                  {/* Generic QR code placeholder */}
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/150px-QR_code_for_mobile_English_Wikipedia.svg.png" alt="QR Code" width="50" height="50" />
                </div>
                <div>
                  <div style={{ fontSize: "9px", marginBottom: "4px" }}>Ditandatangani secara elektronik oleh:</div>
                  <div style={{ fontWeight: "bold", fontSize: "10px", marginBottom: "8px" }}>SEKRETARIS DINAS KOMUNIKASI DAN INFORMATIKA PROVINSI JAWA BARAT</div>
                  <div style={{ fontWeight: "bold", fontSize: "10px" }}>AGI AGUNG GALUH PURWA, S.STP., M.Sc., MPA.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
