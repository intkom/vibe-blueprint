"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/lib/notification-context";

const TYPE_COLORS = {
  success:   { bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  text: "#34d399",  dot: "#34d399"  },
  info:      { bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)",  text: "#60a5fa",  dot: "#60a5fa"  },
  milestone: { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)",  text: "#fbbf24",  dot: "#fbbf24"  },
};

// Global toast portal — rendered outside of any overflow:hidden parent
export function NotificationToasts() {
  const { notifications, dismiss } = useNotifications();

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 10000,
      display: "flex", flexDirection: "column-reverse", gap: 10,
      pointerEvents: "none",
    }}>
      {notifications.map(n => {
        const c = TYPE_COLORS[n.type];
        return (
          <div key={n.id} style={{
            pointerEvents: "all",
            background: "rgba(8,4,26,0.96)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${c.border}`,
            borderRadius: 14,
            padding: "13px 16px",
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${c.border}`,
            animation: "slideInRight 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            maxWidth: 340, minWidth: 260,
          }}>
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{n.icon ?? "✓"}</span>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5, flex: 1 }}>
              {n.message}
            </p>
            <button
              onClick={() => dismiss(n.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.25)", fontSize: "1rem", lineHeight: 1,
                padding: "0 2px", flexShrink: 0,
              }}
            >×</button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideInRight {
          from { opacity:0; transform:translateX(32px) scale(0.95); }
          to   { opacity:1; transform:translateX(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}

// Bell icon for navbar — shows unread count badge
export function NotificationBell() {
  const { notifications, dismiss } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count = notifications.length;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        style={{
          position: "relative",
          width: 34, height: 34, borderRadius: 9,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: open ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)",
          border: open ? "1px solid rgba(139,92,246,0.35)" : "1px solid rgba(255,255,255,0.1)",
          cursor: "pointer", color: count > 0 ? "#a78bfa" : "rgba(255,255,255,0.4)",
          transition: "all 0.18s ease",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {count > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            width: 16, height: 16, borderRadius: "50%",
            background: "#7c3aed", border: "2px solid #030014",
            fontSize: "0.55rem", fontWeight: 800, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{count > 9 ? "9+" : count}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 300,
          background: "rgba(8,4,26,0.97)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 14, overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)",
          zIndex: 100,
          animation: "scaleIn 0.18s ease",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Notifications
            </span>
            {count > 0 && (
              <button
                onClick={() => notifications.forEach(n => dismiss(n.id))}
                style={{ fontSize: "0.72rem", color: "rgba(139,92,246,0.6)", background: "none", border: "none", cursor: "pointer" }}
              >
                Clear all
              </button>
            )}
          </div>

          {count === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.2)", margin: 0 }}>No notifications</p>
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {notifications.map(n => {
                const c = TYPE_COLORS[n.type];
                return (
                  <div key={n.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: c.dot, boxShadow: `0 0 6px ${c.dot}88`, marginTop: 5,
                    }} />
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.5, flex: 1 }}>
                      {n.message}
                    </p>
                    <button
                      onClick={() => dismiss(n.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", fontSize: "1rem", padding: 0, flexShrink: 0 }}
                    >×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
