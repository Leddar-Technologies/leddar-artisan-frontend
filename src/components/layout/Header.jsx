"use client";

import { Bell, CheckCheck, LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import apiClient from "../../services/apiClient";

const TYPE_COLORS = {
  ORDER_UPDATE:             "bg-blue-50 text-blue-600",
  PAYMENT_UPDATE:           "bg-emerald-50 text-emerald-600",
  JOB_ASSIGNED:             "bg-amber-50 text-amber-600",
  SAMPLE_READY:             "bg-amber-50 text-amber-700",
  PAYMENT_RELEASED:         "bg-emerald-50 text-emerald-600",
  PRODUCTION_JOB_ASSIGNED:  "bg-amber-50 text-amber-600",
};

export default function Header({ userName, onLogout, onMenuToggle }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen]                   = useState(false);
  const dropdownRef                        = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get("/artisans/notifications");
      setNotifications(res.data?.data || []);
    } catch { /* non-fatal */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await apiClient.patch("/artisans/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* non-fatal */ }
  };

  const markOneRead = async (id) => {
    try {
      await apiClient.patch(`/artisans/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch { /* non-fatal */ }
  };

  const handleLogout = () => {
    onLogout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-surface-400/80 bg-white/95 backdrop-blur-md">
      <div className="px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-start gap-3 sm:gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2.5 bg-espresso text-white rounded-xl border border-white/10 flex-shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-xl font-semibold text-ink leading-tight">
              Welcome back, {userName}
            </h2>
            <p className="text-[11px] sm:text-sm text-neutral-700 leading-snug hidden sm:block">
              Manage your jobs and track your earnings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="relative p-2.5 rounded-xl border border-surface-400 bg-white text-neutral-700 hover:border-amber-400 hover:text-amber-600 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-surface-300 bg-white shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
                  <p className="text-sm font-bold text-ink">Notifications</p>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:underline"
                      >
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setOpen(false)}
                      className="text-neutral-400 hover:text-ink"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-sm text-neutral-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markOneRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-surface-100 last:border-0 cursor-pointer transition-colors ${
                          n.isRead
                            ? "bg-white hover:bg-neutral-50"
                            : "bg-amber-50/40 hover:bg-amber-50"
                        }`}
                      >
                        <span
                          className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            TYPE_COLORS[n.type] || "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {n.type?.replace(/_/g, " ")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-ink leading-relaxed">{n.message}</p>
                          <p className="mt-0.5 text-[10px] text-neutral-400">
                            {new Date(n.createdAt).toLocaleDateString("en-NG")}
                          </p>
                        </div>
                        {!n.isRead && (
                          <span className="mt-2 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-neutral-900 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
