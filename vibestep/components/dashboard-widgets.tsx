"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { StreamEvent } from "@/app/api/analyze/route";
import type { AnalysisData } from "@/app/api/analyze/route";

type FocusProject = {
  id: string;
  title: string;
  health_score?: number;
  health_label?: string;
  lastActivity: string;
};

/* ── Today's Focus ──────────────────────────────────────── */
export function TodayFocusWidget({ project }: { project: FocusProject | null }) {
  if (!project) return null;
  const color = project.health_score
    ? project.health_score >= 76 ? "#34d399" : project.health_score >= 61 ? "#60a5fa" : project.health_score >= 41 ? "#fbbf24" : "#fb923c"
    : "#a78bfa";

  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}08, rgba(255,255,255,0.015))`,
      border: `1px solid ${color}22`,
      borderRadius: 14, padding: "18px 20px",
      animation: "fadeInUp 0.4s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem",
        }}>
          🎯
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: `${color}80`, margin: "0 0 4px" }}>
            Today&apos;s Focus
          </p>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.82)", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {project.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {project.health_score !== undefined && (
              <span style={{ fontSize: "0.68rem", color, fontWeight: 700 }}>{project.health_score}/100 {project.health_label}</span>
            )}
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.28)" }}>Last active {project.lastActivity}</span>
          </div>
        </div>
        <a
          href={`/project/${project.id}/analysis`}
          style={{
            flexShrink: 0,
            background: `${color}18`, border: `1px solid ${color}35`,
            color, padding: "7px 14px", borderRadius: 9,
            fontSize: "0.75rem", fontWeight: 700, textDecoration: "none",
            transition: "all 0.15s ease", whiteSpace: "nowrap",
          }}
        >
          Start working →
        </a>
      </div>
    </div>
  );
}

/* ── Quick Analyze ─────────────────────────────────────── */
export function QuickAnalyzeWidget() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [val, setVal] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function run() {
    const idea = val.trim();
    if (idea.length < 20) return;
    setPhase("loading");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      if (!res.ok || !res.body) throw new Error("Request failed");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as StreamEvent;
            if (event.type === "error") throw new Error(event.message);
            if (event.type === "done") {
              router.push(`/project/${event.projectId}/analysis`);
              return;
            }
          } catch (pe) {
            if (pe instanceof SyntaxError) continue;
            throw pe;
          }
        }
      }
    } catch (err) {
      setPhase("error");
      setErrMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, padding: "18px 20px",
      animation: "fadeInUp 0.4s ease 0.08s both",
    }}>
      <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(167,139,250,0.5)", margin: "0 0 10px" }}>
        Quick Analyze
      </p>
      <textarea
        ref={textareaRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Describe your build in 1–2 sentences..."
        rows={3}
        disabled={phase === "loading"}
        style={{
          width: "100%", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9,
          padding: "10px 13px", fontSize: "0.85rem",
          color: "rgba(255,255,255,0.75)", resize: "none", outline: "none",
          fontFamily: "inherit", lineHeight: 1.6, caretColor: "#a78bfa",
          transition: "border-color 0.15s", marginBottom: 10,
          boxSizing: "border-box",
        }}
        onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(139,92,246,0.4)"; }}
        onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
        onKeyDown={e => { if (e.key === "Enter" && e.metaKey) run(); }}
      />
      {errMsg && <p style={{ fontSize: "0.72rem", color: "#f87171", margin: "0 0 8px" }}>{errMsg}</p>}
      <button
        type="button"
        onClick={run}
        disabled={val.trim().length < 20 || phase === "loading"}
        style={{
          width: "100%",
          background: val.trim().length >= 20 ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${val.trim().length >= 20 ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
          color: val.trim().length >= 20 ? "white" : "rgba(255,255,255,0.25)",
          padding: "10px", borderRadius: 9,
          fontSize: "0.85rem", fontWeight: 700,
          cursor: val.trim().length >= 20 && phase !== "loading" ? "pointer" : "not-allowed",
          transition: "all 0.2s ease",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        {phase === "loading" ? (
          <>
            <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }} />
            Analyzing...
          </>
        ) : "Quick analyze →"}
      </button>
    </div>
  );
}

/* ── Recent Insights ───────────────────────────────────── */
export function RecentInsightsWidget({ insights }: { insights: Array<{ projectId: string; projectTitle: string; insight: string; type: string }> }) {
  if (insights.length === 0) return null;

  const typeColor: Record<string, string> = { health: "#34d399", risk: "#f87171", competitor: "#fbbf24", step: "#a78bfa" };

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, overflow: "hidden",
      animation: "fadeInUp 0.4s ease 0.12s both",
    }}>
      <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: 0 }}>
          Recent Insights
        </p>
      </div>
      {insights.map((ins, i) => {
        const c = typeColor[ins.type] ?? "#a78bfa";
        return (
          <div key={i} style={{
            padding: "12px 18px",
            borderBottom: i < insights.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0, marginTop: 6 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.72rem", color: c, fontWeight: 600, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ins.projectTitle}
              </p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.55, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {ins.insight}
              </p>
            </div>
            <a href={`/project/${ins.projectId}/analysis`} style={{ flexShrink: 0, fontSize: "0.65rem", color: "rgba(255,255,255,0.22)", textDecoration: "none", marginTop: 2 }}>View →</a>
          </div>
        );
      })}
    </div>
  );
}

// Type export for server usage
export type { FocusProject };
export type InsightItem = { projectId: string; projectTitle: string; insight: string; type: string };
