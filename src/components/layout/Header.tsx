"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Search, User, Trash2, Check, Shield } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Dropdown from "@/components/ui/Dropdown";
import { useRouter } from "next/navigation";
import { logout } from "@/services/api";
import { useTaskStore } from "@/store/useTaskStore";

export interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const { 
    notifications, 
    currentUser, 
    loadCurrentUser, 
    markNotificationAsRead, 
    clearNotifications 
  } = useTaskStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  // Click outside for notifications dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = currentUser?.name || "User";
  const isAdmin = currentUser?.role === "admin";
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    try { 
      await logout(); 
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const profileMenuItems = [
    {
      label: "Profil Saya",
      onClick: () => router.push(isAdmin ? "/admin/users" : "/rekayasaaplikasi/dashboard"),
      icon: <User size={14} />,
    },
    {
      label: "Keluar",
      onClick: handleLogout,
      icon: <Bell size={14} className="text-red-400" />,
      destructive: true,
    },
  ];

  return (
    <header className="flex items-center justify-between bg-white border border-slate-100/80 rounded-2xl px-6 py-4 shadow-sm select-none">
      {/* Title Area */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-base font-extrabold text-slate-800 tracking-wide leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-slate-400 font-semibold tracking-wide">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Icon & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors ${
              isNotifOpen ? "bg-slate-50 text-slate-700" : ""
            }`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center bg-red-500 rounded-full ring-2 ring-white text-[8px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 shadow-xl rounded-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800">Notifikasi</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    Bersihkan
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 text-left hover:bg-slate-50/70 transition-colors cursor-pointer relative ${
                        !n.read ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-800">{n.title}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{n.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal pr-4">{n.message}</p>
                      {!n.read && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 bg-blue-100 rounded-full">
                          <Check size={9} className="text-blue-600 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                    <Bell size={24} className="text-slate-300 stroke-[1.5]" />
                    <span className="text-xs text-slate-400 font-medium">Tidak ada notifikasi baru</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-100" />

        {/* Profile Selector */}
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
              <Avatar name={userName} size="sm" indicator="online" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate leading-none">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5">
                  {isAdmin ? "Admin" : "Developer"}
                </span>
              </div>
            </div>
          }
          items={profileMenuItems}
        />
      </div>
    </header>
  );
}
export { Header };

