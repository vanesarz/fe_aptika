'use client';

import React from 'react';
import { FormPerubahanIT, StatusType } from './types';

interface DetailModalProps {
  data: FormPerubahanIT | null;
  onClose: () => void;
  onDownload: (id: number, no_rfc: string) => void;
  isDownloading: boolean;
}

// Helper untuk format tanggal
function fmtDate(d?: string): string {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Helper untuk status
function inferStatus(r: FormPerubahanIT): StatusType {
  const jp = r.jenis_permohonan ?? [];
  const jc = r.jenis_perubahan ?? [];
  if (jp.some((j) => j.includes('Deaktivasi') || j.includes('Take Down'))) return 'Nonaktif';
  if (jc.includes('Peningkatan Sistem')) return 'Migrasi';
  return 'Baru';
}

function StatusBadge({ status }: { status: StatusType }) {
  const map: Record<StatusType, string> = {
    Baru: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    Nonaktif: 'bg-red-50 text-red-800 ring-1 ring-red-200',
    Migrasi: 'bg-blue-50 text-blue-800 ring-1 ring-blue-200',
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>{status}</span>;
}

// Helper untuk item detail
function DetailItem({ label, value, isBox = false }: { label: string, value?: string, isBox?: boolean }) {
  // Fungsi sederhana untuk mendeteksi apakah teks adalah link
  const isLink = (val: string) => val && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('www.'));

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase text-slate-400">{label}</p>
      {isBox ? (
        <p className="p-3 text-sm break-words whitespace-pre-wrap rounded-lg text-slate-800 bg-slate-50">
          {value || '-'}
        </p>
      ) : isLink(value || '') ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-medium text-blue-600 break-words hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium break-words text-slate-800">{value || '-'}</p>
      )}
    </div>
  );
}

export default function DetailModal({ data, onClose, onDownload, isDownloading }: DetailModalProps) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Detail Lengkap Pengajuan</h3>
            <p className="mt-1 font-mono text-sm text-slate-500">
              {data.no_rfc} — <StatusBadge status={inferStatus(data)} />
            </p>
          </div>
          <button onClick={onClose} className="p-2 transition-colors rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            ✕
          </button>
        </div>
        
        {/* Body Modal (Scrollable) */}
        <div className="p-6 space-y-8 overflow-y-auto">
          
          {/* Bagian 1: Informasi Pemohon */}
          <div>
            <h4 className="pb-2 mb-3 font-bold border-b text-slate-800 border-slate-100">1. Informasi Pemohon</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem label="Pemohon" value={data.pemohon} />
              <DetailItem label="Kontak / No Surat" value={data.nomor_kontak} />
              <DetailItem label="Perangkat Daerah" value={data.nama_perangkat_daerah} />
              <DetailItem label="Unit Kerja" value={data.unit_kerja} />
            </div>
          </div>

          {/* Bagian 2: Informasi Data & Aplikasi */}
          <div>
            <h4 className="pb-2 mb-3 font-bold border-b text-slate-800 border-slate-100">2. Informasi Data & Aplikasi</h4>
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Jenis Perubahan</p>
                <ul className="text-sm list-disc list-inside text-slate-700">
                  {data.jenis_perubahan?.length > 0 ? data.jenis_perubahan.map(j => <li key={j}>{j}</li>) : <li>-</li>}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Jenis Permohonan</p>
                <ul className="text-sm list-disc list-inside text-slate-700">
                  {data.jenis_permohonan?.length > 0 ? data.jenis_permohonan.map(j => <li key={j}>{j}</li>) : <li>-</li>}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="Nama Aplikasi" value={data.nama_aplikasi} />
              <DetailItem label="Alamat Aplikasi" value={data.alamat_aplikasi} />
              <DetailItem label="Alamat Repository" value={data.alamat_repository} />
              <div className="sm:col-span-2">
                <DetailItem label="Deskripsi Aplikasi" value={data.deskripsi_aplikasi} isBox />
              </div>
            </div>
          </div>

          {/* Bagian 3: Rincian Perubahan */}
          <div>
            <h4 className="pb-2 mb-3 font-bold border-b text-slate-800 border-slate-100">3. Rincian Perubahan & Risiko</h4>
            <div className="grid grid-cols-1 gap-4">
              <DetailItem label="Latar Belakang Perubahan" value={data.latar_belakang} isBox />
              <DetailItem label="Rincian atas perubahan yang diajukan" value={data.rincian_perubahan} isBox />
              <DetailItem label="Risiko bila perubahan tidak dilakukan" value={data.risiko_tidak_dilakukan} isBox />
              
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Kriteria Risiko</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.kriteria_risiko?.length > 0 ? (
                    data.kriteria_risiko.map(k => (
                      <span key={k} className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">{k}</span>
                    ))
                  ) : <span className="text-sm text-slate-700">-</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Bagian 4: Informasi Ekstra */}
          <div>
            <h4 className="pb-2 mb-3 font-bold border-b text-slate-800 border-slate-100">4. Informasi Ekstra</h4>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <DetailItem label="Solusi yang diharapkan" value={data.solusi_diharapkan} isBox />
              <DetailItem label="Risiko Perubahan (jika dilakukan)" value={data.risiko_perubahan} isBox />
              <DetailItem label="Alternatif Perubahan" value={data.alternatif_perubahan} isBox />
              <DetailItem label="Keterangan Tambahan" value={data.keterangan} isBox />
            </div>
            
            <div className="grid grid-cols-1 gap-4 pt-4 border-t sm:grid-cols-3 border-slate-100">
              <DetailItem label="Estimasi Biaya Perubahan" value={data.biaya_perubahan ? `Rp ${data.biaya_perubahan}` : '-'} />
              <DetailItem label="Estimasi Waktu Perubahan" value={data.waktu_perubahan} />
              <DetailItem label="Tanggal Permohonan" value={fmtDate(data.tanggal_permohonan)} />
            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button 
            onClick={() => onDownload(data.id, data.no_rfc || '')}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold transition-colors border rounded-lg border-emerald-600 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          >
            {isDownloading ? 'Mengunduh...' : '⬇ Unduh PDF'}
          </button>
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}