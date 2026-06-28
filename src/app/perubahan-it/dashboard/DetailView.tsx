'use client';

import React, { useState, useEffect } from 'react';
import { FormPerubahanIT } from './types';

interface DetailViewProps {
  data: FormPerubahanIT;
  apiUrl?: string;
  onBack: () => void;
  viewMode?: 'list' | 'detail' | 'preview';
  setViewMode?: (mode: 'list' | 'detail' | 'preview') => void;
}

export default function DetailView({ data, apiUrl, onBack }: DetailViewProps) {
  const [isPreview, setIsPreview] = useState(false);
  // State untuk handle error gambar tanda tangan (fallback ke placeholder)
  const [ttdImgError, setTtdImgError] = useState(false);
  // State lokal untuk status, agar badge & UI langsung berubah saat tombol Setuju/Tolak/Kembalikan ditekan
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  // State untuk menandai tombol mana yang sedang memproses request (mencegah klik ganda)
  const [updatingStatus, setUpdatingStatus] = useState<'disetujui' | 'ditolak' | null>(null);
  // State untuk modal lightbox lampiran dokumen (preview full layar)
  const [isLampiranFullscreen, setIsLampiranFullscreen] = useState(false);

  // Tutup modal lightbox dengan tombol Escape
  useEffect(() => {
    if (!isLampiranFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLampiranFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLampiranFullscreen]);

  const currentStatus = (() => {
    const raw = localStatus ?? data.status;
    if (raw) {
      if (raw.toLowerCase() === 'disetujui') return 'Disetujui';
      if (raw.toLowerCase() === 'ditolak') return 'Ditolak';
      if (raw.toLowerCase() === 'selesai') return 'Selesai';
      return 'Menunggu';
    }
    return data.jenis_permohonan?.some((j) => j.includes('Deaktivasi') || j.includes('Tolak')) ? 'Ditolak' : 'Menunggu';
  })();

  const renderCetakCheckbox = (arr: string[] = [], val: string, key?: React.Key) => (
    <span key={key} className="inline-flex items-center gap-1.5 mr-3 mt-1">
      <span className="w-3 h-3 border border-black inline-flex items-center justify-center text-[9px] font-bold bg-white text-black">
        {arr.includes(val) || arr.some(item => item.includes(val)) ? 'X' : '\u00A0'}
      </span>
      <span>{val}</span>
    </span>
  );

  const handleUpdateStatus = async (newStatus: 'disetujui' | 'ditolak') => {
    if (updatingStatus) return;
    setUpdatingStatus(newStatus);
    // Update status secara optimis di UI lokal agar badge langsung berubah
    setLocalStatus(newStatus);

    if (!apiUrl || !data.id) {
      setUpdatingStatus(null);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/form-perubahan-it/${data.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUpdatingStatus(null);
        // Beri sedikit delay agar perubahan badge terlihat dulu sebelum kembali ke daftar
        setTimeout(() => onBack(), 400);
      } else {
        // Rollback status lokal jika request gagal
        setLocalStatus(data.status ?? null);
        setUpdatingStatus(null);
        alert(`Gagal memperbarui status. Kode Error: HTTP ${res.status}`);
      }
    } catch (err) {
      setLocalStatus(data.status ?? null);
      setUpdatingStatus(null);
      alert('Terjadi kesalahan jaringan saat menghubungi API backend.');
    }
  };

  // Tombol "Kembalikan ke Awal" hanya navigasi balik ke daftar, tanpa mengubah status apapun
  const handleBackToList = () => {
    onBack();
  };

  const handleDownloadPDF = () => {
    if (apiUrl && data.id) {
      window.open(`${apiUrl}/form-perubahan-it/${data.id}/pdf`, '_blank');
    } else {
      alert("API URL atau ID Data tidak ditemukan.");
    }
  };

  const formattedDate = data.tanggal_permohonan
    ? new Date(data.tanggal_permohonan).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : '-';

  const opsiJenisPerubahan = ['Permintaan Baru', 'Peningkatan Sistem', 'Perbaikan Sistem'];
  const opsiJenisPermohonan = [
    'I. Permintaan Sub-Domain', 'II. Perbaikan Sistem',
    'III. Pembuatan Akun Mail', 'IV. Reset Password Mail',
    'V. Penghapusan Akun Mail', 'VI. Akun Repository',
    'VII. SSL', 'VIII. Deaktivasi Aplikasi',
    'IX. Repointing', 'X. Replikasi Aplikasi'
  ];
  const opsiKriteriaRisiko = ['Malapetaka', 'Sangat Berat', 'Berat', 'Agak Berat', 'Tidak Berat'];

  // ============================================================
  // Helper: Lampiran Dokumen Pendukung (Multi-File)
  // FIX: BE mengirim array `dokumen_pendukung_urls`, bukan single
  // string `dokumen_pendukung_url`. Helper di bawah ini mendukung
  // banyak berkas sekaligus beserta ekstensi masing-masing.
  // ============================================================
  const dokumenUrls: string[] = data.dokumen_pendukung_urls ?? [];

  const getExtensionFromUrl = (url: string) => {
    const clean = url.split('?')[0];
    const ext = clean.split('.').pop()?.toLowerCase();
    return ext || 'file';
  };

  const isImageExt = (ext: string) => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  const isPdfExt = (ext: string) => ext === 'pdf';

  const getDokumenFileName = (url: string, index: number) => {
    try {
      const decoded = decodeURIComponent(url.split('/').pop() || '');
      return decoded || `Dokumen Pendukung ${index + 1}`;
    } catch {
      return `Dokumen Pendukung ${index + 1}`;
    }
  };

  // Index lampiran yang sedang dibuka di mode lightbox full-layar
  const [lampiranActiveIndex, setLampiranActiveIndex] = useState(0);

  // ============================================================
  // Komponen Tampilan Tanda Tangan: Menampilkan gambar dari BE
  // ============================================================
  const TandaTanganDisplay = ({ className = '' }: { className?: string }) => {
    if (data.tanda_tangan_url && !ttdImgError) {
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.tanda_tangan_url}
            alt="Tanda Tangan Pemohon"
            className="object-contain max-w-full max-h-full"
            onError={() => setTtdImgError(true)}
          />
        </div>
      );
    }
    // Fallback jika tidak ada URL atau gambar error
    return (
      <div className={`flex items-center justify-center text-slate-400 text-[11px] italic ${className}`}>
        {data.tanda_tangan_url && ttdImgError
          ? 'Gagal memuat gambar tanda tangan'
          : 'Tidak ada tanda tangan'}
      </div>
    );
  };

  // ============================================================
  // Komponen Tampilan Tanda Tangan untuk mode Print/Preview
  // ============================================================
  const TandaTanganCetak = () => {
    if (data.tanda_tangan_url && !ttdImgError) {
      return (
        <div className="relative flex items-center w-full h-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.tanda_tangan_url}
            alt="Tanda Tangan"
            className="max-h-16 max-w-[140px] object-contain"
            onError={() => setTtdImgError(true)}
          />
        </div>
      );
    }
    return <div className="h-14" />;
  };

  // --- TAMPILAN 2: PRINT PREVIEW (A4 Mockup) ---
  if (isPreview) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-12 animate-in fade-in duration-300">
        {/* Breadcrumb & Action Header */}
        <div className="px-8 py-4 border-b border-slate-200 bg-white flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-slate-500 hover:text-[#113289]">Permintaan Perubahan TI</button>
            <span className="text-slate-400">/</span>
            <button onClick={() => setIsPreview(false)} className="text-slate-500 hover:text-[#113289]">Detail {data.no_rfc || `RFC-00${data.id}`}</button>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-[#113289]">Preview Formulir Permintaan Perubahan TI</span>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 rounded-lg text-white bg-[#113289] hover:bg-[#0e276b] font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download PDF Resmi
          </button>
        </div>

        {/* Kertas Render Horizontal */}
        <div className="flex flex-col items-center justify-center gap-8 px-4 pb-8 mt-8 overflow-x-auto lg:flex-row lg:items-start">

          {/* Kertas Dokumen Halaman 1 */}
          <div className="w-[800px] h-[1131px] shrink-0 bg-white shadow-md border border-slate-300 p-12 flex flex-col text-black">
            <div className="flex mb-4 border border-black">
              <div className="w-[15%] p-2 border-r border-black flex flex-col items-center justify-center text-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Coat_of_arms_of_West_Java.svg/100px-Coat_of_arms_of_West_Java.svg.png" alt="Logo" className="object-contain w-12 h-auto" />
              </div>
              <div className="w-[50%] p-4 border-r border-black flex items-center justify-center text-center">
                <h2 className="text-sm font-bold tracking-wide">FORMULIR PERMINTAAN PERUBAHAN TI</h2>
              </div>
              <div className="w-[35%] text-[10px] flex flex-col">
                <div className="flex border-b border-black"><span className="p-1 w-[40%] border-r border-black font-semibold">No. Dokumen</span><span className="p-1 w-[60%]">FR-015/KOM.03.05/ SANDIKA</span></div>
                <div className="flex border-b border-black"><span className="p-1 w-[40%] border-r border-black font-semibold">No. Revisi</span><span className="p-1 w-[60%]">1.1</span></div>
                <div className="flex"><span className="p-1 w-[40%] border-r border-black font-semibold">Tgl Berlaku</span><span className="p-1 w-[60%]">1 Januari 2030</span></div>
              </div>
            </div>

            <div className="text-[12px] font-bold mb-2">No. Registrasi: {data.no_rfc || `RFC-00${data.id}`}</div>

            <table className="w-full text-[11px] border-collapse border border-black mb-4">
              <tbody>
                <tr className="bg-[#002160] text-white"><td colSpan={2} className="border border-black p-1.5 font-bold px-2">Informasi Pemohon</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold w-[30%]">Pemohon</td><td className="border border-black p-1.5 px-2 w-[70%]">{data.pemohon}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Unit Kerja</td><td className="border border-black p-1.5 px-2">{data.unit_kerja || '-'}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Perangkat Daerah</td><td className="border border-black p-1.5 px-2">{data.nama_perangkat_daerah || '-'}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Nomor Surat/Contact Person</td><td className="border border-black p-1.5 px-2">{data.nomor_kontak || '-'}</td></tr>

                <tr className="bg-[#002160] text-white"><td colSpan={2} className="border border-black p-1.5 font-bold px-2">Informasi Data</td></tr>
                <tr>
                  <td className="border border-black p-1.5 px-2 font-bold align-top">Jenis Perubahan</td>
                  <td className="border border-black p-1.5 px-2">
                    {opsiJenisPerubahan.map((opt) => renderCetakCheckbox(data.jenis_perubahan, opt, opt))}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 px-2 font-bold align-top pt-2">Jenis Permohonan</td>
                  <td className="border border-black p-1.5 px-2">
                    <div className="grid grid-cols-2 gap-y-1">
                      {opsiJenisPermohonan.map((opt) => renderCetakCheckbox(data.jenis_permohonan, opt, opt))}
                    </div>
                  </td>
                </tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Nama Aplikasi</td><td className="border border-black p-1.5 px-2">{data.nama_aplikasi || '-'}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Deskripsi Aplikasi</td><td className="border border-black p-1.5 px-2">{data.deskripsi_aplikasi || '-'}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Alamat Aplikasi</td><td className="border border-black p-1.5 px-2 text-blue-600 underline break-all">{data.alamat_aplikasi || '-'}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Alamat Repository</td><td className="border border-black p-1.5 px-2 break-all">{data.alamat_repository || '-'}</td></tr>

                <tr className="bg-[#002160] text-white"><td colSpan={2} className="border border-black p-1.5 font-bold px-2">Perubahan yang Diharapkan</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold align-top">Latar belakang perubahan</td><td className="border border-black p-1.5 px-2 align-top">{data.latar_belakang || '-'}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold align-top h-12">Rincian atas perubahan yang diajukan</td><td className="border border-black p-1.5 px-2 align-top">{data.rincian_perubahan || '-'}</td></tr>
                <tr>
                  <td className="border border-black p-1.5 px-2 font-bold align-top pt-2">Risiko terkait bila perubahan tidak dilakukan</td>
                  <td className="border border-black p-1.5 px-2 align-top">
                    <div className="mb-1 font-bold">Kriteria:</div>
                    <div className="pb-2 mb-2 border-b border-dashed border-slate-400">
                      {opsiKriteriaRisiko.map((opt) => renderCetakCheckbox(data.kriteria_risiko, opt, opt))}
                    </div>
                    <div>
                      <span className="font-bold">Keterangan:</span><br />
                      {data.risiko_tidak_dilakukan || '-'}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Kertas Dokumen Halaman 2 */}
          <div className="w-[800px] h-[1131px] shrink-0 bg-white shadow-md border border-slate-300 p-12 flex flex-col text-black">
            <div className="flex mb-4 border border-black">
              <div className="w-[15%] p-2 border-r border-black flex flex-col items-center justify-center text-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Coat_of_arms_of_West_Java.svg/100px-Coat_of_arms_of_West_Java.svg.png" alt="Logo" className="object-contain w-12 h-auto" />
              </div>
              <div className="w-[50%] p-4 border-r border-black flex items-center justify-center text-center">
                <h2 className="text-sm font-bold tracking-wide">FORMULIR PERMINTAAN PERUBAHAN TI</h2>
              </div>
              <div className="w-[35%] text-[10px] flex flex-col">
                <div className="flex border-b border-black"><span className="p-1 w-[40%] border-r border-black font-semibold">No. Dokumen</span><span className="p-1 w-[60%]">FR-015/KOM.03.05/ SANDIKA</span></div>
                <div className="flex border-b border-black"><span className="p-1 w-[40%] border-r border-black font-semibold">No. Revisi</span><span className="p-1 w-[60%]">1.1</span></div>
                <div className="flex"><span className="p-1 w-[40%] border-r border-black font-semibold">Tgl Berlaku</span><span className="p-1 w-[60%]">1 Januari 2030</span></div>
              </div>
            </div>

            <table className="w-full text-[11px] border-collapse border border-black mb-6">
              <tbody>
                <tr><td className="border border-black p-1.5 px-2 font-bold w-[30%]">Solusi yang diharapkan</td><td className="border border-black p-1.5 px-2 w-[70%]">{data.solusi_diharapkan || '-'}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Risiko Perubahan</td><td className="border border-black p-1.5 px-2">{data.risiko_perubahan || '-'}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Alternatif Perubahan</td><td className="border border-black p-1.5 px-2">{data.alternatif_perubahan || '-'}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Biaya Perubahan</td><td className="border border-black p-1.5 px-2">{data.biaya_perubahan ? `Rp ${data.biaya_perubahan}` : 'Rp 0,00'}</td></tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Waktu Perubahan</td><td className="border border-black p-1.5 px-2">{data.waktu_perubahan || '-'}</td></tr>
                <tr>
                  <td className="border border-black p-1.5 px-2 font-bold">Lampiran</td>
                  <td className="border border-black p-1.5 px-2">
                    {/* FIX: Tampilkan seluruh berkas lampiran (multi-file) dari dokumen_pendukung_urls */}
                    {dokumenUrls.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {dokumenUrls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-[10px]"
                          >
                            Lihat Lampiran {dokumenUrls.length > 1 ? idx + 1 : ''} ({getExtensionFromUrl(url).toUpperCase()})
                          </a>
                        ))}
                      </div>
                    ) : (data.lampiran || '-')}
                  </td>
                </tr>
                <tr><td className="border border-black p-1.5 px-2 font-bold">Tanggal Permohonan</td><td className="border border-black p-1.5 px-2">{formattedDate}</td></tr>
              </tbody>
            </table>

            {/* Kotak Tanda Tangan Blok 2x2 */}
            <div className="grid grid-cols-2 text-left text-[11px] border border-black">
              <div className="flex flex-col justify-between p-3 border-b border-r border-black min-h-[160px]">
                <div>Tanggal:<br /><span className="block mt-1 font-semibold">Dibuat Oleh:<br />Pemohon,</span></div>
                {/* FIX: Gambar tanda tangan asli dari BE, bukan placeholder cursive */}
                <div className="relative mt-2">
                  <TandaTanganCetak />
                  <div className="mt-1">Nama: {data.pemohon}<br />Jabatan: </div>
                </div>
              </div>
              <div className="flex flex-col justify-between p-3 border-b border-black min-h-[160px]">
                <div>Tanggal:<br /><span className="block mt-1 font-semibold">Diterima Oleh:<br />Koordinator Agen,</span></div>
                <div>Nama:<br />Jabatan:</div>
              </div>
              <div className="flex flex-col justify-between p-3 border-r border-black min-h-[160px]">
                <div>Tanggal:<br /><span className="block mt-1 font-semibold">Disetujui Oleh:<br />Penanggung Jawab Perangkat,</span></div>
                <div>Nama:<br />Jabatan:</div>
              </div>
              <div className="flex flex-col justify-between p-3 min-h-[160px]">
                <div>Tanggal:<br /><span className="block mt-1 font-semibold">Dilaksanakan Oleh:<br />Agen,</span></div>
                <div>Nama:<br />Jabatan:</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- TAMPILAN 1: NORMAL DASHBOARD DETAIL VIEW ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 animate-in fade-in duration-300">

      {/* Breadcrumb + Tombol Kembali */}
      <div className="px-8 py-5 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-slate-600 hover:text-[#113289] hover:bg-slate-100 transition shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali
          </button>
          <span className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <button onClick={onBack} className="hover:text-[#113289] transition">Permintaan Perubahan TI</button>
            <span>/</span>
            <span className="font-semibold text-slate-800">Detail {data.no_rfc || `RFC-00${data.id}`}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl px-6 mx-auto mt-6 space-y-6">

        {/* Baris Judul RFC, Status & Tombol Aksi */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#113289]">{data.no_rfc || `RFC-00${data.id}`}</h1>

            {currentStatus === 'Menunggu' && (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] text-xs font-bold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>MENUNGGU PERSETUJUAN
              </span>
            )}
            {currentStatus === 'Ditolak' && (
              <span className="flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wide text-red-600 bg-red-100 border border-red-200 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>DITOLAK
              </span>
            )}
            {(currentStatus === 'Disetujui' || currentStatus === 'Selesai') && (
              <span className="flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wide text-green-600 bg-green-100 border border-green-200 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>DISETUJUI
              </span>
            )}
          </div>

          {/* Tombol aksi hanya tampil selama status masih Menunggu Persetujuan. Setelah Disetujui/Ditolak, status sudah final. */}
          {currentStatus === 'Menunggu' && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleBackToList}
                className="px-4 py-2 border border-slate-300 rounded-lg text-[13px] font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-2 shadow-sm transition"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                Kembalikan ke Awal
              </button>
              <button
                onClick={() => handleUpdateStatus('ditolak')}
                disabled={updatingStatus !== null}
                className="px-4 py-2 border border-red-200 rounded-lg text-[13px] font-semibold text-red-600 bg-white hover:bg-red-50 flex items-center gap-2 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                {updatingStatus === 'ditolak' ? 'Memproses...' : 'Tolak'}
              </button>
              <button
                onClick={() => handleUpdateStatus('disetujui')}
                disabled={updatingStatus !== null}
                className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#113289] hover:bg-[#0e276b] flex items-center gap-2 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {updatingStatus === 'disetujui' ? 'Memproses...' : 'Setujui'}
              </button>
            </div>
          )}
        </div>

        {/* Card 1: Informasi Pemohon */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#113289]" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <h2 className="font-bold text-slate-800 text-[15px]">Informasi Pemohon</h2>
          </div>
          <div className="grid grid-cols-1 p-6 md:grid-cols-3 gap-y-6 gap-x-8">
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase">Nama Pemohon</p>
              <p className="text-[13px] font-semibold text-slate-800">{data.pemohon}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase">Unit Kerja</p>
              <p className="text-[13px] font-semibold text-slate-800">{data.unit_kerja || '-'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase">Perangkat Daerah</p>
              <p className="text-[13px] font-semibold text-slate-800">{data.nama_perangkat_daerah || '-'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase">Email Dinas</p>
              <p className="text-[13px] font-semibold text-blue-600">{data.email_dinas || '-'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase">Nomor Surat / Contact Person</p>
              <p className="text-[13px] font-semibold text-slate-800">{data.nomor_kontak || '-'}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Informasi Data Dinamis */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#113289]" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h2 className="font-bold text-slate-800 text-[15px]">Informasi Data</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-8 pb-8 mb-8 border-b md:grid-cols-3 border-slate-100">

              {/* Jenis Perubahan Dinamis */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wide">Jenis Perubahan</p>
                <div className="flex flex-col gap-2 text-[13px]">
                  {opsiJenisPerubahan.map((opt) => {
                    const active = data.jenis_perubahan?.includes(opt);
                    return (
                      <label key={opt} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center bg-white ${active ? 'border-[#113289]' : 'border-slate-300'}`}>
                          {active && <div className="w-1.5 h-1.5 rounded-full bg-[#113289]" />}
                        </div>
                        <span className={active ? 'font-semibold text-slate-800' : 'text-slate-400'}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Jenis Permohonan Dinamis */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wide">Jenis Permohonan</p>
                <div className="flex flex-col gap-2 text-[13px] max-h-52 overflow-y-auto pr-2">
                  {opsiJenisPermohonan.map((opt) => {
                    const active = data.jenis_permohonan?.includes(opt) || data.jenis_permohonan?.some(item => item.includes(opt));
                    return (
                      <label key={opt} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center text-white ${active ? 'bg-[#113289] border-[#113289]' : 'border-slate-300 bg-white'}`}>
                          {active && <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={active ? 'font-semibold text-slate-800' : 'text-slate-400'}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Kriteria Risiko Dinamis */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wide">Kriteria Risiko Sistem</p>
                <div className="flex flex-col gap-2 text-[13px]">
                  {opsiKriteriaRisiko.map((opt) => {
                    const active = data.kriteria_risiko?.includes(opt);
                    return (
                      <label key={opt} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center text-white ${active ? 'bg-[#113289] border-[#113289]' : 'border-slate-300 bg-white'}`}>
                          {active && <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={active ? 'font-semibold text-slate-800' : 'text-slate-400'}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panel Detail Aplikasi */}
            <div className="bg-[#F8FAFC] rounded-xl p-6 border border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 mb-5 uppercase tracking-wide">Detail Aplikasi</p>
              <div className="grid grid-cols-1 mb-6 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">Nama Aplikasi</p>
                  <p className="text-[13px] font-bold text-slate-800">{data.nama_aplikasi || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">Alamat Aplikasi (URL)</p>
                  <p className="text-[13px] font-medium text-blue-600 break-all">{data.alamat_aplikasi || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">Deskripsi Aplikasi</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{data.deskripsi_aplikasi || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">Biaya Perubahan</p>
                  <p className="text-[13px] text-slate-700 font-semibold">{data.biaya_perubahan ? `Rp ${data.biaya_perubahan}` : 'Rp 0,00'}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 mb-2">Alamat Repository</p>
                <div className="bg-slate-200/60 font-mono text-[12px] text-slate-700 px-4 py-2.5 rounded-md break-all">
                  {data.alamat_repository || '-'}
                </div>
              </div>
            </div>

            {/* Grid Analisis Perubahan */}
            <div className="mt-8">
              <p className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wide">Analisis Komparasi Perubahan</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Latar Belakang Perubahan', value: data.latar_belakang },
                  { label: 'Rincian Atas Perubahan Diajukan', value: data.rincian_perubahan },
                  { label: 'Keterangan Risiko Bila Tidak Dilakukan', value: data.risiko_tidak_dilakukan },
                  { label: 'Solusi Yang Diharapkan', value: data.solusi_diharapkan },
                  { label: 'Risiko Perubahan', value: data.risiko_perubahan },
                  { label: 'Alternatif Perubahan', value: data.alternatif_perubahan },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
                    <p className="text-[11px] font-bold text-[#113289] mb-1.5 uppercase tracking-tight">{item.label}</p>
                    <p className="text-[13px] text-slate-700 whitespace-pre-line leading-relaxed">{item.value || '-'}</p>
                  </div>
                ))}
                <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200 md:col-span-2 lg:col-span-1">
                  <p className="text-[11px] font-bold text-[#113289] mb-1.5 uppercase tracking-tight">Waktu Perubahan</p>
                  <p className="text-[13px] text-slate-700 font-semibold">{data.waktu_perubahan || '-'}</p>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* FIX: Lampiran Dokumen — render SEMUA berkas (multi-file)     */}
            {/* dari dokumen_pendukung_urls, preview langsung per-file,      */}
            {/* klik untuk lihat full layar.                                 */}
            {/* ============================================================ */}
            <div className="mt-8">
              <p className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wide">
                Lampiran Dokumen Pendukung {dokumenUrls.length > 0 && `(${dokumenUrls.length} berkas)`}
              </p>
              {dokumenUrls.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {dokumenUrls.map((url, idx) => {
                    const ext = getExtensionFromUrl(url);
                    const isImg = isImageExt(ext);
                    const isPdf = isPdfExt(ext);
                    const fileName = getDokumenFileName(url, idx);
                    return (
                      <div key={idx} className="w-full overflow-hidden border rounded-lg shadow-sm border-slate-200">
                        {/* Header info file */}
                        <div className="flex items-center gap-3 p-3 border-b bg-slate-50/50 border-slate-200">
                          <div className={`w-9 h-9 flex items-center justify-center rounded-lg shrink-0 font-bold text-[10px] text-white ${isPdf ? 'bg-red-500' : 'bg-[#113289]'}`}>
                            {isPdf ? 'PDF' : ext.toUpperCase()}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[13px] font-bold text-slate-800 truncate" title={fileName}>
                              {fileName}
                            </p>
                            <p className="text-[11px] text-slate-400 capitalize">File {ext} terlampir</p>
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-[#113289] p-1.5 rounded transition-colors shrink-0"
                            title="Buka di tab baru"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        </div>

                        {/* Preview konten file */}
                        {isImg ? (
                          <button
                            type="button"
                            onClick={() => { setLampiranActiveIndex(idx); setIsLampiranFullscreen(true); }}
                            className="relative block w-full overflow-hidden group bg-slate-900/5"
                            title="Klik untuk lihat full layar"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={fileName}
                              className="object-contain w-full p-2 bg-white max-h-56"
                            />
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/0 group-hover:bg-black/30 group-hover:opacity-100">
                              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/95 text-slate-800 text-[12px] font-semibold shadow-sm">
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                Lihat Full Layar
                              </span>
                            </div>
                          </button>
                        ) : isPdf ? (
                          <div className="relative">
                            <iframe
                              src={url}
                              title={`Preview Lampiran PDF ${fileName}`}
                              className="w-full h-56 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => { setLampiranActiveIndex(idx); setIsLampiranFullscreen(true); }}
                              className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#113289] text-white text-[11px] font-semibold shadow-sm hover:bg-[#0e276b] transition top-2 right-2"
                              title="Lihat full layar"
                            >
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                              Full Layar
                            </button>
                          </div>
                        ) : (
                          <p className="p-4 text-[12px] text-slate-400 italic">Pratinjau tidak tersedia untuk tipe file ini. Gunakan tombol buka tab baru di atas.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-slate-400 italic">Tidak ada lampiran dokumen untuk permohonan ini.</p>
              )}
            </div>

          </div>
        </div>

        {/* Card 3: Laporan & Konfirmasi + Tanda Tangan */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#113289]" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <h2 className="font-bold text-slate-800 text-[15px]">Laporan & Konfirmasi</h2>
          </div>
          <div className="flex flex-col justify-between gap-8 p-6 md:flex-row">
            <div className="flex-1 space-y-4">
              <p className="text-[13px] text-slate-700">Saya menyatakan bahwa data yang diisi adalah benar dan telah melalui koordinasi internal unit kerja.</p>

              <div className="flex gap-3 border border-slate-100 rounded-lg p-4 bg-[#F8FAFC]">
                <div className="mt-0.5 w-4 h-4 shrink-0 rounded bg-[#113289] flex items-center justify-center text-white"><svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                <span className="text-[13px] text-slate-700 font-medium">Data yang disampaikan telah sesuai dengan standar operasional prosedur rekayasa aplikasi.</span>
              </div>

              <div className="flex gap-3 border border-slate-100 rounded-lg p-4 bg-[#F8FAFC]">
                <div className="mt-0.5 w-4 h-4 shrink-0 rounded bg-[#113289] flex items-center justify-center text-white"><svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                <span className="text-[13px] text-slate-700 font-medium">Menyetujui risiko perubahan yang telah diidentifikasi dan siap melaksanakan mitigasi.</span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* FIX: Digital Signature — tampilkan gambar dari BE             */}
            {/* ============================================================ */}
            <div className="w-full md:w-64 bg-[#F3F4F6] rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center shrink-0">
              <p className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest uppercase">Tanda Tangan Digital</p>
              <div className="flex items-center justify-center w-full p-2 mb-3 overflow-hidden bg-white border rounded shadow-inner h-28 border-slate-200">
                <TandaTanganDisplay className="w-full h-full" />
              </div>
              <p className="text-[12px] font-bold text-slate-800 uppercase text-center">{data.pemohon}</p>
              <p className="text-[10px] text-slate-400 text-center mt-0.5">Pemohon Perubahan IT</p>
              {data.tanda_tangan_url && (
                <a
                  href={data.tanda_tangan_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-[10px] text-[#113289] underline hover:opacity-75 transition"
                >
                  Lihat file asli
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Menuju Mode Cetak */}
        <div className="flex justify-end pt-4">
          <button
            onClick={() => setIsPreview(true)}
            className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white bg-[#113289] hover:bg-[#0e276b] flex items-center gap-2 shadow-md transition-all duration-200"
          >
            Cetak <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>

      </div>

      {/* Modal Lightbox: Preview Lampiran Dokumen Full Layar */}
      {isLampiranFullscreen && dokumenUrls.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80"
          onClick={() => setIsLampiranFullscreen(false)}
        >
          <button
            onClick={() => setIsLampiranFullscreen(false)}
            className="absolute flex items-center justify-center w-10 h-10 text-white transition rounded-full bg-white/10 hover:bg-white/20 top-5 right-5"
            title="Tutup"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Navigasi antar lampiran, hanya tampil jika lebih dari 1 berkas */}
          {dokumenUrls.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLampiranActiveIndex((lampiranActiveIndex - 1 + dokumenUrls.length) % dokumenUrls.length); }}
                className="absolute flex items-center justify-center w-10 h-10 text-white transition -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 left-5 top-1/2"
                title="Sebelumnya"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLampiranActiveIndex((lampiranActiveIndex + 1) % dokumenUrls.length); }}
                className="absolute flex items-center justify-center w-10 h-10 text-white transition -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 right-5 top-1/2"
                title="Berikutnya"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
              <span className="absolute px-3 py-1 text-[12px] font-semibold text-white -translate-x-1/2 rounded-full bottom-5 left-1/2 bg-white/10">
                {lampiranActiveIndex + 1} / {dokumenUrls.length}
              </span>
            </>
          )}

          {(() => {
            const activeUrl = dokumenUrls[lampiranActiveIndex];
            const ext = getExtensionFromUrl(activeUrl);
            return isImageExt(ext) ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeUrl}
                alt={getDokumenFileName(activeUrl, lampiranActiveIndex)}
                className="object-contain max-w-full max-h-full rounded shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <iframe
                src={activeUrl}
                title="Preview Lampiran PDF Full Layar"
                className="w-full h-full max-w-5xl bg-white rounded shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            );
          })()}
        </div>
      )}

    </div>
  );
}