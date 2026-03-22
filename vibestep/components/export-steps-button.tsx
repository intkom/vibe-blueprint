"use client";

import { useState } from "react";

type Step = {
  step_index: number;
  phase: string | null;
  title: string | null;
  objective: string | null;
  guidance: string | null;
  status: string | null;
};

export function ExportStepsButton({ steps, projectTitle }: { steps: Step[]; projectTitle: string }) {
  const [copied, setCopied] = useState(false);

  function handleExport() {
    const lines: string[] = [
      `# ${projectTitle}`,
      `# VibeStep Build Plan — ${steps.length} Steps`,
      `# Exported ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      "",
    ];

    for (const step of steps) {
      const status = step.status === "complete" ? "[✓ Done]" : "[ ]";
      lines.push(`${status} Step ${step.step_index + 1}: ${step.title?.trim() ?? "Untitled"}`);
      if (step.phase) lines.push(`Phase: ${step.phase.charAt(0).toUpperCase() + step.phase.slice(1)}`);
      if (step.objective) lines.push(`Objective: ${step.objective.trim()}`);
      if (step.guidance) lines.push(`Guidance: ${step.guidance.trim()}`);
      lines.push("");
    }

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: copied ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
        border: copied ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 9, padding: "6px 13px",
        fontSize: "0.75rem", fontWeight: 600,
        color: copied ? "#34d399" : "rgba(255,255,255,0.45)",
        cursor: "pointer", transition: "all 0.2s ease",
      }}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          Export as text
        </>
      )}
    </button>
  );
}
