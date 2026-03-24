"use client";

import { useState, useEffect, useRef } from "react";
import { Render } from "@/components/action-panel";
import type { AnalysisData } from "@/app/api/analyze/route";

const CHIPS = [
  "Review my execution path",
  "What should I build first?",
  "How do I reduce my top risk?",
  "Give me a code snippet for step 1",
  "What would a senior dev change?",
];

type Msg = { role: "user" | "assistant"; content: string };

export function WorkspaceChat({
  projectId,
  projectIdea,
  projectTitle,
  analysis,
}: {
  projectId: string;
  projectIdea: string;
  projectTitle: string;
  analysis: AnalysisData;
}) {
  const KEY = `axiom_chat_${projectId}`;
  const [history, setHistory] = useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Msg[]; } catch { return []; }
  });
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(history)); } catch { }
  }, [history, KEY]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [streamText, history]);

  useEffect(() => () => abort.current?.abort(), []);

  const ctx = {
    health_score: analysis.health_score,
    health_label: analysis.health_label,
    summary: analysis.summary,
    risk_areas: (analysis.risk_areas ?? []).map(r => `${r.severity}: ${r.title} — ${r.description}`).join("\n"),
    execution_path: (analysis.execution_path ?? []).map(s => `${s.step}. ${s.title} (~${s.estimated_hours}h): ${s.description}`).join("\n"),
    architecture: (analysis.architecture_insights ?? []).map(a => `${a.layer}: ${a.recommendation}`).join(", "),
    competitors: (analysis.competitor_analysis ?? []).map(c => c.name).join(", "),
  };

  async function run(msgs: Msg[]) {
    abort.current?.abort();
    abort.current = new AbortController();
    setStreaming(true);
    setStreamText("");
    let acc = "";
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ask", projectIdea, projectTitle, context: ctx, messages: msgs }),
        signal: abort.current.signal,
      });
      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setStreamText(acc);
      }
      setHistory(h => {
        const next = [...h, { role: "assistant" as const, content: acc }];
        try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { }
        return next;
      });
      setStreamText("");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setHistory(h => [...h, { role: "assistant", content: "⚠ Connection error. Try again." }]);
      }
    }
    setStreaming(false);
  }

  function sendMsg(text: string) {
    if (streaming || !text.trim()) return;
    const msgs: Msg[] = [...history, { role: "user", content: text }];
    setHistory(msgs);
    setInput("");
    run(msgs);
  }

  function exportChat() {
    const md = history.map(m => `**${m.role === "user" ? "You" : "Axiom"}:**\n${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([`# Axiom Chat — ${projectTitle}\n\n${md}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectTitle.toLowerCase().replace(/\s+/g, "-")}-chat.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearChat() {
    setHistory([]);
    try { localStorage.removeItem(KEY); } catch { }
  }

  const isEmpty = history.length === 0 && !streaming && !streamText;

  const btnBase: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
    color: "rgba(255,255,255,0.38)", padding: "4px 10px", borderRadius: 7,
    fontSize: "0.67rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
  };

  return (
    <div style={{
      width: 380, flexShrink: 0,
      borderLeft: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(5,2,20,0.98)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(139,92,246,0.04)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.9rem", color: "#a78bfa",
        }}>✦</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.57rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(167,139,250,0.5)", margin: 0 }}>
            AI Workspace
          </p>
          <h3 style={{ fontSize: "0.82rem", fontWeight: 700, margin: 0, color: "rgba(255,255,255,0.75)", letterSpacing: "-0.01em" }}>
            Axiom Chat
          </h3>
        </div>
        {history.length > 0 && (
          <div style={{ display: "flex", gap: 5 }}>
            <button type="button" onClick={exportChat} style={btnBase}>↓</button>
            <button type="button" onClick={clearChat} style={{ ...btnBase, color: "rgba(248,113,113,0.55)" }}>Clear</button>
          </div>
        )}
        {streaming && (
          <div style={{ display: "flex", gap: 3 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#a78bfa", opacity: 0.6, animation: `pulseGlow 1.2s ease-in-out ${i * 0.18}s infinite` }} />)}
          </div>
        )}
      </div>

      {/* Quick chips — shown when empty */}
      {isEmpty && (
        <div style={{ padding: "16px 14px 4px", flexShrink: 0 }}>
          <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 8px" }}>
            Quick prompts
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {CHIPS.map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => sendMsg(chip)}
                style={{
                  background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.14)",
                  borderRadius: 8, padding: "8px 11px",
                  fontSize: "0.76rem", color: "rgba(255,255,255,0.42)", cursor: "pointer",
                  textAlign: "left", lineHeight: 1.4, transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(139,92,246,0.11)"; b.style.borderColor = "rgba(139,92,246,0.28)"; b.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(139,92,246,0.05)"; b.style.borderColor = "rgba(139,92,246,0.14)"; b.style.color = "rgba(255,255,255,0.42)"; }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: "auto", padding: "14px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {history.map((msg, i) => {
          if (msg.role === "user") return (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "10px 10px 3px 10px", padding: "8px 11px", maxWidth: "88%",
                fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5,
              }}>
                {msg.content}
              </div>
            </div>
          );
          return (
            <div key={i} style={{ opacity: i === history.length - 1 && !streaming ? 1 : 0.52, transition: "opacity 0.2s" }}>
              {i > 0 && history[i - 1]?.role === "assistant" && (
                <div style={{ height: 1, background: "rgba(255,255,255,0.04)", marginBottom: 12 }} />
              )}
              <Render text={msg.content} />
            </div>
          );
        })}

        {streaming && streamText && <Render text={streamText} />}
        {streaming && !streamText && (
          <div style={{ display: "flex", gap: 5, padding: "4px 0" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", opacity: 0.4, animation: `pulseGlow 1.3s ease-in-out ${i*0.2}s infinite` }} />)}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "10px 12px", flexShrink: 0,
        background: "rgba(0,0,0,0.18)",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={history.length === 0 ? "Ask anything about your build..." : "Follow-up..."}
            rows={1}
            disabled={streaming}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(input); } }}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "8px 10px",
              fontSize: "0.8rem", color: "rgba(255,255,255,0.72)",
              resize: "none", outline: "none", fontFamily: "inherit",
              lineHeight: 1.5, caretColor: "#a78bfa",
              transition: "border-color 0.15s",
            }}
            onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(139,92,246,0.4)"; }}
            onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
          />
          <button
            type="button"
            onClick={() => sendMsg(input)}
            disabled={!input.trim() || streaming}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0, alignSelf: "flex-end",
              background: input.trim() ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${input.trim() ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`,
              color: input.trim() ? "#a78bfa" : "rgba(255,255,255,0.2)",
              cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem", transition: "all 0.15s",
            }}
          >
            ↑
          </button>
        </div>
        <p style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.15)", margin: "5px 0 0", textAlign: "center" }}>
          Full context loaded · Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
