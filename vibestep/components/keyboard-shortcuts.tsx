"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/app/api/search/route";

const SHORTCUTS = [
  { key: "N",   label: "New analysis"    },
  { key: "D",   label: "Dashboard"       },
  { key: "⌘K",  label: "Search"          },
  { key: "⌘↵",  label: "Submit form"     },
  { key: "?",   label: "Show shortcuts"  },
  { key: "Esc", label: "Close panels"    },
];

const QUICK_LINKS = [
  { icon: "⚡", label: "New analysis",  href: "/create" },
  { icon: "🏠", label: "Dashboard",     href: "/dashboard" },
  { icon: "📋", label: "Templates",     href: "/templates" },
  { icon: "⚙",  label: "Settings",      href: "/settings" },
];

function healthColor(score?: number) {
  if (!score) return "rgba(255,255,255,0.25)";
  if (score >= 76) return "#34d399";
  if (score >= 61) return "#60a5fa";
  if (score >= 41) return "#fbbf24";
  return "#f87171";
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHint, setShowHint]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState<SearchResult[]>([]);
  const [searching, setSearching]   = useState(false);
  const [selected, setSelected]     = useState(0);
  const inputRef  = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Debounced search ── */
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setSearching(false); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json() as { results: SearchResult[] };
        setResults(data.results);
        setSelected(0);
      }
    } catch { /* silent */ }
    setSearching(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  /* ── Keyboard handler ── */
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";

      // ⌘K / Ctrl+K — global search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(s => !s);
        setShowHint(false);
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }

      // ⌘Enter — submit nearest form
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        const form = document.querySelector("form");
        if (form) {
          const btn = form.querySelector<HTMLButtonElement>("button[type='submit']");
          btn?.click();
        }
        return;
      }

      if (isInput) return;

      // Arrow navigation in search
      if (searchOpen) {
        const total = results.length || QUICK_LINKS.length;
        if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, total - 1)); }
        if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
        if (e.key === "Enter") {
          e.preventDefault();
          if (results.length > 0) {
            const r = results[selected];
            if (r) { setSearchOpen(false); setQuery(""); router.push(r.url); }
          } else {
            const l = QUICK_LINKS[selected];
            if (l) { setSearchOpen(false); router.push(l.href); }
          }
        }
      }

      if (e.key === "n" || e.key === "N") { e.preventDefault(); router.push("/create"); }
      else if (e.key === "d" || e.key === "D") { e.preventDefault(); router.push("/dashboard"); }
      else if (e.key === "?") { e.preventDefault(); setShowHint(v => !v); setSearchOpen(false); }
      else if (e.key === "Escape") {
        setShowHint(false);
        setSearchOpen(false);
        setQuery("");
        setResults([]);
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, searchOpen, results, selected]);

  function openSearch() {
    setSearchOpen(true);
    setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <>
      {/* Bottom-right hint badge */}
      {!showHint && !searchOpen && (
        <button
          onClick={openSearch}
          title="Search (⌘K)"
          aria-label="Open search"
          style={{
            position: "fixed", bottom: 20, right: 20, zIndex: 9000,
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 9999, padding: "5px 11px",
            color: "rgba(255,255,255,0.2)", fontSize: "0.65rem", fontWeight: 700,
            cursor: "pointer", transition: "all 0.2s ease",
            fontFamily: "monospace",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.2)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.09)";
          }}
        >
          <kbd>⌘K</kbd>
          <span>Search</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <kbd onClick={e => { e.stopPropagation(); setShowHint(v => !v); }}>?</kbd>
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
              animation: "kbScaleIn 0.18s ease",
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
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
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
            onClick={() => { setSearchOpen(false); setQuery(""); setResults([]); }}
            style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Search"
            style={{
              position: "fixed", top: "18%", left: "50%", transform: "translateX(-50%)",
              zIndex: 9999, width: "min(560px, 90vw)",
              background: "rgba(8,4,26,0.99)",
              backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 16, overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.1)",
              animation: "searchSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {/* Search input */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {searching ? (
                <div style={{ width: 16, height: 16, border: "2px solid rgba(139,92,246,0.3)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "kbSpin 0.7s linear infinite", flexShrink: 0 }} />
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              )}
              <input
                ref={inputRef}
                autoFocus
                type="text"
                placeholder="Search analyses, steps, ideas..."
                value={query}
                onChange={e => setQuery(e.target.value)}
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

            {/* Results or quick links */}
            <div style={{ maxHeight: 380, overflowY: "auto" }}>

              {/* Actual search results */}
              {results.length > 0 && (
                <div style={{ padding: "8px 8px 10px" }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "4px 10px", margin: "0 0 4px" }}>
                    Results
                  </p>
                  {results.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => { setSearchOpen(false); setQuery(""); setResults([]); router.push(r.url); }}
                      style={{
                        width: "100%", textAlign: "left",
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 10px", borderRadius: 9,
                        background: i === selected ? "rgba(139,92,246,0.12)" : "transparent",
                        border: "none", cursor: "pointer",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={() => setSelected(i)}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: r.type === "project" ? "rgba(139,92,246,0.1)" : "rgba(52,211,153,0.08)",
                        border: `1px solid ${r.type === "project" ? "rgba(139,92,246,0.2)" : "rgba(52,211,153,0.15)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem",
                      }}>
                        {r.type === "project" ? "📁" : "▶"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: "0.83rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.title}
                          </span>
                          {r.health_score !== undefined && (
                            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: healthColor(r.health_score), flexShrink: 0 }}>
                              {r.health_score}%
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.28)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.snippet}
                        </p>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {!searching && query.trim().length >= 2 && results.length === 0 && (
                <div style={{ padding: "28px 18px", textAlign: "center" }}>
                  <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.15)", margin: "6px 0 0" }}>
                    Try: SaaS, mobile, API, authentication...
                  </p>
                </div>
              )}

              {/* Quick links (shown when no query) */}
              {query.trim().length < 2 && (
                <div style={{ padding: "10px 8px 12px" }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "4px 10px", marginBottom: 4 }}>
                    Quick navigation
                  </p>
                  {QUICK_LINKS.map((item, i) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => { setSearchOpen(false); setQuery(""); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 10px", borderRadius: 9,
                        background: i === selected ? "rgba(255,255,255,0.06)" : "transparent",
                        textDecoration: "none", transition: "background 0.12s",
                      }}
                      onMouseEnter={() => setSelected(i)}
                    >
                      <span style={{
                        fontSize: "1rem", width: 28, height: 28,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(255,255,255,0.05)", borderRadius: 7,
                      }}>{item.icon}</span>
                      <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: "8px 14px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, desc]) => (
                <span key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <kbd style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "1px 5px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{key}</kbd>
                  <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.18)" }}>{desc}</span>
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes kbScaleIn { from{opacity:0;transform:scale(0.95)}  to{opacity:1;transform:scale(1)} }
        @keyframes searchSlideIn { from{opacity:0;transform:translateX(-50%) scale(0.97)} to{opacity:1;transform:translateX(-50%) scale(1)} }
        @keyframes kbSpin { to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}
