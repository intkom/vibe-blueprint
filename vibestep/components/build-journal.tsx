"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type Entry = {
  id: string;
  content: string;
  mood: "crushing" | "grinding" | "stuck";
  created_at: string;
};

const MOODS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  crushing: { label: "🔥 Crushing it", color: "#f97316", bg: "rgba(249,115,22,0.1)",   border: "rgba(249,115,22,0.25)" },
  grinding: { label: "😤 Grinding",    color: "#a78bfa", bg: "rgba(139,92,246,0.1)",   border: "rgba(139,92,246,0.25)" },
  stuck:    { label: "😵 Stuck",       color: "#f87171", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"  },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function BuildJournal({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<"crushing" | "grinding" | "stuck">("grinding");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadEntries(); }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadEntries() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("build_journal")
      .select("id, content, mood, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(5);
    setEntries((data ?? []) as Entry[]);
    setLoading(false);
  }

  async function addEntry() {
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); setError("Not signed in."); return; }
    const { data, error: err } = await supabase
      .from("build_journal")
      .insert({ project_id: projectId, user_id: user.id, content: content.trim(), mood })
      .select("id, content, mood, created_at")
      .single();
    if (err) { setError(err.message); } else if (data) {
      setEntries(prev => [data as Entry, ...prev.slice(0, 4)]);
      setContent("");
    }
    setSubmitting(false);
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: 0 }}>
          Build Journal
        </p>
      </div>

      {/* Add entry */}
      <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What did you build today? Any blockers? What's next?"
          rows={3}
          style={{
            width: "100%", background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
            padding: "11px 14px", fontSize: "0.85rem",
            color: "rgba(255,255,255,0.72)", resize: "none", outline: "none",
            fontFamily: "inherit", lineHeight: 1.6, caretColor: "#a78bfa",
            transition: "border-color 0.15s", marginBottom: 10,
            boxSizing: "border-box",
          }}
          onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(139,92,246,0.4)"; }}
          onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Mood selector */}
          {(Object.entries(MOODS) as [string, { label: string; color: string; bg: string; border: string }][]).map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => setMood(k as "crushing" | "grinding" | "stuck")}
              style={{
                background: mood === k ? v.bg : "rgba(255,255,255,0.03)",
                border: `1px solid ${mood === k ? v.border : "rgba(255,255,255,0.08)"}`,
                color: mood === k ? v.color : "rgba(255,255,255,0.35)",
                padding: "5px 12px", borderRadius: 9999,
                fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {v.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={addEntry}
            disabled={!content.trim() || submitting}
            style={{
              background: content.trim() ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${content.trim() ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: content.trim() ? "white" : "rgba(255,255,255,0.25)",
              padding: "7px 18px", borderRadius: 9,
              fontSize: "0.8rem", fontWeight: 700,
              cursor: content.trim() ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
          >
            {submitting ? "Saving..." : "Log entry →"}
          </button>
        </div>
        {error && <p style={{ fontSize: "0.72rem", color: "#f87171", margin: "8px 0 0" }}>{error}</p>}
      </div>

      {/* Entries */}
      <div style={{ padding: "10px 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading && (
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.22)", textAlign: "center", padding: "16px 0", margin: 0 }}>
            Loading entries...
          </p>
        )}
        {!loading && entries.length === 0 && (
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.22)", textAlign: "center", padding: "16px 0", margin: 0, fontStyle: "italic" }}>
            No entries yet. Log your first session above.
          </p>
        )}
        {entries.map(entry => {
          const m = MOODS[entry.mood] ?? MOODS.grinding;
          return (
            <div key={entry.id} style={{
              background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 11, padding: "12px 14px",
              animation: "fadeInUp 0.3s ease both",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7, flexWrap: "wrap", gap: 6 }}>
                <span style={{
                  fontSize: "0.62rem", fontWeight: 700, color: m.color,
                  background: m.bg, border: `1px solid ${m.border}`,
                  padding: "2px 8px", borderRadius: 9999,
                }}>
                  {m.label}
                </span>
                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.22)" }}>
                  {fmtDate(entry.created_at)}
                </span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                {entry.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
