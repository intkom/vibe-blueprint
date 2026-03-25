"use client";

import { useState, useActionState, useRef } from "react";
import { onboardAndCreate } from "@/app/actions/onboarding";
import { useTranslations } from "next-intl";

/* ── Types ── */
type BuildType = "saas" | "mobile" | "devtool" | "ecommerce" | "ai" | "other";
type ExpLevel  = "beginner" | "intermediate" | "expert";

const IDEA_EXAMPLES = [
  "An AI meeting summariser for remote teams — joins calls, transcribes, and sends bullet points to Slack automatically.",
  "A subscription tracker that finds forgotten subscriptions in your email and calculates monthly spend.",
  "A no-code Shopify app builder where merchants describe what they want and AI generates the app.",
];

const TOTAL_STEPS = 4;

/* ── Component ── */
export function OnboardingWizard() {
  const t = useTranslations("onboarding");

  const BUILD_OPTIONS: { id: BuildType; emoji: string; label: string; sub: string }[] = [
    { id: "saas",      emoji: "🖥",  label: t("saas"),       sub: t("saasDesc")       },
    { id: "mobile",    emoji: "📱",  label: t("mobile"),     sub: t("mobileDesc")     },
    { id: "devtool",   emoji: "⚡",  label: t("devTool"),    sub: t("devToolDesc")    },
    { id: "ecommerce", emoji: "🛍",  label: t("ecommerce"),  sub: t("ecommerceDesc")  },
    { id: "ai",        emoji: "🧠",  label: t("aiApp"),      sub: t("aiAppDesc")      },
    { id: "other",     emoji: "✨",  label: t("other"),      sub: t("otherDesc")      },
  ];

  const EXP_OPTIONS: { id: ExpLevel; emoji: string; label: string; sub: string }[] = [
    { id: "beginner",     emoji: "🌱", label: t("beginner"),     sub: t("beginnerDesc")     },
    { id: "intermediate", emoji: "🔨", label: t("intermediate"), sub: t("intermediateDesc") },
    { id: "expert",       emoji: "🚀", label: t("expert"),       sub: t("expertDesc")       },
  ];

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [buildTypes, setBuildTypes] = useState<Set<BuildType>>(new Set());
  const [expLevel, setExpLevel]   = useState<ExpLevel | null>(null);
  const [idea, setIdea]           = useState("");
  const [animDir, setAnimDir]     = useState<"forward" | "back">("forward");
  const [state, formAction, pending] = useActionState(
    onboardAndCreate,
    null as { error: string } | null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function goTo(next: 0 | 1 | 2 | 3, dir: "forward" | "back" = "forward") {
    setAnimDir(dir);
    setTimeout(() => setStep(next), 0);
  }

  function toggleBuildType(id: BuildType) {
    setBuildTypes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function fillExample(text: string) {
    setIdea(text);
    if (textareaRef.current) textareaRef.current.value = text;
  }

  const animKey = `${step}-${animDir}`;
  const slideIn  = animDir === "forward" ? "slideInRight" : "slideInLeft";
  const progressPct = (step / (TOTAL_STEPS - 1)) * 100;

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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: step === 0 ? 0 : 40, justifyContent: "center" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "white",
            boxShadow: "0 0 16px rgba(139,92,246,0.5)",
          }}>A</div>
          <span style={{
            fontSize: "1.1rem", fontWeight: 800,
            background: "linear-gradient(135deg,#c4b5fd,#a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Axiom</span>
        </div>

        {/* Progress bar (hidden on welcome step) */}
        {step > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3].map(n => (
                  <div key={n} style={{
                    width: n <= step ? 20 : 8, height: 4, borderRadius: 9999,
                    background: n < step ? "#34d399" : n === step ? "linear-gradient(90deg,#7c3aed,#a78bfa)" : "rgba(255,255,255,0.08)",
                    transition: "all 0.4s ease",
                  }} />
                ))}
              </div>
              <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>
                {step === 1 ? t("step1of3") : step === 2 ? t("step2of3") : t("step3of3")}
              </span>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 9999,
                background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
                width: `${progressPct}%`,
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: "0 0 8px rgba(139,92,246,0.6)",
              }} />
            </div>
          </div>
        )}

        {/* Card */}
        <div style={{
          background: "rgba(8,4,26,0.97)",
          backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 24, padding: step === 0 ? "48px 36px" : "36px 32px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)",
          position: "relative", overflow: "hidden",
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "60%", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.8),transparent)",
          }} />

          <div key={animKey} style={{ animation: step === 0 ? "fadeIn 0.5s ease" : `${slideIn} 0.32s cubic-bezier(0.34,1.56,0.64,1) both` }}>

            {/* ── Step 0: Welcome ── */}
            {step === 0 && (
              <div style={{ textAlign: "center" }}>
                {/* Animated logo orb */}
                <div style={{
                  width: 72, height: 72, borderRadius: 20, margin: "0 auto 28px",
                  background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(91,33,182,0.15))",
                  border: "1px solid rgba(139,92,246,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2rem",
                  boxShadow: "0 0 40px rgba(139,92,246,0.3)",
                  animation: "pulseGlow 3s ease-in-out infinite",
                }}>✦</div>

                <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(167,139,250,0.55)", margin: "0 0 12px" }}>
                  {t("welcome")}
                </p>
                <h1 style={{ fontSize: "1.9rem", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 12px", color: "rgba(255,255,255,0.95)", lineHeight: 1.2 }}>
                  {t("welcomeSubline")}
                </h1>
                <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.38)", margin: "0 0 36px", lineHeight: 1.7 }}>
                  {t("welcomeDesc")}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                  {[
                    { icon: "⚡", text: t("feature1") },
                    { icon: "🎯", text: t("feature2") },
                    { icon: "🗺", text: t("feature3") },
                  ].map(f => (
                    <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem",
                      }}>{f.icon}</div>
                      <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>{f.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => goTo(1)}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    border: "1px solid rgba(139,92,246,0.5)",
                    color: "white", padding: "14px 24px", borderRadius: 12,
                    fontSize: "1rem", fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 0 28px rgba(139,92,246,0.4)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                >
                  {t("getStarted")}
                </button>
              </div>
            )}

            {/* ── Step 1: Build type (multi-select) ── */}
            {step === 1 && (
              <div>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(167,139,250,0.55)", margin: "0 0 10px" }}>
                  {t("step1of3")}
                </p>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 6px", color: "rgba(255,255,255,0.95)" }}>
                  {t("step1Title")}
                </h2>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", margin: "0 0 24px" }}>
                  {t("step1Subline")}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                  {BUILD_OPTIONS.map(opt => {
                    const selected = buildTypes.has(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleBuildType(opt.id)}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "flex-start",
                          padding: "16px 16px",
                          background: selected ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${selected ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 14, cursor: "pointer", textAlign: "left",
                          transition: "all 0.18s ease",
                          boxShadow: selected ? "0 0 20px rgba(139,92,246,0.15)" : "none",
                          position: "relative",
                        }}
                      >
                        {selected && (
                          <div style={{
                            position: "absolute", top: 8, right: 8,
                            width: 18, height: 18, borderRadius: "50%",
                            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.6rem", color: "white", fontWeight: 800,
                          }}>✓</div>
                        )}
                        <span style={{ fontSize: "1.4rem", marginBottom: 8 }}>{opt.emoji}</span>
                        <span style={{ fontSize: "0.83rem", fontWeight: 700, color: "rgba(255,255,255,0.82)", display: "block", marginBottom: 3 }}>
                          {opt.label}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>{opt.sub}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => goTo(2)}
                  disabled={buildTypes.size === 0}
                  style={{
                    width: "100%",
                    background: buildTypes.size > 0 ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "rgba(139,92,246,0.2)",
                    border: "1px solid rgba(139,92,246,0.45)",
                    color: buildTypes.size > 0 ? "white" : "rgba(255,255,255,0.3)",
                    padding: "12px 20px", borderRadius: 11, fontSize: "0.9rem", fontWeight: 700,
                    cursor: buildTypes.size > 0 ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease",
                  }}
                >
                  {buildTypes.size > 0 ? t("continueSelected", { count: buildTypes.size }) : t("selectAtLeastOne")}
                </button>
              </div>
            )}

            {/* ── Step 2: Experience level ── */}
            {step === 2 && (
              <div>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(167,139,250,0.55)", margin: "0 0 10px" }}>
                  {t("step2of3")}
                </p>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 6px", color: "rgba(255,255,255,0.95)" }}>
                  {t("step2Title")}
                </h2>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", margin: "0 0 28px" }}>
                  {t("step2Subline")}
                </p>

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

                <button type="button" onClick={() => goTo(1, "back")} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: "0.78rem", cursor: "pointer", padding: 0,
                }}>
                  {t("back")}
                </button>
              </div>
            )}

            {/* ── Step 3: First idea ── */}
            {step === 3 && (
              <form action={formAction}>
                <input type="hidden" name="building_type" value={[...buildTypes].join(",")} />
                <input type="hidden" name="experience_level" value={expLevel ?? ""} />

                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(167,139,250,0.55)", margin: "0 0 10px" }}>
                  {t("step3of3")}
                </p>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 6px", color: "rgba(255,255,255,0.95)" }}>
                  {t("step3Title")}
                </h2>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", margin: "0 0 20px" }}>
                  {t("step3Subline")}
                </p>

                {state?.error && (
                  <div role="alert" style={{
                    display: "flex", gap: 10,
                    background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)",
                    borderRadius: 10, padding: "12px 14px",
                    fontSize: "0.82rem", color: "rgba(252,165,165,0.85)", marginBottom: 16,
                  }}>
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
                    fontFamily: "inherit", caretColor: "#a78bfa",
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
                  <button type="button" onClick={() => goTo(2, "back")} style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.3)", padding: "12px 16px", borderRadius: 11,
                    fontSize: "0.82rem", cursor: "pointer", flexShrink: 0,
                  }}>
                    {t("back")}
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
                        {t("analyzing")}
                      </span>
                    ) : t("analyzeNow")}
                  </button>
                </div>

                {/* Skip */}
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => { window.location.href = "/dashboard"; }}
                    style={{
                      background: "none", border: "none", fontSize: "0.78rem",
                      color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: 0,
                    }}
                  >
                    {t("analyzeLater")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.15)", marginTop: 20 }}>
          {t("preferencesNote")}
        </p>
      </div>

      <style>{`
        @keyframes slideInRight { from { opacity:0; transform:translateX(28px) scale(0.97); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-28px) scale(0.97); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(139,92,246,0.3); }
          50% { box-shadow: 0 0 60px rgba(139,92,246,0.5), 0 0 80px rgba(139,92,246,0.2); }
        }
      `}</style>
    </div>
  );
}
