'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FormPerubahanIT, StatusType } from './types';
import DetailView from './DetailView';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function inferStatus(r: FormPerubahanIT): StatusType {
  if (r.status) {
    if (r.status.toLowerCase() === 'disetujui') return 'Disetujui';
    if (r.status.toLowerCase() === 'ditolak') return 'Ditolak';
    return 'Menunggu';
  }
  const jp = r.jenis_permohonan ?? [];
  if (jp.some((j) => j.includes('Deaktivasi') || j.includes('Tolak'))) return 'Ditolak';
  return 'Menunggu';
}

function fmtDate(d?: string): string {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function AdminPermohonanPage() {
  const [data, setData] = useState<FormPerubahanIT[]>([]);
  const [filtered, setFiltered] = useState<FormPerubahanIT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'preview'>('list');
  const [selectedData, setSelectedData] = useState<FormPerubahanIT | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/form-perubahan-it`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows: FormPerubahanIT[] = Array.isArray(json) ? json : json.data ?? [];
      setData(rows);
    } catch (e) {
      setError('Tidak dapat terhubung ke API Laravel.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      data.filter((r) => {
        const opd = (r.nama_perangkat_daerah ?? '').toLowerCase();
        const app = (r.nama_aplikasi ?? '').toLowerCase();
        const rfc = (r.no_rfc ?? '').toLowerCase();
        const name = (r.pemohon ?? '').toLowerCase();
        return !q || [opd, app, rfc, name].some((v) => v.includes(q));
      })
    );
  }, [data, search]);

  // ============================================================
  // FIX: Fetch detail lengkap dari BE saat klik tombol Detail
  // Endpoint GET /form-perubahan-it/{id} mengembalikan tanda_tangan_url
  // dan dokumen_pendukung_url yang tidak ada di endpoint list
  // ============================================================
  const handleOpenDetail = async (row: FormPerubahanIT) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_URL}/form-perubahan-it/${row.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const detail: FormPerubahanIT = await res.json();
      setSelectedData(detail);
    } catch {
      // Fallback: pakai data dari list jika fetch detail gagal
      setSelectedData(row);
    } finally {
      setDetailLoading(false);
      setCurrentView('detail');
    }
  };

  if ((currentView === 'detail' || currentView === 'preview') && selectedData) {
    return (
      <DetailView
        data={selectedData}
        viewMode={currentView}
        setViewMode={setCurrentView}
        apiUrl={API_URL}
        onBack={() => {
          setCurrentView('list');
          setSelectedData(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Header Utama */}
      <div className="px-8 py-6 mb-8 bg-white border-b border-slate-200">
        <h1 className="text-[22px] font-bold text-slate-800">Permintaan Perubahan TI</h1>
        <div className="flex items-center gap-2 mt-1 text-[13px] text-slate-500">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Data Rekapitulasi Tahun 2026
        </div>
      </div>

      <div className="px-8 mx-auto max-w-7xl">

        {/* STAT CARDS INDIKATOR */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="flex items-center gap-4 p-5 bg-white border shadow-sm rounded-xl border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#113289]">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-500 mb-0.5">Total Permintaan Masuk 2026</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-800">{filtered.length}</span>
                <span className="text-[13px] font-medium text-slate-500">permintaan</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border shadow-sm rounded-xl border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#113289]">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-500 mb-0.5">Sudah Diekspor</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-800">{filtered.filter(x => inferStatus(x) === 'Disetujui' || inferStatus(x) === 'Selesai').length}</span>
                <span className="text-[13px] font-medium text-slate-500">permintaan</span>
              </div>
            </div>
          </div>

          <div className="bg-[#113289] p-5 rounded-xl border border-[#113289] shadow-sm text-white flex flex-col justify-center">
            <p className="text-[12px] font-medium opacity-80 mb-1">Target Penyelesaian</p>
            <p className="mb-2 text-3xl font-bold tracking-tight">94.2%</p>
            <div className="w-full bg-blue-900/50 rounded-full h-1.5">
              <div className="bg-[#FDE047] h-1.5 rounded-full" style={{ width: '94.2%' }}></div>
            </div>
          </div>
        </div>

        {/* SEARCH FILTER */}
        <div className="flex justify-end gap-3 mb-6">
          <div className="relative w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-200 pointer-events-none">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari RFC, Perangkat Daerah, Pemohon..."
              className="w-full bg-[#113289] text-white placeholder:text-blue-200 text-[13px] pl-10 pr-4 py-2.5 rounded-lg border-none focus:ring-2 focus:ring-[#FDE047] outline-none"
            />
          </div>
        </div>

        {/* TABEL REKAPITULASI DATA */}
        <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">
          <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100">
            <h2 className="text-[15px] font-bold text-slate-800">Daftar Rekapitulasi Permintaan Perubahan TI</h2>
            {error && <span className="px-3 py-1 text-xs font-semibold text-red-500 border border-red-100 rounded bg-red-50">{error}</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4">NO</th>
                  <th className="px-6 py-4">NO RFC</th>
                  <th className="px-6 py-4 whitespace-nowrap">TANGGAL PERMOHONAN</th>
                  <th className="px-6 py-4">NAMA PEMOHON</th>
                  <th className="px-6 py-4">UNIT KERJA / OPD</th>
                  <th className="px-6 py-4">EMAIL DINAS</th>
                  <th className="px-6 py-4 text-center">STATUS</th>
                  <th className="px-6 py-4 text-center">DETAIL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] text-slate-600">
                {loading ? (
                  <tr><td colSpan={8} className="py-12 text-center text-slate-400">Memuat data dari API Laravel...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-slate-400">Tidak ada data yang tersedia.</td></tr>
                ) : (
                  filtered.map((r, idx) => {
                    const status = inferStatus(r);
                    return (
                      <tr key={r.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4">{idx + 1}</td>
                        <td className="px-6 py-4 font-semibold text-blue-600">{r.no_rfc || `RFC-00${r.id}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{fmtDate(r.tanggal_permohonan)}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{r.pemohon}</td>
                        <td className="px-6 py-4">{r.nama_perangkat_daerah || r.unit_kerja || '-'}</td>
                        <td className="px-6 py-4 text-slate-500">{r.email_dinas || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          {status === 'Menunggu' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>Menunggu
                            </span>
                          )}
                          {status === 'Ditolak' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>Ditolak
                            </span>
                          )}
                          {(status === 'Disetujui' || status === 'Selesai') && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-600 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>Disetujui
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {/* FIX: Panggil handleOpenDetail yang fetch data lengkap dari BE */}
                          <button
                            onClick={() => handleOpenDetail(r)}
                            disabled={detailLoading}
                            className="p-1.5 text-slate-400 hover:text-[#113289] hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                          >
                            {detailLoading ? (
                              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}