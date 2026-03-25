"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteProject } from "@/app/actions/projects";

export type AnalysisListEntry = {
  id: string;
  title: string;
  pct: number;
  isDone: boolean;
  health_score?: number;
  health_label?: string;
};

function healthColor(score?: number) {
  if (!score) return "#a78bfa";
  if (score >= 76) return "#34d399";
  if (score >= 61) return "#60a5fa";
  if (score >= 41) return "#fbbf24";
  return "#fb923c";
}

function AnalysisRow({ entry }: { entry: AnalysisListEntry }) {
  const [hovered, setHovered] = useState(false);
  const dotColor = entry.isDone ? "#34d399" : "#60a5fa";
  const hc = healthColor(entry.health_score);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "13px 16px",
        background: hovered ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 11,
        transition: "background 0.15s ease",
      }}
    >
      {/* Status dot */}
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: dotColor,
        flexShrink: 0,
        boxShadow: `0 0 6px ${dotColor}60`,
      }} />

      {/* Title */}
      <span style={{
        flex: "0 0 auto", maxWidth: 260,
        fontSize: "0.875rem", fontWeight: 600,
        color: "rgba(255,255,255,0.82)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {entry.title || "Untitled"}
      </span>

      {/* Progress bar */}
      <div style={{ flex: 1, minWidth: 60, maxWidth: 200 }}>
        <div style={{
          height: 4, borderRadius: 9999,
          background: "rgba(255,255,255,0.07)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 9999,
            width: `${entry.pct}%`,
            background: entry.isDone
              ? "linear-gradient(90deg,#34d399,#059669)"
              : "linear-gradient(90deg,#7c3aed,#a78bfa)",
            transition: "width 0.3s ease",
          }} />
        </div>
        <span style={{
          fontSize: "0.6rem", color: "rgba(255,255,255,0.28)",
          marginTop: 2, display: "block",
        }}>
          {entry.pct}%
        </span>
      </div>

      {/* Health badge */}
      {entry.health_score !== undefined && (
        <span style={{
          fontSize: "0.65rem", fontWeight: 700,
          color: hc,
          background: `${hc}12`,
          border: `1px solid ${hc}30`,
          padding: "3px 9px", borderRadius: 9999,
          flexShrink: 0, whiteSpace: "nowrap",
        }}>
          {entry.health_score}/100
        </span>
      )}

      {/* View → */}
      <Link
        href={`/project/${entry.id}/analysis`}
        style={{
          flexShrink: 0,
          fontSize: "0.75rem", fontWeight: 700,
          color: "#a78bfa", textDecoration: "none",
          padding: "5px 12px", borderRadius: 8,
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          transition: "all 0.15s ease",
          whiteSpace: "nowrap",
        }}
      >
        View →
      </Link>

      {/* Delete button — visible on hover */}
      <form
        action={deleteProject}
        style={{ flexShrink: 0, opacity: hovered ? 1 : 0, transition: "opacity 0.15s ease" }}
      >
        <input type="hidden" name="projectId" value={entry.id} />
        <button
          type="submit"
          onClick={e => {
            if (!confirm(`Delete "${entry.title?.trim() || "Untitled"}"? This cannot be undone.`)) {
              e.preventDefault();
            }
          }}
          title="Delete"
          style={{
            background: "none", border: "none",
            cursor: "pointer", padding: "4px 6px",
            color: "rgba(248,113,113,0.5)",
            borderRadius: 6,
            fontSize: "0.85rem",
            lineHeight: 1,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.5)"; }}
        >
          ✕
        </button>
      </form>
    </div>
  );
}

export function DashboardAnalysesList({ entries }: { entries: AnalysisListEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {entries.map(e => <AnalysisRow key={e.id} entry={e} />)}
    </div>
  );
}
