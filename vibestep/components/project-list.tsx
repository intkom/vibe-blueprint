"use client";

import { useState, useMemo } from "react";
import { ProjectCard, type ProjectRow, type StepStats } from "@/components/project-card";

type ProjectEntry = {
  project: ProjectRow;
  stats: StepStats;
  pct: number;
  isDone: boolean;
  toolType: string | null;
};

type FilterTab = "all" | "progress" | "completed";

export function ProjectList({ entries }: { entries: ProjectEntry[] }) {
  const [tab, setTab] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = useMemo(() => {
    let list = entries;
    if (tab === "progress")   list = list.filter(e => !e.isDone);
    if (tab === "completed")  list = list.filter(e => e.isDone);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(e =>
        (e.project.title ?? "").toLowerCase().includes(q) ||
        (e.project.raw_idea ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, tab, query]);

  const counts = useMemo(() => ({
    all:       entries.length,
    progress:  entries.filter(e => !e.isDone).length,
    completed: entries.filter(e => e.isDone).length,
  }), [entries]);

  const TABS: { key: FilterTab; label: string; color: string }[] = [
    { key: "all",       label: `All (${counts.all})`,             color: "#c4b5fd" },
    { key: "progress",  label: `In Progress (${counts.progress})`, color: "#60a5fa" },
    { key: "completed", label: `Completed (${counts.completed})`,  color: "#34d399" },
  ];

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, flex: 1,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 11, padding: 4,
        }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "7px 10px", borderRadius: 8, border: "none",
                fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                transition: "all 0.18s ease",
                background: tab === t.key ? "rgba(255,255,255,0.08)" : "transparent",
                color: tab === t.key ? t.color : "rgba(255,255,255,0.32)",
                boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: 200 }}>
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{
              position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
              color: searchFocused ? "rgba(167,139,250,0.7)" : "rgba(255,255,255,0.2)",
              pointerEvents: "none", transition: "color 0.2s",
            }}
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search projects…"
            style={{
              paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              background: searchFocused ? "rgba(139,92,246,0.07)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${searchFocused ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 10, fontSize: "0.82rem", color: "rgba(255,255,255,0.8)",
              outline: "none", width: "100%",
              transition: "all 0.2s ease", caretColor: "#a78bfa",
              boxShadow: searchFocused ? "0 0 0 3px rgba(139,92,246,0.12)" : "none",
            }}
          />
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)",
          borderRadius: 16,
        }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", margin: 0 }}>
            {query ? `No projects match "${query}"` : "No projects in this filter."}
          </p>
        </div>
      ) : (
        <div
          key={`${tab}|${query}`}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 14 }}
        >
          {filtered.map((e, i) => (
            <div
              key={e.project.id}
              style={{
                animation: "fadeInUp 0.4s ease both",
                animationDelay: `${i * 0.055}s`,
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
      )}
    </>
  );
}
