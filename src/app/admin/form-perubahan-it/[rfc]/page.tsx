'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDetailTicketPage() {
  const params = useParams();
  const router = useRouter();
  const rfc = params.rfc as string;

  const [ticket, setTicket] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('detail');
  
  // State untuk Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  useEffect(() => {
    // Sesuaikan URL fetch dengan API Backend Anda
    fetch(`http://localhost:8000/api/form-perubahan-it/ticket/${rfc}`)
      .then((res) => res.json())
      .then((data) => {
        setTicket(data);
      });
  }, [rfc]);

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7F9]">
        <p className="text-lg font-semibold text-slate-500">Memuat data tiket...</p>
      </div>
    );
  }

  // Helper Array Parser (Sama dengan versi user)
  const formatArrayString = (str: any) => {
    if (!str) return '-';
    if (Array.isArray(str)) return str.join(', ');
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed.join(', ') : str;
    } catch (e) {
      return str.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans">
      
      {/* ======================= */}
      {/* SIDEBAR ADMIN           */}
      {/* ======================= */}
      <aside className="w-[260px] flex-shrink-0 bg-[#0F172A] text-slate-300 flex flex-col">
        <div className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            A
          </div>
        </div>
        
        <div className="flex-1 px-4 py-4">
          <p className="px-2 text-[11px] font-bold tracking-wider text-slate-500">ADMINISTRASI</p>
          <div className="mt-4 space-y-1">
            <Link href="/admin/form-perubahan-it" className="flex items-center gap-3 rounded-lg bg-[#1E293B] px-3 py-2.5 text-sm font-medium text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Permohonan TI
            </Link>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#1E293B] p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 font-bold text-white">N</div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-medium text-white">APTIKA - Diskominfo Jabar</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ======================= */}
      {/* MAIN CONTENT AREA       */}
      {/* ======================= */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-8">
          
          {/* Header Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Aptika Tools / Administrasi</p>
              <h1 className="text-xl font-bold text-slate-800">Detail Permohonan</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/admin/form-perubahan-it')}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span>←</span> Daftar Tiket
              </button>
              <span className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-[#153289]">
                Admin APTIKA
              </span>
            </div>
          </div>

          {/* Ticket Header & Actions */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-[#0F172A]">{ticket.no_rfc || 'RFC-2026-0024'}</h2>
                
                {/* Contoh Badge Status Perlu Perbaikan sesuai Mockup */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                  Perlu Perbaikan
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {ticket.alamat_aplikasi || 'https://akdjsbf'} • {ticket.alamat_repository || 'https://akdjsbf'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Tombol Simulasi: Minta Perbaikan (menampilkan Modal 2) */}
              <button 
                onClick={() => setIsRevisionModalOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Minta Perbaikan
              </button>

              <button className="flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1E293B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                Pilih Agen
              </button>
              <button 
                onClick={() => setIsStatusModalOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Ubah Status
              </button>
            </div>
          </div>

          {/* White Card Container */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            
            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-6">
              {['detail', 'dokumen', 'riwayat'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-6 py-4 text-sm font-semibold capitalize transition-colors ${
                    activeTab === tab 
                      ? 'border-[#153289] text-[#153289]' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'detail' ? 'Detail Permohonan' : tab}
                </button>
              ))}
            </div>

            {/* Tab Content: Detail Permohonan */}
            {activeTab === 'detail' && (
              <div className="p-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                  
                  {/* KOLOM KIRI */}
                  <div className="space-y-8">
                    {/* Seksi 1: Identitas Pemohon */}
                    <section>
                      <h3 className="mb-6 text-lg font-bold text-slate-800">Identitas Pemohon</h3>
                      <div className="space-y-5">
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Nama & Jabatan</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.pemohon || '-'} · {ticket.jabatan || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Unit Kerja</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.unit_kerja || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Perangkat Daerah</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.nama_perangkat_daerah || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Email Dinas</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.email_dinas || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">PIC Teknis</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.pic_teknis || '-'} · {ticket.nomor_kontak || '-'}</p>
                        </div>
                      </div>
                    </section>

                    {/* Seksi 2: Informasi Aplikasi */}
                    <section className="pt-4">
                      <h3 className="mb-6 text-lg font-bold text-slate-800">Informasi Aplikasi</h3>
                      <div className="space-y-5">
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Nama Aplikasi</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.nama_aplikasi || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Deskripsi</p>
                          <p className="text-sm font-semibold text-slate-900 leading-relaxed">{ticket.deskripsi_aplikasi || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">URL Baru</p>
                          <p className="text-sm font-semibold text-[#153289]">{ticket.alamat_aplikasi || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Target IP / CNAME</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.target_ip_cname || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Kebutuhan SSL</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.kebutuhan_ssl ? 'Ya' : 'Tidak'}</p>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* KOLOM KANAN */}
                  <div className="space-y-8">
                    {/* Seksi 3: Informasi Surat */}
                    <section>
                      <h3 className="mb-6 text-lg font-bold text-slate-800">Informasi Surat</h3>
                      <div className="space-y-5">
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Nomor Surat</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.nomor_surat || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Tanggal Surat</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.tanggal_surat || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Perihal</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.perihal_surat || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Lampiran</p>
                          <p className="text-sm font-semibold text-slate-900">
                             {/* Simulasi nama file */}
                             {ticket.dokumen_pendukung_file ? 'Tabel Kontribusi Kelompok 3.pdf' : '-'}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Seksi 4: Detail Perubahan & Risiko */}
                    <section className="pt-4">
                      <h3 className="mb-6 text-lg font-bold text-slate-800">Detail Perubahan & Risiko</h3>
                      <div className="space-y-5">
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Jenis Perubahan</p>
                          <p className="text-sm font-semibold text-slate-900">{formatArrayString(ticket.jenis_perubahan)}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Rincian</p>
                          <p className="text-sm font-semibold text-slate-900 leading-relaxed">{ticket.rincian_perubahan || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Dampak</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.dampak_perubahan || '-'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Tingkat Risiko</p>
                          <p className="text-sm font-semibold text-slate-900">{formatArrayString(ticket.kriteria_risiko)}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">Mitigasi</p>
                          <p className="text-sm font-semibold text-slate-900">{ticket.solusi_diharapkan || '-'}</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Warning Catatan Admin Box */}
                {ticket.catatan_admin && (
                  <div className="mt-8 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <p className="text-sm font-medium text-amber-800">
                      Catatan admin: <span className="font-normal">{ticket.catatan_admin}</span>
                    </p>
                  </div>
                )}
                
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ======================= */}
      {/* MODAL 1: UBAH STATUS    */}
      {/* ======================= */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Ubah Status Tiket</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Status baru</label>
              <select className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>Dokumen Sedang Disiapkan</option>
                <option>Perlu Tanda Tangan</option>
                <option>Proses Persetujuan APTIKA</option>
                <option>Dalam Pengerjaan</option>
                <option>Selesai</option>
              </select>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsStatusModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Batal</button>
              <button className="rounded-lg bg-[#0F172A] px-6 py-2 text-sm font-medium text-white hover:bg-[#1E293B]">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= */}
      {/* MODAL 2: MINTA PERBAIKAN*/}
      {/* ======================= */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Minta Perbaikan Data</h3>
              <button onClick={() => setIsRevisionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Catatan perbaikan <span className="text-red-500">*</span></label>
                <textarea 
                  rows={3} 
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Masukkan catatan..."
                ></textarea>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-slate-700">Field yang perlu diperbaiki <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-blue-500 bg-blue-50 p-3">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                    <span className="text-sm font-bold text-slate-900">Target IP / CNAME</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    <span className="text-sm font-medium text-slate-600">Lampiran teknis</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    <span className="text-sm font-medium text-slate-600">Informasi aplikasi</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    <span className="text-sm font-medium text-slate-600">Informasi surat</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Batas waktu <span className="font-normal text-slate-400">(opsional)</span></label>
                <input 
                  type="date" 
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsRevisionModalOpen(false)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Batal</button>
              <button className="flex items-center gap-2 rounded-lg bg-[#0F172A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1E293B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Kirim Permintaan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}