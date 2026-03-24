"use client";

import { useState } from "react";
import type { FollowUpQuestion, DeepAnalysisData } from "@/app/api/analyze/route";
import type { RefineEvent } from "@/app/api/analyze/refine/route";

interface FollowUpQuestionsProps {
  questions: FollowUpQuestion[];
  projectId: string;
  onAnalysisUpdated: (analysis: DeepAnalysisData) => void;
}

export function FollowUpQuestions({ questions, projectId, onAnalysisUpdated }: FollowUpQuestionsProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [phase, setPhase] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const hasAnswers = Object.values(answers).some(a => a.trim().length > 0);

  async function handleRefine() {
    if (!hasAnswers) return;
    setPhase("loading");
    setProgress(0);
    setLog(["Submitting your answers..."]);

    try {
      const res = await fetch("/api/analyze/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          questions: questions.map(q => q.question),
          answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v])),
        }),
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
            const event = JSON.parse(line) as RefineEvent;
            if (event.type === "progress") {
              setLog(prev => [...prev, event.message]);
              setProgress(event.pct);
            }
            if (event.type === "done") {
              setPhase("done");
              setProgress(100);
              onAnalysisUpdated(event.analysis);
            }
            if (event.type === "error") throw new Error(event.message);
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err) {
      setPhase("error");
      setLog(prev => [...prev, err instanceof Error ? err.message : "Failed"]);
    }
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          width: "100%", textAlign: "left",
          background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.15)",
          borderRadius: 12, padding: "12px 16px",
          cursor: "pointer", transition: "all 0.15s",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(167,139,250,0.7)" }}>
          ✦ {questions.length} questions that would sharpen your analysis
        </span>
        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>Expand ›</span>
      </button>
    );
  }

  return (
    <div style={{
      background: "rgba(167,139,250,0.04)",
      border: "1px solid rgba(167,139,250,0.18)",
      borderRadius: 16, overflow: "hidden",
      animation: "fadeIn 0.3s ease",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(167,139,250,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(167,139,250,0.55)", margin: "0 0 3px" }}>
            Axiom has questions
          </p>
          <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "rgba(255,255,255,0.8)", margin: 0 }}>
            {questions.length} questions that would sharpen your analysis
          </p>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: "0.9rem", padding: 4 }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Questions */}
        {phase === "idle" || phase === "error" ? (
          <>
            {questions.map((q, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 7 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 800, color: "#a78bfa",
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", margin: "0 0 2px", lineHeight: 1.5 }}>
                      {q.question}
                    </p>
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.28)", margin: 0, lineHeight: 1.5 }}>
                      Improves: {q.section} — {q.why}
                    </p>
                  </div>
                </div>
                <textarea
                  value={answers[i] ?? ""}
                  onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                  placeholder="Your answer..."
                  rows={2}
                  style={{
                    width: "100%", display: "block",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, padding: "10px 14px",
                    fontSize: "0.82rem", color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.6, resize: "vertical",
                    outline: "none", fontFamily: "inherit",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = "rgba(167,139,250,0.4)"; }}
                  onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
            ))}

            {phase === "error" && (
              <p style={{ fontSize: "0.78rem", color: "#f87171", margin: 0 }}>
                Refinement failed. Please try again.
              </p>
            )}

            <button
              onClick={handleRefine}
              disabled={!hasAnswers}
              style={{
                background: hasAnswers
                  ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                  : "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.4)",
                color: hasAnswers ? "white" : "rgba(255,255,255,0.25)",
                padding: "11px 20px", borderRadius: 10,
                fontSize: "0.875rem", fontWeight: 700,
                cursor: hasAnswers ? "pointer" : "not-allowed",
                width: "100%", transition: "all 0.2s ease",
              }}
            >
              Update analysis with answers →
            </button>
          </>
        ) : phase === "loading" ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(167,139,250,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Re-analyzing
              </span>
              <span style={{ fontSize: "0.72rem", color: "rgba(167,139,250,0.7)", fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(167,139,250,0.1)", borderRadius: 9999, overflow: "hidden", marginBottom: 14 }}>
              <div style={{
                height: "100%", width: `${progress}%`,
                background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
                transition: "width 0.5s ease", borderRadius: 9999,
              }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {log.slice(-3).map((msg, i) => (
                <div key={i} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa", flexShrink: 0 }} />
                  {msg}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0" }}>
            <span style={{ color: "#34d399", fontSize: "1.1rem" }}>✓</span>
            <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#34d399", margin: 0 }}>
              Analysis updated with your answers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
