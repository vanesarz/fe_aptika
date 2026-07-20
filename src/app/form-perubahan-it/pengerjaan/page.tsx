'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DaftarPengerjaanAdmin() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sesuaikan endpoint ini jika perlu
    fetch('http://localhost:8000/api/form-perubahan-it')
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : data.data ?? [];
        setTickets(rows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans">
      
      {/* ======================= */}
      {/* SIDEBAR ADMIN           */}
      {/* ======================= */}
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

      {/* ======================= */}
      {/* MAIN CONTENT AREA       */}
      {/* ======================= */}
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
      </div>
      </div>



  <div className="w-full px-6 py-5 ">
          
          

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-700">Semua Tiket</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">No RFC</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Pemohon</th>
                    <th className="px-6 py-4">Perangkat Daerah</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-10">Memuat data...</td></tr>
                  ) : tickets.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10">Belum ada tiket.</td></tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#113289]">{ticket.no_rfc || `RFC-00${ticket.id}`}</td>
                        <td className="px-6 py-4">{formatDate(ticket.tanggal_permohonan || ticket.created_at)}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{ticket.pemohon}</td>
                        <td className="px-6 py-4">{ticket.nama_perangkat_daerah || '-'}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                            {ticket.status || 'Menunggu'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => router.push(`/form-perubahan-it/pengerjaan/${ticket.no_rfc || ticket.id}`)}
                            className="px-4 py-2 bg-[#113289] text-white rounded-lg text-xs font-bold hover:bg-[#0e276b] transition-colors"
                          >
                            Buka Pengerjaan
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}