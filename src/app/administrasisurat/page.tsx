"use client";

import { useRouter } from "next/navigation";
import { FileText, ShieldAlert, TriangleAlert, PlaneTakeoff, Laptop, ArrowRight } from "lucide-react";

export default function AdministrasiSuratPage() {
  const router = useRouter();

  const cards = [
    {
      id: "nota-dinas",
      title: "1. Nota Dinas",
      desc: "Format standar komunikasi internal kedinasan untuk koordinasi antar unit kerja.",
      icon: <FileText size={20} className="text-blue-500" />,
      iconBg: "bg-blue-100",
      actionText: "Buat Surat",
      actionColor: "text-blue-600",
      path: "/administrasisurat/nota-dinas"
    },
    {
      id: "pentest",
      title: "2. Pemberitahuan Hasil Pentest",
      desc: "Laporan resmi mengenai hasil pengujian penetrasi keamanan infrastruktur atau aplikasi.",
      icon: <ShieldAlert size={20} className="text-amber-700" />,
      iconBg: "bg-amber-100",
      actionText: "Kelola Laporan",
      actionColor: "text-amber-700",
      path: "/administrasisurat/hasil-pentest"
    },
    {
      id: "kerentanan",
      title: "3. Pemberitahuan Kerentanan",
      desc: "Surat peringatan dini mengenai celah keamanan kritis yang ditemukan pada aplikasi.",
      icon: <TriangleAlert size={20} className="text-red-500" />,
      iconBg: "bg-red-100",
      actionText: "Kelola Kerentanan",
      actionColor: "text-red-500",
      path: "/administrasisurat/kerentanan"
    },
    {
      id: "spd",
      title: "4. SPD (Surat Perjalanan Dinas)",
      desc: "Dokumen penugasan resmi untuk perjalanan dinas pegawai di lingkungan kementerian.",
      icon: <PlaneTakeoff size={20} className="text-slate-500" />,
      iconBg: "bg-slate-200",
      actionText: "Kelola SPD",
      actionColor: "text-slate-500",
      path: "/spd"
    },
    {
      id: "ti",
      title: "5. Permohonan TI",
      desc: "Surat pengajuan dukungan teknologi informasi, perangkat, atau pengembangan sistem.",
      icon: <Laptop size={20} className="text-blue-600" />,
      iconBg: "bg-blue-100",
      actionText: "Kelola Permohonan",
      actionColor: "text-blue-600",
      path: "/perubahan-it/dashboard"
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Title Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-[22px] font-bold text-blue-700 mb-2">
          Pilih Jenis Surat
        </h2>
        <p className="text-sm text-slate-500">
          Silakan pilih kategori surat yang ingin Anda kelola untuk memulai proses administrasi.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => router.push(card.path)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col cursor-pointer hover:shadow-md transition-shadow group h-full"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${card.iconBg}`}>
              {card.icon}
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-3">
              {card.title}
            </h3>

            <p className="text-[13px] text-slate-500 leading-relaxed flex-grow">
              {card.desc}
            </p>

            <div className={`flex items-center gap-1.5 mt-6 font-semibold text-[13px] ${card.actionColor}`}>
              <span>{card.actionText}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
