"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("errors");
  return (
    <div style={{
      minHeight: "100vh", background: "var(--vs-bg)", color: "var(--vs-text)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      {/* Ambient orbs */}
      <div aria-hidden="true" style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />
      <div aria-hidden="true" style={{
        position: "fixed", bottom: "10%", left: "10%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 480 }}>
        {/* 404 number */}
        <div style={{
          fontSize: "clamp(5rem, 18vw, 9rem)", fontWeight: 900,
          letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4,
          background: "linear-gradient(135deg, rgba(167,139,250,0.25) 0%, rgba(139,92,246,0.08) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          userSelect: "none",
        }}>
          404
        </div>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 24px",
          background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 28px rgba(139,92,246,0.45)",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v3M11 14h.01"/>
          </svg>
        </div>

        <h1 style={{
          fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.025em",
          color: "rgba(255,255,255,0.92)", margin: "0 0 10px",
        }}>
          {t("notFound")}
        </h1>
        <p style={{
          fontSize: "0.92rem", color: "rgba(255,255,255,0.35)",
          lineHeight: 1.7, margin: "0 0 36px",
        }}>
          {t("notFoundDesc")}
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{
            display: "inline-block",
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
            border: "1px solid rgba(139,92,246,0.45)",
            color: "white", padding: "11px 26px", borderRadius: 11,
            fontSize: "0.9rem", fontWeight: 600, textDecoration: "none",
            boxShadow: "0 0 22px rgba(139,92,246,0.35)",
          }}>
            {t("goHome")}
          </Link>
          <Link href="/dashboard" style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.55)", padding: "11px 26px", borderRadius: 11,
            fontSize: "0.9rem", fontWeight: 500, textDecoration: "none",
          }}>
            {t("goDashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}
