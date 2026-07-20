"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/services/api";
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
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";

const TEAMS = [
  { name: "Integrasi Interoperabilitas", key: "integrasiinteroperabilitas", icon: Network },
  { name: "Administrasi Surat", key: "administrasisurat", icon: FileText },
  { name: "Pengelolaan Aplikasi", key: "pengelolaanaplikasi", icon: Layers },
  { name: "Rekayasa Aplikasi", key: "rekayasaaplikasi", icon: Cpu },
  { name: "Sidebar Jabar", key: "sidebarjabar", icon: LayoutTemplate },
  { name: "Smart Jabar", key: "smartjabar", icon: Smartphone },
  { name: "Sada Jabar", key: "sadajabar", icon: Database },
  { name: "Manajemen Tugas Digital", key: "manajementugasdigital", icon: Briefcase },
  { name: "Magang", key: "magang", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const uObj = JSON.parse(uStr);
          setUserName(uObj?.name || "User");
          if (uObj?.role === "admin") {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const activeSegment = pathname.split("/")[1] || "rekayasaaplikasi";

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsCollapsed((prev) => !prev);
      setIsOpen(false);
      return;
    }

    setIsOpen((prev) => !prev);
    setIsCollapsed(false);
  };

  const handleTeamClick = (key: string) => {
    setIsOpen(false);
    if (key === "administrasisurat" || key === "manajementugasdigital") {
      router.push(`/${key}`);
    } else {
      router.push(`/${key}/dashboard`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Also delete cookie
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    } catch { }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <>
      {/* Hamburger Toggle Button for Mobile/Tablet */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-50 flex items-center justify-center lg:hidden w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-md hover:bg-slate-800 transition-all duration-200"
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      {/* Overlay Backdrop for Mobile/Tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col h-screen
        bg-[#0b2146] text-white border-r border-slate-800
        transition-all duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:flex-shrink-0
        ${isCollapsed ? "w-[76px]" : "w-[260px]"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand Header */}
        <div
          className={`flex items-center justify-between border-b border-white/5 ${isCollapsed ? "px-3 py-5" : "px-6 py-6"}`}
        >
          {isCollapsed ? (
            <button
              onClick={toggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all animate-in fade-in duration-200"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={20} />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div
                className="cursor-pointer flex-grow animate-in fade-in duration-200"
                onClick={() => router.push("/rekayasaaplikasi/dashboard")}
              >
                <h1 className="text-[15px] font-extrabold tracking-wide uppercase bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Aptika Tools
                </h1>
                <p className="text-[10px] font-semibold text-slate-400 tracking-wider mt-0.5">
                  Rekap Data Aptika
                </p>
              </div>
              <button
                onClick={toggleSidebar}
                className="flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all ml-2"
                title="Collapse Sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-7 scrollbar-hide">
          {/* Services Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-4 text-[10px] font-extrabold text-slate-500 tracking-widest uppercase select-none">
                Service
              </span>
            )}
            <div className="pt-2 space-y-0.5">
              {TEAMS.map((team) => {
                const Icon = team.icon as any;
                const isActive = activeSegment === team.key;
                return (
                  <button
                    key={team.key}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold
                      transition-all duration-150 select-none outline-none group
                      ${isCollapsed ? "justify-center px-3" : ""}
                      ${isActive
                        ? "bg-blue-600/20 text-white shadow-sm border border-blue-500/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }
                    `}
                    onClick={() => handleTeamClick(team.key)}
                  >
                    <Icon size={16} className={`flex-shrink-0 transition-colors ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                    {!isCollapsed && <span className="flex-1 truncate">{team.name}</span>}
                    {isActive && (
                      <span className={`w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(56,189,248,0.8)] ${isCollapsed ? "absolute right-2" : ""}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Panel Section */}
          {isAdmin && (
            <div className="space-y-1 pt-4 border-t border-white/5">
              {!isCollapsed && (
                <span className="px-4 text-[10px] font-extrabold text-slate-500 tracking-widest uppercase select-none">
                  Admin Panel
                </span>
              )}
              <div className="pt-2 space-y-0.5">
                <button
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold
                    transition-all duration-150 select-none outline-none group
                    ${isCollapsed ? "justify-center px-3" : ""}
                    ${activeSegment === "admin"
                      ? "bg-blue-600/20 text-white shadow-sm border border-blue-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/admin/users");
                  }}
                >
                  <Users size={16} className={`flex-shrink-0 transition-colors ${activeSegment === "admin" ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                  {!isCollapsed && <span className="flex-1 truncate">Manajemen User</span>}
                  {activeSegment === "admin" && (
                    <span className={`w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(56,189,248,0.8)] ${isCollapsed ? "absolute right-2" : ""}`} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Area with Profile and Logout */}
        <div className={`p-4 border-t border-white/5 bg-[#081835]/50 flex flex-col gap-3 ${isCollapsed ? "items-center" : ""}`}>
          <div className={`flex items-center gap-3 px-2 ${isCollapsed ? "justify-center" : ""}`}>
            <Avatar name={userName} size="sm" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{userName}</h4>
                <p className="text-[10px] text-slate-400 truncate">{isAdmin ? "Administrator" : "Developer"}</p>
              </div>
            )}
          </div>
          <button
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-bold ${isCollapsed ? "justify-center" : ""}`}
            onClick={handleLogout}
          >
            <LogOut size={14} />
            {!isCollapsed && "Keluar Aplikasi"}
          </button>
        </div>
      </aside>
    </>
  );
}