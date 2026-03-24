"use client";

import { useEffect, useState } from "react";

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    // Only show once per session
    const seen = sessionStorage.getItem("exit_popup_seen");
    if (seen) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        setShow(true);
        sessionStorage.setItem("exit_popup_seen", "1");
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    // Delay attaching so it doesn't fire immediately
    const t = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(t);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [dismissed]);

  function dismiss() {
    setShow(false);
    setDismissed(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("done");
        setTimeout(dismiss, 2500);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  }

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed", inset: 0, zIndex: 400,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Popup */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 401, width: "min(440px, 92vw)",
        background: "#07041a",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 0 60px rgba(139,92,246,0.2), 0 24px 60px rgba(0,0,0,0.8)",
        animation: "scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Top glow */}
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "60%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)",
        }} />

        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 2,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.9rem",
          }}
        >✕</button>

        <div style={{ padding: "32px 28px 28px", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, margin: "0 auto 16px",
              background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(124,58,237,0.1))",
              border: "1px solid rgba(139,92,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem",
              boxShadow: "0 0 20px rgba(139,92,246,0.2)",
            }}>✦</div>
            <h2 style={{
              fontSize: "1.2rem", fontWeight: 900, letterSpacing: "-0.025em",
              color: "rgba(255,255,255,0.92)", margin: "0 0 8px",
            }}>
              Before you go — get free build tips
            </h2>
            <p style={{
              fontSize: "0.82rem", color: "rgba(255,255,255,0.35)",
              margin: 0, lineHeight: 1.65,
            }}>
              Weekly insights on what kills indie products and how to fix them before you ship.
            </p>
          </div>

          {status === "done" ? (
            <div style={{
              textAlign: "center", padding: "14px 20px",
              background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.22)",
              borderRadius: 12, color: "#34d399", fontWeight: 600, fontSize: "0.9rem",
            }}>
              ✓ You&apos;re in — check your inbox
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
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
                  color: "white", padding: "11px 18px", borderRadius: 10,
                  fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {status === "loading" ? "…" : "Get tips →"}
              </button>
            </form>
          )}

          <button
            onClick={dismiss}
            style={{
              display: "block", width: "100%", background: "none", border: "none",
              color: "rgba(255,255,255,0.2)", fontSize: "0.75rem",
              cursor: "pointer", padding: "10px 0 0", textAlign: "center",
            }}
          >
            No thanks
          </button>
        </div>
      </div>
    </>
  );
}
