"use client";

import { useActionState, useState } from "react";
import { validateIdea, INITIAL_RESULT, type ValidateState } from "@/app/actions/validate";

/* ── Verdict styling ── */
const VERDICT_STYLES = {
  "Build it": {
    bg: "rgba(52,211,153,0.06)",
    border: "rgba(52,211,153,0.3)",
    text: "#34d399",
    badge: "rgba(52,211,153,0.15)",
    icon: "🚀",
    glow: "0 0 48px rgba(52,211,153,0.18)",
  },
  "Pivot": {
    bg: "rgba(251,191,36,0.06)",
    border: "rgba(251,191,36,0.3)",
    text: "#fbbf24",
    badge: "rgba(251,191,36,0.15)",
    icon: "🔄",
    glow: "0 0 48px rgba(251,191,36,0.18)",
  },
  "Skip it": {
    bg: "rgba(248,113,113,0.06)",
    border: "rgba(248,113,113,0.3)",
    text: "#f87171",
    badge: "rgba(248,113,113,0.15)",
    icon: "⛔",
    glow: "0 0 40px rgba(248,113,113,0.12)",
  },
} as const;

const CONFIDENCE_LABELS = {
  high: { label: "High confidence", color: "#34d399" },
  medium: { label: "Medium confidence", color: "#fbbf24" },
  low: { label: "Low confidence", color: "#f87171" },
};

const EXAMPLES = [
  "A SaaS tool that auto-generates technical interviews based on job descriptions, with AI-scoring of candidates",
  "A marketplace connecting restaurant owners with vetted freelance social media managers who specialize in food content",
  "An AI co-pilot for solo founders that turns their raw ideas into investor-ready pitch decks and financial models",
];

