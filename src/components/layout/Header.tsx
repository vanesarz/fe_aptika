"use client";

import { useEffect, useState } from "react";
import { Bell, Search, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Dropdown from "@/components/ui/Dropdown";
import { useRouter } from "next/navigation";
import { logout } from "@/services/api";

export interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [userName, setUserName] = useState("User");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        try {
          const uObj = JSON.parse(uStr);
          setUserName(uObj?.name || "User");
          setIsAdmin(uObj?.role === "admin");
        } catch {}
      }
    }
  }, []);

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
        {/* Notification Icon */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

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
