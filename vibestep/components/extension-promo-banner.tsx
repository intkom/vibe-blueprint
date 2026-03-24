"use client";

import { useState, useEffect } from "react";

export function ExtensionPromoBanner() {
  const [visible, setVisible] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("axiom_ext_banner_dismissed");
      if (!dismissed) setVisible(true);
    } catch { setVisible(true); }
  }, []);

  function dismiss() {
    setVisible(false);
    try { localStorage.setItem("axiom_ext_banner_dismissed", "1"); } catch { }
  }

  if (!visible) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(96,165,250,0.06))",
      border: "1px solid rgba(139,92,246,0.2)",
      borderRadius: 14, padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
      marginBottom: 24,
      animation: "fadeInUp 0.4s ease both",
    }}>
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(96,165,250,0.1))",
        border: "1px solid rgba(139,92,246,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.1rem",
      }}>
        ⚡
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.82)", margin: "0 0 2px" }}>
          Get Axiom insights while you browse
        </p>
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
          Analyze any product you visit — coming to Chrome & Firefox soon
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {!waitlisted ? (
          <button
            type="button"
            onClick={() => setWaitlisted(true)}
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(96,165,250,0.15))",
              border: "1px solid rgba(139,92,246,0.4)",
              color: "#c4b5fd", padding: "7px 16px", borderRadius: 8,
              fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
              transition: "all 0.15s ease", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(139,92,246,0.35), rgba(96,165,250,0.22))"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(96,165,250,0.15))"; }}
          >
            Join waitlist →
          </button>
        ) : (
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#34d399", padding: "7px 10px" }}>
            ✓ You&apos;re on the list
          </span>
        )}
        <button
          type="button"
          onClick={dismiss}
          style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.25)",
            cursor: "pointer", padding: "6px", fontSize: "0.85rem",
            lineHeight: 1, borderRadius: 6, transition: "color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)"; }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
