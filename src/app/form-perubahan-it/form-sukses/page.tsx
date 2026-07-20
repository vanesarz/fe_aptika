import React from 'react';

export default function SuccessView({ data, onReset }: { data: any, onReset: () => void }) {
  // Fallback data jika backend tidak lengkap
  const formData = data?.formData || {};
  
  return (
    <div className="mx-auto max-w-[900px] space-y-6 animate-in fade-in zoom-in duration-500 pb-12">
      
      {/* Header & Ikon Sukses */}
      <div className="flex flex-col items-center py-10">
        <div className="relative mb-6 flex h-32 w-32 items-center justify-center">
          {/* Efek Lingkaran Lapis */}
          <div className="absolute inset-0 rounded-full bg-[#E8F5E9]" />
          <div className="absolute inset-[10px] rounded-full bg-[#C8E6C9]" />
          <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#10B981] shadow-lg shadow-green-300/50 z-10">
            {/* Menggunakan File Gambar Ceklis */}
            <img src="./ceklis.png" alt="Berhasil" className="h-32 w-32 object-contain" />
          </div>
          {/* Elemen Bintang/Plus */}
          <svg className="absolute right-3 top-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          <svg className="absolute left-6 bottom-4 h-3 w-3 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          <svg className="absolute left-1 top-8 h-5 w-5 text-green-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800">Permohonan Berhasil Dikirim</h2>
        <p className="mt-2 text-center text-[13px] text-slate-500 max-w-md leading-relaxed">
          Terima kasih. Permohonan perubahan TI Anda telah berhasil dikirim dan akan diverifikasi oleh tim APTIKA.
        </p>
      </div>

      {/* Tabel Ringkasan Pengajuan */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-8 py-5">
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-[#1a365d]" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <h3 className="text-[14px] font-bold text-slate-800">Ringkasan Pengajuan</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { label: 'Tanggal Pengajuan', value: formData.tanggalPengajuan || '-' },
            { label: 'Perangkat Daerah', value: formData.perangkatDaerah || '-' },
            { label: 'Nama Pemohon', value: formData.pemohon || '-' },
            { label: 'Jenis Permohonan', value: formData.jenisPermohonan || '-' },
            { label: 'Nama Aplikasi', value: formData.namaAplikasi || '-' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center px-8 py-4 gap-2 sm:gap-0">
              <span className="w-full sm:w-1/3 text-[13px] text-slate-500">{item.label}</span>
              <span className="w-full sm:w-2/3 text-[13px] font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
          
          <div className="flex flex-col sm:flex-row sm:items-center px-8 py-4 gap-2 sm:gap-0">
            <span className="w-full sm:w-1/3 text-[13px] text-slate-500">Status</span>
            <span className="w-full sm:w-2/3">
              <span className="inline-flex items-center gap-1.5 rounded bg-[#EFF4FF] px-3 py-1.5 text-[11px] font-bold text-[#113289] border border-[#dce6ff]">
                <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Menunggu Verifikasi
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Langkah Selanjutnya */}
      <div className="pt-4">
        <div className="mb-6 flex items-center gap-3 px-2">
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-[#1a365d]" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          <h3 className="text-[14px] font-bold text-slate-800">Langkah Selanjutnya</h3>
        </div>
        
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Garis Putus-putus Desktop (Dashed Line with Circles) */}
          <div className="hidden md:flex absolute top-1/2 left-[18%] right-[18%] -translate-y-[10px] items-center justify-between -z-10">
            <div className="w-full border-t border-dashed border-slate-300"></div>
            <div className="h-3 w-3 rounded-full border-2 border-slate-300 bg-slate-50 absolute left-[48.5%] bg-[#F4F7F9]"></div>
            <div className="h-3 w-3 rounded-full border-2 border-slate-300 bg-slate-50 absolute -left-2 bg-[#F4F7F9]"></div>
            <div className="h-3 w-3 rounded-full border-2 border-slate-300 bg-slate-50 absolute -right-2 bg-[#F4F7F9]"></div>
          </div>
          
          {[
            { 
              num: 1, 
              title: 'Verifikasi Admin APTIKA', 
              desc: 'Permohonan akan diperiksa kelengkapan datanya',
              icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></>
            },
            { 
              num: 2, 
              title: 'Peninjauan Teknis', 
              desc: 'Tim terkait akan meninjau kebutuhan perubahan.',
              icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></>
            },
            { 
              num: 3, 
              title: 'Notifikasi Hasil', 
              desc: 'Status permohonan akan dikirimkan melalui email.',
              icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></>
            },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center rounded-xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
              <div className="mb-4 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#113289] text-[11px] font-bold text-white z-10 shadow-sm">{step.num}</div>
              <svg className="mb-4 h-9 w-9 text-[#113289]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                 {step.icon}
              </svg>
              <h4 className="mb-2 text-[13px] font-bold text-slate-800">{step.title}</h4>
              <p className="text-[12px] text-slate-500 leading-relaxed px-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <button onClick={onReset} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#113289] px-10 py-3.5 text-[13px] font-semibold tracking-wide text-white transition hover:bg-[#0e276b] shadow-md">
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          Verifikasi Admin APTIKA
        </button>
      </div>
    </div>
  );
}