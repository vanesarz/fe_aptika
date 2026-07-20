'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { statusMap } from '../../utils/ticket-status';
import { getPerubahanItByRfc } from '@/services/api';

export default function DetailTicketPage() {
  const params = useParams();
  const rfc = params.rfc as string;

  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    if (!rfc) return;
    getPerubahanItByRfc(rfc)
      .then((data: any) => {
        setTicket(data);
      })
      .catch((err: any) => {
        console.error("Failed to load ticket", err);
        setTicket(null);
      });
  }, [rfc]);

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] p-8">
        <div className="mx-auto max-w-[1400px] rounded-xl border bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-bold">Ticket tidak ditemukan</h1>
          <Link
            href="/form-perubahan-it"
            className="mt-6 inline-flex rounded-lg bg-[#153289] px-4 py-2 text-white"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = statusMap[ticket.status] ?? statusMap.menunggu;
  const currentStep = currentStatus.step;

  const steps = [
    'Permohonan Dikirim',
    'Verifikasi Admin APTIKA',
    'Dokumen & Tanda Tangan',
    'Pengerjaan',
    'Selesai',
  ];

  // Format tanggal menjadi: 5 Juli 2026, 11.49
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(' pukul ', ', ').replace(':', '.');
  };

  // Helper untuk mengubah "[\"Item A\", \"Item B\"]" menjadi "Item A, Item B"
 const formatArrayString = (str: any) => {
    if (!str) return '-';
    if (Array.isArray(str)) return str.join(', ');
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed.join(', ') : str;
    } catch (e) {
      // Jika gagal di-parse, bersihkan tanda kurung siku/kutip dan beri spasi setelah koma
      return str.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
    }
  };

