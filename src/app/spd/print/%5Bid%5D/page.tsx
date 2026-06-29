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
        setData(res?.data || mockItems[id] || mockItems["1"]);
      } catch {
        setData(mockItems[id] || mockItems["1"]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
            height: 0;
            margin: 0;
            border: none;
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
          font-family: "Times New Roman", Times, serif;
          line-height: 1.4;
          box-sizing: border-box;
        }

        .kop-surat {
          display: flex;
          align-items: center;
          border-bottom: 3px double black;
          padding-bottom: 8px;
          margin-bottom: 20px;
        }

        .kop-logo {
          width: 75px;
          height: 75px;
          margin-right: 15px;
          border: 1px dashed #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }

        .kop-teks {
          text-align: center;
          flex-grow: 1;
        }

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

      {/* PAGE 1: SURAT PERJALANAN DINAS (SPD) */}
      <div className="print-container">
        {/* Kop Dinas */}
        <div className="kop-surat">
          <div className="kop-logo">LOGO PROV</div>
          <div className="kop-teks">
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
                b. {data?.tglMulai}<br />
                c. {data?.tglSelesai}
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
            <div>Pada tanggal: {data?.tanggalSpd || "2026-07-02"}</div>
            <div style={{ borderBottom: "1px solid black", margin: "10px 0" }}></div>
            <div style={{ fontWeight: "bold" }}>Kepala Bidang APTIKA,</div>
            <div style={{ height: "65px" }}></div>
            <div style={{ fontWeight: "bold", textDecoration: "underline" }}>Dr. Ir. G.P. Ginanjar, M.T.</div>
            <div>NIP. 197412081999031002</div>
          </div>
        </div>
      </div>

      {/* PAGE BREAK FOR PRINT */}
      <div className="page-break"></div>

      {/* PAGE 2: VISUM / LEMBAR SPD BELAKANG */}
      <div className="print-container">
        <h3 style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", textDecoration: "underline", marginBottom: "15px" }}>
          LEMBAR VISUM / CATATAN PERJALANAN
        </h3>
        
        <table className="table-visum">
          <tbody>
            <tr>
              <td>
                <strong>I. Berangkat dari:</strong> Bandung<br />
                <strong>Ke:</strong> {data?.tempatTujuan}<br />
                <strong>Pada tanggal:</strong> {data?.tglMulai}<br /><br />
                <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", borderTop: "1px dashed black", paddingTop: "5px", marginTop: "10px" }}>
                  Tanda Tangan Pejabat Berwenang
                </div>
              </td>
              <td>
                <strong>II. Tiba di:</strong> {data?.tempatTujuan}<br />
                <strong>Pada tanggal:</strong> {data?.tglMulai}<br />
                <div style={{ height: "40px" }}></div>
                <div style={{ borderTop: "1px solid black", margin: "5px 0" }}></div>
                <strong>(Pejabat di Lokasi Tujuan)</strong>
              </td>
            </tr>
            <tr>
              <td>
                <strong>III. Berangkat dari:</strong> {data?.tempatTujuan}<br />
                <strong>Ke:</strong> Bandung<br />
                <strong>Pada tanggal:</strong> {data?.tglSelesai}<br /><br />
                <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", borderTop: "1px dashed black", paddingTop: "5px", marginTop: "10px" }}>
                  Tanda Tangan Pejabat Berwenang
                </div>
              </td>
              <td>
                <strong>IV. Tiba di:</strong> Bandung<br />
                <strong>Pada tanggal:</strong> {data?.tglSelesai}<br />
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
  );
}
