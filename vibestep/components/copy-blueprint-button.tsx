"use client";

import { useState } from "react";

export function CopyBlueprintButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: select text */
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: copied ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.12)"}`,
        color: copied ? "#34d399" : "rgba(255,255,255,0.55)",
        padding: "10px 20px", borderRadius: 10, fontSize: "0.88rem", fontWeight: 600,
        cursor: "pointer", transition: "all 0.2s ease",
      }}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          Link copied!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Share link
        </>
      )}
    </button>
  );
}
