"use client";

import { useState } from "react";
import Link from "next/link";
import { markStepComplete } from "@/app/actions/build-steps";
import { useNotifications } from "@/lib/notification-context";
import { StepNotes } from "@/components/step-notes";

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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

export function StepCard({
  step, isActive, isLocked, projectId,
}: {
  step: Step;
  isActive: boolean;
  isLocked: boolean;
  projectId: string;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const { addNotification } = useNotifications();
  const isStepDone = step.status === "complete";
  const phaseKey = (step.phase ?? "build").toLowerCase();
  const phaseStyle = PHASE_COLORS[phaseKey] ?? PHASE_COLORS.build;

  // Acceptance criteria derived from step content
  const criteria = [
    `Complete: ${step.title?.trim() || "this step"}`,
    "Verify it works as expected in the browser or terminal",
    "No breaking errors introduced from previous steps",
  ];

  return (
    <div style={{
      background: isStepDone
        ? "rgba(52,211,153,0.03)"
        : isLocked
        ? "rgba(255,255,255,0.01)"
        : "rgba(255,255,255,0.03)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      border: isStepDone
        ? "1px solid rgba(52,211,153,0.18)"
        : isActive
        ? `1px solid ${phaseStyle.border}`
        : "1px solid rgba(255,255,255,0.05)",
      borderRadius: 16, padding: "18px 20px",
      position: "relative", overflow: "hidden",
      opacity: isLocked ? 0.45 : 1,
      transition: "all 0.22s ease",
    }}>
      {/* Left accent bar */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
        background: isStepDone
          ? "linear-gradient(180deg,#059669,#34d399)"
          : isLocked
          ? "rgba(255,255,255,0.05)"
          : `linear-gradient(180deg,${phaseStyle.text},${phaseStyle.text}88)`,
        opacity: isLocked ? 0.3 : isStepDone ? 1 : 0.6,
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingLeft: 6 }}>
        {/* Step number / status circle */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isStepDone
            ? "rgba(52,211,153,0.15)"
            : isLocked
            ? "rgba(255,255,255,0.04)"
            : phaseStyle.bg,
          border: `1px solid ${isStepDone ? "rgba(52,211,153,0.3)" : isLocked ? "rgba(255,255,255,0.08)" : phaseStyle.border}`,
          color: isStepDone ? "#34d399" : isLocked ? "rgba(255,255,255,0.2)" : phaseStyle.text,
          fontSize: "0.75rem", fontWeight: 800,
        }}>
          {isStepDone ? <IconCheck /> : isLocked ? <IconLock /> : step.step_index + 1}
        </div>

        {/* Content */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              {/* Phase badge + step number */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "2px 7px", borderRadius: 9999,
                  background: isLocked ? "rgba(255,255,255,0.04)" : phaseStyle.bg,
                  border: `1px solid ${isLocked ? "rgba(255,255,255,0.07)" : phaseStyle.border}`,
                  color: isLocked ? "rgba(255,255,255,0.2)" : phaseStyle.text,
                }}>
                  {phaseStyle.label}
                </span>
                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>
                  Step {step.step_index + 1}
                </span>
                {!isLocked && !isStepDone && (
                  <span style={{
                    fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.06em",
                    color: "rgba(255,255,255,0.18)",
                    display: "flex", alignItems: "center", gap: 3,
                  }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ~2–4 hrs
                  </span>
                )}
                {isActive && (
                  <span style={{
                    fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
                    color: "#34d399", padding: "2px 7px", borderRadius: 9999,
                  }}>Current</span>
                )}
              </div>

              <h3 style={{
                fontWeight: 700, fontSize: "0.925rem", margin: 0, lineHeight: 1.3,
                color: isStepDone ? "rgba(255,255,255,0.4)" : isLocked ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
                textDecoration: isStepDone ? "line-through" : "none",
              }}>
                {step.title?.trim() || "Untitled step"}
              </h3>
            </div>

            {/* Status badge / button */}
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {isStepDone ? (
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                  background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)",
                  color: "#34d399", padding: "4px 10px", borderRadius: 9999, display: "inline-block",
                }}>Done</span>
              ) : isLocked ? (
                <span style={{
                  fontSize: "0.65rem", color: "rgba(255,255,255,0.15)", padding: "4px 10px",
                  display: "inline-block",
                }}>Locked</span>
              ) : null}
            </div>
          </div>

          {/* Objective */}
          {step.objective && !isLocked && (
            <p style={{
              fontSize: "0.82rem", lineHeight: 1.65,
              color: isStepDone ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.5)",
              margin: "0 0 10px",
            }}>{step.objective}</p>
          )}

          {/* Guidance */}
          {step.guidance && !isStepDone && !isLocked && (
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 14,
              borderLeft: `3px solid ${phaseStyle.text}44`,
            }}>
              <p style={{
                fontSize: "0.78rem", color: "rgba(255,255,255,0.38)",
                lineHeight: 1.7, margin: 0, fontStyle: "italic",
              }}>
                {step.guidance}
              </p>
            </div>
          )}

          {/* Acceptance criteria — only on active step */}
          {isActive && !isStepDone && (
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "14px 16px", marginBottom: 14,
            }}>
              <p style={{
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)", margin: "0 0 10px",
              }}>Acceptance criteria</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {criteria.map((c, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      style={{ marginTop: 2, accentColor: "#a78bfa", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{c}</span>
                  </label>
                ))}
              </div>

              {/* Confirm checkbox */}
              <label style={{
                display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
                marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)",
              }}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#34d399", flexShrink: 0 }}
                />
                <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, fontWeight: 500 }}>
                  I&apos;ve completed and verified this step
                </span>
              </label>

              <button
                type="button"
                disabled={!confirmed || pending}
                onClick={async () => {
                  setPending(true);
                  addNotification(
                    `Step ${step.step_index + 1} complete! Keep going 🎉`,
                    "success",
                    "✅",
                  );
                  const fd = new FormData();
                  fd.append("stepId", step.id);
                  fd.append("projectId", projectId);
                  await markStepComplete(fd);
                  setPending(false);
                }}
                style={{
                  marginTop: 12,
                  background: confirmed && !pending
                    ? "linear-gradient(135deg,#059669,#34d399)"
                    : "rgba(255,255,255,0.05)",
                  border: confirmed && !pending
                    ? "1px solid rgba(52,211,153,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: confirmed && !pending ? "white" : "rgba(255,255,255,0.25)",
                  padding: "8px 16px", borderRadius: 9,
                  fontSize: "0.8rem", fontWeight: 600,
                  cursor: confirmed && !pending ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  boxShadow: confirmed && !pending ? "0 0 20px rgba(52,211,153,0.3)" : "none",
                  display: "block",
                }}
              >
                {pending ? "Saving…" : "Mark step complete ✓"}
              </button>
            </div>
          )}
          {/* Step notes + detail link — available on all non-locked steps */}
          {!isLocked && (
            <>
              <StepNotes stepId={step.id} />
              <Link
                href={`/project/${projectId}/step/${step.id}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  marginTop: 12, fontSize: "0.72rem", fontWeight: 600,
                  color: isStepDone ? "rgba(255,255,255,0.2)" : phaseStyle.text,
                  textDecoration: "none", opacity: 0.75,
                  transition: "opacity 0.15s ease",
                }}
              >
                View full details
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 14 0M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
