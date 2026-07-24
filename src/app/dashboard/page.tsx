"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Network,
  FileText,
  Layers,
  Cpu,
  LayoutTemplate,
  Smartphone,
  Database,
  Briefcase,
  Users,
  UserCog,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function Homepage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const uObj = JSON.parse(uStr);
          if (uObj?.name) setUserName(uObj.name);
          if (uObj?.role) setUserRole(uObj.role);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isAdmin = userRole.toLowerCase() === "admin";

  const cards = [
    {
      id: "integrasi-interoperabilitas",
      title: "1. Integrasi Interoperabilitas",
      desc: "Format standar integrasi data dan koordinasi interoperabilitas sistem antar instansi pemerintah.",
      icon: <Network size={22} className="text-blue-600" />,
      iconBg: "bg-blue-100",
      actionText: "Buka Interoperabilitas",
      actionColor: "text-blue-600",
      path: "/integrasiinteroperabilitas/dashboard",
    },
    {
      id: "administrasi-surat",
      title: "2. Administrasi Surat",
      desc: "Layanan administrasi Nota Dinas, Hasil Pentest, Kerentanan, SPD, dan Permohonan TI.",
      icon: <FileText size={22} className="text-amber-700" />,
      iconBg: "bg-amber-100",
      actionText: "Kelola Surat",
      actionColor: "text-amber-700",
      path: "/administrasisurat",
    },
    {
      id: "pengelolaan-aplikasi",
      title: "3. Pengelolaan Aplikasi",
      desc: "Platform inventarisasi, pengelolaan domain, dan pemantauan status sistem aplikasi.",
      icon: <Layers size={22} className="text-purple-600" />,
      iconBg: "bg-purple-100",
      actionText: "Kelola Aplikasi",
      actionColor: "text-purple-600",
      path: "/pengelolaanaplikasi/dashboard",
    },
    {
      id: "rekayasa-aplikasi",
      title: "4. Rekayasa Aplikasi",
      desc: "Layanan perancangan, pengembangan, dan rekapitulasi replikasi perangkat lunak.",
      icon: <Cpu size={22} className="text-cyan-600" />,
      iconBg: "bg-cyan-100",
      actionText: "Lihat Rekap",
      actionColor: "text-cyan-600",
      path: "/rekayasaaplikasi/dashboard",
    },
    {
      id: "sidebar-jabar",
      title: "5. Sidebar Jabar",
      desc: "Manajemen dan konfigurasi komponen navigasi standar ekosistem Jabar Digital.",
      icon: <LayoutTemplate size={22} className="text-emerald-600" />,
      iconBg: "bg-emerald-100",
      actionText: "Buka Sidebar Jabar",
      actionColor: "text-emerald-600",
      path: "/sidebarjabar/dashboard",
    },
    {
      id: "smart-jabar",
      title: "6. Smart Jabar",
      desc: "Ekosistem layanan digital pintar terintegrasi Pemerintah Provinsi Jawa Barat.",
      icon: <Smartphone size={22} className="text-indigo-600" />,
      iconBg: "bg-indigo-100",
      actionText: "Akses Smart Jabar",
      actionColor: "text-indigo-600",
      path: "/smartjabar/dashboard",
    },
    {
      id: "sada-jabar",
      title: "7. Sada Jabar",
      desc: "Pusat repositori data tunggal, analisis statistik, dan visualisasi data Aptika.",
      icon: <Database size={22} className="text-rose-600" />,
      iconBg: "bg-rose-100",
      actionText: "Buka Sada Jabar",
      actionColor: "text-rose-600",
      path: "/sadajabar/dashboard",
    },
    {
      id: "manajemen-tugas-digital",
      title: "8. Manajemen Tugas Digital",
      desc: "Monitoring penugasan, alur kerja digital, dan manajemen penyelesaian tugas tim.",
      icon: <Briefcase size={22} className="text-teal-600" />,
      iconBg: "bg-teal-100",
      actionText: "Kelola Tugas",
      actionColor: "text-teal-600",
      path: "/manajementugasdigital",
    },
    {
      id: "magang",
      title: "9. Magang",
      desc: "Pengelolaan data peserta magang, presensi, penugasan, dan administrasi magang Aptika.",
      icon: <Users size={22} className="text-orange-600" />,
      iconBg: "bg-orange-100",
      actionText: "Kelola Magang",
      actionColor: "text-orange-600",
      path: "/magang/dashboard",
    },
    ...(isAdmin
      ? [
          {
            id: "manajemen-user",
            title: "10. Manajemen User",
            desc: "Pengelolaan akun pengguna, hak akses, peranan (role), dan status keaktifan user dalam sistem APTIKA.",
            icon: <UserCog size={22} className="text-violet-600" />,
            iconBg: "bg-violet-100",
            actionText: "Kelola User",
            actionColor: "text-violet-600",
            badge: "Admin Only",
            path: "/admin/users",
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0b2146] via-[#163868] to-[#1d4ed8] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-cyan-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-200 text-xs font-semibold backdrop-blur-sm border border-white/15 mb-3">
              <Sparkles size={14} className="text-cyan-300 animate-pulse" />
              <span>APTIKA Tools Jawa Barat</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Selamat Datang, <span className="text-cyan-300">{userName}</span>
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed">
              Platform pengelolaan dan rekapitulasi data Aplikasi Informatika Dinas Komunikasi dan Informatika Provinsi Jawa Barat. Silakan pilih layanan di bawah untuk memulai.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Status Sistem: <strong className="text-emerald-300">Aktif</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
              <Layers size={16} className="text-cyan-300" />
              <span>Total Modul: <strong className="text-white">{cards.length} Layanan</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Title Section (Frosted Glass Transparent Style) */}
      <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/70">
        <h2 className="text-[22px] font-bold text-blue-700 mb-2">
          Pilih Modul Service
        </h2>
        <p className="text-sm text-slate-600 font-medium">
          Silakan pilih modul layanan yang ingin Anda kelola untuk mengakses dashboard dan fitur terkait.
        </p>
      </div>

      {/* Grid of Service Button Cards (Frosted Glass Kaca Transparent Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => router.push(card.path)}
            className="bg-white/45 backdrop-blur-md rounded-2xl p-6 shadow-md border border-white/70 flex flex-col cursor-pointer hover:bg-white/75 hover:shadow-xl hover:border-blue-400/60 transition-all duration-200 group h-full relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-white/80 ${card.iconBg}`}
              >
                {card.icon}
              </div>
              {card.badge && (
                <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 font-extrabold text-[10px] tracking-wider uppercase border border-violet-200 shadow-sm">
                  {card.badge}
                </span>
              )}
            </div>

            <h3 className="text-base font-extrabold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">
              {card.title}
            </h3>

            <p className="text-[13px] text-slate-600 leading-relaxed flex-grow font-semibold">
              {card.desc}
            </p>

            <div
              className={`flex items-center gap-1.5 mt-6 font-bold text-[13px] ${card.actionColor}`}
            >
              <span>{card.actionText}</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

