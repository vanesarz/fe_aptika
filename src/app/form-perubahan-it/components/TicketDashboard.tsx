'use client';

import { useRouter } from 'next/navigation';

interface Props {
  tickets: any[];
}

export default function TicketDashboard({
  tickets,
}: Props) {
  const router = useRouter();

  return (
    <div className="space-y-6">

      <div className="rounded-xl bg-white border p-6">
        <h2 className="text-2xl font-bold">
          Permohonan Saya
        </h2>

        <p className="mt-2 text-slate-500">
          Daftar permohonan yang pernah Anda buat.
        </p>
      </div>

      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="rounded-xl bg-white border p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Nomor RFC
              </p>

              <h3 className="text-2xl font-bold text-[#153289]">
                {ticket.no_rfc}
              </h3>

              <div className="mt-3">
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                  {ticket.status}
                </span>
              </div>
            </div>

            <button
                onClick={() =>
                    router.push(
                    `/form-perubahan-it/ticket/${ticket.no_rfc}`
                    )
                }
                >
                Lihat Detail
                </button>
          </div>
        </div>
      ))}

      <button
        onClick={() =>
          router.push(
            '/form-perubahan-it/new'
          )
        }
        className="w-full rounded-xl border-2 border-dashed border-[#153289] p-6 text-[#153289]"
      >
        + Buat Permohonan Baru
      </button>
    </div>
  );
}