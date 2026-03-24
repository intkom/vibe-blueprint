"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/actions/auth";

/* ── Helpers ────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#7c3aed", "#2563eb", "#059669", "#d97706",
  "#dc2626", "#0891b2", "#db2777", "#4f46e5",
];

function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(email: string): string {
  const local = email.split("@")[0];
  const parts = local.split(/[._\-+]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.substring(0, 2).toUpperCase();
}

/* ── Component ──────────────────────────────────────────── */
export function UserAvatar() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const initials = email ? getInitials(email) : "…";
  const color = email ? hashColor(email) : "#7c3aed";

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="User menu"
        style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: `linear-gradient(135deg, ${color}, ${color}bb)`,
          border: open ? `2px solid ${color}88` : "2px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          fontSize: "0.6rem", fontWeight: 800, color: "white", letterSpacing: "0.05em",
          boxShadow: open ? `0 0 16px ${color}55` : "none",
          transition: "all 0.18s ease",
        }}
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 210,
          background: "rgba(8,4,26,0.98)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 14, overflow: "hidden",
          boxShadow: "0 20px 56px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.06)",
          zIndex: 200,
          animation: "scaleIn 0.15s ease",
          transformOrigin: "top right",
        }}>
          {/* Profile header */}
          <div style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 11,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${color}, ${color}bb)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.65rem", fontWeight: 800, color: "white",
              boxShadow: `0 0 12px ${color}44`,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.85)",
                margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {email ?? "Loading…"}
              </p>
              <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>
                Free plan
              </p>
            </div>
          </div>

          {/* Menu links */}
          <div style={{ padding: "6px" }}>
            {[
              { href: "/dashboard",  label: "Dashboard",  icon: "▦" },
              { href: "/create",     label: "New analysis",   icon: "✦" },
              { href: "/tools",      label: "Tools",      icon: "⚡" },
              { href: "/templates",  label: "Templates",  icon: "◈" },
              { href: "/settings",   label: "Settings",   icon: "⚙" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 11px", borderRadius: 9,
                  fontSize: "0.82rem",
                  color: hover === item.href ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  background: hover === item.href ? "rgba(255,255,255,0.05)" : "transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={() => setHover(item.href)}
                onMouseLeave={() => setHover(null)}
              >
                <span style={{ fontSize: "0.7rem", opacity: 0.6, width: 14, textAlign: "center" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />

            {/* Sign out */}
            <form action={signOut} style={{ margin: 0 }}>
              <button
                type="submit"
                style={{
                  width: "100%", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 11px", borderRadius: 9,
                  fontSize: "0.82rem", color: "rgba(248,113,113,0.75)",
                  background: hover === "signout" ? "rgba(239,68,68,0.08)" : "transparent",
                  border: "none", cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={() => setHover("signout")}
                onMouseLeave={() => setHover(null)}
              >
                <span style={{ fontSize: "0.7rem", opacity: 0.6, width: 14, textAlign: "center" }}>→</span>
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
