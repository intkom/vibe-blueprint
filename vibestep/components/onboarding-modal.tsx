"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "axiom_onboarding_done";

const STEPS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.25)",
    title: "Describe your build",
    desc: "Paste what you're building in plain language — your idea, your stack, or both. No templates needed.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    color: "#ec4899",
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.25)",
    title: "Claude analyses it",
    desc: "In ~30 seconds, Axiom runs a structured analysis — scoring risk, picking architecture, and sequencing your execution path.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.25)",
    title: "Ship step by step",
    desc: "Work through your steps one at a time. Mark each complete when done. The next step unlocks automatically.",
  },
];

export function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9001,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        pointerEvents: "none",
      }}>
        <div style={{
          width: "100%", maxWidth: 480,
          background: "rgba(8,4,26,0.97)",
          backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: 24,
          padding: "36px 36px 32px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.1)",
          animation: "scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "all",
          position: "relative", overflow: "hidden",
        }}>
          {/* Top beam */}
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "60%", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.8),rgba(236,72,153,0.4),transparent)",
          }} />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              display: "inline-flex", width: 52, height: 52, borderRadius: 15,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 28px rgba(139,92,246,0.5)",
              marginBottom: 18, fontSize: 22,
            }}>✦</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.95)", margin: "0 0 6px" }}>
              Welcome to Axiom
            </h2>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
              Here&apos;s how it works in 3 steps
            </p>
          </div>

          {/* Step dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 20 : 7, height: 7, borderRadius: 9999,
                  background: i === step ? "#a78bfa" : "rgba(255,255,255,0.15)",
                  border: "none", cursor: "pointer",
                  transition: "all 0.25s ease", padding: 0,
                }}
              />
            ))}
          </div>

          {/* Current step */}
          <div style={{
            background: current.bg, border: `1px solid ${current.border}`,
            borderRadius: 16, padding: "20px 22px", marginBottom: 24,
            display: "flex", alignItems: "flex-start", gap: 16,
            transition: "all 0.2s ease",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: `${current.color}22`, border: `1px solid ${current.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: current.color,
            }}>
              {current.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: current.color, background: `${current.color}22`,
                  border: `1px solid ${current.border}`, padding: "2px 8px", borderRadius: 9999,
                }}>
                  Step {step + 1} of {STEPS.length}
                </span>
              </div>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "rgba(255,255,255,0.9)", margin: "0 0 6px" }}>
                {current.title}
              </p>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.65 }}>
                {current.desc}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            {isLast ? (
              <Link
                href="/create"
                onClick={dismiss}
                style={{
                  flex: 1, display: "block", textAlign: "center", textDecoration: "none",
                  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                  border: "1px solid rgba(139,92,246,0.45)",
                  color: "white", padding: "12px 20px", borderRadius: 11,
                  fontSize: "0.9rem", fontWeight: 600,
                  boxShadow: "0 0 22px rgba(139,92,246,0.35)",
                }}
              >
                Start your first analysis →
              </Link>
            ) : (
              <>
                <button
                  onClick={dismiss}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                    color: "rgba(255,255,255,0.3)", padding: "12px 16px", borderRadius: 11,
                    fontSize: "0.82rem", fontWeight: 500, cursor: "pointer",
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(s => s + 1)}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    border: "1px solid rgba(139,92,246,0.45)",
                    color: "white", padding: "12px 20px", borderRadius: 11,
                    fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
                    boxShadow: "0 0 18px rgba(139,92,246,0.3)",
                  }}
                >
                  Next →
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </>
  );
}
