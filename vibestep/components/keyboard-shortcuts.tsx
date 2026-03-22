"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/create");
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        router.push("/dashboard");
      } else if (e.key === "?") {
        e.preventDefault();
        setShowHint(v => !v);
      } else if (e.key === "Escape") {
        setShowHint(false);
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  if (!showHint) {
    return (
      <button
        onClick={() => setShowHint(true)}
        title="Keyboard shortcuts (?)"
        style={{
          position: "fixed", bottom: 20, left: 20, zIndex: 9000,
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s ease",
        }}
      >
        ?
      </button>
    );
  }

  return (
    <>
      {/* backdrop */}
      <div
        onClick={() => setShowHint(false)}
        style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.5)" }}
      />
      {/* panel */}
      <div style={{
        position: "fixed", bottom: 20, left: 20, zIndex: 9999,
        background: "rgba(8,4,26,0.97)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: 14, padding: "18px 20px", minWidth: 220,
        boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
        animation: "scaleIn 0.18s ease",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14,
        }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
            Shortcuts
          </span>
          <button
            onClick={() => setShowHint(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: "1rem", lineHeight: 1, padding: 0 }}
          >×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { key: "N", label: "New idea" },
            { key: "D", label: "Dashboard" },
            { key: "?", label: "Toggle shortcuts" },
            { key: "Esc", label: "Close panels" },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)" }}>{label}</span>
              <kbd style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 5, padding: "2px 8px",
                fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.5)",
                fontFamily: "monospace",
              }}>{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
