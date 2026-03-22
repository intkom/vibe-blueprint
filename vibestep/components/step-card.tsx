"use client";

import { useState } from "react";
import Link from "next/link";
import { markStepComplete } from "@/app/actions/build-steps";
import { StepNotes } from "@/components/step-notes";
import { ConfettiBurst } from "@/components/confetti-burst";

type Step = {
  id: string;
  step_index: number;
  phase: string | null;
  title: string | null;
  objective: string | null;
  guidance: string | null;
  status: string | null;
};

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  discover: { bg: "rgba(96,165,250,0.08)",  text: "#60a5fa", border: "rgba(96,165,250,0.25)",  label: "Discover"  },
  define:   { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.25)",  label: "Define"    },
  design:   { bg: "rgba(236,72,153,0.08)",  text: "#ec4899", border: "rgba(236,72,153,0.25)",  label: "Design"    },
  build:    { bg: "rgba(139,92,246,0.08)",  text: "#a78bfa", border: "rgba(139,92,246,0.25)",  label: "Build"     },
  launch:   { bg: "rgba(52,211,153,0.08)",  text: "#34d399", border: "rgba(52,211,153,0.25)",  label: "Launch"    },
  reflect:  { bg: "rgba(248,113,113,0.08)", text: "#f87171", border: "rgba(248,113,113,0.25)", label: "Reflect"   },
};

function IconCheck({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

export function StepCard({
  step, isActive, isLocked, projectId, isLastStep = false,
}: {
  step: Step;
  isActive: boolean;
  isLocked: boolean;
  projectId: string;
  isLastStep?: boolean;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [fireConfetti, setFireConfetti] = useState(false);
  const isStepDone = step.status === "complete";
  const phaseKey = (step.phase ?? "build").toLowerCase();
  const phaseStyle = PHASE_COLORS[phaseKey] ?? PHASE_COLORS.build;

  return (
    <>
      <ConfettiBurst trigger={fireConfetti} />
      <div style={{
        background: isActive
          ? "rgba(139,92,246,0.06)"
          : isStepDone
          ? "rgba(255,255,255,0.02)"
          : "transparent",
        border: isActive
          ? "1px solid rgba(139,92,246,0.3)"
          : isStepDone
          ? "1px solid rgba(52,211,153,0.15)"
          : "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14, padding: "16px 18px",
        opacity: isLocked ? 0.4 : 1,
        transition: "all 0.2s ease",
        position: "relative",
      }}>
        {/* Violet left bar for active step */}
        {isActive && (
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
            background: "linear-gradient(180deg,#7c3aed,#a78bfa)",
            borderRadius: "14px 0 0 14px",
          }} />
        )}

        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingLeft: isActive ? 8 : 0 }}>
          {/* Step number / status */}
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isStepDone
              ? "rgba(52,211,153,0.12)"
              : isActive
              ? "rgba(139,92,246,0.15)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${isStepDone ? "rgba(52,211,153,0.3)" : isActive ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`,
            color: isStepDone ? "#34d399" : isActive ? "#a78bfa" : "rgba(255,255,255,0.2)",
            fontSize: "0.72rem", fontWeight: 800,
          }}>
            {isStepDone ? <IconCheck size={11} /> : isLocked ? <IconLock /> : step.step_index + 1}
          </div>

          {/* Content */}
          <div style={{ minWidth: 0, flex: 1 }}>
            {/* Phase badge + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <span style={{
                fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "2px 7px", borderRadius: 9999,
                background: isLocked ? "rgba(255,255,255,0.03)" : phaseStyle.bg,
                border: `1px solid ${isLocked ? "rgba(255,255,255,0.06)" : phaseStyle.border}`,
                color: isLocked ? "rgba(255,255,255,0.18)" : phaseStyle.text,
                flexShrink: 0,
              }}>
                {phaseStyle.label}
              </span>
              {isActive && (
                <span style={{
                  fontSize: "0.57rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
                  color: "#a78bfa", padding: "2px 7px", borderRadius: 9999, flexShrink: 0,
                }}>Current</span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <h3 style={{
                fontWeight: 700, fontSize: "0.9rem", margin: "0 0 6px", lineHeight: 1.3,
                color: isStepDone ? "rgba(255,255,255,0.3)" : isLocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.88)",
                textDecoration: isStepDone ? "line-through" : "none",
              }}>
                {step.title?.trim() || "Untitled step"}
              </h3>
              {isStepDone && (
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
                  background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.22)",
                  color: "#34d399", padding: "3px 9px", borderRadius: 9999, flexShrink: 0,
                }}>Done</span>
              )}
            </div>

            {/* Objective */}
            {step.objective && !isLocked && (
              <p style={{
                fontSize: "0.82rem", lineHeight: 1.6, margin: "0 0 10px",
                color: isStepDone ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.45)",
              }}>
                {step.objective}
              </p>
            )}

            {/* Guidance */}
            {step.guidance && !isStepDone && !isLocked && (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${phaseStyle.text}33`,
                borderRadius: 8, padding: "9px 13px", marginBottom: 14,
              }}>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>
                  {step.guidance}
                </p>
              </div>
            )}

            {/* Mark complete — active step only */}
            {isActive && !isStepDone && (
              <div style={{ marginTop: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={e => setConfirmed(e.target.checked)}
                    style={{ accentColor: "#7c3aed", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                    I&apos;ve completed this step
                  </span>
                </label>
                <button
                  type="button"
                  disabled={!confirmed || pending}
                  onClick={async () => {
                    setPending(true);
                    if (isLastStep) setFireConfetti(true);
                    const fd = new FormData();
                    fd.append("stepId", step.id);
                    fd.append("projectId", projectId);
                    await markStepComplete(fd);
                    setPending(false);
                  }}
                  style={{
                    background: confirmed && !pending
                      ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                      : "rgba(255,255,255,0.04)",
                    border: confirmed && !pending
                      ? "1px solid rgba(139,92,246,0.5)"
                      : "1px solid rgba(255,255,255,0.07)",
                    color: confirmed && !pending ? "white" : "rgba(255,255,255,0.2)",
                    padding: "8px 16px", borderRadius: 9,
                    fontSize: "0.8rem", fontWeight: 600,
                    cursor: confirmed && !pending ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease",
                    boxShadow: confirmed && !pending ? "0 0 16px rgba(139,92,246,0.3)" : "none",
                  }}
                >
                  {pending ? "Saving…" : "Mark as done ✓"}
                </button>
              </div>
            )}

            {/* Notes + detail link */}
            {!isLocked && (
              <>
                <StepNotes stepId={step.id} />
                <Link
                  href={`/project/${projectId}/step/${step.id}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    marginTop: 10, fontSize: "0.72rem", fontWeight: 600,
                    color: isStepDone ? "rgba(255,255,255,0.18)" : phaseStyle.text,
                    textDecoration: "none", opacity: 0.7, transition: "opacity 0.15s ease",
                  }}
                >
                  View details
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 14 0M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
