"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSpdById, fromApiSpdItem, getDetailPerjalananById, fromApiDetailPerjalanan } from "@/services/api";

type PrintPageProps = {
  params: Promise<{ id: string }>;
};

const formatDateIndonesian = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const cleanDateStr = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const date = new Date(cleanDateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
};

export default function SpdPrintPage({ params }: PrintPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState<"sp" | "spd">("sp");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Coba gunakan API Baru (detail-perjalanan) terlebih dahulu
        const res = await getDetailPerjalananById(Number(id));
        setData(fromApiDetailPerjalanan(res));
      } catch {
        try {
          // Fallback ke API lama
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

  useEffect(() => {
    const handleBeforePrint = () => {
      const prefix = docType === "sp" ? "SP" : "SPD";
      if (data && data.noSpd) {
        const sanitizedNoSpd = data.noSpd.replace(/\//g, "_");
        document.title = `${prefix}_${sanitizedNoSpd}`;
      } else if (data && data.nama) {
        document.title = `${prefix}_${data.nama.replace(/\s+/g, "_")}`;
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
  }, [data, docType]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading dokumen...</div>;
  }

  return (
    <>
      <style>{`
        /* Print Styles */
        @media print {
          @page {
            size: ${docType === "spd" ? "landscape" : "portrait"};
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container-sp, .print-container-spd {
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            padding: 0 !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
            height: 0;
            margin: 0;
            border: none;
          }
        }

        /* Screen Preview Common Styles */
        .print-container-sp {
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

        .print-container-spd {
          background-color: white;
          width: 297mm;
          min-height: 210mm;
          margin: 30px auto;
          padding: 20mm;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          border: 1px solid #cbd5e1;
          color: black;
          font-family: "Times New Roman", Times, serif;
          line-height: 1.4;
          box-sizing: border-box;
        }

        /* Kop Surat (SP) */
        .kop-surat-sp {
          display: flex;
          align-items: center;
          border-bottom: 3px solid black;
          padding-bottom: 8px;
          margin-bottom: 2px;
        }
        
        .kop-surat-inner-sp {
          border-bottom: 1px solid black;
          margin-bottom: 15px;
        }

        .kop-logo-sp {
          width: 80px;
          height: auto;
          margin-right: 15px;
        }

        .kop-teks-sp {
          text-align: center;
          flex-grow: 1;
        }

        /* Kop Surat (SPD) */
        .kop-surat-spd {
          display: flex;
          align-items: center;
          border-bottom: 3px double black;
          padding-bottom: 8px;
          margin-bottom: 20px;
        }

        .kop-logo-spd {
          width: 75px;
          height: 75px;
          margin-right: 15px;
        }

        .kop-teks-spd {
          text-align: center;
          flex-grow: 1;
        }
        
        /* SP Layout Styles */
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

        /* SPD Layout Styles */
        .table-spd {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 13px;
        }

        .table-spd td {
          border: 1px solid black;
          padding: 6px 10px;
          vertical-align: top;
        }

        .table-visum {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 12px;
        }

        .table-visum td {
          border: 1px solid black;
          padding: 12px;
          width: 50%;
          height: 110px;
          vertical-align: top;
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
        zIndex: 100,
        fontFamily: "Inter, sans-serif"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: "700" }}>Pratinjau Dokumen Cetak</span>
          <span style={{ fontSize: "12px", opacity: 0.8, backgroundColor: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: "4px" }}>ID: #{id}</span>
        </div>

        {/* Switcher Tab */}
        <div style={{ display: "flex", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "4px" }}>
          <button
            onClick={() => setDocType("sp")}
            style={{
              backgroundColor: docType === "sp" ? "#38bdf8" : "transparent",
              color: docType === "sp" ? "#0f2540" : "white",
              border: "none",
              padding: "6px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "700",
              transition: "all 0.2s"
            }}
          >
            Surat Perintah (SP)
          </button>
          <button
            onClick={() => setDocType("spd")}
            style={{
              backgroundColor: docType === "spd" ? "#38bdf8" : "transparent",
              color: docType === "spd" ? "#0f2540" : "white",
              border: "none",
              padding: "6px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "700",
              transition: "all 0.2s"
            }}
          >
            Surat Perjalanan Dinas (SPD)
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => router.push("/spd")}
            style={{
              backgroundColor: "transparent",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600"
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
              padding: "6px 18px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "800",
              boxShadow: "0 4px 6px -1px rgba(56, 189, 248, 0.2)"
            }}
          >
            Cetak Dokumen (Print / PDF)
          </button>
        </div>
      </div>

      {/* DOCUMENT RENDER CONTAINER */}
      {docType === "sp" ? (
        /* ======================== SURAT PERINTAH (SP) ======================== */
        <div className="print-container-sp">
          {/* Kop Dinas */}
          <div className="kop-surat-inner-sp">
            <div className="kop-surat-sp">
              <img 
                src="/logo-jabar.png" 
                alt="Logo Jabar" 
                className="kop-logo-sp"
                onError={(e) => { 
                  const t = e.target as HTMLImageElement;
                  if (!t.dataset.fallback) {
                    t.dataset.fallback = "1";
                    t.src = "https://upload.wikimedia.org/wikipedia/commons/0/07/West_Java_coa.png";
                  }
                }} 
              />
              <div className="kop-teks-sp">
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
                          <tr><td style={{ width: "100px" }}>Pada tanggal</td><td>: {formatDateIndonesian(data?.tglMulai) || "-"}</td></tr>
                          <tr><td>Dalam rangka</td><td>: {data?.maksud || "-"}</td></tr>
                          <tr><td></td><td>  ke {data?.tempatTujuan || "-"}</td></tr>
                        </tbody>
                      </table>
                    </li>
                    <li style={{ paddingBottom: "8px" }}>
                      Pembiayaan dibebankan pada DPA-SKPD Dinas Komunikasi dan Informatika Provinsi Jawa Barat Tahun Anggaran 2026 pada :<br/>
                      <table className="person-table" style={{ marginTop: "4px" }}>
                        <tbody>
                          <tr><td style={{ width: "100px" }}>Kegiatan</td><td>: {data?.kegiatan || "Pengelolaan Nama Domain yang telah ditetapkan oleh Pemerintah Pusat dan Sub Domain di lingkup Pemerintah Daerah Provinsi"}</td></tr>
                          <tr><td>Sub Kegiatan</td><td>: {data?.subKegiatan || "Penatalaksanaan dan Pengawasan Nama Domain dan Sub Domain dalam Penyelenggaraan Pemerintahan Daerah Provinsi"}</td></tr>
                          <tr><td>Kode Rekening</td><td>: {data?.kodeRekening || "2.16.03.1 01.02 5.1.02.04.01 0001"}</td></tr>
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
                  <tr><td>Pada Tanggal</td><td>: {formatDateIndonesian(data?.tanggalSpd || data?.tglMulai) || "2 Juli 2026"}</td></tr>
                </tbody>
              </table>
              
              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <div>a.n KEPALA DINAS KOMUNIKASI DAN INFORMATIKA</div>
                <div>PROVINSI JAWA BARAT</div>
                <div>SEKRETARIS,</div>
                
                <div className="signature-box" style={{ marginTop: "20px", textAlign: "left" }}>
                  <div style={{ flexShrink: 0 }}>
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
      ) : (
        /* ======================== SURAT PERJALANAN DINAS (SPD) ======================== */
        <>
          {/* PAGE 1: SURAT PERJALANAN DINAS (SPD) FRONT */}
          <div className="print-container-spd">
            {/* Kop Dinas */}
            <div className="kop-surat-spd">
              <img 
                src="/logo-jabar.png" 
                alt="Logo Jabar" 
                style={{ width: "75px", height: "auto", marginRight: "15px" }}
                onError={(e) => { 
                  const t = e.target as HTMLImageElement;
                  if (!t.dataset.fallback) {
                    t.dataset.fallback = "1";
                    t.src = "https://upload.wikimedia.org/wikipedia/commons/0/07/West_Java_coa.png";
                  }
                }} 
              />
              <div className="kop-teks-spd">
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>PEMERINTAH PROVINSI JAWA BARAT</div>
                <div style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "0.5px" }}>DINAS KOMUNIKASI DAN INFORMATIKA</div>
                <div style={{ fontSize: "11px", fontStyle: "italic" }}>Jalan Taman Sari No. 55 Telepon (022) 2502898 Fax (022) 2511605</div>
                <div style={{ fontSize: "12px", fontWeight: "bold" }}>BANDUNG - 40132</div>
              </div>
            </div>

            {/* Title */}
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <div style={{ fontSize: "15px", fontWeight: "bold", textDecoration: "underline" }}>SURAT PERJALANAN DINAS (SPD)</div>
              <div style={{ fontSize: "13px" }}>Nomor: {data?.noSpd || "094/SPD-0182/APTIKA/2026"}</div>
            </div>

            {/* SPD Grid Table */}
            <table className="table-spd">
              <tbody>
                <tr>
                  <td style={{ width: "4%", textAlign: "center" }}>1.</td>
                  <td style={{ width: "41%" }}>Pejabat Pembuat Komitmen</td>
                  <td style={{ width: "55%" }}>{data?.pejabatPemberi || "Kepala Bidang APTIKA Diskominfo Jabar"}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" }}>2.</td>
                  <td>Nama / NIP Pegawai yang diperintah</td>
                  <td>
                    <strong>{data?.nama}</strong><br />
                    NIP. {data?.nip}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" }}>3.</td>
                  <td>
                    a. Pangkat dan Golongan<br />
                    b. Jabatan / Instansi<br />
                    c. Tingkat Biaya Perjalanan Dinas
                  </td>
                  <td>
                    a. {data?.pangkat || "-"}<br />
                    b. {data?.jabatan || "-"}<br />
                    c. {data?.tingkatBiaya || "Tingkat C"}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" }}>4.</td>
                  <td>Maksud Perjalanan Dinas</td>
                  <td>{data?.maksud}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" }}>5.</td>
                  <td>Alat angkutan yang dipergunakan</td>
                  <td>{data?.angkutan || "Kendaraan Dinas"}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" }}>6.</td>
                  <td>
                    a. Tempat berangkat<br />
                    b. Tempat tujuan
                  </td>
                  <td>
                    a. {data?.tempatBerangkat || "Bandung"}<br />
                    b. {data?.tempatTujuan}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" }}>7.</td>
                  <td>
                    a. Lamanya perjalanan dinas<br />
                    b. Tanggal berangkat<br />
                    c. Tanggal harus kembali/tiba
                  </td>
                  <td>
                    a. {data?.durasi || 1} Hari<br />
                    b. {formatDateIndonesian(data?.tglMulai)}<br />
                    c. {formatDateIndonesian(data?.tglSelesai)}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" }}>8.</td>
                  <td>Pengikut: Nama / Tanggal Lahir / Keterangan</td>
                  <td>
                    {data?.pengikut && data.pengikut.length > 0 ? (
                      <ol style={{ margin: 0, paddingLeft: "15px" }}>
                        {data.pengikut.map((p: any, i: number) => (
                          <li key={i}>
                            {p.nama} (Lahir: {p.tglLahir || "-"}) - {p.keterangan || "-"}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" }}>9.</td>
                  <td>
                    Pembebanan Anggaran<br />
                    a. Instansi<br />
                    b. Mata Anggaran / Akun
                  </td>
                  <td>
                    <br />
                    a. Dinas Komunikasi dan Informatika Jabar<br />
                    b. APBD Provinsi Jawa Barat TA 2026
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" }}>10.</td>
                  <td>Keterangan lain-lain</td>
                  <td>Surat tugas terlampir</td>
                </tr>
              </tbody>
            </table>

            {/* Footer Signatures */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", fontSize: "13px" }}>
              <div></div>
              <div style={{ width: "250px" }}>
                <div>Dikeluarkan di: Bandung</div>
                <div>Pada tanggal: {formatDateIndonesian(data?.tanggalSpd || data?.tglMulai) || "2 Juli 2026"}</div>
                <div style={{ borderBottom: "1px solid black", margin: "10px 0" }}></div>
                <div style={{ fontWeight: "bold" }}>Kepala Bidang APTIKA,</div>
                <div style={{ height: "65px" }}></div>
                <div style={{ fontWeight: "bold", textDecoration: "underline" }}>{data?.raw?.orderer_name || "Dr. Ir. G.P. Ginanjar, M.T."}</div>
                <div>NIP. {data?.raw?.orderer_nip || "197412081999031002"}</div>
              </div>
            </div>
          </div>

          {/* PAGE BREAK FOR PRINT */}
          <div className="page-break"></div>

          {/* PAGE 2: VISUM / LEMBAR SPD BELAKANG */}
          <div className="print-container-spd">
            <h3 style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", textDecoration: "underline", marginBottom: "15px" }}>
              LEMBAR VISUM / CATATAN PERJALANAN
            </h3>
            
            <table className="table-visum">
              <tbody>
                <tr>
                  <td>
                    <strong>I. Berangkat dari:</strong> Bandung<br />
                    <strong>Ke:</strong> {data?.tempatTujuan}<br />
                    <strong>Pada tanggal:</strong> {formatDateIndonesian(data?.tglMulai)}<br /><br />
                    <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", borderTop: "1px dashed black", paddingTop: "5px", marginTop: "10px" }}>
                      Tanda Tangan Pejabat Berwenang
                    </div>
                  </td>
                  <td>
                    <strong>II. Tiba di:</strong> {data?.tempatTujuan}<br />
                    <strong>Pada tanggal:</strong> {formatDateIndonesian(data?.tglMulai)}<br />
                    <div style={{ height: "40px" }}></div>
                    <div style={{ borderTop: "1px solid black", margin: "5px 0" }}></div>
                    <strong>(Pejabat di Lokasi Tujuan)</strong>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>III. Berangkat dari:</strong> {data?.tempatTujuan}<br />
                    <strong>Ke:</strong> Bandung<br />
                    <strong>Pada tanggal:</strong> {formatDateIndonesian(data?.tglSelesai)}<br /><br />
                    <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", borderTop: "1px dashed black", paddingTop: "5px", marginTop: "10px" }}>
                      Tanda Tangan Pejabat Berwenang
                    </div>
                  </td>
                  <td>
                    <strong>IV. Tiba di:</strong> Bandung<br />
                    <strong>Pada tanggal:</strong> {formatDateIndonesian(data?.tglSelesai)}<br />
                    <div style={{ height: "40px" }}></div>
                    <div style={{ borderTop: "1px solid black", margin: "5px 0" }}></div>
                    <strong>Kabid APTIKA Diskominfo Jabar</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Visum Notes */}
            <div style={{ marginTop: "30px", fontSize: "11px" }}>
              <strong>Catatan Penting:</strong>
              <ol style={{ margin: 0, paddingLeft: "15px" }}>
                <li>Setiap tempat persinggahan/kunjungan dinas wajib meminta visum (stempel & tanda tangan) pejabat setempat.</li>
                <li>Lembar ini dilampirkan bersama Laporan Hasil Perjalanan Dinas (LHPD) maksimal 5 hari setelah kembali.</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </>
  );
}
