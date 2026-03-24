"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { AnalysisData, DeepAnalysisData } from "@/app/api/analyze/route";
import { ActionPanel, type ActionPanelConfig } from "@/components/action-panel";
import { WorkspaceChat } from "@/components/workspace-chat";
import { BuildJournal } from "@/components/build-journal";
import { ShareBar } from "@/components/share-bar";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { TechStackSection } from "@/components/tech-stack-section";
import { CompetitiveMoatSection } from "@/components/competitive-moat-section";
import { FollowUpQuestions } from "@/components/follow-up-questions";

/* ── Helpers ──────────────────────────────────────────────── */

function healthColor(score: number): string {
  if (score >= 76) return "#34d399";
  if (score >= 61) return "#60a5fa";
  if (score >= 41) return "#fbbf24";
  if (score >= 21) return "#fb923c";
  return "#f87171";
}

function severityStyle(s: string) {
  if (s === "high")   return { color: "#f87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)"   };
  if (s === "medium") return { color: "#fb923c", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)"  };
  return               { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)"  };
}

/* ── Animated counter ─────────────────────────────────────── */
function useCountUp(target: number, delay = 200, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(target * eased));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, delay, duration]);
  return val;
}

/* ── Typewriter ───────────────────────────────────────────── */
function TypewriterText({ text, delay = 400 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    setDone(false);
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, 18);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);
  return (
    <span>
      {displayed}
      {!done && <span style={{ opacity: 1, animation: "pulseGlow 0.8s ease-in-out infinite", display: "inline-block", width: 2, height: "1em", background: "#a78bfa", verticalAlign: "text-bottom", marginLeft: 2 }} />}
    </span>
  );
}

/* ── Health Gauge ─────────────────────────────────────────── */
function HealthGauge({ score, label }: { score: number; label: string }) {
  const [animated, setAnimated] = useState(false);
  const displayScore = useCountUp(score);
  const color = healthColor(score);
  const R = 72;
  const circ = 2 * Math.PI * R;
  const offset = animated ? circ - (score / 100) * circ : circ;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      <div style={{ position: "relative", width: 180, height: 180 }}>
        {/* Glow */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          filter: "blur(12px)", transition: "all 1.5s ease",
        }} />
        <svg viewBox="0 0 180 180" style={{ width: 180, height: 180, display: "block" }}>
          {/* Track */}
          <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          {/* Arc */}
          <circle
            cx="90" cy="90" r={R}
            fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 90 90)"
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease" }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "3rem", fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.04em" }}>
            {displayScore}
          </span>
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>/100</span>
        </div>
      </div>
      {/* Label */}
      <div style={{
        marginTop: 12,
        fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase",
        color,
        background: `${color}15`,
        border: `1px solid ${color}35`,
        padding: "4px 14px", borderRadius: 9999,
      }}>
        {label}
      </div>
    </div>
  );
}

type RiskStatus = "open" | "in_progress" | "mitigated";

