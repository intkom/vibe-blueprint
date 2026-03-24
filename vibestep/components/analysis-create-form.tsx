"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { StreamEvent } from "@/app/api/analyze/route";

function scoreIdea(text: string): { score: number; tip: string | null } {
  if (text.length < 10) return { score: 0, tip: null };
  let score = 0;
  score += Math.min(30, Math.floor((text.length / 150) * 30));
  const hasAudience = /\b(for|users?|customers?|teams?|founders?|developers?|businesses?|clients?|creators?)\b/i.test(text);
  if (hasAudience) score += 20;
  const hasProblem = /\b(problem|pain|solve|need|frustrat|difficult|automat|save time|manual)\b/i.test(text);
  if (hasProblem) score += 20;
  const hasSpec = /(\$\d|\d+\/|\d+ (hour|min|user|team)|b2b|b2c|saas|api|mobile|dashboard|real.?time)/i.test(text);
  if (hasSpec) score += 15;
  const hasBiz = /\b(subscription|freemium|per (user|seat|month)|one.time|revenue|pricing|\$)/i.test(text);
  if (hasBiz) score += 15;
  score = Math.min(100, score);
  let tip: string | null = null;
  if (!hasAudience) tip = "Add a target audience — who specifically will use this?";
  else if (!hasProblem) tip = "Describe the core problem your product solves.";
  else if (!hasSpec) tip = "Add specificity — tech stack, scale, or use case details.";
  else if (!hasBiz) tip = "Mention a pricing model to strengthen the signal.";
  return { score, tip };
}

function getComplexity(text: string): { label: "Simple" | "Moderate" | "Detailed"; color: string } {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10).length;
  if (sentences >= 4) return { label: "Detailed", color: "#34d399" };
  if (sentences >= 2) return { label: "Moderate", color: "#fbbf24" };
  return { label: "Simple", color: "#f87171" };
}

function getStage(pct: number): { label: string; num: number } {
  if (pct <= 10) return { label: "Initializing", num: 1 };
  if (pct <= 20) return { label: "Connecting to engine", num: 2 };
  if (pct <= 60) return { label: "Analyzing your build", num: 3 };
  if (pct <= 90) return { label: "Generating insights", num: 4 };
  return { label: "Finalizing report", num: 5 };
}

const DID_YOU_KNOW = [
  "Ship in 4 weeks, not 4 months. Axiom sequences steps around what unblocks the most.",
  "Your first version's only job is proving the core assumption wrong — quickly.",
  "Most builder anxiety comes from premature architecture. Scope down before you scale up.",
  "The fastest path to revenue: find one person who'll pay before you build anything.",
  "90% of failed products solved problems users had already solved themselves.",
  "Your health score reflects execution clarity, not idea quality. A 60 can still win.",
  "Every competitor has a pricing weakness. Finding it takes 30 minutes, not $30k.",
  "The next Stripe was rejected from YC. Ship first. Iterate relentlessly.",
];

const EXAMPLES = [
  "A Notion clone for developers — markdown-first, with code blocks, GitHub integration, and keyboard shortcuts everywhere.",
  "A habit tracker for athletes — log workouts, streaks, and personal bests. Mobile-first. Syncs with Apple Health.",
  "An AI writing assistant for content creators — paste a topic, get a full blog post draft with SEO suggestions.",
  "A booking app for freelancers — clients can see availability, book sessions, pay upfront, and get automated reminders.",
];

