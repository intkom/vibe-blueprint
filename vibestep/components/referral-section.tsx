"use client";

import { useState } from "react";

export function ReferralSection({ username }: { username: string }) {
  const refLink = `https://vibe-blueprint.vercel.app/ref/${username}`;
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "20px 24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <p style={{
            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 3px",
          }}>
            Refer &amp; Unlock
          </p>
          <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "rgba(255,255,255,0.82)", margin: 0 }}>
            Invite friends to VibeStep
          </p>
        </div>
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
          color: "#a78bfa", padding: "4px 10px", borderRadius: 9999, flexShrink: 0,
        }}>
          🎁 Referral program
        </span>
      </div>

      {/* Progress */}
      <div style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12, padding: "16px 18px", marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
            You&apos;ve invited <strong style={{ color: "rgba(255,255,255,0.7)" }}>0 friends</strong>
          </span>
          <span style={{ fontSize: "0.72rem", color: "#a78bfa", fontWeight: 600 }}>0 / 3</span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ width: "0%", height: "100%", background: "linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius: 9999 }} />
        </div>

        {/* Steps */}
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.25)",
              }}>{n}</div>
              <span style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.2)", textAlign: "center" }}>friend {n}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "0.72rem", color: "rgba(139,92,246,0.7)", fontWeight: 600, margin: "12px 0 0", textAlign: "center" }}>
          Invite 3 friends → unlock unlimited blueprints 🚀
        </p>
      </div>

      {/* Referral link */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "10px 14px", marginBottom: 12,
      }}>
        <span style={{
          flex: 1, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)",
          fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {refLink}
        </span>
        <button
          onClick={handleCopy}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: copied ? "rgba(52,211,153,0.1)" : "rgba(139,92,246,0.12)",
            border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(139,92,246,0.3)"}`,
            color: copied ? "#34d399" : "#a78bfa",
            padding: "6px 14px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700,
            cursor: "pointer", flexShrink: 0, transition: "all 0.2s ease",
          }}
        >
          {copied ? "✓ Copied!" : "Copy link"}
        </button>
      </div>

      {/* Share options */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Share on X",        emoji: "✕", href: `https://x.com/intent/tweet?text=I%27m%20using%20VibeStep%20to%20turn%20startup%20ideas%20into%20build%20plans%20in%2030s.%20Try%20it%20free%3A%20${encodeURIComponent(refLink)}` },
          { label: "Share on LinkedIn", emoji: "in", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(refLink)}` },
        ].map(s => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)", padding: "7px 14px", borderRadius: 8,
            fontSize: "0.75rem", fontWeight: 600, textDecoration: "none",
          }}>
            <span style={{ fontWeight: 900, fontSize: "0.7rem" }}>{s.emoji}</span>
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
