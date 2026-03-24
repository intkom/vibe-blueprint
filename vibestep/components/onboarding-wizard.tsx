"use client";

import { useState, useActionState, useRef } from "react";
import { onboardAndCreate } from "@/app/actions/onboarding";

/* ── Types ── */
type BuildType = "saas" | "mobile" | "api" | "other";
type ExpLevel  = "beginner" | "intermediate" | "expert";

const BUILD_OPTIONS: { id: BuildType; emoji: string; label: string; sub: string }[] = [
  { id: "saas",   emoji: "🖥️", label: "SaaS / Web App",   sub: "Subscription product or web tool"  },
  { id: "mobile", emoji: "📱", label: "Mobile App",        sub: "iOS and/or Android"                 },
  { id: "api",    emoji: "⚡", label: "API / Backend",     sub: "Developer tool or data platform"    },
  { id: "other",  emoji: "✨", label: "Something else",    sub: "Marketplace, game, hardware, etc."  },
];

const EXP_OPTIONS: { id: ExpLevel; emoji: string; label: string; sub: string }[] = [
  { id: "beginner",     emoji: "🌱", label: "Beginner",     sub: "Learning as I go"             },
  { id: "intermediate", emoji: "🔨", label: "Intermediate",  sub: "Built a few things before"   },
  { id: "expert",       emoji: "🚀", label: "Expert",        sub: "Ship fast, no hand-holding"  },
];

const IDEA_EXAMPLES = [
  "An AI meeting summariser for remote teams — joins calls, transcribes, and sends bullet points to Slack automatically.",
  "A subscription tracker that finds forgotten subscriptions in your email and calculates monthly spend.",
  "A no-code Shopify app builder where merchants describe what they want and AI generates the app.",
];

const STEPS = [
  { num: 1, label: "What are you building?" },
  { num: 2, label: "Your experience level" },
  { num: 3, label: "Describe your first idea" },
];

