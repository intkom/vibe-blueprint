"use client";

import { useState } from "react";

const PRO_FEATURES = [
  "Unlimited analyses",
  "Full AI workspace chat",
  "Live code generator per step",
  "Risk mitigation tracker",
  "Build journal",
  "Priority processing",
  "Export to Markdown",
  "Shareable analysis links",
];

export function UpgradeModal({ onClose, used = 3, limit = 3 }: { onClose: () => void; used?: number; limit?: number }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 301, width: "min(520px, 95vw)",
        background: "#07041a",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: 24, overflow: "hidden",
        boxShadow: "0 0 80px rgba(139,92,246,0.25), 0 32px 80px rgba(0,0,0,0.8)",
        animation: "scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Top glow beam */}
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "70%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.85), transparent)",
        }} />
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 120,
          background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(139,92,246,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 2,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "1rem",
          }}
        >✕</button>

        <div style={{ padding: "36px 32px 32px", position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 15, margin: "0 auto 18px",
              background: "linear-gradient(135deg,rgba(251,191,36,0.18),rgba(251,146,60,0.1))",
              border: "1px solid rgba(251,191,36,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem",
              boxShadow: "0 0 24px rgba(251,191,36,0.2)",
            }}>⚡</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.025em", margin: "0 0 8px" }}>
              You&apos;ve used all {limit} free analyses
            </h2>
            <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6 }}>
              Used {used}/{limit} this month. Upgrade for unlimited access.
            </p>
          </div>

          {/* Pro card */}
          <div style={{
            background: "rgba(139,92,246,0.07)",
            border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: 16, padding: "20px 22px",
            marginBottom: 20, position: "relative", overflow: "hidden",
          }}>
            <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "55%", height: 1, background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.7), transparent)" }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(167,139,250,0.7)", margin: "0 0 4px" }}>Axiom Pro</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: "2rem", fontWeight: 900, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.03em" }}>$19</span>
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.35)" }}>/month</span>
                </div>
              </div>
              <span style={{ fontSize: "0.62rem", fontWeight: 700, background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd", padding: "4px 10px", borderRadius: 9999, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Most popular
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
              {PRO_FEATURES.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ color: "#a78bfa", flexShrink: 0, fontSize: "0.85rem" }}>✓</span>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Waitlist form */}
          {status === "done" ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
              padding: "14px 20px",
              background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.22)",
              borderRadius: 12, marginBottom: 14,
              fontSize: "0.9rem", color: "#34d399", fontWeight: 600,
            }}>
              ✓ You&apos;re on the waitlist — we&apos;ll email you when Pro launches
            </div>
          ) : (
            <form onSubmit={joinWaitlist} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1, background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, padding: "11px 14px",
                  fontSize: "0.875rem", color: "rgba(255,255,255,0.8)",
                  outline: "none", fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(139,92,246,0.45)"; }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                  border: "1px solid rgba(139,92,246,0.5)",
                  color: "white", padding: "11px 20px", borderRadius: 10,
                  fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
                  whiteSpace: "nowrap", boxShadow: "0 0 22px rgba(139,92,246,0.3)",
                }}
              >
                {status === "loading" ? "…" : "Join waitlist →"}
              </button>
            </form>
          )}

          <button
            onClick={onClose}
            style={{
              width: "100%", background: "none", border: "none",
              color: "rgba(255,255,255,0.25)", fontSize: "0.82rem",
              cursor: "pointer", padding: "8px",
              transition: "color 0.14s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)"; }}
          >
            Continue with free plan →
          </button>
        </div>
      </div>
    </>
  );
}
