'use client';

import React, { useState } from 'react';
import FormView from './form-view/page';
import SuccessView from './form-sukses/page';

export default function PagePerubahanTI() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleSuccess = (data: any) => {
    setSubmittedData(data);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* BAGIAN YANG DIUBAH: max-w-[1100px] diubah menjadi max-w-[1400px] agar form lebih lebar */}
      <div className="mx-auto max-w-[1400px] space-y-6 transition-all duration-300">
        
        {/* Header dengan Hiasan PNG */}
        <div className="relative overflow-hidden rounded-xl bg-white border border-[#E2E8F0] px-6 py-10 text-center shadow-sm">
          <img src="./hiasan.png" alt="Hiasan Kiri" className="pointer-events-none absolute bottom-0 left-0 h-40 w-auto rotate-180 object-contain opacity-80" />
          <img src="./hiasan.png" alt="Hiasan Kanan" className="pointer-events-none absolute top-0 right-0 h-40 w-auto object-contain opacity-80" />
          
          <div className="relative z-10">
            <p className="text-[11px] font-bold tracking-[0.15em] text-[#153289] uppercase mb-1.5">APTIKA Tools</p>
            <h1 className="text-[22px] font-extrabold text-slate-800 mb-2">Formulir Permohonan Perubahan TI</h1>
            <p className="text-[13px] text-slate-500 max-w-lg mx-auto leading-relaxed">
              Formulir ini digunakan untuk mengajukan perubahan pada layanan atau sistem TI.<br />
              Mohon lengkapi data dengan benar. Permohonan akan diverifikasi oleh Tim APTIKA.
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <SuccessView data={submittedData} onReset={() => setIsSubmitted(false)} />
        ) : (
          <FormView onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
}