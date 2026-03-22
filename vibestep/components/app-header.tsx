"use client";

import { useState } from "react";
import Link from "next/link";
import { NotificationBell } from "@/components/notification-bell";
import { UserAvatar } from "@/components/user-avatar";

const NAV_LINKS = [
  { href: "/dashboard",  label: "Dashboard"  },
  { href: "/tools",      label: "Tools"      },
  { href: "/templates",  label: "Templates"  },
  { href: "/validate",   label: "Validate"   },
  { href: "/settings",   label: "Settings"   },
];

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        /* Desktop: show nav, hide mobile controls */
        .vs-hdr-desktop { display: flex; }
        .vs-hdr-mobile  { display: none; }

        /* Mobile: flip */
        @media (max-width: 767px) {
          .vs-hdr-desktop { display: none !important; }
          .vs-hdr-mobile  { display: flex !important; }
        }
      `}</style>

      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(3,0,20,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>

        {/* ── Single bar ── */}
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", alignItems: "center",
          height: 64, padding: "0 1.5rem",
        }}>

          {/* Logo — always visible */}
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 10,
            textDecoration: "none", flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "white",
              boxShadow: "0 0 16px rgba(139,92,246,0.5)",
            }}>V</div>
            <span style={{
              fontSize: "1.1rem", fontWeight: 800,
              background: "linear-gradient(135deg,#c4b5fd,#a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>VibeStep</span>
          </Link>

          {/* ── DESKTOP layout (hidden on mobile) ── */}
          {/* Nav links */}
          <nav className="vs-hdr-desktop" style={{ alignItems: "center", gap: 2, marginLeft: 20 }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                fontSize: "0.82rem", color: "rgba(255,255,255,0.45)",
                padding: "7px 11px", borderRadius: 8, textDecoration: "none",
                whiteSpace: "nowrap",
              }}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="vs-hdr-desktop" style={{ flex: 1 }} />

          {/* Right actions */}
          <div className="vs-hdr-desktop" style={{ alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Link href="/create" style={{
              display: "inline-flex", alignItems: "center",
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              border: "1px solid rgba(139,92,246,0.45)",
              color: "white", padding: "7px 15px", borderRadius: 9,
              fontSize: "0.82rem", fontWeight: 600, textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              + New idea
            </Link>
            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)" }} />
            <NotificationBell />
            <UserAvatar />
          </div>

          {/* ── MOBILE layout (hidden on desktop) ── */}
          {/* Spacer to push controls right */}
          <div className="vs-hdr-mobile" style={{ flex: 1 }} />

          {/* New idea + hamburger */}
          <div className="vs-hdr-mobile" style={{ alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Link href="/create" style={{
              display: "inline-flex", alignItems: "center",
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              border: "1px solid rgba(139,92,246,0.45)",
              color: "white", padding: "6px 12px", borderRadius: 9,
              fontSize: "0.78rem", fontWeight: 600, textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              + New idea
            </Link>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", justifyContent: "center",
                alignItems: "center", gap: 5, width: 36, height: 36, padding: 4,
                flexShrink: 0,
              }}
            >
              <span style={{
                display: "block", width: 20, height: 2,
                background: "rgba(255,255,255,0.8)", borderRadius: 2,
                transition: "transform 0.22s ease",
                transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
              }} />
              <span style={{
                display: "block", width: 20, height: 2,
                background: "rgba(255,255,255,0.8)", borderRadius: 2,
                transition: "opacity 0.22s ease",
                opacity: menuOpen ? 0 : 1,
              }} />
              <span style={{
                display: "block", width: 20, height: 2,
                background: "rgba(255,255,255,0.8)", borderRadius: 2,
                transition: "transform 0.22s ease",
                transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
              }} />
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown (only mounted when open) ── */}
        {menuOpen && (
          <div style={{
            background: "rgba(5,2,24,0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "8px 1.5rem 20px",
            display: "flex", flexDirection: "column", gap: 2,
            animation: "fadeIn 0.15s ease",
          }}>
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block", padding: "11px 14px", borderRadius: 10,
                  textDecoration: "none", color: "rgba(255,255,255,0.55)",
                  fontSize: "0.92rem", fontWeight: 500,
                }}
              >
                {l.label}
              </Link>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "8px 0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 14px" }}>
              <NotificationBell />
              <UserAvatar />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
