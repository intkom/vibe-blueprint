"use client";

import { ProjectCard, type ProjectRow, type StepStats } from "@/components/project-card";

type ProjectEntry = {
  project: ProjectRow;
  stats: StepStats;
  pct: number;
  isDone: boolean;
  toolType: string | null;
};

export function ProjectList({ entries }: { entries: ProjectEntry[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {entries.map((e, i) => (
        <div
          key={e.project.id}
          style={{
            animation: "fadeInUp 0.35s ease both",
            animationDelay: `${i * 0.06}s`,
          }}
        >
          <ProjectCard
            project={e.project}
            stats={e.stats}
            pct={e.pct}
            isDone={e.isDone}
            toolType={e.toolType}
          />
        </div>
      ))}
    </div>
  );
}
