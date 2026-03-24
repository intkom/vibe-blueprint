"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { AnalysisData } from "@/app/api/analyze/route";

type SearchItem = {
  id: string;
  title: string;
  excerpt: string;
  type: "project" | "risk" | "step" | "competitor";
  url: string;
  score: number;
};

function fuzzy(haystack: string, needle: string): boolean {
  if (!needle) return true;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let hi = 0;
  for (let ni = 0; ni < n.length; ni++) {
    const found = h.indexOf(n[ni], hi);
    if (found === -1) return false;
    hi = found + 1;
  }
  return true;
}

function score(text: string, q: string): number {
  const t = text.toLowerCase();
  const n = q.toLowerCase();
  if (t === n) return 100;
  if (t.startsWith(n)) return 80;
  if (t.includes(n)) return 60;
  if (fuzzy(t, n)) return 20;
  return 0;
}

type ProjectRow = {
  id: string;
  title: string | null;
  raw_idea: string | null;
  analysis: AnalysisData | null;
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (projects.length === 0) loadProjects();
    } else {
      setQuery("");
      setActiveIdx(0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProjects() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("projects")
      .select("id, title, raw_idea, analysis")
      .order("updated_at", { ascending: false })
      .limit(50);
    setProjects((data ?? []) as ProjectRow[]);
    setLoading(false);
  }

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    const items: SearchItem[] = [];

    for (const p of projects) {
      const title = p.title ?? "Untitled";
      const idea = p.raw_idea ?? "";
      const titleScore = score(title, q);
      const ideaScore = Math.floor(score(idea, q) * 0.6);
      const best = Math.max(titleScore, ideaScore);
      if (best > 0) {
        items.push({
          id: `proj-${p.id}`,
          title,
          excerpt: idea.length > 80 ? idea.slice(0, 80) + "…" : idea,
          type: "project",
          url: p.analysis ? `/project/${p.id}/analysis` : `/project/${p.id}`,
          score: best,
        });
      }

      // Search analysis sections
      const a = p.analysis;
      if (a) {
        for (const r of a.risk_areas ?? []) {
          const s = score(r.title + " " + r.description, q);
          if (s > 0) items.push({
            id: `risk-${p.id}-${r.title}`,
            title: r.title,
            excerpt: `${title} · ${r.severity} risk`,
            type: "risk",
            url: `/project/${p.id}/analysis#s3`,
            score: s,
          });
        }
        for (const step of a.execution_path ?? []) {
          const s = score(step.title + " " + step.description, q);
          if (s > 0) items.push({
            id: `step-${p.id}-${step.step}`,
            title: `Step ${step.step}: ${step.title}`,
            excerpt: `${title} · ~${step.estimated_hours}h`,
            type: "step",
            url: `/project/${p.id}/analysis#s6`,
            score: s,
          });
        }
        for (const c of a.competitor_analysis ?? []) {
          const s = score(c.name, q);
          if (s > 0) items.push({
            id: `comp-${p.id}-${c.name}`,
            title: c.name,
            excerpt: `${title} · competitor`,
            type: "competitor",
            url: `/project/${p.id}/analysis#s9`,
            score: s,
          });
        }
      }
    }

    items.sort((a, b) => b.score - a.score);
    setResults(items.slice(0, 10));
    setActiveIdx(0);
  }, [projects]);

  useEffect(() => { search(query); }, [query, search]);

  function navigate(url: string) {
    setOpen(false);
    router.push(url);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const list = query ? results : [];
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, list.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && list[activeIdx]) navigate(list[activeIdx].url);
  }

  const typeIcon: Record<string, string> = { project: "✦", risk: "⚠", step: "→", competitor: "vs" };
  const typeColor: Record<string, string> = {
    project: "#a78bfa", risk: "#f87171", step: "#34d399", competitor: "#fbbf24",
  };

  if (!open) return null;

  const displayList = query ? results : projects.slice(0, 8).map(p => ({
    id: `proj-${p.id}`,
    title: p.title ?? "Untitled",
    excerpt: (p.raw_idea ?? "").slice(0, 80) + ((p.raw_idea?.length ?? 0) > 80 ? "…" : ""),
    type: "project" as const,
    url: p.analysis ? `/project/${p.id}/analysis` : `/project/${p.id}`,
    score: 100,
  }));

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 900,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        zIndex: 901, width: "min(600px, 92vw)",
        background: "#08051a",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: 18,
        boxShadow: "0 0 80px rgba(139,92,246,0.18), 0 32px 80px rgba(0,0,0,0.9)",
        overflow: "hidden",
        animation: "scaleIn 0.18s ease",
      }}>
        {/* Input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, steps, risks..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: "0.95rem", color: "rgba(255,255,255,0.85)",
              fontFamily: "inherit", caretColor: "#a78bfa",
            }}
          />
          <kbd style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 5, padding: "3px 7px", fontSize: "0.65rem",
            color: "rgba(255,255,255,0.3)", fontFamily: "monospace", flexShrink: 0,
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 380, overflowY: "auto" }}>
          {loading && (
            <div style={{ padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>
              Loading projects...
            </div>
          )}
          {!loading && displayList.length === 0 && query && (
            <div style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.82rem" }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {!loading && !query && displayList.length === 0 && (
            <div style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.82rem" }}>
              No projects yet. <a href="/create" style={{ color: "#a78bfa", textDecoration: "none" }}>Create your first →</a>
            </div>
          )}
          {!loading && displayList.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.url)}
              onMouseEnter={() => setActiveIdx(i)}
              style={{
                width: "100%", textAlign: "left", background: i === activeIdx ? "rgba(139,92,246,0.08)" : "none",
                border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)",
                padding: "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                transition: "background 0.1s ease",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: `${typeColor[item.type]}12`, border: `1px solid ${typeColor[item.type]}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.65rem", color: typeColor[item.type], fontWeight: 700,
              }}>
                {typeIcon[item.type]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.82)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.title}
                </p>
                {item.excerpt && (
                  <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.32)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.excerpt}
                  </p>
                )}
              </div>
              <span style={{ fontSize: "0.62rem", color: typeColor[item.type], background: `${typeColor[item.type]}12`, padding: "2px 7px", borderRadius: 9999, flexShrink: 0 }}>
                {item.type}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", gap: 16,
          background: "rgba(0,0,0,0.15)",
        }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["Esc", "close"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <kbd style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 6px", fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{k}</kbd>
              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
