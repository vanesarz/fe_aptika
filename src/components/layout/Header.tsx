"use client";

import { useEffect, useState, useRef } from "react";
import { Search, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Dropdown from "@/components/ui/Dropdown";
import { useRouter } from "next/navigation";
import { logout } from "@/services/api";
import { useTaskStore } from "@/store/useTaskStore";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const { currentUser, loadCurrentUser } = useTaskStore();

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const userName = currentUser?.name || "User";
  const isAdmin = currentUser?.role === "admin";

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
      icon: <User size={14} className="text-red-400" />,
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
        <NotificationBell />

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

