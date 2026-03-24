"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh", background: "var(--vs-bg)", color: "var(--vs-text)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      {/* Ambient orbs */}
      <div aria-hidden="true" style={{
        position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />
      <div aria-hidden="true" style={{
        position: "fixed", bottom: "10%", right: "10%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 480 }}>
        {/* Icon */}
        <div style={{
          width: 58, height: 58, borderRadius: 16, margin: "0 auto 28px",
          background: "linear-gradient(135deg,rgba(239,68,68,0.18),rgba(239,68,68,0.06))",
          border: "1px solid rgba(239,68,68,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 28px rgba(239,68,68,0.2)",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4M12 17h.01"/>
          </svg>
        </div>

        <h1 style={{
          fontSize: "1.55rem", fontWeight: 900, letterSpacing: "-0.025em",
          color: "rgba(255,255,255,0.92)", margin: "0 0 10px",
        }}>
          Something went wrong
        </h1>
        <p style={{
          fontSize: "0.9rem", color: "rgba(255,255,255,0.32)",
          lineHeight: 1.7, margin: "0 0 10px",
        }}>
          An unexpected error occurred. This has been logged.
        </p>
        {error.digest && (
          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.16)", margin: "0 0 36px", fontFamily: "monospace" }}>
            Error ID: {error.digest}
          </p>
        )}
        {!error.digest && <div style={{ marginBottom: 36 }} />}

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              border: "1px solid rgba(139,92,246,0.45)",
              color: "white", padding: "11px 26px", borderRadius: 11,
              fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 0 22px rgba(139,92,246,0.32)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", padding: "11px 26px", borderRadius: 11,
              fontSize: "0.9rem", fontWeight: 500, textDecoration: "none",
            }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
