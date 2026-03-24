"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SHORTCUTS = [
  { key: "N",   label: "New analysis",     desc: "" },
  { key: "D",   label: "Dashboard",        desc: "" },
  { key: "⌘K",  label: "Search",           desc: "" },
  { key: "⌘↵",  label: "Submit analysis",  desc: "" },
  { key: "?",   label: "Toggle shortcuts", desc: "" },
  { key: "Esc", label: "Close panels",     desc: "" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHint, setShowHint] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";

      // ⌘K / Ctrl+K — global search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(s => !s);
        setShowHint(false);
        return;
      }

      if (isInput) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/create");
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        router.push("/dashboard");
      } else if (e.key === "?") {
        e.preventDefault();
        setShowHint(v => !v);
        setSearchOpen(false);
      } else if (e.key === "Escape") {
        setShowHint(false);
        setSearchOpen(false);
        setSearchQuery("");
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return (
    <>
      {/* Keyboard hint badge — bottom right */}
      {!showHint && !searchOpen && (
        <button
          onClick={() => setShowHint(true)}
          title="Keyboard shortcuts (?)"
          aria-label="Show keyboard shortcuts"
          style={{
            position: "fixed", bottom: 20, right: 20, zIndex: 9000,
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 9999, padding: "5px 10px",
            color: "rgba(255,255,255,0.2)", fontSize: "0.65rem", fontWeight: 700,
            cursor: "pointer", transition: "all 0.2s ease",
            fontFamily: "monospace",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.2)";
          }}
        >
          <kbd style={{ fontSize: "0.62rem", letterSpacing: "0.04em" }}>⌘K</kbd>
          <span>Search</span>
          <span style={{ opacity: 0.4, margin: "0 1px" }}>·</span>
          <kbd style={{ fontSize: "0.62rem" }}>?</kbd>
          <span>Shortcuts</span>
        </button>
      )}

      {/* Shortcuts overlay */}
      {showHint && (
        <>
          <div
            onClick={() => setShowHint(false)}
            style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.5)" }}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Keyboard shortcuts"
            style={{
              position: "fixed", bottom: 20, right: 20, zIndex: 9999,
              background: "rgba(8,4,26,0.97)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: 14, padding: "18px 20px", minWidth: 240,
              boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              animation: "scaleIn 0.18s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                Shortcuts
              </span>
              <button
                onClick={() => setShowHint(false)}
                aria-label="Close shortcuts"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: "1rem", lineHeight: 1, padding: 0 }}
              >×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SHORTCUTS.map(({ key, label }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)" }}>{label}</span>
                  <kbd style={{
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 5, padding: "2px 8px",
                    fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.5)",
                    fontFamily: "monospace", whiteSpace: "nowrap",
                  }}>{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ⌘K Search modal */}
      {searchOpen && (
        <>
          <div
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
            style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Search"
            style={{
              position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
              zIndex: 9999, width: "min(540px, 90vw)",
              background: "rgba(8,4,26,0.98)",
              backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 16,
              boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.1)",
              animation: "scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)",
              overflow: "hidden",
            }}
          >
            {/* Search input */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Search analyses, templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: "0.95rem", color: "rgba(255,255,255,0.85)",
                  fontFamily: "inherit", caretColor: "#a78bfa",
                }}
              />
              <kbd style={{
                fontSize: "0.62rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 5, padding: "2px 7px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace",
              }}>Esc</kbd>
            </div>

            {/* Quick links */}
            <div style={{ padding: "10px 8px 12px" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "4px 10px", marginBottom: 4 }}>
                Quick navigation
              </p>
              {[
                { icon: "⚡", label: "New analysis", href: "/create" },
                { icon: "🏠", label: "Dashboard",    href: "/dashboard" },
                { icon: "📋", label: "Templates",    href: "/templates" },
                { icon: "⚙", label: "Settings",     href: "/settings" },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 10px", borderRadius: 9,
                    textDecoration: "none", transition: "background 0.12s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                >
                  <span style={{ fontSize: "1rem", width: 24, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)" }}>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity:0; transform: translateX(-50%) scale(0.96); }
          to   { opacity:1; transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </>
  );
}
