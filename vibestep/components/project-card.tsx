"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteProject } from "@/app/actions/projects";

export type ProjectRow = {
  id: string;
  title: string | null;
  raw_idea: string | null;
  created_at?: string | null;
};

export type StepStats = {
  total: number;
  completed: number;
};

const TOOL_BADGE_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  validator:    { label: "Validator",      color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)"  },
  stack:        { label: "Blueprint",      color: "#a78bfa", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)"  },
  monetization: { label: "Monetization",   color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)"  },
  sprint:       { label: "Sprint Plan",    color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)"  },
};

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IconFolder() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  );
}

export function ProjectCard({
  project, stats, pct, isDone, toolType,
}: {
  project: ProjectRow;
  stats: StepStats;
  pct: number;
  isDone: boolean;
  toolType?: string | null;
}) {
  const hasSteps = stats.total > 0;
  const badge = toolType ? TOOL_BADGE_STYLE[toolType] : null;
  const [delHover, setDelHover] = useState(false);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${project.title?.trim() || "Untitled"}"? This cannot be undone.`)) {
      const fd = new FormData();
      fd.append("projectId", project.id);
      deleteProject(fd);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Delete button — floats above the card link */}
      <button
        type="button"
        onClick={handleDelete}
        onMouseEnter={() => setDelHover(true)}
        onMouseLeave={() => setDelHover(false)}
        title="Delete project"
        style={{
          position: "absolute", top: 12, right: 12, zIndex: 10,
          width: 28, height: 28, borderRadius: 7,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: delHover ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
          border: delHover ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(255,255,255,0.08)",
          color: delHover ? "#f87171" : "rgba(255,255,255,0.25)",
          cursor: "pointer", transition: "all 0.18s ease",
        }}
      >
        <TrashIcon />
      </button>

    <Link
      href={`/project/${project.id}`}
      style={{
        display: "block",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        border: isDone ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18, padding: "20px 22px",
        textDecoration: "none", color: "white",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        position: "relative", overflow: "hidden",
      }}
      onMouseOver={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(-3px)";
        el.style.borderColor = isDone ? "rgba(52,211,153,0.4)" : "rgba(139,92,246,0.4)";
        el.style.boxShadow = isDone
          ? "0 16px 40px rgba(52,211,153,0.1)"
          : "0 16px 40px rgba(139,92,246,0.12), 0 0 0 1px rgba(139,92,246,0.15)";
        el.style.background = "rgba(255,255,255,0.055)";
      }}
      onMouseOut={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(0)";
        el.style.borderColor = isDone ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.07)";
        el.style.boxShadow = "";
        el.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {/* Top beam */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: isDone
          ? "linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)"
          : "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)",
        opacity: 0,
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        {/* Left */}
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: isDone ? "#34d399" : "#a78bfa",
              boxShadow: isDone ? "0 0 8px rgba(52,211,153,0.7)" : "0 0 8px rgba(167,139,250,0.7)",
            }} />
            <h2 style={{
              fontSize: "0.975rem", fontWeight: 700, margin: 0,
              color: "rgba(255,255,255,0.9)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {project.title?.trim() || "Untitled"}
            </h2>
            {badge && (
              <span style={{
                fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                background: badge.bg, border: `1px solid ${badge.border}`,
                color: badge.color, padding: "2px 7px", borderRadius: 9999, flexShrink: 0,
              }}>
                {badge.label}
              </span>
            )}
            {isDone && (
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                flexShrink: 0,
                background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)",
                color: "#34d399", padding: "2px 8px", borderRadius: 9999,
              }}>Done</span>
            )}
          </div>

          {/* Idea preview */}
          {project.raw_idea && (
            <p style={{
              fontSize: "0.82rem", color: "rgba(255,255,255,0.32)", margin: "0 0 6px 15px",
              lineHeight: 1.6,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {project.raw_idea}
            </p>
          )}

          {/* Created date */}
          {project.created_at && (
            <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.18)", margin: "0 0 10px 15px" }}>
              {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}

          {/* Progress bar (sprint projects) */}
          {hasSteps ? (
            <div style={{ marginLeft: 15 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>Progress</span>
                <span style={{
                  fontSize: "0.7rem", fontWeight: 600,
                  color: isDone ? "rgba(52,211,153,0.8)" : "rgba(167,139,250,0.7)",
                }}>
                  {stats.completed}/{stats.total} steps · {pct}%
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 9999, width: `${pct}%`,
                  background: isDone ? "linear-gradient(90deg, #34d399, #6ee7b7)" : "linear-gradient(90deg, #7c3aed, #a78bfa, #ec4899)",
                  boxShadow: isDone ? "0 0 8px rgba(52,211,153,0.5)" : "0 0 8px rgba(139,92,246,0.5)",
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          ) : (
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", margin: "0 0 0 15px" }}>
              {badge && badge.label !== "Sprint Plan" ? "Tool output ready" : "No steps generated yet"}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0, marginTop: 2 }}>
          <IconChevron />
        </div>
      </div>
    </Link>
    </div>
  );
}
