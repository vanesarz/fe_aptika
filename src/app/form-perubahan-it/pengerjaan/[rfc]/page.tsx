'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PengerjaanPage() {
  const params = useParams();
  const router = useRouter();
  const rfc = params.rfc as string;

  const [ticket, setTicket] = useState<any>(null);
  const [catatan, setCatatan] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');

  useEffect(() => {
    fetch(
      `http://localhost:8000/api/form-perubahan-it/ticket/${rfc}`
    )
      .then((res) => res.json())
      .then((data) => setTicket(data))
      .catch((err) => console.log(err));
  }, [rfc]);

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat detail pengerjaan...
      </div>
    );
  }
  const handleSelesai = async () => {
  try {
    const res = await fetch(
      `http://localhost:8000/api/form-perubahan-it/${ticket.id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'selesai',
        }),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result.message || 'Gagal menyelesaikan pengerjaan'
      );
    }

    alert('Pengerjaan berhasil diselesaikan');

    router.push(
      `/perubahan-it/dashboard/`
    );
  } catch (err) {
    console.error(err);
    alert('Gagal menyelesaikan pengerjaan');
  }
};

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-2 text-sm text-slate-500 hover:text-[#113289]"
            >
              ← Kembali ke Detail
            </button>

            <h1 className="text-3xl font-bold text-slate-900">
              {ticket.no_rfc}
            </h1>

            <p className="mt-2 text-slate-500">
              Formulir pengerjaan teknis permohonan perubahan TI
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-[#113289]">
            Dalam Pengerjaan
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Header Card */}
          <div className="border-b border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900">
              Detail Pengerjaan
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Lengkapi informasi pengerjaan sebelum permohonan
              dinyatakan selesai.
            </p>
          </div>

          <div className="space-y-8 p-8">

            {/* Informasi Tiket */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-slate-800">
                Informasi Permohonan
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">
                    Nomor RFC
                  </p>

                  <p className="mt-1 font-medium">
                    {ticket.no_rfc}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 font-medium">
                    {ticket.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Catatan Teknis Pengerjaan
              </label>

              <textarea
                rows={6}
                value={catatan}
                onChange={(e) =>
                  setCatatan(e.target.value)
                }
                placeholder="Tuliskan langkah-langkah teknis yang telah dilakukan..."
                className="
                  w-full rounded-xl border border-slate-300
                  p-4 outline-none
                  transition
                  focus:border-[#113289]
                  focus:ring-2
                  focus:ring-[#113289]/20
                "
              />
            </div>

            {/* Tanggal & Upload */}
            <div className="grid gap-8 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tanggal Selesai
                </label>

                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) =>
                    setTanggalSelesai(e.target.value)
                  }
                  className="
                    w-full rounded-xl border border-slate-300
                    p-3 outline-none
                    focus:border-[#113289]
                    focus:ring-2
                    focus:ring-[#113289]/20
                  "
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Upload Hasil Pekerjaan
                </label>

                <label
                  className="
                    flex h-40 cursor-pointer flex-col
                    items-center justify-center
                    rounded-xl border-2 border-dashed
                    border-slate-300 bg-slate-50
                    transition hover:border-[#113289]
                    hover:bg-blue-50
                  "
                >
                  <span className="text-4xl">📄</span>

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Klik untuk upload dokumen
                  </p>

                  <p className="text-xs text-slate-500">
                    PDF, DOCX, ZIP
                  </p>

                  <input
                    type="file"
                    className="hidden"
                  />
                </label>
              </div>

            </div>

            {/* Checklist */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-slate-800">
                Konfirmasi
              </h3>

              <div className="space-y-3 rounded-xl border border-slate-200 p-5">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  <span className="text-sm">
                    Konfigurasi telah selesai dilakukan
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  <span className="text-sm">
                    Pengujian telah dilakukan
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  <span className="text-sm">
                    Dokumentasi telah diunggah
                  </span>
                </label>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 border-t border-slate-200 p-6">
            <button
              className="
                rounded-xl border border-slate-300
                px-5 py-3 font-semibold
                text-slate-700
                hover:bg-slate-50
              "
            >
              Simpan Draft
            </button>

<button
  onClick={handleSelesai}
  className="px-5 py-2.5 rounded-lg bg-green-600 font-bold text-white hover:bg-green-700"
>
  Selesaikan Pengerjaan
</button>
          </div>

        </div>
      </div>
    </div>
  );
}