export function AnalysisCreateForm() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [ideaText, setIdeaText] = useState("");
  const [btnHover, setBtnHover] = useState(false);
  const [listening, setListening] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);

  // Analysis state
  const [phase, setPhase] = useState<"idle" | "analyzing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const ideaScore = useMemo(() => scoreIdea(ideaText), [ideaText]);
  const complexity = useMemo(() => charCount >= 10 ? getComplexity(ideaText) : null, [ideaText, charCount]);

  // Cycle "Did you know?" tips during analysis
  useEffect(() => {
    if (phase !== "analyzing") return;
    const t = setInterval(() => setTipIdx(i => (i + 1) % DID_YOU_KNOW.length), 4000);
    return () => clearInterval(t);
  }, [phase]);

  function fillExample(text: string) {
    if (textareaRef.current) {
      textareaRef.current.value = text;
      setCharCount(text.length);
      setIdeaText(text);
      textareaRef.current.focus();
    }
  }

  function startVoice() {
    type AnySR = { new(): {
      continuous: boolean; interimResults: boolean; lang: string;
      onstart: (() => void) | null; onend: (() => void) | null; onerror: (() => void) | null;
      onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
      start(): void;
    }};
    const w = window as unknown as Record<string, unknown>;
    const SR = (w["SpeechRecognition"] || w["webkitSpeechRecognition"]) as AnySR | undefined;
    if (!SR) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript && textareaRef.current) {
        const current = textareaRef.current.value;
        const updated = current ? `${current} ${transcript}` : transcript;
        textareaRef.current.value = updated;
        setCharCount(updated.length);
        setIdeaText(updated);
      }
    };
    rec.start();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idea = textareaRef.current?.value?.trim() ?? "";
    if (!idea || idea.length < 20) return;

    setPhase("analyzing");
    setProgress(0);
    setTipIdx(0);
    setLog(["Submitting your build description..."]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as StreamEvent;
            if (event.type === "error") throw new Error(event.message);
            if (event.type === "progress") {
              setLog(prev => [...prev, event.message]);
              setProgress(event.pct);
            }
            if (event.type === "done") {
              setLog(prev => [...prev, "Analysis complete"]);
              setProgress(100);
              setPhase("success");
              setTimeout(() => router.push(`/project/${event.projectId}/analysis`), 700);
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err) {
      setPhase("error");
      setErrorMsg(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    }
  }

  // ── Full-screen analysis overlay ─────────────────────────────
  if (phase === "analyzing" || phase === "success") {
    const stage = getStage(progress);
    const currentMsg = log[log.length - 1] ?? "";
    const completedMsgs = log.slice(0, -1);

    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "#030014",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "24px",
        animation: "fadeIn 0.3s ease",
      }}>
        {/* Ambient glow */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 55% 45% at 50% 35%, rgba(139,92,246,0.14) 0%, transparent 65%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Stage label */}
          <div style={{ textAlign: "center" }}>
            <p style={{
              fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(167,139,250,0.5)", margin: "0 0 10px",
            }}>
              Stage {stage.num} of 5 — {stage.label}
            </p>
            <h2 style={{
              fontSize: "clamp(1.2rem, 3vw, 1.6rem)", fontWeight: 900, letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: 1.2,
            }}>
              {phase === "success" ? "Analysis complete ✓" : "Running your analysis..."}
            </h2>
          </div>

          {/* Progress bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(167,139,250,0.6)" }}>
                {phase === "success" ? "Complete" : "Progress"}
              </span>
              <span style={{ fontSize: "0.72rem", color: "rgba(167,139,250,0.7)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 9999, background: "rgba(139,92,246,0.1)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 9999, width: `${progress}%`,
                background: phase === "success"
                  ? "linear-gradient(90deg,#059669,#34d399)"
                  : "linear-gradient(90deg,#7c3aed,#a78bfa,#c084fc)",
                boxShadow: "0 0 12px rgba(139,92,246,0.5)",
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1), background 0.5s ease",
              }} />
            </div>
            {/* Stage dots */}
            <div style={{ display: "flex", gap: 4, marginTop: 8, justifyContent: "center" }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{
                  width: n <= stage.num ? 16 : 8, height: 4, borderRadius: 9999,
                  background: n < stage.num ? "#34d399" : n === stage.num ? "#a78bfa" : "rgba(255,255,255,0.1)",
                  transition: "all 0.4s ease",
                }} />
              ))}
            </div>
          </div>

          {/* Terminal log */}
          <div style={{
            background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, overflow: "hidden",
            fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 13px",
              borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)",
            }}>
              {["#f87171","#fbbf24","#34d399"].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.4 }} />
              ))}
              <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.18)", marginLeft: 6, letterSpacing: "0.06em" }}>
                axiom — analysis engine
              </span>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 5, minHeight: 110, maxHeight: 200, overflowY: "auto" }}>
              {completedMsgs.map((msg, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, animation: "fadeInUp 0.3s ease both" }}>
                  <span style={{ color: "#34d399", fontSize: "0.7rem", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.4 }}>{msg}</span>
                </div>
              ))}
              {currentMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, animation: "fadeInUp 0.25s ease both" }}>
                  {phase === "success" ? (
                    <span style={{ color: "#34d399", fontSize: "0.7rem", flexShrink: 0 }}>✓</span>
                  ) : (
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                      background: "#a78bfa", animation: "pulseGlow 1s ease-in-out infinite",
                    }} />
                  )}
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.82)", fontWeight: 600, lineHeight: 1.4 }}>
                    {currentMsg}
                    {phase === "analyzing" && (
                      <span style={{ display: "inline-block", width: 6, height: "0.82em", background: "#a78bfa", verticalAlign: "text-bottom", marginLeft: 4, animation: "pulseGlow 0.7s ease-in-out infinite" }} />
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Did you know? */}
          {phase === "analyzing" && (
            <div key={tipIdx} style={{
              background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)",
              borderRadius: 12, padding: "14px 18px",
              animation: "fadeIn 0.5s ease",
            }}>
              <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(167,139,250,0.4)", margin: "0 0 6px" }}>
                Did you know?
              </p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.65, fontStyle: "italic" }}>
                {DID_YOU_KNOW[tipIdx]}
              </p>
            </div>
          )}

          {phase === "success" && (
            <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#34d399", textAlign: "center", margin: 0, animation: "fadeInUp 0.4s ease" }}>
              Redirecting to your report...
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "32px 24px", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>⚠</div>
        <div>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", margin: "0 0 6px" }}>Analysis failed</p>
          <p style={{ fontSize: "0.82rem", color: "rgba(252,165,165,0.7)", margin: 0 }}>{errorMsg}</p>
        </div>
        <button
          onClick={() => { setPhase("idle"); setProgress(0); setLog([]); }}
          style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)", padding: "10px 24px", borderRadius: 10,
            fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Idle form ────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Example chips */}
      <div>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 10 }}>
          Try an example
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => fillExample(ex)}
              style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10, padding: "9px 14px",
                fontSize: "0.78rem", color: "rgba(255,255,255,0.4)",
                cursor: "pointer", textAlign: "left", lineHeight: 1.5,
                transition: "all 0.18s ease",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = "rgba(139,92,246,0.4)";
                el.style.color = "rgba(255,255,255,0.65)";
                el.style.background = "rgba(139,92,246,0.06)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = "rgba(255,255,255,0.07)";
                el.style.color = "rgba(255,255,255,0.4)";
                el.style.background = "rgba(255,255,255,0.03)";
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <label htmlFor="idea-analysis" style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.01em" }}>
            Describe your build
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Complexity badge */}
            {complexity && (
              <span style={{
                fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: complexity.color, background: `${complexity.color}12`,
                border: `1px solid ${complexity.color}30`, padding: "2px 8px", borderRadius: 9999,
                animation: "fadeIn 0.2s ease",
              }}>
                {complexity.label}
              </span>
            )}
            <span style={{ fontSize: "0.72rem", color: charCount > 0 ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.2)" }}>
              {charCount > 0 ? `${charCount} chars` : "be specific for better results"}
            </span>
          </div>
        </div>

        <div style={{
          position: "relative", borderRadius: 14, padding: 1,
          background: focused
            ? "linear-gradient(135deg, rgba(139,92,246,0.7), rgba(236,72,153,0.4))"
            : "rgba(255,255,255,0.08)",
          transition: "background 0.25s ease",
          boxShadow: focused ? "0 0 30px rgba(139,92,246,0.2)" : "none",
        }}>
          <textarea
            ref={textareaRef}
            id="idea-analysis"
            required
            rows={9}
            placeholder="e.g. A B2B SaaS that helps e-commerce brands recover abandoned carts via SMS. Built with Next.js and Supabase. Target: Shopify store owners doing $10k+/mo."
            onChange={e => { setCharCount(e.target.value.length); setIdeaText(e.target.value); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: "100%", display: "block",
              background: focused ? "rgba(15,8,40,0.95)" : "rgba(10,6,30,0.9)",
              borderRadius: 13, border: "none", outline: "none",
              padding: "16px 18px",
              fontSize: "0.9rem", color: "rgba(255,255,255,0.88)",
              lineHeight: 1.72, resize: "vertical", minHeight: 200,
              caretColor: "#a78bfa",
              transition: "background 0.25s ease",
              fontFamily: "inherit",
            }}
          />
          {/* Voice input button */}
          <button
            type="button"
            onClick={startVoice}
            title={listening ? "Listening..." : "Voice input"}
            style={{
              position: "absolute", bottom: 10, right: 10,
              width: 30, height: 30, borderRadius: 8,
              background: listening ? "rgba(239,68,68,0.15)" : "rgba(139,92,246,0.1)",
              border: `1px solid ${listening ? "rgba(239,68,68,0.35)" : "rgba(139,92,246,0.2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.15s ease",
              color: listening ? "#f87171" : "rgba(167,139,250,0.7)",
              fontSize: "0.9rem",
              animation: listening ? "pulseGlow 0.8s ease-in-out infinite" : "none",
            }}
          >
            🎤
          </button>
          {focused && !listening && (
            <div aria-hidden="true" style={{
              position: "absolute", bottom: 10, left: 12,
              width: 5, height: 5, borderRadius: "50%",
              background: "#a78bfa", boxShadow: "0 0 8px rgba(167,139,250,0.8)",
              animation: "pulseGlow 1.5s ease-in-out infinite",
            }} />
          )}
        </div>

        {listening && (
          <p style={{ fontSize: "0.73rem", color: "#f87171", margin: 0, textAlign: "center", animation: "pulseGlow 1s ease-in-out infinite" }}>
            🎤 Listening... speak your idea
          </p>
        )}

        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.22)", margin: 0, lineHeight: 1.5 }}>
          The more specific you are, the better your analysis.
        </p>
      </div>

      {/* Input clarity score */}
      {charCount >= 10 && (
        <div style={{ animation: "fadeInUp 0.3s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
              Input clarity
            </span>
            <span style={{
              fontSize: "0.75rem", fontWeight: 700,
              color: ideaScore.score >= 71 ? "#34d399" : ideaScore.score >= 41 ? "#fbbf24" : "#f87171",
            }}>
              {ideaScore.score}/100
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${ideaScore.score}%`, borderRadius: 9999,
              background: ideaScore.score >= 71 ? "linear-gradient(90deg,#059669,#34d399)" : ideaScore.score >= 41 ? "linear-gradient(90deg,#d97706,#fbbf24)" : "linear-gradient(90deg,#dc2626,#f87171)",
              transition: "width 0.4s ease, background 0.4s ease",
            }} />
          </div>
          {ideaScore.tip && (
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: "6px 0 0", lineHeight: 1.5 }}>
              💡 {ideaScore.tip}
            </p>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={charCount < 20}
        onMouseEnter={() => charCount >= 20 && setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          width: "100%",
          background: charCount < 20
            ? "rgba(109,40,217,0.25)"
            : btnHover
              ? "linear-gradient(135deg,#8b5cf6,#7c3aed)"
              : "linear-gradient(135deg,#7c3aed,#6d28d9)",
          border: "1px solid rgba(139,92,246,0.45)",
          color: charCount < 20 ? "rgba(255,255,255,0.3)" : "white",
          padding: "14px 20px", borderRadius: 12,
          fontSize: "0.95rem", fontWeight: 600,
          cursor: charCount < 20 ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: btnHover && charCount >= 20 ? "translateY(-2px)" : "translateY(0)",
          transition: "all 0.22s ease",
          minHeight: 50,
          position: "relative", overflow: "hidden",
        }}
      >
        {btnHover && charCount >= 20 && (
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
            animation: "shimmerSlide 1.2s ease infinite",
          }} />
        )}
        <span style={{ position: "relative", zIndex: 1 }}>Run analysis →</span>
      </button>
    </form>
  );
}
