"use client";

import { useState, useEffect, useRef } from "react";

export function StepNotes({ stepId }: { stepId: string }) {
  const key = `axiom_note_${stepId}`;
  const [notes, setNotes] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) setNotes(saved);
  }, [key]);

  function handleChange(val: string) {
    setNotes(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      localStorage.setItem(key, val);
      setLastSaved(new Date());
    }, 800);
  }

  function formatSaved(d: Date) {
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  }

  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          color: notes ? "rgba(167,139,250,0.7)" : "rgba(255,255,255,0.22)",
          fontSize: "0.72rem", fontWeight: 500, padding: 0,
          transition: "color 0.18s ease",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        {open ? "Hide notes" : notes ? "My notes" : "Add notes"}
        {notes && !open && (
          <span style={{
            width: 5, height: 5, borderRadius: "50%", background: "#a78bfa", display: "inline-block",
          }} />
        )}
      </button>

      {open && (
        <div style={{ marginTop: 8 }}>
          <textarea
            value={notes}
            onChange={e => handleChange(e.target.value)}
            placeholder="Jot down your notes, links, or blockers for this step…"
            rows={4}
            style={{
              width: "100%", resize: "vertical",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "10px 13px",
              color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", lineHeight: 1.65,
              outline: "none", fontFamily: "inherit",
              transition: "border-color 0.18s ease",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.45)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          />
          {lastSaved && (
            <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.18)", marginTop: 4 }}>
              Saved {formatSaved(lastSaved)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