export function IdeaValidatorForm() {
  const [state, formAction, isPending] = useActionState<ValidateState, FormData>(
    validateIdea,
    INITIAL_RESULT
  );
  const [idea, setIdea] = useState("");

  const charCount = idea.length;
  const canSubmit = charCount >= 20 && !isPending;
  const vs = state.result ? VERDICT_STYLES[state.result.verdict] : null;

  return (
    <div>
      {/* ── Form ── */}
      <form action={formAction}>
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 18, padding: "22px 22px 18px",
          marginBottom: 14,
        }}>
          <label style={{ display: "block", marginBottom: 10 }}>
            <span style={{
              fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
            }}>
              Describe your startup idea
            </span>
          </label>
          <textarea
            name="idea"
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="e.g. A B2B SaaS that helps e-commerce brands automatically recover abandoned carts via personalized SMS sequences powered by purchase history…"
            rows={5}
            style={{
              width: "100%", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12,
              color: "rgba(255,255,255,0.88)", fontSize: "0.9rem", lineHeight: 1.7,
              padding: "14px 16px", outline: "none", resize: "vertical",
              caretColor: "#a78bfa", fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease",
            }}
          />

          {/* Examples + char count row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 10, gap: 12, flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {charCount < 20 && EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdea(ex)}
                  style={{
                    background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.22)",
                    color: "rgba(167,139,250,0.75)", padding: "4px 10px", borderRadius: 9999,
                    fontSize: "0.68rem", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Example {i + 1}
                </button>
              ))}
            </div>
            <span style={{
              fontSize: "0.68rem", fontWeight: 600,
              color: charCount < 20 ? "rgba(248,113,113,0.6)" : "rgba(52,211,153,0.6)",
              flexShrink: 0,
            }}>
              {charCount < 20 ? `${20 - charCount} chars needed` : `${charCount} chars ✓`}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: "100%", padding: "15px 24px", borderRadius: 13,
            background: canSubmit
              ? "linear-gradient(135deg,#7c3aed,#5b21b6)"
              : "rgba(255,255,255,0.05)",
            border: canSubmit
              ? "1px solid rgba(139,92,246,0.45)"
              : "1px solid rgba(255,255,255,0.08)",
            color: canSubmit ? "white" : "rgba(255,255,255,0.22)",
            fontSize: "0.925rem", fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            boxShadow: canSubmit ? "0 0 32px rgba(139,92,246,0.4)" : "none",
            animation: isPending ? "ringPulse 1.4s ease-in-out infinite" : "none",
            letterSpacing: "0.01em", fontFamily: "inherit",
            transition: "all 0.2s ease",
          }}
        >
          {isPending ? "Analyzing your idea…" : "Validate my idea →"}
        </button>
      </form>

      {/* ── Error ── */}
      {state.error && (
        <div style={{
          marginTop: 14,
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12, padding: "12px 16px",
          color: "rgba(252,165,165,0.8)", fontSize: "0.85rem",
        }}>
          {state.error}
        </div>
      )}

      {/* ── Results ── */}
      {state.result && vs && (
        <div
          key={`${state.result.verdict}-${state.result.market_size}`}
          style={{ marginTop: 28, animation: "fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) both" }}
        >
          {/* ── Verdict card ── */}
          <div style={{
            background: vs.bg, border: `1px solid ${vs.border}`,
            borderRadius: 20, padding: "26px 28px 22px",
            marginBottom: 12, position: "relative", overflow: "hidden",
            boxShadow: vs.glow,
          }}>
            <div aria-hidden="true" style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "55%", height: 1,
              background: `linear-gradient(90deg,transparent,${vs.text}88,transparent)`,
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <span style={{ fontSize: "2.2rem", lineHeight: 1 }}>{vs.icon}</span>
              <div>
                <p style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: `${vs.text}88`, margin: "0 0 3px",
                }}>Verdict</p>
                <p style={{
                  fontSize: "1.65rem", fontWeight: 900, color: vs.text,
                  margin: 0, letterSpacing: "-0.025em", lineHeight: 1,
                }}>
                  {state.result.verdict}
                </p>
              </div>
              {/* Confidence badge */}
              <span style={{
                marginLeft: "auto", fontSize: "0.62rem", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase",
                background: vs.badge, border: `1px solid ${vs.border}`,
                color: CONFIDENCE_LABELS[state.result.confidence]?.color ?? vs.text,
                padding: "4px 10px", borderRadius: 9999,
              }}>
                {CONFIDENCE_LABELS[state.result.confidence]?.label ?? "Medium confidence"}
              </span>
            </div>

            <p style={{
              fontSize: "0.875rem", color: "rgba(255,255,255,0.65)",
              lineHeight: 1.72, margin: 0,
            }}>
              {state.result.verdict_reasoning}
            </p>
          </div>

          {/* ── Stats grid ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {/* Market size — full width */}
            <div style={{
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "18px 20px", gridColumn: "1 / -1",
            }}>
              <p style={{
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: "0 0 6px",
              }}>
                Market Size
              </p>
              <p style={{
                fontSize: "1.5rem", fontWeight: 900, color: "#a78bfa",
                margin: "0 0 5px", letterSpacing: "-0.02em",
              }}>
                {state.result.market_size}
              </p>
              <p style={{
                fontSize: "0.8rem", color: "rgba(255,255,255,0.38)",
                margin: 0, lineHeight: 1.65,
              }}>
                {state.result.market_reasoning}
              </p>
            </div>

            {/* Unique angle */}
            <div style={{
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "16px 18px",
            }}>
              <p style={{
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: "0 0 6px",
              }}>
                Your Angle
              </p>
              <p style={{
                fontSize: "0.82rem", color: "rgba(255,255,255,0.7)",
                lineHeight: 1.65, margin: 0,
              }}>
                {state.result.unique_angle}
              </p>
            </div>

            {/* Biggest risk */}
            <div style={{
              background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)",
              borderRadius: 14, padding: "16px 18px",
            }}>
              <p style={{
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(248,113,113,0.5)", margin: "0 0 6px",
              }}>
                Biggest Risk
              </p>
              <p style={{
                fontSize: "0.82rem", color: "#f87171",
                lineHeight: 1.65, margin: 0,
              }}>
                {state.result.biggest_risk}
              </p>
            </div>
          </div>

          {/* ── Competitors ── */}
          <div style={{
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "18px 20px", marginBottom: 14,
          }}>
            <p style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: "0 0 12px",
            }}>
              Top Competitors
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {state.result.competitors.slice(0, 3).map((c, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "10px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 800, color: "#a78bfa",
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: "0.85rem", fontWeight: 700,
                      color: "rgba(255,255,255,0.82)", margin: "0 0 2px",
                    }}>
                      {c.name}
                    </p>
                    <p style={{
                      fontSize: "0.75rem", color: "rgba(52,211,153,0.7)",
                      margin: 0, lineHeight: 1.5,
                    }}>
                      Gap: {c.weakness}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          {state.result.verdict === "Build it" && (
            <div style={{ textAlign: "center" }}>
              <a
                href="/create"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg,#059669,#34d399)",
                  border: "1px solid rgba(52,211,153,0.4)",
                  color: "white", padding: "13px 32px", borderRadius: 12,
                  fontSize: "0.9rem", fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 0 32px rgba(52,211,153,0.3)",
                  letterSpacing: "0.01em",
                }}
              >
                Build it with VibeStep →
              </a>
            </div>
          )}
          {state.result.verdict === "Pivot" && (
            <div style={{ textAlign: "center" }}>
              <a
                href="/create"
                style={{
                  display: "inline-block",
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.3)",
                  color: "#fbbf24", padding: "13px 32px", borderRadius: 12,
                  fontSize: "0.9rem", fontWeight: 700, textDecoration: "none",
                  letterSpacing: "0.01em",
                }}
              >
                Refine the angle in VibeStep →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
