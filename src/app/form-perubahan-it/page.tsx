'use client';

import React, { useEffect, useState } from 'react';
import FormView from './form-view/page';
import SuccessView from './form-sukses/page';
import { useRouter } from 'next/navigation';
import { getPerubahanItList } from '@/services/api';

export default function PagePerubahanTI() {
  const router = useRouter();

  const [isSubmitted, setIsSubmitted] =
    useState(false);

  const [submittedData, setSubmittedData] =
    useState<any>(null);

  const [tickets, setTickets] = useState<any[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const data = await getPerubahanItList();

      if (Array.isArray(data.data)) {
        setTickets(data.data);
      } else if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSuccess = (data: any) => {
    setSubmittedData(data);
    setIsSubmitted(true);

    fetchTickets();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const statusStyles: Record<
    string,
    {
      bg: string;
      text: string;
      label: string;
    }
  > = {
    menunggu: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Menunggu',
    },

    disetujui: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Disetujui',
    },

    pengerjaan: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      label: 'Pengerjaan',
    },

    selesai: {
      bg: 'bg-cyan-100',
      text: 'text-cyan-700',
      label: 'Selesai',
    },

    ditolak: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Ditolak',
    },
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] px-4 py-8 font-sans sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-6">

        {/* Header */}
        <div className="relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white px-6 py-10 text-center shadow-sm">
          <img
            src="./hiasan.png"
            alt="Hiasan Kiri"
            className="pointer-events-none absolute bottom-0 left-0 h-40 w-auto rotate-180 object-contain opacity-80"
          />

          <img
            src="./hiasan.png"
            alt="Hiasan Kanan"
            className="pointer-events-none absolute right-0 top-0 h-40 w-auto object-contain opacity-80"
          />

          <div className="relative z-10">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#153289]">
              APTIKA Tools
            </p>

            <h1 className="mb-2 text-[22px] font-extrabold text-slate-800">
              Formulir Permohonan Perubahan TI
            </h1>

            <p className="mx-auto max-w-lg text-[13px] leading-relaxed text-slate-500">
              Formulir ini digunakan untuk
              mengajukan perubahan pada layanan
              atau sistem TI.
              <br />
              Mohon lengkapi data dengan benar.
              Permohonan akan diverifikasi oleh
              Tim APTIKA.
            </p>
          </div>
        </div>

        {/* Success */}
        {isSubmitted ? (
          <SuccessView
            data={submittedData}
            onReset={() => {
              setIsSubmitted(false);
              fetchTickets();
            }}
          />
        ) : showForm ||
          (!loading &&
            tickets.length === 0) ? (
          <FormView
            onSuccess={handleSuccess}
          />
        ) : (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                Permohonan Saya
              </h2>

              <p className="mt-2 text-slate-500">
                Daftar permohonan yang pernah
                Anda buat.
              </p>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500">
                Memuat data...
              </div>
            ) : (
              <div className="space-y-4">

                {tickets.map((ticket) => {
                  const status =
                    statusStyles[
                      ticket.status?.toLowerCase()
                    ] ?? {
                      bg: 'bg-slate-100',
                      text: 'text-slate-700',
                      label: ticket.status,
                    };

                  return (
                    <div
                      key={ticket.id}
                      className="rounded-xl border border-slate-200 p-6 transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                        <div>
                          <p className="text-sm text-slate-500">
                            Nomor RFC
                          </p>

                          <h3 className="text-2xl font-bold text-[#153289]">
                            {ticket.no_rfc}
                          </h3>

                          <div className="mt-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${status.bg} ${status.text}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              router.push(
                                `/form-perubahan-it/ticket/${ticket.no_rfc}`
                              )
                            }
                            className="rounded-lg bg-[#153289] px-4 py-2 text-white transition hover:bg-[#0f276c]"
                          >
                            Lihat Detail
                          </button>

                          <button
                            className="rounded-lg border border-slate-300 px-4 py-2 transition hover:bg-slate-50"
                          >
                            Unduh Bukti
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}

              </div>
            )}

            <div className="mt-8">
              <button
                onClick={() =>
                  setShowForm(true)
                }
                className="
                  w-full
                  rounded-xl
                  border-2
                  border-dashed
                  border-[#153289]
                  p-6
                  font-semibold
                  text-[#153289]
                  transition
                  hover:bg-[#EFF4FF]
                "
              >
                + Buat Permohonan Baru
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}