return (
    <div className="min-h-screen bg-[#F4F7F9] p-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        
        {/* Header Paling Atas */}
        <div className="relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white px-6 py-10 text-center shadow-sm">
          <img src="/hiasan.png" alt="Hiasan Kiri" className="pointer-events-none absolute bottom-0 left-0 h-40 w-auto rotate-180 object-contain opacity-80" />
          <img src="/hiasan.png" alt="Hiasan Kanan" className="pointer-events-none absolute top-0 right-0 h-40 w-auto object-contain opacity-80" />
          <div className="relative z-10">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#153289]">APTIKA Tools</p>
            <h1 className="mb-2 text-[22px] font-extrabold text-slate-800">Formulir Permohonan Perubahan TI</h1>
            <p className="mx-auto max-w-lg text-[13px] leading-relaxed text-slate-500">
              Formulir ini digunakan untuk mengajukan perubahan pada layanan atau sistem TI.<br />
              Mohon lengkapi data dengan benar. Permohonan akan diverifikasi oleh Tim APTIKA.
            </p>
          </div>
        </div>

        {/* Tombol Lacak permohonan lain */}
        <Link href="/form-perubahan-it" className="inline-flex items-center text-[#153289] hover:underline font-medium">
          <span className="mr-2">←</span> Kembali ke Dashboard Tiket
        </Link>

        {/* Header Info (RFC) */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 py-2">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-[#153289]">{ticket.no_rfc || 'RFC-001'}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${currentStatus.badgeClass || 'border-amber-200 bg-amber-50 text-amber-600'}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                {currentStatus.label || ticket.status}
              </span>
            </div>
            <p className="mt-2 text-slate-500 font-medium">
              {ticket.alamat_aplikasi || '-'} • {formatArrayString(ticket.jenis_permohonan)}
            </p>
          </div>
          <div className="text-right text-sm text-slate-500 space-y-1">
            <p>Diajukan {formatDate(ticket.created_at)}</p>
            <p>Terakhir diperbarui {formatDate(ticket.updated_at || ticket.created_at)}</p>
          </div>
        </div>

        {/* Card Stepper */}
        <div className="rounded-xl border bg-white p-10 shadow-sm overflow-x-auto">
          <div className="relative flex justify-between min-w-[700px]">
            <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-slate-200" />
            {steps.map((step, index) => {
              const active = index + 1 <= currentStep;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center w-40">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-semibold ${active ? 'border-[#153289] bg-[#153289] text-white' : 'border-slate-300 bg-white text-slate-400'}`}>
                    {index + 1}
                  </div>
                  <p className={`mt-4 text-center text-sm font-medium leading-tight ${active ? 'text-[#153289]' : 'text-slate-400'}`}>
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Layout: Ringkasan & Riwayat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Kiri: Ringkasan Permohonan & Analisis */}
          <div className="lg:col-span-2 rounded-xl border border-[#3b82f6] bg-white p-8 shadow-sm">
            <h2 className="mb-8 text-xl font-bold text-slate-800">Ringkasan Permohonan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4 mb-8">
              {/* Kolom 1 */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Nama Pemohon</p>
                  <p className="text-sm font-semibold text-slate-900">{ticket.pemohon || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Email Dinas</p>
                  <a href={`mailto:${ticket.email_dinas}`} className="text-sm font-semibold text-[#153289] hover:underline">
                    {ticket.email_dinas || '-'}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Jenis Permohonan</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatArrayString(ticket.jenis_permohonan)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Alamat Aplikasi</p>
                  <a href={ticket.alamat_aplikasi?.startsWith('http') ? ticket.alamat_aplikasi : `https://${ticket.alamat_aplikasi}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#153289] hover:underline break-all">
                    {ticket.alamat_aplikasi || '-'}
                  </a>
                </div>
              </div>

              {/* Kolom 2 */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Unit Kerja</p>
                  <p className="text-sm font-semibold text-slate-900">{ticket.unit_kerja || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Nomor Surat / Contact Person</p>
                  <p className="text-sm font-semibold text-slate-900">{ticket.nomor_kontak || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Nama Aplikasi</p>
                  <p className="text-sm font-semibold text-slate-900">{ticket.nama_aplikasi || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Alamat Repository</p>
                  <a href={ticket.alamat_repository?.startsWith('http') ? ticket.alamat_repository : `https://${ticket.alamat_repository}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-900 hover:underline break-all">
                    {ticket.alamat_repository || '-'}
                  </a>
                </div>
              </div>

              {/* Kolom 3 */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Perangkat Daerah</p>
                  <p className="text-sm font-semibold text-slate-900">{ticket.nama_perangkat_daerah || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Jenis Perubahan</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatArrayString(ticket.jenis_perubahan)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Deskripsi Aplikasi</p>
                  <p className="text-sm font-semibold text-slate-900 line-clamp-2" title={ticket.deskripsi_aplikasi}>
                    {ticket.deskripsi_aplikasi || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Biaya Perubahan</p>
                  <p className="text-sm font-semibold text-slate-900">{ticket.biaya_perubahan || 'Rp 0,00'}</p>
                </div>
              </div>
            </div>

            {/* Bagian Analisis Perubahan */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Analisis Perubahan</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {/* Kotak 1 */}
                <div className="rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-[11px] font-bold text-[#153289] mb-1">Perubahan yang diharapkan</p>
                  <p className="text-sm text-slate-800 line-clamp-3">{ticket.keterangan || ticket.rincian_perubahan || '-'}</p>
                </div>
                {/* Kotak 2 */}
                <div className="rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-[11px] font-bold text-[#153289] mb-1">Latar belakang perubahan</p>
                  <p className="text-sm text-slate-800 line-clamp-3">{ticket.latar_belakang || '-'}</p>
                </div>
                {/* Kotak 3 */}
                <div className="rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-[11px] font-bold text-[#153289] mb-1">Rincian atas perubahan</p>
                  <p className="text-sm text-slate-800 line-clamp-3">{ticket.rincian_perubahan || '-'}</p>
                </div>
                {/* Kotak 4 */}
                <div className="rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-[11px] font-bold text-red-600 mb-1">Keterangan resiko terkait</p>
                  <p className="text-sm text-slate-800 line-clamp-3">
                    {formatArrayString(ticket.kriteria_risiko) !== '-' ? formatArrayString(ticket.kriteria_risiko) : (ticket.risiko_perubahan || '-')}
                  </p>
                </div>
                {/* Kotak 5 */}
                <div className="rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-[11px] font-bold text-emerald-600 mb-1">Solusi yang diharapkan</p>
                  <p className="text-sm text-slate-800 line-clamp-3">{ticket.solusi_diharapkan || '-'}</p>
                </div>
                {/* Kotak 6 */}
                <div className="rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-[11px] font-bold text-amber-600 mb-1">Waktu Perubahan</p>
                  <p className="text-sm text-slate-800 line-clamp-3">{ticket.waktu_perubahan || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kanan: Riwayat Status */}
          <div className="rounded-xl border bg-white p-8 shadow-sm h-fit">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#153289" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Riwayat Status
            </h2>
            <div className="relative border-l-2 border-slate-100 ml-2 mt-4 space-y-6">
              {ticket.histories && ticket.histories.length > 0 ? (
                ticket.histories.map((history: any, index: number) => (
                  <div key={history.id || index} className="relative pl-6">
                    <div className="absolute h-2.5 w-2.5 rounded-full bg-[#153289] -left-[5px] top-1.5 ring-4 ring-white" />
                    <p className="text-sm font-semibold text-slate-900">{history.keterangan || `Status: ${history.status}`}</p>
                    {history.catatan && <p className="mt-1 text-xs text-slate-500">{history.catatan}</p>}
                    <p className="mt-2 text-[11px] text-slate-400">{formatDate(history.created_at)}</p>
                  </div>
                ))
              ) : (
                <div className="relative pl-6">
                  <div className="absolute h-2.5 w-2.5 rounded-full bg-[#153289] -left-[5px] top-1.5 ring-4 ring-white" />
                  <p className="text-sm font-semibold text-slate-900">Permohonan berhasil dikirim</p>
                  <p className="mt-1 text-xs text-slate-500">Data permohonan diterima dan menunggu verifikasi.</p>
                  <p className="mt-2 text-[11px] text-slate-400">{formatDate(ticket.created_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================= */}
        {/* Daftar Dokumen (Desain Baru) */}
        {/* ======================= */}
        <div className="rounded-xl border bg-white p-8 shadow-sm mt-6">
          <h2 className="mb-6 text-xl font-bold text-slate-800">Daftar Dokumen</h2>
          
          {(() => {
            let files = [];
            try {
              files = JSON.parse(ticket.dokumen_pendukung_file || '[]');
              if (!Array.isArray(files)) files = [];
            } catch (e) { files = []; }

            if (files.length > 0) {
              return (
                <div className="flex flex-wrap gap-4">
                  {files.map((path: string, idx: number) => {
                    const fileUrl = `http://localhost:8000/storage/${path.replace(/\\/g, '/')}`;
                    const fileName = path.split('/').pop() || `Lampiran_${idx + 1}`;
                    const isPdf = fileName.toLowerCase().endsWith('.pdf');
                    const uploadDate = formatDate(ticket.created_at).split(',')[0]; // Ambil tanggalnya saja
                    
                    return (
                      <div key={idx} className="flex items-center justify-between w-full max-w-[320px] rounded-xl border border-slate-200 p-4 shadow-sm bg-white hover:border-[#153289] transition-colors">
                        <div className="flex items-center gap-4 overflow-hidden">
                          {/* Ikon File Dinamis */}
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${isPdf ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#153289]'}`}>
                            {isPdf ? (
                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            ) : (
                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            )}
                          </div>
                          
                          {/* Detail File */}
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-bold text-slate-800" title={fileName}>
                              {fileName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Diunggah {uploadDate}
                            </span>
                          </div>
                        </div>
                        
                        {/* Tombol Aksi */}
                        <a href={fileUrl} target="_blank" rel="noreferrer" className="ml-3 text-slate-400 hover:text-[#153289] bg-slate-50 p-1.5 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                      </div>
                    );
                  })}
                </div>
              );
            }

            return (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
                Belum ada dokumen yang tersedia.
              </div>
            );
          })()}
        </div>
        
      </div>
    </div>
  );
}