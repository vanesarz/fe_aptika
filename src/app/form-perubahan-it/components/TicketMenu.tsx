'use client';

import { useRouter } from 'next/navigation';

interface Props {
  ticket: any;
  onNewRequest: () => void;
}

export default function TicketMenu({
  ticket,
  onNewRequest,
}: Props) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Permohonan Sebelumnya Ditemukan
        </h2>

        <p className="mt-2 text-slate-500">
          Anda masih memiliki permohonan yang tersimpan
          pada browser ini.
        </p>
      </div>

      {/* RFC Card */}
      <div className="mb-8 rounded-lg bg-[#EFF4FF] p-5">
        <div className="text-sm text-slate-500">
          Nomor RFC
        </div>

        <div className="text-3xl font-bold text-[#153289]">
          {ticket.no_rfc}
        </div>

        <div className="mt-3">
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
            {ticket.status}
          </span>
        </div>
      </div>

      {/* Menu */}
      <div className="grid gap-4 md:grid-cols-3">

        {/* Detail */}
        <button
          onClick={() =>
            router.push(
              `/form-perubahan-it/ticket/${ticket.no_rfc}`
            )
          }
          className="rounded-xl border p-6 text-left transition hover:border-[#153289] hover:bg-[#EFF4FF]"
        >
          <h3 className="font-bold">
            Lihat Detail Permohonan
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Lihat progres, riwayat, dan dokumen permohonan.
          </p>
        </button>

        {/* Download */}
        <button
          onClick={() => {
            // nanti kita isi endpoint download
          }}
          className="rounded-xl border p-6 text-left transition hover:border-[#153289] hover:bg-[#EFF4FF]"
        >
          <h3 className="font-bold">
            Unduh Bukti Pengajuan
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Download bukti permohonan RFC.
          </p>
        </button>

        {/* Permohonan Baru */}
        <button
          onClick={onNewRequest}
          className="rounded-xl border p-6 text-left transition hover:border-[#153289] hover:bg-[#EFF4FF]"
        >
          <h3 className="font-bold">
            Buat Permohonan Baru
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Ajukan permohonan perubahan TI baru.
          </p>
        </button>

      </div>
    </div>
  );
}