"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Notification } from "@/app/api/notifications/route";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_META: Record<string, { color: string; bg: string; icon: string }> = {
  info:    { color: "#a78bfa", bg: "rgba(139,92,246,0.1)", icon: "✦" },
  success: { color: "#34d399", bg: "rgba(52,211,153,0.1)", icon: "✓" },
  warning: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: "⚠" },
  risk:    { color: "#f87171", bg: "rgba(239,68,68,0.1)",  icon: "↓" },
};

export function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json() as { notifications: Notification[] };
        setNotifications(data.notifications);
      }
    } catch { /* silent */ }
  }, []);

  // Fetch on mount + poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function handleClick(n: Notification) {
    if (!n.read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  function handleBellClick() {
    setOpen(o => !o);
    if (!open) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  }

  return (
    <div ref={dropRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: open ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${open ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.1)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.18s ease",
          position: "relative",
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
          }
        }}
      >
        {/* Bell SVG */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={open ? "#a78bfa" : "rgba(255,255,255,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            minWidth: 16, height: 16, borderRadius: 9999,
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            border: "2px solid rgba(5,2,20,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.55rem", fontWeight: 800, color: "white",
            padding: "0 3px",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 340,
          background: "rgba(6,3,22,0.98)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14, overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(139,92,246,0.1)",
          zIndex: 200,
          animation: "vsDropIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
          transformOrigin: "top right",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700,
                  background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)",
                  color: "#a78bfa", padding: "1px 7px", borderRadius: 9999,
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.7rem", color: "rgba(167,139,250,0.6)",
                  fontWeight: 600, padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <div style={{ width: 18, height: 18, border: "2px solid rgba(139,92,246,0.2)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: 8, opacity: 0.4 }}>🔔</div>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                  No notifications yet
                </p>
                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.15)", margin: "4px 0 0" }}>
                  You&apos;ll see updates about your analyses here
                </p>
              </div>
            ) : (
              notifications.map(n => {
                const meta = TYPE_META[n.type] ?? TYPE_META.info;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    style={{
                      width: "100%", textAlign: "left",
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 16px",
                      background: n.read ? "transparent" : "rgba(139,92,246,0.04)",
                      border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)",
                      cursor: n.link ? "pointer" : "default",
                      transition: "background 0.14s",
                    }}
                    onMouseEnter={e => {
                      if (n.link) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = n.read ? "transparent" : "rgba(139,92,246,0.04)";
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      background: meta.bg, border: `1px solid ${meta.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.8rem", color: meta.color,
                    }}>
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: "0.8rem", fontWeight: n.read ? 500 : 700,
                        color: n.read ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.82)",
                        margin: "0 0 2px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {n.title}
                      </p>
                      <p style={{
                        fontSize: "0.72rem", color: "rgba(255,255,255,0.3)",
                        margin: "0 0 4px", lineHeight: 1.5,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", margin: 0 }}>
                        {timeAgo(n.created_at)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#a78bfa", flexShrink: 0, marginTop: 6,
                      }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes vsDropIn {
          from { opacity:0; transform:scale(0.95) translateY(-8px); }
          to   { opacity:1; transform:scale(1)    translateY(0);    }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
