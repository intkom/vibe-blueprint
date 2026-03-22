"use client";

import { useState, useEffect, useRef } from "react";
import { markStepComplete } from "@/app/actions/build-steps";
import { useNotifications } from "@/lib/notification-context";
import { StepTimer } from "@/components/step-timer";
import { StepNotes } from "@/components/step-notes";
import { ConfettiBurst } from "@/components/confetti-burst";

type Props = {
  stepId: string;
  projectId: string;
  stepIndex: number;
  stepStatus: string | null;
  isActive: boolean;
  criteria: string[];
  isLastStep?: boolean;
};

/* ── Draw-check SVG overlay ─────────────────────────────── */
function SuccessOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9990,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(3,0,20,0.7)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      animation: "fadeInUp 0.25s ease both",
    }}>
      <div style={{
        background: "rgba(8,4,26,0.97)",
        border: "1px solid rgba(52,211,153,0.35)",
        borderRadius: 22, padding: "36px 48px", textAlign: "center",
        animation: "successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        boxShadow: "0 0 60px rgba(52,211,153,0.15), 0 24px 48px rgba(0,0,0,0.6)",
      }}>
        {/* Animated checkmark */}
        <svg
          width="72" height="72" viewBox="0 0 56 56"
          fill="none" style={{ display: "block", margin: "0 auto 18px" }}
        >
          <circle cx="28" cy="28" r="26" stroke="rgba(52,211,153,0.15)" strokeWidth="2" />
          <circle
            cx="28" cy="28" r="26"
            stroke="#34d399" strokeWidth="2"
            strokeDasharray="164"
            strokeDashoffset="164"
            strokeLinecap="round"
            style={{ animation: "drawCheck 0.55s ease 0.05s forwards" }}
          />
          <path
            d="M18 29l7 7 13-14"
            stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="60"
            strokeDashoffset="60"
            style={{ animation: "drawCheck 0.4s ease 0.4s forwards" }}
          />
        </svg>
        <p style={{
          fontSize: "1.1rem", fontWeight: 800, color: "#34d399",
          margin: "0 0 6px", letterSpacing: "-0.01em",
        }}>
          Step complete!
        </p>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
          Keep up the momentum
        </p>
      </div>
    </div>
  );
}

/* ── Main client component ──────────────────────────────── */
export function StepDetailClient({
  stepId, projectId, stepIndex, stepStatus, isActive, criteria, isLastStep = false,
}: Props) {
  const { addNotification } = useNotifications();
  const isDone = stepStatus === "complete";

  const [checked, setChecked] = useState<boolean[]>(criteria.map(() => false));
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fireConfetti, setFireConfetti] = useState(false);

  // Detect server-side status update (revalidatePath re-renders component)
  const prevStatusRef = useRef(stepStatus);
  useEffect(() => {
    if (prevStatusRef.current !== "complete" && stepStatus === "complete") {
      setShowSuccess(true);
    }
    prevStatusRef.current = stepStatus;
  }, [stepStatus]);

  const allCriteriaChecked = checked.every(Boolean);

  async function handleComplete() {
    if (!confirmed || pending) return;
    setPending(true);

    if (isLastStep) {
      setFireConfetti(true);
      addNotification("🏆 All 10 steps complete! You shipped it!", "milestone", "🏆");
    } else {
      addNotification(`Step ${stepIndex + 1} complete! Keep going 🎉`, "success", "✅");
    }

    const fd = new FormData();
    fd.append("stepId", stepId);
    fd.append("projectId", projectId);
    await markStepComplete(fd);
    setPending(false);
  }

  return (
    <>
      <ConfettiBurst trigger={fireConfetti} />
      {showSuccess && <SuccessOverlay onDone={() => setShowSuccess(false)} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Timer ── */}
        {!isDone && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
              Time on this step
            </span>
            <StepTimer stepId={stepId} />
          </div>
        )}

        {/* ── Acceptance criteria ── */}
        {isActive && !isDone && criteria.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "20px 22px",
          }}>
            <p style={{
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: "0 0 14px",
            }}>
              Acceptance Criteria
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {criteria.map((c, i) => (
                <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked[i]}
                    onChange={e => {
                      const next = [...checked];
                      next[i] = e.target.checked;
                      setChecked(next);
                    }}
                    style={{ marginTop: 3, accentColor: "#a78bfa", flexShrink: 0, width: 15, height: 15 }}
                  />
                  <span style={{
                    fontSize: "0.85rem", lineHeight: 1.6,
                    color: checked[i] ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
                    textDecoration: checked[i] ? "line-through" : "none",
                    transition: "all 0.2s ease",
                  }}>{c}</span>
                </label>
              ))}
            </div>

            {/* Confirm checkbox — appears once all criteria are ticked */}
            {allCriteriaChecked && (
              <div style={{
                marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)",
                animation: "fadeInUp 0.3s ease both",
              }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={e => setConfirmed(e.target.checked)}
                    style={{ marginTop: 3, accentColor: "#34d399", flexShrink: 0, width: 15, height: 15 }}
                  />
                  <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.5, fontWeight: 500 }}>
                    I&apos;ve verified all criteria and this step is done
                  </span>
                </label>
              </div>
            )}

            {/* Mark complete button */}
            <button
              type="button"
              disabled={!confirmed || pending}
              onClick={handleComplete}
              style={{
                marginTop: 14, width: "100%",
                background: confirmed && !pending
                  ? isLastStep
                    ? "linear-gradient(135deg,#7c3aed,#34d399)"
                    : "linear-gradient(135deg,#059669,#34d399)"
                  : "rgba(255,255,255,0.04)",
                border: confirmed && !pending
                  ? "1px solid rgba(52,211,153,0.45)"
                  : "1px solid rgba(255,255,255,0.07)",
                color: confirmed && !pending ? "white" : "rgba(255,255,255,0.2)",
                padding: "12px 20px", borderRadius: 11,
                fontSize: "0.875rem", fontWeight: 700,
                cursor: confirmed && !pending ? "pointer" : "not-allowed",
                transition: "all 0.25s ease",
                boxShadow: confirmed && !pending
                  ? isLastStep
                    ? "0 0 40px rgba(139,92,246,0.5), 0 0 20px rgba(52,211,153,0.3)"
                    : "0 0 30px rgba(52,211,153,0.3)"
                  : "none",
                letterSpacing: "0.01em",
                animation: pending ? "ringPulse 1.4s ease-in-out infinite" : "none",
              }}
            >
              {pending
                ? "Saving…"
                : isLastStep
                  ? "🏆 Complete final step"
                  : "✓ Mark step complete"}
            </button>
          </div>
        )}

        {/* Completed state */}
        {isDone && (
          <div style={{
            background: "rgba(52,211,153,0.06)",
            border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 14, padding: "16px 22px",
            display: "flex", alignItems: "center", gap: 12,
            animation: "fadeInUp 0.4s ease both",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(52,211,153,0.15)",
              border: "1px solid rgba(52,211,153,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#34d399", flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#34d399", margin: 0 }}>
                {isLastStep ? "🏆 Final step complete!" : "Step completed"}
              </p>
              <p style={{ fontSize: "0.75rem", color: "rgba(52,211,153,0.6)", margin: "2px 0 0" }}>
                {isLastStep ? "You shipped the full blueprint!" : "This step has been marked as done"}
              </p>
            </div>
          </div>
        )}

        {/* ── Notes ── */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, padding: "16px 20px",
        }}>
          <p style={{
            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: "0 0 10px",
          }}>My Notes</p>
          <StepNotes stepId={stepId} />
        </div>
      </div>
    </>
  );
}
