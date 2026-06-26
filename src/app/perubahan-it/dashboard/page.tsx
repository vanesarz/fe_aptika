'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FormPerubahanIT, StatusType } from './types';
import DetailModal from './DetailModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// --- Helpers ---
function inferStatus(r: FormPerubahanIT): StatusType {
  const jp = r.jenis_permohonan ?? [];
  const jc = r.jenis_perubahan ?? [];
  if (jp.some((j) => j.includes('Deaktivasi') || j.includes('Take Down'))) return 'Nonaktif';
  if (jc.includes('Peningkatan Sistem')) return 'Migrasi';
  return 'Baru';
}

function fmtDate(d?: string): string {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

function StatusBadge({ status }: { status: StatusType }) {
  const map: Record<StatusType, string> = {
    Baru: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    Nonaktif: 'bg-red-50 text-red-800 ring-1 ring-red-200',
    Migrasi: 'bg-blue-50 text-blue-800 ring-1 ring-blue-200',
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>{status}</span>;
}

function StatCard({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent: string }) {
  return (
    <div className="p-4 bg-white border border-blue-100 rounded-xl">
      <p className="mb-1 text-xs font-medium tracking-wide text-blue-500 uppercase">{label}</p>
      <p className={`text-3xl font-semibold ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// --- Main Page ---
export default function AdminPermohonanPage() {
  const [data, setData] = useState<FormPerubahanIT[]>([]);
  const [filtered, setFiltered] = useState<FormPerubahanIT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOPD, setFilterOPD] = useState('');
  
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<FormPerubahanIT | null>(null);

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
        const pic = (r.pemohon ?? '').toLowerCase();
        
        const matchQ = !q || [opd, app, rfc, pic].some((v) => v.includes(q));
        const matchS = !filterStatus || inferStatus(r) === filterStatus;
        const matchO = !filterOPD || r.nama_perangkat_daerah === filterOPD;
        
        return matchQ && matchS && matchO;
      })
    );
  }, [data, search, filterStatus, filterOPD]);

  const opdOptions = [...new Set(data.map((r) => r.nama_perangkat_daerah ?? '').filter(Boolean))].sort();
  const inputClass = 'rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors';

  const handleDownloadPDF = async (id: number, no_rfc: string) => {
    try {
      setIsDownloading(id);
      const response = await fetch(`${API_URL}/form-perubahan-it/${id}/pdf`, {
        method: 'GET',
        headers: { 'Accept': 'application/pdf' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Gagal mengunduh PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Form_Perubahan_IT_${no_rfc || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      alert(`Terjadi Kesalahan: ${error.message}`);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDelete = async (id: number, no_rfc: string) => {
    const isConfirmed = window.confirm(`Apakah kamu yakin ingin menghapus data dengan No RFC: ${no_rfc}? Tindakan ini tidak dapat dibatalkan.`);
    if (!isConfirmed) return;

    try {
      setIsDeleting(id);
      const response = await fetch(`${API_URL}/form-perubahan-it/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        alert('Data berhasil dihapus.');
        setData((prev) => prev.filter((item) => item.id !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Gagal menghapus data');
      }
    } catch (error: any) {
      alert(`Terjadi Kesalahan: ${error.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-blue-50 via-slate-50 to-slate-50 sm:px-6 lg:px-8">
      
      {/* Import Komponen Modal yang baru kita pisah */}
      <DetailModal 
        data={selectedDetail} 
        onClose={() => setSelectedDetail(null)} 
        onDownload={handleDownloadPDF} 
        isDownloading={isDownloading !== null} 
      />

      {/* HEADER DASHBOARD */}
      <div className="px-6 mb-6 overflow-hidden shadow-lg rounded-2xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 py-7 shadow-blue-900/20 sm:px-8">
        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Permohonan &amp; Penonaktifan Subdomain</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <StatCard label="Total RFC" value={filtered.length} sub="entri ditampilkan" accent="text-blue-800" />
        <StatCard label="Permohonan baru" value={filtered.filter((r) => inferStatus(r) === 'Baru').length} accent="text-emerald-700" />
        <StatCard label="Penonaktifan" value={filtered.filter((r) => inferStatus(r) === 'Nonaktif').length} accent="text-red-700" />
        <StatCard label="Migrasi" value={filtered.filter((r) => inferStatus(r) === 'Migrasi').length} accent="text-blue-600" />
      </div>

      {/* TABEL DATA */}
      <div className="bg-white border border-blue-100 shadow-sm rounded-2xl shadow-blue-900/5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
          <h2 className="text-sm font-semibold tracking-wide text-blue-900 uppercase">Daftar Permohonan</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari OPD, aplikasi..." className={inputClass + ' w-48 sm:w-60'} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass}>
              <option value="">Semua status</option>
              <option value="Baru">Baru</option>
              <option value="Nonaktif">Nonaktif</option>
              <option value="Migrasi">Migrasi</option>
            </select>
            <select value={filterOPD} onChange={(e) => setFilterOPD(e.target.value)} className={inputClass + ' max-w-[180px]'}>
              <option value="">Semua OPD</option>
              {opdOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
            <button onClick={loadData} className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-transparent px-3 py-2 text-sm text-blue-700 hover:bg-blue-50">↺ Muat ulang</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-blue-700 uppercase bg-blue-50">
                <th className="px-4 py-3 text-left">No RFC</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Tanggal</th>
                <th className="px-4 py-3 text-left">Perangkat Daerah</th>
                <th className="px-4 py-3 text-left min-w-[150px]">Nama Aplikasi</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left min-w-[120px]">Pemohon</th>
                <th className="px-4 py-3 text-left min-w-[250px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-sm text-center text-blue-400">Memuat data dari API Laravel...</td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="py-10 text-sm text-center text-red-500">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-sm text-center text-slate-400">Tidak ada data yang sesuai filter.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="transition-colors border-t border-blue-50 hover:bg-blue-50/40">
                    <td className="px-4 py-3 font-semibold text-blue-700 whitespace-nowrap">{r.no_rfc}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(r.tanggal_permohonan)}</td>
                    <td className="px-4 py-3 text-xs">{r.nama_perangkat_daerah ?? '-'}</td>
                    <td className="px-4 py-3 text-xs">{r.nama_aplikasi}</td>
                    <td className="px-4 py-3"><StatusBadge status={inferStatus(r)} /></td>
                    <td className="px-4 py-3 text-xs">{r.pemohon || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button 
                          onClick={() => setSelectedDetail(r)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                        >
                          Lihat Detail
                        </button>
                        
                        <button 
                          onClick={() => handleDownloadPDF(r.id, r.no_rfc || '')} 
                          disabled={isDownloading === r.id}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDownloading === r.id ? 'Mengunduh...' : 'Unduh'}
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(r.id, r.no_rfc || '')} 
                          disabled={isDeleting === r.id}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting === r.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}