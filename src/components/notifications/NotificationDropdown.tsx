"use client";

import { AlertCircle, CheckCheck, Clock3, MessageSquare, RefreshCw, Trash2, BellOff, Sparkles } from "lucide-react";
import { useMemo } from "react";
import type { NotificationItem } from "@/services/notifications/NotificationTypes";
import { getTaskNotificationRedirectPath } from "@/services/notifications/NotificationAPI";

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onMarkAsRead: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onNavigate: (path: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "TASK_ASSIGNED":
      return <Clock3 className="h-4 w-4 text-sky-600" />;
    case "TASK_COMMENT":
      return <MessageSquare className="h-4 w-4 text-violet-600" />;
    case "TASK_STATUS_CHANGED":
      return <RefreshCw className="h-4 w-4 text-amber-600" />;
    case "JOIN_APPROVED":
      return <CheckCheck className="h-4 w-4 text-emerald-600" />;
    case "JOIN_REJECTED":
      return <AlertCircle className="h-4 w-4 text-rose-600" />;
    case "BOARD_ARCHIVED":
      return <BellOff className="h-4 w-4 text-slate-600" />;
    default:
      return <Sparkles className="h-4 w-4 text-sky-600" />;
  }
};

const formatRelativeTime = (date?: string | null) => {
  if (!date) return "Just now";
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return target.toLocaleDateString("en", { month: "short", day: "numeric" });
};

export function NotificationDropdown({ open, notifications, unreadCount, isLoading, isError, onRefresh, onMarkAllAsRead, onMarkAsRead, onDelete, onNavigate }: NotificationDropdownProps) {
  const unread = useMemo(() => notifications.filter((item) => !item.is_read), [notifications]);
  const earlier = useMemo(() => notifications.filter((item) => item.is_read), [notifications]);

  if (!open) return null;

  return (
    <div className="absolute right-0 z-50 mt-2 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Notifications</p>
          <p className="text-xs text-slate-500">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRefresh()}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Refresh notifications"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => onMarkAllAsRead()}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-50"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto bg-slate-50/70 p-2">
        {isLoading && (
          <div className="space-y-2 px-2 py-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-700">
            Unable to load notifications right now.
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/90 px-4 py-8 text-center text-sm text-slate-500">
            <BellOff className="h-8 w-8 text-slate-300" />
            <span>No notifications</span>
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <div className="space-y-3">
            {unread.length > 0 && (
              <div>
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Unread</p>
                <div className="space-y-2">
                  {unread.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={async () => {
                        await onMarkAsRead(notification.id);
                        onNavigate(getTaskNotificationRedirectPath(notification));
                      }}
                      className="group flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50"
                    >
                      <div className="mt-0.5 rounded-xl bg-slate-100 p-2">{getNotificationIcon(notification.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-800">{notification.title}</span>
                          <span className="text-[11px] text-slate-400">{formatRelativeTime(notification.created_at)}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{notification.message}</p>
                      </div>
                      <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {earlier.length > 0 && (
              <div>
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Earlier</p>
                <div className="space-y-2">
                  {earlier.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={async () => {
                        await onMarkAsRead(notification.id);
                        onNavigate(getTaskNotificationRedirectPath(notification));
                      }}
                      className="group flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                    >
                      <div className="mt-0.5 rounded-xl bg-slate-100 p-2">{getNotificationIcon(notification.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-700">{notification.title}</span>
                          <span className="text-[11px] text-slate-400">{formatRelativeTime(notification.created_at)}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{notification.message}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-white px-4 py-3 text-center">
        <button type="button" onClick={() => onNavigate('/manajementugasdigital')} className="text-sm font-semibold text-sky-600 transition hover:text-sky-700">
          View all notifications
        </button>
      </div>
    </div>
  );
}
