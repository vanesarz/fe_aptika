'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DetailPengerjaanAdmin() {
  const params = useParams();
  const router = useRouter();
  const rfc = params.rfc as string;

  const [ticket, setTicket] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('detail');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  // ==========================================
  // STATE BARU UNTUK FITUR UBAH STATUS
  // ==========================================
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Ambil data detail permohonan dari API Laravel
  const fetchTicketDetail = () => {
    fetch(`http://localhost:8000/api/form-perubahan-it/ticket/${rfc}`)
      .then((res) => res.json())
      .then((data) => {
        setTicket(data);
        // Set default status di select modal sesuai status tiket saat ini
        if (data && data.status) {
          setSelectedStatus(data.status);
        }
      });
  };

  useEffect(() => {
    fetchTicketDetail();
  }, [rfc]);

  // ==========================================
  // FUNGSI UNTUK MENYIMPAN PERUBAHAN STATUS
  // ==========================================
  const handleSaveStatus = async () => {
    if (!selectedStatus || isSavingStatus) return;
    
    setIsSavingStatus(true);
    try {
      // Endpoint PATCH status disesuaikan dengan API backend Laravel Anda
      const res = await fetch(`http://localhost:8000/api/form-perubahan-it/${ticket.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus.toLowerCase() }),
      });

      if (res.ok) {
        setIsStatusModalOpen(false);
        // Refresh data di layar setelah berhasil disimpan
        fetchTicketDetail(); 
        alert('Status tiket berhasil diperbarui!');
      } else {
        alert(`Gagal memperbarui status. HTTP ${res.status}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan saat menghubungi API.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  if (!ticket) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F4F7F9]">Memuat data...</div>;
  }

  // Format Status Teks untuk Badge agar Rapi
  const formatBadgeStatus = (status: string) => {
    if (!status) return 'Menunggu';
    if (status.toLowerCase() === 'disetujui') return 'Disetujui';
    if (status.toLowerCase() === 'ditolak') return 'Ditolak';
    if (status.toLowerCase() === 'selesai') return 'Selesai';
    return status;
  };


  

  return (
    
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans">
      
      
      {/* SIDEBAR ADMIN */}
      
      <aside className="w-[235px] flex-shrink-0 bg-[#0D3158] text-slate-300 flex flex-col">
        <div className="p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18477D] shadow-lg text-white font-bold">
                A
                </div>
        </div>
        
        <div className="flex-1 px-4 py-4">
          <p className="px-2 text-[11px] font-bold tracking-wider text-slate-500">ADMINISTRASI</p>
          <div className="mt-4 space-y-1">
            <Link href="/form-perubahan-it/pengerjaan" className="flex items-center gap-3 rounded-lg bg-[#264669] px-3 py-2.5 text-sm font-medium text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Permohonan TI
            </Link>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#0D3158] p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 font-bold text-white">N</div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-medium text-white">APTIKA - Diskominfo Jabar</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
<main className="flex-1 overflow-y-auto bg-[#F5F7FA]">
<div className="border-b border-slate-200 bg-white px-6 py-3">

    {/* Header Halaman */}
    <div className="mb-6 flex items-start justify-between">

      {/* Kiri */}
      <div>
        <p className="text-sm text-slate-500">
          Aptika Tools / Administrasi
        </p>

        <h1 className="mt-1 text-3xl font-bold text-[#16325B]">
          Detail Permohonan
        </h1>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-3">

        <button
          onClick={() => router.push("/form-perubahan-it/pengerjaan")}
          className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>

          Daftar Tiket
        </button>

        <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
          Admin APTIKA
        </div>

      </div>

    </div>
</div>






        <div className="w-full px-6 py-5">
          
      

          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-[#0F172A]">{ticket.no_rfc || 'RFC-001'}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                  {formatBadgeStatus(ticket.status)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {ticket.alamat_aplikasi || '-'} • {ticket.alamat_repository || '-'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1E293B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                Pilih Agen
              </button>
              <button onClick={() => setIsStatusModalOpen(true)} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Ubah Status
              </button>
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex border-b border-slate-100 px-6">
              {['detail', 'dokumen', 'riwayat'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 px-6 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'border-[#153289] text-[#153289]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  {tab === 'detail' ? 'Detail Permohonan' : tab}
                </button>
              ))}
            </div>
            {activeTab === 'dokumen' && (
              <div className="p-8">
                <h3 className="mb-6 text-lg font-bold text-slate-800">Dokumen Pendukung</h3>
                {(() => {
                  let files = [];
                  try {
                    // Coba parse dari string JSON jika dari database
                    files = JSON.parse(ticket.dokumen_pendukung_file || '[]');
                    if (!Array.isArray(files)) files = [];
                  } catch (e) {
                    files = [];
                  }

                  if (files.length === 0) {
                    return <p className="text-sm text-slate-500 italic">Belum ada dokumen yang dilampirkan.</p>;
                  }

                  return (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {files.map((path: string, idx: number) => {
                        const fileUrl = `http://localhost:8000/storage/${path.replace(/\\/g, '/')}`;
                        const ext = path.split('.').pop()?.toLowerCase() || 'file';
                        const isPdf = ext === 'pdf';
                        return (
                          <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-[#113289] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-[10px] text-white ${isPdf ? 'bg-red-500' : 'bg-[#113289]'}`}>
                                {isPdf ? 'PDF' : ext.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">Lampiran {idx + 1}</p>
                                <p className="text-[11px] text-slate-500">File {ext}</p>
                              </div>
                            </div>
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-[#113289] hover:bg-slate-50 rounded-lg">
                              Buka File
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
            {/* Tab Content: Riwayat */}
            {activeTab === 'riwayat' && (
              <div className="p-8">
                <h3 className="mb-6 text-lg font-bold text-slate-800">Riwayat Status</h3>
                
                <div className="relative ml-3 border-l-2 border-slate-200 space-y-8">
                  {ticket.histories && ticket.histories.length > 0 ? (
                    ticket.histories.map((history: any, index: number) => (
                      <div key={index} className="relative pl-6">
                        {/* Bulatan Timeline */}
                        <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-[#113289]" />
                        
                        {/* Konten Riwayat */}
                        <p className="text-sm font-bold text-slate-800">
                          {history.keterangan || `Status diperbarui menjadi: ${history.status}`}
                        </p>
                        {history.catatan && (
                          <p className="mt-1 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {history.catatan}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(history.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          }).replace('.', ':')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-slate-300" />
                      <p className="text-sm text-slate-500">Belum ada catatan riwayat untuk tiket ini.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'detail' && (
              <div className="p-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                  <div className="space-y-8">
                    <section>
                      <h3 className="mb-6 text-lg font-bold text-slate-800">Identitas Pemohon</h3>
                      <div className="space-y-5">
                        <div><p className="mb-1 text-xs text-slate-500">Nama Pemohon</p><p className="text-sm font-semibold text-slate-900">{ticket.pemohon || '-'}</p></div>
                        <div><p className="mb-1 text-xs text-slate-500">Unit Kerja</p><p className="text-sm font-semibold text-slate-900">{ticket.unit_kerja || '-'}</p></div>
                        <div><p className="mb-1 text-xs text-slate-500">Perangkat Daerah</p><p className="text-sm font-semibold text-slate-900">{ticket.nama_perangkat_daerah || '-'}</p></div>
                        <div><p className="mb-1 text-xs text-slate-500">Email Dinas</p><p className="text-sm font-semibold text-slate-900">{ticket.email_dinas || '-'}</p></div>
                      </div>
                    </section>
                  </div>
                  <div className="space-y-8">
                    <section>
                      <h3 className="mb-6 text-lg font-bold text-slate-800">Informasi Aplikasi</h3>
                      <div className="space-y-5">
                        <div><p className="mb-1 text-xs text-slate-500">Nama Aplikasi</p><p className="text-sm font-semibold text-slate-900">{ticket.nama_aplikasi || '-'}</p></div>
                        <div><p className="mb-1 text-xs text-slate-500">Alamat Aplikasi</p><p className="text-sm font-semibold text-[#153289]">{ticket.alamat_aplikasi || '-'}</p></div>
                        <div><p className="mb-1 text-xs text-slate-500">Deskripsi</p><p className="text-sm font-semibold text-slate-900">{ticket.deskripsi_aplikasi || '-'}</p></div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ==================================================== */}
      {/* MODAL UBAH STATUS (AKTIF & BERFUNGSI)                 */}
      {/* ==================================================== */}
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
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="menunggu">Menunggu Persetujuan</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
                <option value="pengerjaan">Dalam Pengerjaan</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setIsStatusModalOpen(false)} 
                disabled={isSavingStatus}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveStatus}
                disabled={isSavingStatus}
                className="rounded-lg bg-[#0F172A] px-6 py-2 text-sm font-medium text-white hover:bg-[#1E293B] disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingStatus ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}