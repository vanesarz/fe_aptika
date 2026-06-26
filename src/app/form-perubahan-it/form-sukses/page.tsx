import React from 'react';

export default function SuccessView({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Alert Icon & Title */}
      <div className="flex flex-col items-center py-12">
        <div className="relative mb-6 flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#E8F5E9]" />
          <div className="absolute inset-[10px] rounded-full bg-[#C8E6C9]" />
          <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#10B981] shadow-lg shadow-green-300/50 z-10">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          {/* Sparkles */}
          <span className="absolute right-4 top-2 text-xl font-bold text-green-500">+</span>
          <span className="absolute left-6 bottom-4 text-sm font-bold text-green-400">+</span>
          <span className="absolute left-2 top-8 text-lg font-bold text-green-300">+</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Permohonan Berhasil Dikirim</h2>
        <p className="mt-2 text-center text-sm text-slate-500 max-w-md">
          Terima kasih. Permohonan perubahan TI Anda telah berhasil dikirim dan akan diverifikasi oleh tim APTIKA.
        </p>
      </div>

      {/* Ringkasan Pengajuan */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1a365d]" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <h3 className="font-bold text-slate-800">Ringkasan Pengajuan</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { label: 'Tanggal Pengajuan', value: '24 Mei 2026' },
            { label: 'Perangkat Daerah', value: 'Dinas Pendidikan' },
            { label: 'Nama Pemohon', value: 'Asep Saepudin' },
            { label: 'Jenis Permohonan', value: 'Permintaan Sub-Domain' },
            { label: 'Nama Aplikasi', value: 'Sekolah Maung' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center px-6 py-4">
              <span className="w-1/3 text-sm text-slate-500">{item.label}</span>
              <span className="w-2/3 text-sm font-medium text-slate-800">{item.value}</span>
            </div>
          ))}
          <div className="flex items-center px-6 py-4">
            <span className="w-1/3 text-sm text-slate-500">Status</span>
            <span className="w-2/3">
              <span className="inline-flex items-center gap-1.5 rounded bg-[#E0E7FF] px-2.5 py-1 text-[11px] font-bold text-[#3730A3]">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Menunggu Verifikasi
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Langkah Selanjutnya */}
      <div>
        <div className="mb-4 flex items-center gap-3 px-1">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1a365d]" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          <h3 className="font-bold text-slate-800">Langkah Selanjutnya</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Dashed Line (Desktop Only) */}
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-[1px] border-t-2 border-dashed border-slate-200 -z-10" />
          
          {[
            { num: 1, title: 'Verifikasi Admin APTIKA', desc: 'Permohonan akan diperiksa kelengkapan datanya.' },
            { num: 2, title: 'Peninjauan Teknis', desc: 'Tim terkait akan meninjau kebutuhan perubahan.' },
            { num: 3, title: 'Notifikasi Hasil', desc: 'Status permohonan akan dikirimkan melalui email.' },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mb-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#1a365d] text-[10px] font-bold text-white z-10">{step.num}</div>
              <div className="mb-3 h-10 w-10 text-[#1a365d]">
                 {step.num === 1 && <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                 {step.num === 2 && <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                 {step.num === 3 && <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              </div>
              <h4 className="mb-1 text-sm font-bold text-slate-800">{step.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed px-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button onClick={onReset} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#1a365d] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#122643]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          Verifikasi Admin APTIKA
        </button>
      </div>
    </div>
  );
}