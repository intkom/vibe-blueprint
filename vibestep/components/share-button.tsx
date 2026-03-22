"use client";

import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: copied ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
        border: copied ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 9, padding: "6px 13px",
        fontSize: "0.75rem", fontWeight: 600,
        color: copied ? "#34d399" : "rgba(255,255,255,0.45)",
        cursor: "pointer", transition: "all 0.2s ease",
      }}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Link copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          Share project
        </>
      )}
    </button>
  );
}