/* ── Risk Card ────────────────────────────────────────────── */
function RiskCard({ risk, delay, onMitigate, onExplain, handled, onHandled, status, onStatus }: {
  risk: AnalysisData["risk_areas"][0];
  delay: number;
  onMitigate?: () => void;
  onExplain?: () => void;
  handled?: boolean;
  onHandled?: () => void;
  status?: RiskStatus;
  onStatus?: (s: RiskStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const s = severityStyle(risk.severity);
  return (
    <div style={{
      background: handled ? "rgba(52,211,153,0.03)" : "rgba(255,255,255,0.025)",
      border: handled ? "1px solid rgba(52,211,153,0.2)" : `1px solid ${s.border}`,
      borderRadius: 14, overflow: "hidden",
      animation: `fadeInUp 0.5s ease ${delay}s both`,
      opacity: handled ? 0.5 : 1, transition: "all 0.3s ease",
    }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
          padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 12,
        }}
      >
        <span style={{
          fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
          background: s.bg, border: `1px solid ${s.border}`, color: s.color,
          padding: "3px 8px", borderRadius: 9999, flexShrink: 0, marginTop: 2,
        }}>
          {risk.severity.toUpperCase()}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "rgba(255,255,255,0.88)", margin: "0 0 5px" }}>
            {risk.title}
          </p>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
            {risk.description}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginTop: 2 }}>
          {/* Already handled toggle */}
          {onHandled && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onHandled(); }}
              title={handled ? "Mark as unhandled" : "Mark as already handled"}
              style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                background: handled ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)",
                border: handled ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: handled ? "#34d399" : "rgba(255,255,255,0.2)",
                fontSize: "0.65rem", transition: "all 0.15s ease",
              }}
            >
              {handled ? "✓" : ""}
            </button>
          )}
          <span style={{ fontSize: "0.7rem", color: s.color, fontWeight: 600, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>▾</span>
        </div>
      </button>
      {open && (
        <div style={{
          padding: "0 18px 16px 18px",
          borderTop: `1px solid ${s.border}`,
          background: `${s.bg}`,
          animation: "fadeInUp 0.2s ease both",
        }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#34d399", margin: "12px 0 6px" }}>
            How to fix this
          </p>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.65 }}>
            {risk.fix}
          </p>
          {/* Status selector */}
          {onStatus && (
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              {(["open", "in_progress", "mitigated"] as RiskStatus[]).map(st => {
                const stStyle = {
                  open: { color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", label: "Open" },
                  in_progress: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", label: "In Progress" },
                  mitigated: { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)", label: "Mitigated" },
                }[st];
                const active = (status ?? "open") === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={e => { e.stopPropagation(); onStatus(st); }}
                    style={{
                      background: active ? stStyle.bg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? stStyle.border : "rgba(255,255,255,0.08)"}`,
                      color: active ? stStyle.color : "rgba(255,255,255,0.3)",
                      padding: "4px 11px", borderRadius: 9999,
                      fontSize: "0.68rem", fontWeight: 700, cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {stStyle.label}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
            {onMitigate && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onMitigate(); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)",
                  color: "#f87171", padding: "5px 12px", borderRadius: 7,
                  fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.18)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; }}
              >
                ⚡ Mitigate →
              </button>
            )}
            {onExplain && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onExplain(); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.22)",
                  color: "#60a5fa", padding: "5px 12px", borderRadius: 7,
                  fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(96,165,250,0.16)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(96,165,250,0.08)"; }}
              >
                ✦ Explain simply
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Format elapsed time ──────────────────────────────────── */
function fmtTime(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/* ── Execution Step ───────────────────────────────────────── */
function ExecutionStep({
  step, isAddressed, isLast, onAddress, onStart, onStuck, onCodeGen,
  timerElapsed, timerRunning, onTimerToggle,
}: {
  step: AnalysisData["execution_path"][0];
  isAddressed: boolean;
  isLast: boolean;
  onAddress: () => void;
  onStart?: () => void;
  onStuck?: () => void;
  onCodeGen?: () => void;
  timerElapsed: number;
  timerRunning: boolean;
  onTimerToggle: () => void;
}) {
  return (
    <div style={{
      display: "flex", gap: 16,
      opacity: isAddressed ? 0.45 : 1, transition: "opacity 0.3s ease",
    }}>
      {/* Timeline line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: isAddressed ? "rgba(52,211,153,0.12)" : "rgba(139,92,246,0.12)",
          border: `1px solid ${isAddressed ? "rgba(52,211,153,0.35)" : "rgba(139,92,246,0.35)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.72rem", fontWeight: 800,
          color: isAddressed ? "#34d399" : "#a78bfa",
          transition: "all 0.3s ease",
        }}>
          {isAddressed ? "✓" : step.step}
        </div>
        {!isLast && (
          <div style={{
            width: 1, flexGrow: 1, marginTop: 4,
            background: isAddressed ? "rgba(52,211,153,0.2)" : "rgba(139,92,246,0.15)",
            minHeight: 24,
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: "0.88rem", color: isAddressed ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.88)", textDecoration: isAddressed ? "line-through" : "none" }}>
            {step.title}
          </span>
          <span style={{
            fontSize: "0.62rem", fontWeight: 600, padding: "2px 7px", borderRadius: 9999,
            background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)",
            color: "rgba(96,165,250,0.7)", flexShrink: 0,
          }}>
            ~{step.estimated_hours}h
          </span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", margin: "0 0 8px", lineHeight: 1.6 }}>
          {step.description}
        </p>
        <p style={{ fontSize: "0.73rem", color: "rgba(139,92,246,0.5)", margin: "0 0 10px", fontStyle: "italic", lineHeight: 1.5 }}>
          {step.why}
        </p>
        {/* Timer row */}
        {(timerElapsed > 0 || timerRunning) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: timerRunning ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.04)",
              border: timerRunning ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "4px 10px",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: timerRunning ? "#34d399" : "rgba(255,255,255,0.3)", animation: timerRunning ? "pulseGlow 1s ease-in-out infinite" : "none" }} />
              <span style={{ fontSize: "0.72rem", fontVariantNumeric: "tabular-nums", color: timerRunning ? "#34d399" : "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                {fmtTime(timerElapsed)}
              </span>
            </div>
          </div>
        )}

        {!isAddressed && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {onStart && (
              <button
                type="button"
                onClick={onStart}
                style={{
                  background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(96,165,250,0.1))",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: "#c4b5fd", padding: "5px 14px", borderRadius: 8,
                  fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: "0 0 12px rgba(139,92,246,0.15)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,rgba(139,92,246,0.32),rgba(96,165,250,0.18))";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(139,92,246,0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(96,165,250,0.1))";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(139,92,246,0.15)";
                }}
              >
                ⚡ Start this step →
              </button>
            )}
            {/* Timer toggle */}
            <button
              type="button"
              onClick={onTimerToggle}
              style={{
                background: timerRunning ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.04)",
                border: timerRunning ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,255,255,0.1)",
                color: timerRunning ? "#34d399" : "rgba(255,255,255,0.35)",
                padding: "5px 12px", borderRadius: 8,
                fontSize: "0.72rem", fontWeight: 500, cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {timerRunning ? "⏸ Pause timer" : timerElapsed > 0 ? "▶ Resume timer" : "⏱ Start timer"}
            </button>
            {onCodeGen && (
              <button
                type="button"
                onClick={onCodeGen}
                style={{
                  background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.22)",
                  color: "#34d399", padding: "5px 12px", borderRadius: 8,
                  fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(52,211,153,0.14)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(52,211,153,0.07)"; }}
              >
                &lt;/&gt; Generate starter code →
              </button>
            )}
            {onStuck && (
              <button
                type="button"
                onClick={onStuck}
                style={{
                  background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.22)",
                  color: "#fbbf24", padding: "5px 12px", borderRadius: 8,
                  fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(251,191,36,0.14)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(251,191,36,0.07)"; }}
              >
                🪄 I&apos;m stuck
              </button>
            )}
            <button
              type="button"
              onClick={onAddress}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.35)", padding: "5px 14px", borderRadius: 8,
                fontSize: "0.73rem", fontWeight: 500, cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(52,211,153,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(52,211,153,0.3)";
                (e.currentTarget as HTMLButtonElement).style.color = "#34d399";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
              }}
            >
              Mark as addressed →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Section wrapper ──────────────────────────────────────── */
function Section({ children, delay = 0, style, id }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; id?: string }) {
  return (
    <div id={id} style={{ animation: `fadeInUp 0.55s ease ${delay}s both`, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
      marginBottom: 14, margin: "0 0 14px",
    }}>
      {children}
    </p>
  );
}

/* ── Impact badge ─────────────────────────────────────────── */
function impactStyle(s: string) {
  if (s === "high")   return { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)"  };
  if (s === "medium") return { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.3)"  };
  return               { color: "#a78bfa", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)" };
}

/* ── Priority badge ───────────────────────────────────────── */
function priorityStyle(s: string) {
  if (s === "high")   return { color: "#f87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)"   };
  if (s === "medium") return { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)"  };
  return               { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.3)"  };
}

/* ── Main component ───────────────────────────────────────── */
export function AnalysisDisplay({
  projectId,
  projectTitle,
  projectIdea,
  analysis,
  deepAnalysis: initialDeepAnalysis = null,
  inputMode = "idea",
}: {
  projectId: string;
  projectTitle: string;
  projectIdea: string;
  analysis: AnalysisData;
  deepAnalysis?: DeepAnalysisData | null;
  inputMode?: "idea" | "code" | "github";
}) {
  // Deep analysis state — can be updated by follow-up Q&A
  const [deepAnalysis, setDeepAnalysis] = useState<DeepAnalysisData | null>(initialDeepAnalysis);
  const conf = deepAnalysis?.section_confidence ?? null;
  // Execution path — persisted in localStorage
  const STORAGE_KEY = `axiom_addressed_${projectId}`;
  const [addressed, setAddressed] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved) as number[]) : new Set();
    } catch { return new Set(); }
  });

  // Step timers — { elapsed: seconds, running: bool, startedAt: ms | null }
  const TIMER_KEY = `axiom_timers_${projectId}`;
  type TimerState = { elapsed: number; running: boolean; startedAt: number | null };
  const [timers, setTimers] = useState<Record<number, TimerState>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(TIMER_KEY);
      return saved ? JSON.parse(saved) as Record<number, TimerState> : {};
    } catch { return {}; }
  });

  // Tick running timers
  useEffect(() => {
    const id = setInterval(() => {
      setTimers(prev => {
        let changed = false;
        const next = { ...prev };
        for (const [k, v] of Object.entries(next)) {
          if (v.running && v.startedAt !== null) {
            next[Number(k)] = { ...v, elapsed: v.elapsed + 1 };
            changed = true;
          }
        }
        if (changed) {
          try { localStorage.setItem(TIMER_KEY, JSON.stringify(next)); } catch { }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [TIMER_KEY]);

  function toggleTimer(idx: number) {
    setTimers(prev => {
      const cur = prev[idx] ?? { elapsed: 0, running: false, startedAt: null };
      const next = cur.running
        ? { ...cur, running: false, startedAt: null }
        : { ...cur, running: true, startedAt: Date.now() };
      const updated = { ...prev, [idx]: next };
      try { localStorage.setItem(TIMER_KEY, JSON.stringify(updated)); } catch { }
      return updated;
    });
  }

  // Risk "already handled" — persisted in localStorage
  const HANDLED_KEY = `axiom_handled_${projectId}`;
  const [handledRisks, setHandledRisks] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(HANDLED_KEY);
      return saved ? new Set(JSON.parse(saved) as number[]) : new Set();
    } catch { return new Set(); }
  });

  function toggleHandled(idx: number) {
    setHandledRisks(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      try { localStorage.setItem(HANDLED_KEY, JSON.stringify([...next])); } catch { }
      return next;
    });
  }

  // Keyboard shortcuts overlay
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Workspace mode
  const [workspaceMode, setWorkspaceMode] = useState(false);

  // Risk statuses
  const RISK_STATUS_KEY = `axiom_risk_status_${projectId}`;
  const [riskStatuses, setRiskStatuses] = useState<Record<number, RiskStatus>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem(RISK_STATUS_KEY) ?? "{}") as Record<number, RiskStatus>; } catch { return {}; }
  });

  function setRiskStatus(idx: number, status: RiskStatus) {
    setRiskStatuses(prev => {
      const next = { ...prev, [idx]: status };
      try { localStorage.setItem(RISK_STATUS_KEY, JSON.stringify(next)); } catch { }
      return next;
    });
  }

  const mitigatedCount = Object.values(riskStatuses).filter(s => s === "mitigated").length;
  const inProgressRiskCount = Object.values(riskStatuses).filter(s => s === "in_progress").length;
  const openRiskCount = analysis.risk_areas.length - mitigatedCount - inProgressRiskCount;
  const allMitigated = mitigatedCount === analysis.risk_areas.length && analysis.risk_areas.length > 0;
  // Bonus +15 when all risks mitigated (display only)
  const displayedHealthScore = allMitigated ? Math.min(100, analysis.health_score + 15) : analysis.health_score;

  // Deployment checklist — persisted in localStorage
  const DEPLOY_KEY = `axiom_deploy_${projectId}`;
  const [deployChecked, setDeployChecked] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(DEPLOY_KEY);
      return saved ? new Set(JSON.parse(saved) as number[]) : new Set();
    } catch { return new Set(); }
  });

  function toggleDeploy(idx: number) {
    setDeployChecked(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      try { localStorage.setItem(DEPLOY_KEY, JSON.stringify([...next])); } catch { }
      return next;
    });
  }

  // Viral hooks — copy-to-clipboard
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  function copyHook(text: string, idx: number) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  // Iteration suggestions — "noted" state
  const NOTE_KEY = `axiom_noted_${projectId}`;
  const [noted, setNoted] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(NOTE_KEY);
      return saved ? new Set(JSON.parse(saved) as number[]) : new Set();
    } catch { return new Set(); }
  });
  function markNoted(idx: number) {
    setNoted(prev => {
      const next = new Set(prev);
      next.add(idx);
      try { localStorage.setItem(NOTE_KEY, JSON.stringify([...next])); } catch { }
      return next;
    });
  }

  const addressedCount = addressed.size;
  const totalSteps = analysis.execution_path.length;
  const addressedPct = totalSteps > 0 ? Math.round((addressedCount / totalSteps) * 100) : 0;

  function markAddressed(stepIdx: number) {
    setAddressed(prev => {
      const next = new Set(prev);
      next.add(stepIdx);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { }
      return next;
    });
  }

  // Action panel
  const [actionConfig, setActionConfig] = useState<ActionPanelConfig | null>(null);

  function openAction(cfg: ActionPanelConfig) { setActionConfig(cfg); }

  // Export to markdown
  const exportMarkdown = useCallback(() => {
    const a = analysis;
    const lines: string[] = [
      `# ${projectTitle} — Axiom Analysis Report\n`,
      `## Build Health: ${a.health_score}/100 (${a.health_label})\n`,
      `> ${a.summary}\n`,
      `---\n`,
      `## Risk Areas\n`,
      ...a.risk_areas.map(r => `### [${r.severity.toUpperCase()}] ${r.title}\n${r.description}\n\n**Fix:** ${r.fix}\n`),
      `## Architecture Insights\n`,
      ...a.architecture_insights.map(i => `- **${i.layer}:** ${i.recommendation} — ${i.reason}`),
      `\n## Execution Path\n`,
      ...a.execution_path.map(e => `${e.step}. **${e.title}** (~${e.estimated_hours}h)\n   ${e.description}\n   *Why:* ${e.why}`),
      `\n## Failure Points\n`,
      ...a.failure_points.map(f => `- [${f.likelihood.toUpperCase()}] ${f.point}\n  Prevention: ${f.prevention}`),
      `\n---\n*Confidence: ${a.confidence_note}*\n`,
    ];
    if (a.icp_profile) {
      lines.push(`\n## Ideal Customer\n**Audience:** ${a.icp_profile.primary_audience}\n**Why they pay:** ${a.icp_profile.why_they_care}`);
      if (a.icp_profile.pain_points.length) lines.push(`\n**Pain points:** ${a.icp_profile.pain_points.map(p => `\n- ${p}`).join("")}`);
    }
    if (a.competitor_analysis?.length) {
      lines.push("\n## Competitors\n");
      a.competitor_analysis.forEach(c => lines.push(`### ${c.name}\n- Weakness: ${c.weakness}\n- Your edge: ${c.your_advantage}\n`));
    }
    if (a.viral_hooks?.length) {
      lines.push("\n## Viral Hooks\n");
      a.viral_hooks.forEach(h => lines.push(`**${h.format}**\n> ${h.copy}\n`));
    }
    if (a.iteration_suggestions?.length) {
      lines.push("\n## Iteration Roadmap\n");
      a.iteration_suggestions.forEach(s => lines.push(`- [${s.impact.toUpperCase()}] ${s.issue}\n  Fix: ${s.fix}\n`));
    }
    lines.push("\n---\n*Generated by Axiom*");
    const md = lines.join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `${projectTitle.toLowerCase().replace(/\s+/g, "-")}-analysis.md`;
    el.click();
    URL.revokeObjectURL(url);
  }, [analysis, projectTitle]);

  // Keyboard shortcuts
  useEffect(() => {
    const SECTION_KEYS: Record<string, string> = {
      "1": "s1", "2": "s2", "3": "s3", "4": "s4", "5": "s5",
      "6": "s6", "7": "s7", "8": "s8", "9": "s9",
    };
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "?" || (e.key === "/" && !e.ctrlKey && !e.metaKey)) {
        setShowShortcuts(s => !s); return;
      }
      if (e.key === "Escape") { setShowShortcuts(false); return; }
      if (e.key === "e" || e.key === "E") { exportMarkdown(); return; }
      if (e.key === "a" || e.key === "A") {
        openAction({ type: "ask", title: "Ask Axiom", subtitle: "Ask anything about your build", projectIdea, projectTitle, context: { health_score: analysis.health_score, health_label: analysis.health_label, summary: analysis.summary } });
        return;
      }
      if (e.key === "s" || e.key === "S") {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
        return;
      }
      const id = SECTION_KEYS[e.key];
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [analysis, projectTitle, projectIdea, exportMarkdown]);

  const color = healthColor(displayedHealthScore);
  const totalHours = analysis.execution_path.reduce((sum, s) => sum + s.estimated_hours, 0);

  return (
    <div style={{
      minHeight: "100vh",
      height: workspaceMode ? "100vh" : undefined,
      overflow: workspaceMode ? "hidden" : undefined,
      background: "var(--vs-bg)", color: "var(--vs-text)", position: "relative",
      display: workspaceMode ? "flex" : "block",
    }}>

      {/* Ambient gradient (non-workspace) */}
      {!workspaceMode && (
        <div aria-hidden="true" style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: [
            `radial-gradient(ellipse 60% 40% at 70% -5%, ${color}18 0%, transparent 60%)`,
            "radial-gradient(ellipse 40% 30% at 15% 80%, rgba(139,92,246,0.07) 0%, transparent 55%)",
            "#030014",
          ].join(","),
          transition: "background 1s ease",
        }} />
      )}

      {/* Scrollable content area */}
      <div style={{
        flex: workspaceMode ? 1 : undefined,
        overflowY: workspaceMode ? "auto" : undefined,
        minWidth: 0,
      }}>
      <main style={{ position: "relative", zIndex: 1, maxWidth: workspaceMode ? "none" : 760, margin: workspaceMode ? 0 : "0 auto", padding: workspaceMode ? "40px 32px 96px" : "40px 24px 96px" }}>

        {/* Back + nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: "0.82rem", color: "rgba(255,255,255,0.32)", textDecoration: "none",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7M5 12h14" />
            </svg>
            Dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={exportMarkdown}
              title="Export as Markdown (E)"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.38)", padding: "5px 11px", borderRadius: 8,
                fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.08)"; b.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.04)"; b.style.color = "rgba(255,255,255,0.38)"; }}
            >
              ↓ Export
            </button>
            <button
              type="button"
              onClick={() => setShowShortcuts(s => !s)}
              title="Keyboard shortcuts (?)"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.28)", padding: "5px 11px", borderRadius: 8,
                fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.08)"; b.style.color = "rgba(255,255,255,0.6)"; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.04)"; b.style.color = "rgba(255,255,255,0.28)"; }}
            >
              ? Shortcuts
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode(w => !w)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: workspaceMode ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                border: workspaceMode ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.09)",
                color: workspaceMode ? "#a78bfa" : "rgba(255,255,255,0.38)",
                padding: "5px 11px", borderRadius: 8,
                fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {workspaceMode ? "✦ Workspace" : "Workspace Mode"}
            </button>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 32, animation: "fadeInUp 0.4s ease both" }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(167,139,250,0.5)", marginBottom: 8 }}>
            Analysis Report
          </p>
          <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 900, letterSpacing: "-0.025em", color: "rgba(255,255,255,0.95)", margin: "0 0 16px", lineHeight: 1.2 }}>
            {projectTitle}
          </h1>
          <ShareBar
            projectId={projectId}
            projectTitle={projectTitle}
            healthScore={analysis.health_score}
          />
        </div>

        {/* ── SECTION 1: Build Health ── */}
        <Section id="s1" delay={0.05} style={{ marginBottom: 24 }}>
          <div style={{
            background: "rgba(255,255,255,0.025)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${color}25`,
            borderRadius: 20, overflow: "hidden", position: "relative",
          }}>
            {/* Top beam */}
            <div aria-hidden="true" style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "50%", height: 1,
              background: `linear-gradient(90deg,transparent,${color}88,transparent)`,
            }} />
            <div style={{ padding: "32px 32px 28px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              <HealthGauge score={displayedHealthScore} label={allMitigated ? "Mitigated +" : analysis.health_label} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>
                  Build Health
                </p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
                  {[
                    { val: `${totalSteps}`, label: "Execution steps" },
                    { val: `~${totalHours}h`, label: "Total estimate" },
                    { val: `${analysis.risk_areas.length}`, label: "Risk areas" },
                  ].map(stat => (
                    <div key={stat.label}>
                      <div style={{ fontSize: "1.4rem", fontWeight: 900, color, letterSpacing: "-0.03em" }}>{stat.val}</div>
                      <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openAction({
                    type: "score",
                    title: `Improve from ${analysis.health_score} to ${Math.min(100, analysis.health_score + 20)}+`,
                    subtitle: "Specific actions to raise your build health score",
                    projectIdea,
                    projectTitle,
                    context: { health_score: analysis.health_score, health_label: analysis.health_label },
                  })}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: `${color}15`, border: `1px solid ${color}35`,
                    color, padding: "6px 14px", borderRadius: 8,
                    fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}25`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}15`; }}
                >
                  📈 Improve my score →
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 2: Product Truth ── */}
        <Section id="s2" delay={0.2} style={{ marginBottom: 24 }}>
          <div style={{
            background: "rgba(139,92,246,0.04)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderLeft: "3px solid rgba(139,92,246,0.6)",
            borderRadius: 14, padding: "20px 22px",
          }}>
            <SectionLabel>Product Truth</SectionLabel>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.75, color: "rgba(255,255,255,0.75)", margin: 0 }}>
              <TypewriterText text={analysis.summary} delay={600} />
            </p>
          </div>
        </Section>

        {/* ── SECTION 3: Risk Areas ── */}
        <Section id="s3" delay={0.35} style={{ marginBottom: 24 }}>
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <SectionLabel>Risk Areas</SectionLabel>
                {conf && <ConfidenceBadge score={conf.risk_areas} />}
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 9999,
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171",
                  marginBottom: 14,
                }}>
                  {openRiskCount} open
                </span>
                {inProgressRiskCount > 0 && (
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24", marginBottom: 14 }}>
                    {inProgressRiskCount} in progress
                  </span>
                )}
                {mitigatedCount > 0 && (
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", marginBottom: 14 }}>
                    {mitigatedCount} mitigated
                  </span>
                )}
                {allMitigated && (
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399", marginBottom: 14 }}>
                    +15 score bonus 🎉
                  </span>
                )}
              </div>
            </div>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {analysis.risk_areas.map((risk, i) => (
                <RiskCard
                  key={i} risk={risk} delay={0.4 + i * 0.08}
                  handled={handledRisks.has(i)}
                  onHandled={() => toggleHandled(i)}
                  status={riskStatuses[i] ?? "open"}
                  onStatus={(st) => setRiskStatus(i, st)}
                  onMitigate={() => openAction({
                    type: "risk",
                    title: `Mitigate: ${risk.title}`,
                    subtitle: `${risk.severity} severity — exact mitigation steps`,
                    projectIdea,
                    projectTitle,
                    context: { title: risk.title, severity: risk.severity, description: risk.description, fix: risk.fix },
                  })}
                  onExplain={() => openAction({
                    type: "explain",
                    title: `Explain: ${risk.title}`,
                    subtitle: "Plain-language explanation",
                    projectIdea,
                    projectTitle,
                    context: { section: "Risk Area", content: `${risk.description} Fix: ${risk.fix}` },
                  })}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* ── SECTION 4: Architecture Insights ── */}
        <Section id="s4" delay={0.5} style={{ marginBottom: 24 }}>
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <SectionLabel>Architecture Insights</SectionLabel>
                {conf && <ConfidenceBadge score={conf.architecture} />}
              </div>
            </div>
            <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {analysis.architecture_insights.map((insight, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  animation: `fadeInUp 0.4s ease ${0.55 + i * 0.08}s both`,
                }}>
                  <div style={{
                    width: 3, alignSelf: "stretch", borderRadius: 9999,
                    background: `linear-gradient(180deg, #7c3aed, #a78bfa)`,
                    flexShrink: 0, minHeight: 40,
                  }} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                        color: "#a78bfa", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                        padding: "2px 8px", borderRadius: 9999,
                      }}>
                        {insight.layer}
                      </span>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                        {insight.recommendation}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.6 }}>
                      {insight.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── SECTION 5: Failure Points ── */}
        <Section id="s5" delay={0.65} style={{ marginBottom: 24 }}>
          <div style={{
            background: "rgba(239,68,68,0.03)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
                }}>⚠</div>
                <SectionLabel>Failure Points</SectionLabel>
              </div>
            </div>
            <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {analysis.failure_points.map((fp, i) => {
                const s = severityStyle(fp.likelihood);
                return (
                  <div key={i} style={{
                    background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "14px 16px",
                    border: `1px solid ${s.border}`,
                    animation: `fadeInUp 0.4s ease ${0.7 + i * 0.08}s both`,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                        background: s.bg, border: `1px solid ${s.border}`, color: s.color,
                        padding: "2px 7px", borderRadius: 9999, flexShrink: 0, marginTop: 2,
                      }}>
                        {fp.likelihood.toUpperCase()}
                      </span>
                      <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "rgba(255,255,255,0.82)", margin: 0, lineHeight: 1.4 }}>
                        {fp.point}
                      </p>
                    </div>
                    <div style={{ paddingLeft: 0, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10 }}>
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#34d399", margin: "0 0 4px" }}>
                        Prevention
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>
                        {fp.prevention}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ── SECTION 6: Execution Path ── */}
        <Section id="s6" delay={0.8} style={{ marginBottom: 24 }}>
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <SectionLabel>Execution Path</SectionLabel>
                  {conf && <ConfidenceBadge score={conf.execution_path} />}
                </div>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", fontWeight: 500, marginBottom: 14 }}>
                  {addressedCount}/{totalSteps} addressed
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${addressedPct}%`,
                  borderRadius: 9999,
                  background: addressedCount === totalSteps
                    ? "linear-gradient(90deg,#059669,#34d399)"
                    : "linear-gradient(90deg,#7c3aed,#a78bfa)",
                  transition: "width 0.5s ease, background 0.5s ease",
                  boxShadow: "0 0 8px rgba(139,92,246,0.4)",
                }} />
              </div>
            </div>
            <div style={{ padding: "20px 20px 16px" }}>
              {analysis.execution_path.map((step, i) => (
                <ExecutionStep
                  key={i}
                  step={step}
                  isAddressed={addressed.has(i)}
                  isLast={i === analysis.execution_path.length - 1}
                  onAddress={() => markAddressed(i)}
                  timerElapsed={timers[i]?.elapsed ?? 0}
                  timerRunning={timers[i]?.running ?? false}
                  onTimerToggle={() => toggleTimer(i)}
                  onStart={() => openAction({
                    type: "step",
                    title: `Step ${step.step}: ${step.title}`,
                    subtitle: `~${step.estimated_hours}h · ${step.description}`,
                    projectIdea,
                    projectTitle,
                    context: step,
                    onStepComplete: () => markAddressed(i),
                  })}
                  onCodeGen={() => openAction({
                    type: "codegen",
                    title: `Code: ${step.title}`,
                    subtitle: "Production-ready starter code",
                    projectIdea,
                    projectTitle,
                    context: {
                      ...step,
                      stack: analysis.architecture_insights?.map(a => `${a.layer}: ${a.recommendation}`).join(", ") ?? "",
                    },
                  })}
                  onStuck={() => openAction({
                    type: "stuck",
                    title: `Stuck on Step ${step.step}: ${step.title}`,
                    subtitle: "3 approaches + sub-step breakdown",
                    projectIdea,
                    projectTitle,
                    context: step,
                  })}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* ── SECTION 7: Confidence Note ── */}
        <Section id="s7" delay={0.95} style={{ marginBottom: 32 }}>
          <p style={{
            fontSize: "0.76rem", color: "rgba(255,255,255,0.2)",
            textAlign: "center", lineHeight: 1.65, fontStyle: "italic", margin: "0 auto", maxWidth: 500,
          }}>
            Axiom&apos;s confidence: {analysis.confidence_note}
          </p>
        </Section>

        {/* ── SECTION 8: Your Audience (ICP) ── */}
        {analysis.icp_profile && (
          <Section id="s8" delay={1.05} style={{ marginBottom: 24 }}>
            <div style={{
              background: "rgba(96,165,250,0.03)",
              border: "1px solid rgba(96,165,250,0.15)",
              borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(96,165,250,0.1)" }}>
                <SectionLabel>Your Ideal Customer</SectionLabel>
              </div>
              <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Primary audience */}
                <div style={{
                  background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)",
                  borderRadius: 12, padding: "14px 16px",
                }}>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(96,165,250,0.6)", margin: "0 0 6px" }}>
                    Primary Audience
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.78)", margin: 0, lineHeight: 1.6 }}>
                    {analysis.icp_profile.primary_audience}
                  </p>
                </div>
                {/* Pain points */}
                {analysis.icp_profile.pain_points.length > 0 && (
                  <div>
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: "0 0 10px" }}>
                      Pain Points
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {analysis.icp_profile.pain_points.map((pt, i) => (
                        <span key={i} style={{
                          fontSize: "0.78rem", padding: "5px 12px", borderRadius: 9999,
                          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                          color: "rgba(252,165,165,0.75)", lineHeight: 1.4,
                        }}>
                          {pt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Why they care */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14 }}>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(52,211,153,0.5)", margin: "0 0 6px" }}>
                    Why They Pay
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.65, fontStyle: "italic" }}>
                    {analysis.icp_profile.why_they_care}
                  </p>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* ── SECTION 9: Competitor Landscape ── */}
        {analysis.competitor_analysis && analysis.competitor_analysis.length > 0 && (
          <Section id="s9" delay={1.15} style={{ marginBottom: 24 }}>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <SectionLabel>Competitor Landscape</SectionLabel>
                  {conf && <ConfidenceBadge score={conf.competitor_analysis} />}
                </div>
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {analysis.competitor_analysis.map((comp, i) => (
                  <div key={i} style={{
                    background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "14px 16px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    animation: `fadeInUp 0.4s ease ${1.2 + i * 0.08}s both`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{
                        fontSize: "0.88rem", fontWeight: 800, color: "rgba(255,255,255,0.82)",
                      }}>
                        {comp.name}
                      </span>
                      <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>vs you</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div style={{
                        background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                        borderRadius: 8, padding: "10px 12px",
                      }}>
                        <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f87171", margin: "0 0 4px" }}>
                          Their Weakness
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                          {comp.weakness}
                        </p>
                      </div>
                      <div style={{
                        background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)",
                        borderRadius: 8, padding: "10px 12px",
                      }}>
                        <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#34d399", margin: "0 0 4px" }}>
                          Your Advantage
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                          {comp.your_advantage}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAction({
                        type: "competitor",
                        title: `Deep dive: ${comp.name}`,
                        subtitle: "Tech stack, pricing, attack vector",
                        projectIdea,
                        projectTitle,
                        context: comp,
                      })}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.22)",
                        color: "#fbbf24", padding: "5px 12px", borderRadius: 7,
                        fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(251,191,36,0.16)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(251,191,36,0.08)"; }}
                    >
                      🔍 Research deeper →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ── SECTION 10: Deployment Checklist ── */}
        {analysis.deployment_checklist && analysis.deployment_checklist.length > 0 && (
          <Section delay={1.25} style={{ marginBottom: 24 }}>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <SectionLabel>Deployment Checklist</SectionLabel>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", fontWeight: 500, marginBottom: 14 }}>
                    {deployChecked.size}/{analysis.deployment_checklist.length} done
                  </span>
                </div>
                <div style={{ height: 3, borderRadius: 9999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 9999,
                    width: `${analysis.deployment_checklist.length > 0 ? Math.round((deployChecked.size / analysis.deployment_checklist.length) * 100) : 0}%`,
                    background: deployChecked.size === analysis.deployment_checklist.length
                      ? "linear-gradient(90deg,#059669,#34d399)"
                      : "linear-gradient(90deg,#7c3aed,#a78bfa)",
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
              <div style={{ padding: "10px 16px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                {analysis.deployment_checklist.map((item, i) => {
                  const ps = priorityStyle(item.priority);
                  const isDone = deployChecked.has(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDeploy(i)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        background: isDone ? "rgba(52,211,153,0.04)" : "rgba(0,0,0,0.15)",
                        border: isDone ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 10, padding: "12px 14px",
                        cursor: "pointer", textAlign: "left", width: "100%",
                        transition: "all 0.15s ease",
                        animation: `fadeInUp 0.4s ease ${1.3 + i * 0.06}s both`,
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                        background: isDone ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.04)",
                        border: isDone ? "1px solid rgba(52,211,153,0.5)" : "1px solid rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, color: "#34d399",
                        transition: "all 0.15s ease",
                      }}>
                        {isDone ? "✓" : ""}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                            color: ps.color, background: ps.bg, border: `1px solid ${ps.border}`,
                            padding: "2px 7px", borderRadius: 9999, flexShrink: 0,
                          }}>
                            {item.priority}
                          </span>
                          <span style={{
                            fontSize: "0.78rem", fontWeight: 600, color: "rgba(139,92,246,0.7)",
                          }}>
                            {item.platform}
                          </span>
                        </div>
                        <p style={{
                          fontSize: "0.8rem", color: isDone ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)",
                          margin: 0, lineHeight: 1.5, textDecoration: isDone ? "line-through" : "none",
                          transition: "all 0.15s ease",
                        }}>
                          {item.action}
                        </p>
                      </div>
                      {/* Get exact steps button */}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); openAction({ type: "deploy", title: `${item.platform} Setup`, subtitle: item.action, projectIdea, projectTitle, context: item }); }}
                        style={{
                          flexShrink: 0, alignSelf: "center",
                          background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)",
                          color: "#60a5fa", padding: "4px 10px", borderRadius: 6,
                          fontSize: "0.68rem", fontWeight: 600, cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(96,165,250,0.16)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(96,165,250,0.08)"; }}
                      >
                        Commands →
                      </button>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        {/* ── SECTION 11: Viral Hooks ── */}
        {analysis.viral_hooks && analysis.viral_hooks.length > 0 && (
          <Section delay={1.35} style={{ marginBottom: 24 }}>
            <div style={{
              background: "rgba(236,72,153,0.03)",
              border: "1px solid rgba(236,72,153,0.14)",
              borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(236,72,153,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <SectionLabel>Viral Hooks</SectionLabel>
                <button
                  type="button"
                  onClick={() => openAction({
                    type: "viral",
                    title: "Generate viral hooks",
                    subtitle: "5 more hooks across Twitter, LinkedIn, Reddit, PH, HN",
                    projectIdea,
                    projectTitle,
                    context: {},
                  })}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.22)",
                    color: "#ec4899", padding: "5px 12px", borderRadius: 7,
                    fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                    marginBottom: 14, transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(236,72,153,0.16)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(236,72,153,0.08)"; }}
                >
                  ✦ Generate more →
                </button>
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {analysis.viral_hooks.map((hook, i) => (
                  <div key={i} style={{
                    background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "14px 16px",
                    border: "1px solid rgba(236,72,153,0.12)",
                    animation: `fadeInUp 0.4s ease ${1.4 + i * 0.08}s both`,
                    position: "relative",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                      <span style={{
                        fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                        color: "rgba(236,72,153,0.7)", background: "rgba(236,72,153,0.08)",
                        border: "1px solid rgba(236,72,153,0.2)", padding: "2px 8px", borderRadius: 9999,
                      }}>
                        {hook.format}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyHook(hook.copy, i)}
                        style={{
                          background: copiedIdx === i ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
                          border: copiedIdx === i ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.1)",
                          color: copiedIdx === i ? "#34d399" : "rgba(255,255,255,0.35)",
                          padding: "4px 10px", borderRadius: 7,
                          fontSize: "0.68rem", fontWeight: 600, cursor: "pointer",
                          transition: "all 0.15s ease", flexShrink: 0,
                        }}
                      >
                        {copiedIdx === i ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <p style={{
                      fontSize: "0.83rem", color: "rgba(255,255,255,0.58)", margin: 0,
                      lineHeight: 1.7, fontStyle: "italic",
                    }}>
                      &ldquo;{hook.copy}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ── SECTION 12: Iteration Suggestions ── */}
        {analysis.iteration_suggestions && analysis.iteration_suggestions.length > 0 && (
          <Section delay={1.45} style={{ marginBottom: 40 }}>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <SectionLabel>Iteration Roadmap</SectionLabel>
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {analysis.iteration_suggestions.map((item, i) => {
                  const imp = impactStyle(item.impact);
                  const isNoted = noted.has(i);
                  return (
                    <div key={i} style={{
                      background: "rgba(0,0,0,0.18)", borderRadius: 12, padding: "14px 16px",
                      border: isNoted ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(255,255,255,0.07)",
                      animation: `fadeInUp 0.4s ease ${1.5 + i * 0.08}s both`,
                      transition: "border-color 0.2s ease",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                        <span style={{
                          fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                          background: imp.bg, border: `1px solid ${imp.border}`, color: imp.color,
                          padding: "2px 7px", borderRadius: 9999, flexShrink: 0, marginTop: 2,
                        }}>
                          {item.impact} impact
                        </span>
                        <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "rgba(255,255,255,0.82)", margin: 0, lineHeight: 1.4 }}>
                          {item.issue}
                        </p>
                      </div>
                      <div style={{ paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6, flex: 1 }}>
                          <span style={{ color: "rgba(139,92,246,0.6)", fontWeight: 600 }}>Fix: </span>
                          {item.fix}
                        </p>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => openAction({
                              type: "iterate",
                              title: `Fix: ${item.issue.slice(0, 40)}${item.issue.length > 40 ? "..." : ""}`,
                              subtitle: `${item.impact} impact · exact implementation`,
                              projectIdea,
                              projectTitle,
                              context: item,
                            })}
                            style={{
                              background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.22)",
                              color: "#34d399", padding: "5px 12px", borderRadius: 7,
                              fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(52,211,153,0.16)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(52,211,153,0.08)"; }}
                          >
                            Fix this →
                          </button>
                        {!isNoted ? (
                          <button
                            type="button"
                            onClick={() => markNoted(i)}
                            style={{
                              background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.22)",
                              color: "#a78bfa", padding: "5px 12px", borderRadius: 7,
                              fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                              flexShrink: 0, transition: "all 0.15s ease",
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.16)";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.08)";
                            }}
                          >
                            Note this
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "rgba(139,92,246,0.5)", fontWeight: 600, flexShrink: 0 }}>
                            ✓ Noted
                          </span>
                        )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        {/* ── Tech Stack (deep analysis) ── */}
        {deepAnalysis?.tech_stack && deepAnalysis.tech_stack.length > 0 && (
          <Section delay={1.4} style={{ marginBottom: 24 }}>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <SectionLabel>Recommended Tech Stack</SectionLabel>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <TechStackSection items={deepAnalysis.tech_stack} />
              </div>
            </div>
          </Section>
        )}

        {/* ── Competitive Moat ── */}
        {deepAnalysis?.competitive_moat && (
          <Section delay={1.45} style={{ marginBottom: 24 }}>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <SectionLabel>Competitive Moat</SectionLabel>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <CompetitiveMoatSection moat={deepAnalysis.competitive_moat} />
              </div>
            </div>
          </Section>
        )}

        {/* ── Follow-Up Questions ── */}
        {deepAnalysis?.followup_questions && deepAnalysis.followup_questions.length > 0 && (
          <Section delay={1.5} style={{ marginBottom: 24 }}>
            <FollowUpQuestions
              questions={deepAnalysis.followup_questions}
              projectId={projectId}
              onAnalysisUpdated={setDeepAnalysis}
            />
          </Section>
        )}

        {/* ── Build Journal ── */}
        <Section delay={1.55} style={{ marginBottom: 40 }}>
          <BuildJournal projectId={projectId} />
        </Section>

        {/* ── CTA ── */}
        <Section delay={1.05} style={{ marginTop: 40, textAlign: "center" }}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/create" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "white", padding: "10px 22px", borderRadius: 10,
              fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
              boxShadow: "0 0 24px rgba(139,92,246,0.25)",
            }}>
              Analyze another build →
            </Link>
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.55)", padding: "10px 22px", borderRadius: 10,
              fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
            }}>
              Dashboard
            </Link>
          </div>
        </Section>

      </main>
      </div>{/* end scrollable content */}

      {/* ── Workspace Chat Panel ── */}
      {workspaceMode && (
        <WorkspaceChat
          projectId={projectId}
          projectIdea={projectIdea}
          projectTitle={projectTitle}
          analysis={analysis}
        />
      )}

      {/* ── Floating Ask Axiom button ── */}
      {!workspaceMode && !actionConfig && (
        <button
          type="button"
          onClick={() => openAction({
            type: "ask",
            title: "Ask Axiom",
            subtitle: "Ask anything about your build",
            projectIdea,
            projectTitle,
            context: {
              health_score: analysis.health_score,
              health_label: analysis.health_label,
              summary: analysis.summary,
            },
          })}
          style={{
            position: "fixed", bottom: 28, right: 28, zIndex: 50,
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
            border: "1px solid rgba(139,92,246,0.5)",
            color: "white", padding: "12px 20px", borderRadius: 14,
            fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
            boxShadow: "0 0 32px rgba(139,92,246,0.45), 0 8px 24px rgba(0,0,0,0.5)",
            transition: "all 0.2s ease",
            animation: "fadeInUp 0.5s ease 1.5s both",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 48px rgba(139,92,246,0.6), 0 12px 32px rgba(0,0,0,0.6)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 32px rgba(139,92,246,0.45), 0 8px 24px rgba(0,0,0,0.5)";
          }}
        >
          <span style={{ fontSize: "1rem" }}>✦</span>
          Ask Axiom
        </button>
      )}

      {/* ── Keyboard Shortcuts Overlay ── */}
      {showShortcuts && (
        <>
          <div onClick={() => setShowShortcuts(false)} style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", animation: "fadeIn 0.15s ease" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            zIndex: 111, width: "min(420px, 90vw)",
            background: "#08051a", border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: 18, padding: "24px 26px",
            boxShadow: "0 0 60px rgba(139,92,246,0.2), 0 20px 60px rgba(0,0,0,0.8)",
            animation: "scaleIn 0.2s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "rgba(255,255,255,0.85)", margin: 0, letterSpacing: "-0.01em" }}>Keyboard Shortcuts</h3>
              <button type="button" onClick={() => setShowShortcuts(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "1rem", padding: 4 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["1 – 9", "Jump to section"],
                ["A", "Open Ask Axiom panel"],
                ["E", "Export as Markdown"],
                ["S", "Copy share link"],
                ["?", "Toggle this overlay"],
                ["Esc", "Close any panel"],
              ].map(([key, desc]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <kbd style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 6, padding: "3px 8px", fontSize: "0.72rem", fontFamily: "monospace",
                    color: "#a78bfa", fontWeight: 700, letterSpacing: "0.04em", minWidth: 40, textAlign: "center",
                  }}>{key}</kbd>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", flex: 1 }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Action Panel ── */}
      {actionConfig && (
        <ActionPanel
          config={actionConfig}
          onClose={() => setActionConfig(null)}
        />
      )}
    </div>
  );
}
