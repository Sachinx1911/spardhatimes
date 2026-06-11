"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions/notifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string | Date;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getMyNotifications();
    setNotifications(res.notifications as any);
    setUnreadCount(res.unreadCount);
    setLoading(false);
  }, []);

  // Initial fetch + poll every 60s for new alerts.
  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  // Close on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) load();
  };

  const handleRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await markNotificationRead(id);
  };

  const handleReadAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllNotificationsRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative rounded-full p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-slate-900 border border-border/60 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <span className="font-bold text-sm text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleReadAll}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
            {loading ? (
              <div className="p-6 flex justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                You have no notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && handleRead(n.id)}
                  className={`w-full text-left px-4 py-3 flex gap-2.5 items-start hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    !n.read ? "bg-blue-50/50 dark:bg-blue-950/10" : ""
                  }`}
                >
                  <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      {n.title}
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/70 block mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}{" "}
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
