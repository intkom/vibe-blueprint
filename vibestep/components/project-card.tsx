"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteProject } from "@/app/actions/projects";

export type ProjectRow = {
  id: string;
  title: string | null;
  raw_idea: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  analysis?: {
    health_score?: number;
    health_label?: string;
    risk_areas?: unknown[];
  } | null;
};

export type StepStats = {
  total: number;
  completed: number;
};

export function IconFolder() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

export function ProjectCard({
  project, stats, pct, isDone,
}: {
  project: ProjectRow;
  stats: StepStats;
  pct: number;
  isDone: boolean;
  toolType?: string | null;
}) {
  const hasAnalysis = !!project.analysis;
  const healthScore = project.analysis?.health_score;
  const healthLabel = project.analysis?.health_label;
  const riskCount = project.analysis?.risk_areas?.length ?? 0;
  const analysisHref = hasAnalysis ? `/project/${project.id}/analysis` : `/project/${project.id}`;

  function healthColor(score: number): string {
    if (score >= 76) return "#34d399";
    if (score >= 61) return "#60a5fa";
    if (score >= 41) return "#fbbf24";
    if (score >= 21) return "#fb923c";
    return "#f87171";
  }

  const [hover,    setHover]    = useState(false);
  const [delHover, setDelHover] = useState(false);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (confirm(`Delete "${project.title?.trim() || "Untitled"}"? This cannot be undone.`)) {
      const fd = new FormData();
      fd.append("projectId", project.id);
      deleteProject(fd);
    }
  }

  return (
    <div
      style={{ position:"relative" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setDelHover(false); }}
    >
      {/* Delete button — visible on hover */}
      <button
        type="button"
        onClick={handleDelete}
        onMouseEnter={() => setDelHover(true)}
        onMouseLeave={() => setDelHover(false)}
        title="Delete project"
        style={{
          position:"absolute", top:16, right:16, zIndex:10,
          width:28, height:28, borderRadius:7,
          display:"flex", alignItems:"center", justifyContent:"center",
          background: delHover ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
          border: delHover ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(255,255,255,0.08)",
          color: delHover ? "#f87171" : "rgba(255,255,255,0.28)",
          cursor:"pointer", transition:"all 0.15s ease",
          opacity: hover ? 1 : 0,
          pointerEvents: hover ? "auto" : "none",
        }}
      ><TrashIcon /></button>

      <Link
        href={analysisHref}
        style={{
          display:"block", textDecoration:"none", color:"inherit",
          background: hover
            ? isDone ? "rgba(52,211,153,0.04)" : "rgba(139,92,246,0.05)"
            : "rgba(255,255,255,0.025)",
          border: hover
            ? isDone ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(139,92,246,0.38)"
            : isDone ? "1px solid rgba(52,211,153,0.18)" : "1px solid rgba(255,255,255,0.08)",
          borderRadius:16,
          padding:"24px 26px",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hover
            ? isDone
              ? "0 16px 48px rgba(52,211,153,0.08), 0 2px 10px rgba(0,0,0,0.35)"
              : "0 16px 48px rgba(139,92,246,0.12), 0 2px 10px rgba(0,0,0,0.35)"
            : "0 2px 6px rgba(0,0,0,0.2)",
          transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)",
          position:"relative", overflow:"hidden",
        }}
      >
        {/* Top glow line on hover */}
        <div aria-hidden="true" style={{
          position:"absolute", top:0, left:"15%", right:"15%", height:1,
          background: isDone
            ? "linear-gradient(90deg,transparent,rgba(52,211,153,0.6),transparent)"
            : "linear-gradient(90deg,transparent,rgba(139,92,246,0.6),transparent)",
          opacity: hover ? 1 : 0,
          transition:"opacity 0.22s ease",
        }} />

        {/* Status badges */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:6,
            fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase",
            padding:"3px 10px", borderRadius:9999,
            background: isDone ? "rgba(52,211,153,0.1)" : "rgba(139,92,246,0.1)",
            border:`1px solid ${isDone ? "rgba(52,211,153,0.28)" : "rgba(139,92,246,0.28)"}`,
            color: isDone ? "#34d399" : "#a78bfa",
          }}>
            <span style={{
              width:5, height:5, borderRadius:"50%",
              background: isDone ? "#34d399" : "#a78bfa",
              boxShadow: isDone ? "0 0 6px rgba(52,211,153,0.9)" : "0 0 6px rgba(167,139,250,0.9)",
              animation: isDone ? "none" : "pulseGlow 2s ease-in-out infinite",
              flexShrink:0,
            }} />
            {isDone ? "Complete" : "In Progress"}
          </span>
          {hasAnalysis && healthScore !== undefined && (
            <span style={{
              display:"inline-flex", alignItems:"center", gap:5,
              fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
              padding:"3px 10px", borderRadius:9999,
              background: `${healthColor(healthScore)}12`,
              border:`1px solid ${healthColor(healthScore)}35`,
              color: healthColor(healthScore),
            }}>
              ◉ {healthScore} — {healthLabel}
            </span>
          )}
          {hasAnalysis && riskCount > 0 && (
            <span style={{
              fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
              padding:"3px 10px", borderRadius:9999,
              background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.22)", color:"#f87171",
            }}>
              {riskCount} risk{riskCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize:"1.1rem", fontWeight:700, margin:"0 0 8px",
          color:"rgba(255,255,255,0.92)", letterSpacing:"-0.015em", lineHeight:1.25,
          paddingRight:36,
        }}>
          {project.title?.trim() || "Untitled"}
        </h2>

        {/* Idea preview */}
        {project.raw_idea && (
          <p style={{
            fontSize:"0.845rem", color:"rgba(255,255,255,0.36)",
            margin:"0 0 20px", lineHeight:1.65,
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
            overflow:"hidden",
          }}>
            {project.raw_idea}
          </p>
        )}

        {/* Progress */}
        {stats.total > 0 ? (
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.38)", fontWeight:500 }}>
                {stats.completed} of {stats.total} steps complete
              </span>
              <span style={{
                fontSize:"0.75rem", fontWeight:700,
                color: isDone ? "#34d399" : "#a78bfa",
              }}>{pct}%</span>
            </div>
            <div style={{ height:5, borderRadius:9999, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:9999, width:`${pct}%`,
                background: isDone
                  ? "linear-gradient(90deg,#059669,#34d399)"
                  : "linear-gradient(90deg,#7c3aed,#a78bfa,#c084fc)",
                boxShadow: isDone ? "0 0 8px rgba(52,211,153,0.5)" : "0 0 8px rgba(139,92,246,0.5)",
                transition:"width 0.6s ease",
              }} />
            </div>
          </div>
        ) : (
          <div style={{ height:5, borderRadius:9999, background:"rgba(255,255,255,0.04)", marginBottom:20 }} />
        )}

        {/* Footer */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
          paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ fontSize:"0.73rem", color:"rgba(255,255,255,0.22)" }}>
            {project.created_at ? formatDate(project.created_at) : ""}
          </span>

          {/* CTA button */}
          <span style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"6px 14px", borderRadius:8,
            fontSize:"0.78rem", fontWeight:600,
            background: hover
              ? isDone ? "rgba(52,211,153,0.12)" : "rgba(139,92,246,0.15)"
              : isDone ? "rgba(52,211,153,0.07)" : "rgba(139,92,246,0.08)",
            border: `1px solid ${isDone ? "rgba(52,211,153,0.25)" : "rgba(139,92,246,0.25)"}`,
            color: isDone ? "#34d399" : "#a78bfa",
            transition:"all 0.18s ease",
          }}>
            {hasAnalysis ? "View Analysis →" : isDone ? "View analysis" : "Continue building"}
            <ArrowRight />
          </span>
        </div>
      </Link>
    </div>
  );
}