/* ── Component ── */
export function OnboardingWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [buildType, setBuildType] = useState<BuildType | null>(null);
  const [expLevel, setExpLevel]   = useState<ExpLevel  | null>(null);
  const [idea, setIdea]           = useState("");
  const [animDir, setAnimDir]     = useState<"forward" | "back">("forward");
  const [state, formAction, pending] = useActionState(
    onboardAndCreate,
    null as { error: string } | null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function goTo(next: 1 | 2 | 3, dir: "forward" | "back" = "forward") {
    setAnimDir(dir);
    setTimeout(() => setStep(next), 0);
  }

  function fillExample(text: string) {
    setIdea(text);
    if (textareaRef.current) textareaRef.current.value = text;
  }

  const animKey = `${step}-${animDir}`;
  const slideIn  = animDir === "forward" ? "slideInRight" : "slideInLeft";

  return (
    <div style={{
      minHeight: "100vh", background: "#030014", color: "white",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "24px",
      position: "relative",
    }}>
      {/* Ambient orb */}
      <div aria-hidden="true" style={{
        position: "fixed", top: "-15%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ width: "100%", maxWidth: 520, position: "relative", zIndex: 10 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40, justifyContent: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white", boxShadow: "0 0 16px rgba(139,92,246,0.5)" }}>A</div>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, background: "linear-gradient(135deg,#c4b5fd,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Axiom</span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            {STEPS.map(s => (
              <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: s.num <= step ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${s.num <= step ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", fontWeight: 800,
                  color: s.num <= step ? "white" : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s ease",
                  boxShadow: s.num === step ? "0 0 12px rgba(139,92,246,0.5)" : "none",
                }}>
                  {s.num < step ? "✓" : s.num}
                </div>
                <span style={{ fontSize: "0.68rem", color: s.num === step ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)", display: "none" }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 9999,
              background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
              width: `${((step - 1) / 2) * 100}%`,
              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: "0 0 8px rgba(139,92,246,0.6)",
            }} />
          </div>
          <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", margin: "8px 0 0", textAlign: "right" }}>
            Step {step} of 3
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(8,4,26,0.97)",
          backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 24, padding: "36px 32px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)",
          position: "relative", overflow: "hidden",
        }}>
          <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.8),transparent)" }} />

          <div key={animKey} style={{ animation: `${slideIn} 0.32s cubic-bezier(0.34,1.56,0.64,1) both` }}>

            {/* ── Step 1: Build type ── */}
            {step === 1 && (
              <div>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(167,139,250,0.55)", margin: "0 0 10px" }}>Welcome to Axiom</p>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 6px", color: "rgba(255,255,255,0.95)" }}>What are you building?</h2>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", margin: "0 0 28px" }}>This helps us tailor your analysis.</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
                  {BUILD_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => { setBuildType(opt.id); setTimeout(() => goTo(2), 180); }}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "flex-start",
                        padding: "16px 16px",
                        background: buildType === opt.id ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${buildType === opt.id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 14, cursor: "pointer", textAlign: "left",
                        transition: "all 0.18s ease",
                        boxShadow: buildType === opt.id ? "0 0 20px rgba(139,92,246,0.15)" : "none",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem", marginBottom: 8 }}>{opt.emoji}</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.82)", display: "block", marginBottom: 3 }}>{opt.label}</span>
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Experience level ── */}
            {step === 2 && (
              <div>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(167,139,250,0.55)", margin: "0 0 10px" }}>Almost there</p>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 6px", color: "rgba(255,255,255,0.95)" }}>Your experience level?</h2>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", margin: "0 0 28px" }}>We&apos;ll adjust the technical depth of your analysis.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {EXP_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => { setExpLevel(opt.id); setTimeout(() => goTo(3), 180); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 16,
                        padding: "16px 20px",
                        background: expLevel === opt.id ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${expLevel === opt.id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 14, cursor: "pointer", textAlign: "left",
                        transition: "all 0.18s ease",
                        boxShadow: expLevel === opt.id ? "0 0 20px rgba(139,92,246,0.15)" : "none",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{opt.emoji}</span>
                      <div>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", display: "block" }}>{opt.label}</span>
                        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>{opt.sub}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <button type="button" onClick={() => goTo(1, "back")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: "0.78rem", cursor: "pointer", padding: 0 }}>
                  ← Back
                </button>
              </div>
            )}

            {/* ── Step 3: Idea ── */}
            {step === 3 && (
              <form action={formAction}>
                <input type="hidden" name="building_type" value={buildType ?? ""} />
                <input type="hidden" name="experience_level" value={expLevel ?? ""} />

                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(167,139,250,0.55)", margin: "0 0 10px" }}>Last step</p>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 6px", color: "rgba(255,255,255,0.95)" }}>What&apos;s your first idea?</h2>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", margin: "0 0 20px" }}>Describe it in plain English — we&apos;ll turn it into a full build plan.</p>

                {state?.error && (
                  <div role="alert" style={{ display: "flex", gap: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 10, padding: "12px 14px", fontSize: "0.82rem", color: "rgba(252,165,165,0.85)", marginBottom: 16 }}>
                    <span>⚠</span><span>{state.error}</span>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  name="idea"
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  placeholder="e.g. An AI meeting summariser for remote teams — joins calls, transcribes, and sends bullet points to Slack automatically."
                  rows={5}
                  required
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)", color: "white",
                    borderRadius: 12, padding: "14px 16px", fontSize: "0.9rem",
                    outline: "none", resize: "vertical", lineHeight: 1.65,
                    marginBottom: 10, boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />

                {/* Example chips */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                  {IDEA_EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => fillExample(ex)}
                      style={{
                        fontSize: "0.68rem", color: "rgba(167,139,250,0.6)",
                        background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)",
                        borderRadius: 9999, padding: "4px 10px", cursor: "pointer",
                      }}
                    >
                      Example {i + 1}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => goTo(2, "back")} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", padding: "12px 16px", borderRadius: 11, fontSize: "0.82rem", cursor: "pointer", flexShrink: 0 }}>
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={pending || idea.length < 20}
                    style={{
                      flex: 1,
                      background: pending ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg,#7c3aed,#6d28d9)",
                      border: "1px solid rgba(139,92,246,0.45)", color: "white",
                      padding: "12px 20px", borderRadius: 11, fontSize: "0.9rem", fontWeight: 700,
                      cursor: pending ? "not-allowed" : "pointer",
                      opacity: idea.length < 20 ? 0.5 : 1,
                      boxShadow: "0 0 24px rgba(139,92,246,0.35)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {pending ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                        Analyzing your build…
                      </span>
                    ) : "Analyze my build →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.15)", marginTop: 20 }}>
          You can always change these preferences in settings.
        </p>
      </div>

      <style>{`
        @keyframes slideInRight { from { opacity:0; transform:translateX(28px) scale(0.97); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-28px) scale(0.97); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
