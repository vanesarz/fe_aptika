"use client";

import { Bell, BellDot, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTaskNotifications } from "@/services/notifications/NotificationHooks";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

export function NotificationBell() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading, isError, refresh, markAsRead, markAllAsRead, removeNotification } = useTaskNotifications();

  const isTaskModule = useMemo(() => pathname?.startsWith("/manajementugasdigital"), [pathname]);

  if (!isTaskModule) {
    return null;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Notifications"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : unreadCount > 0 ? (
          <BellDot className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={isLoading}
        isError={isError}
        onRefresh={refresh}
        onMarkAllAsRead={markAllAsRead}
        onMarkAsRead={markAsRead}
        onDelete={removeNotification}
        onNavigate={(path) => {
          setOpen(false);
          router.push(path);
        }}
      />
    </div>
  );
}
