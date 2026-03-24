"use client";

import { useState, useEffect, useRef } from "react";

export type ActionType =
  | "step" | "deploy" | "competitor" | "viral"
  | "iterate" | "score" | "risk" | "ask" | "explain" | "stuck" | "codegen";

export type ActionPanelConfig = {
  type: ActionType;
  title: string;
  subtitle?: string;
  projectIdea: string;
  projectTitle: string;
  context: Record<string, unknown>;
  onStepComplete?: () => void;
};

const META: Record<ActionType, { label: string; accent: string; bg: string }> = {
  step:       { label: "Step Assistant",   accent: "#a78bfa", bg: "rgba(139,92,246,0.07)" },
  deploy:     { label: "Deploy Guide",     accent: "#60a5fa", bg: "rgba(96,165,250,0.07)" },
  competitor: { label: "Competitor Intel", accent: "#fbbf24", bg: "rgba(251,191,36,0.07)" },
  viral:      { label: "Hook Generator",   accent: "#ec4899", bg: "rgba(236,72,153,0.07)" },
  iterate:    { label: "Fix Implementer",  accent: "#34d399", bg: "rgba(52,211,153,0.07)" },
  score:      { label: "Score Improver",   accent: "#34d399", bg: "rgba(52,211,153,0.07)" },
  risk:       { label: "Risk Mitigator",   accent: "#f87171", bg: "rgba(239,68,68,0.07)"  },
  ask:        { label: "Ask Axiom",        accent: "#a78bfa", bg: "rgba(139,92,246,0.07)" },
  explain:    { label: "Simplifier",       accent: "#60a5fa", bg: "rgba(96,165,250,0.07)"  },
  stuck:      { label: "Unstuck",          accent: "#fbbf24", bg: "rgba(251,191,36,0.07)"  },
  codegen:    { label: "Code Generator",   accent: "#34d399", bg: "rgba(52,211,153,0.07)"  },
};

/* ── Content parser ────────────────────────────────────────── */

type Seg = { k: "text"; v: string } | { k: "code"; lang: string; v: string; done: boolean };

function parse(text: string): Seg[] {
  const out: Seg[] = [];
  const re = /```(\w*)\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ k: "text", v: text.slice(last, m.index) });
    out.push({ k: "code", lang: m[1] || "bash", v: m[2].trimEnd(), done: true });
    last = re.lastIndex;
  }
  const rem = text.slice(last);
  if (rem) {
    const fi = rem.indexOf("```");
    if (fi !== -1) {
      if (fi > 0) out.push({ k: "text", v: rem.slice(0, fi) });
      const af = rem.slice(fi + 3);
      const nl = af.indexOf("\n");
      out.push({ k: "code", lang: nl !== -1 ? af.slice(0, nl).trim() || "bash" : "bash", v: nl !== -1 ? af.slice(nl + 1) : "", done: false });
    } else {
      out.push({ k: "text", v: rem });
    }
  }
  return out;
}

/* ── Inline renderer ───────────────────────────────────────── */

function inline(s: string): React.ReactNode[] {
  return s.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2)
      return <code key={i} style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: 4, padding: "1px 5px", fontFamily: "'Geist Mono','JetBrains Mono',monospace", fontSize: "0.84em", color: "#c4b5fd" }}>{p.slice(1, -1)}</code>;
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4)
      return <strong key={i} style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
    return p;
  });
}

/* ── Text block ────────────────────────────────────────────── */

function TextBlock({ v }: { v: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {v.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 4 }} />;
        if (/^#+\s/.test(line)) {
          const lvl = (line.match(/^(#+)/) ?? ["", ""])[1].length;
          return (
            <p key={i} style={{ fontWeight: lvl === 1 ? 800 : 700, fontSize: lvl === 1 ? "0.9rem" : "0.84rem", color: "rgba(255,255,255,0.88)", margin: "6px 0 2px", letterSpacing: "-0.01em" }}>
              {inline(line.replace(/^#+\s/, ""))}
            </p>
          );
        }
        const li = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
        if (li) return (
          <div key={i} style={{ display: "flex", gap: 8, paddingLeft: li[1].length * 12 }}>
            <span style={{ color: "rgba(167,139,250,0.55)", flexShrink: 0, fontSize: "0.7rem", marginTop: 4 }}>•</span>
            <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{inline(li[3])}</span>
          </div>
        );
        return <p key={i} style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.65 }}>{inline(line)}</p>;
      })}
    </div>
  );
}

/* ── Code block ────────────────────────────────────────────── */

function CodeBlock({ lang, v, done }: { lang: string; v: string; done: boolean }) {
  const [cp, setCp] = useState(false);
  return (
    <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden", margin: "2px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 11px", background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>{lang}</span>
        {done && (
          <button type="button"
            onClick={() => { navigator.clipboard.writeText(v).catch(() => {}); setCp(true); setTimeout(() => setCp(false), 2000); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.67rem", fontWeight: 600, color: cp ? "#34d399" : "rgba(255,255,255,0.3)", padding: "2px 6px", borderRadius: 4, transition: "color 0.15s" }}>
            {cp ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>
      <pre style={{ margin: 0, padding: "10px 13px", fontFamily: "'Geist Mono','JetBrains Mono',monospace", fontSize: "0.76rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, overflowX: "auto", whiteSpace: "pre" }}>
        {v}
        {!done && <span style={{ display: "inline-block", width: 5, height: "0.9em", background: "#a78bfa", verticalAlign: "text-bottom", marginLeft: 3, animation: "pulseGlow 0.7s ease-in-out infinite" }} />}
      </pre>
    </div>
  );
}

/* ── Rendered content ──────────────────────────────────────── */

export function Render({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {parse(text).map((seg, i) =>
        seg.k === "code"
          ? <CodeBlock key={i} lang={seg.lang} v={seg.v} done={seg.done} />
          : <TextBlock key={i} v={seg.v} />
      )}
    </div>
  );
}

/* ── Main ActionPanel ──────────────────────────────────────── */

type Msg = { role: "user" | "assistant"; content: string };

export function ActionPanel({
  config,
  onClose,
}: {
  config: ActionPanelConfig;
  onClose: () => void;
}) {
  const meta = META[config.type];
  const isAsk = config.type === "ask";

  const [history, setHistory] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  async function run(apiMsgs: Msg[]) {
    abort.current?.abort();
    abort.current = new AbortController();
    setStreaming(true);
    setStreamText("");
    let acc = "";
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: config.type,
          projectIdea: config.projectIdea,
          projectTitle: config.projectTitle,
          context: config.context,
          messages: apiMsgs,
        }),
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
      setHistory(h => [...h, { role: "assistant", content: acc }]);
      setStreamText("");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setHistory(h => [...h, { role: "assistant", content: "⚠ Failed to generate response. Check your connection and try again." }]);
      }
    }
    setStreaming(false);
  }

  // Auto-start (non-ask types)
  useEffect(() => {
    if (!isAsk) run([{ role: "user", content: "Begin." }]);
    return () => abort.current?.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamText, history]);

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  function send() {
    const msg = input.trim();
    if (!msg || streaming) return;
    setInput("");
    const updated: Msg[] = [...history, { role: "user", content: msg }];
    setHistory(updated);
    const apiMsgs: Msg[] = isAsk
      ? updated
      : [{ role: "user", content: "Begin." }, ...updated];
    run(apiMsgs);
  }

  const showInput = !streaming && (history.length > 0 || isAsk);
  const isEmpty = history.length === 0 && !streaming && !streamText;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(520px, 100vw)", zIndex: 101,
        background: "#050210",
        borderLeft: `1px solid ${meta.accent}1a`,
        display: "flex", flexDirection: "column",
        animation: "slideInFromRight 0.28s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: `-20px 0 60px rgba(0,0,0,0.7), inset 1px 0 0 ${meta.accent}0d`,
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "18px 18px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          background: meta.bg,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "0.57rem", fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase", color: meta.accent, margin: "0 0 4px", opacity: 0.7,
              }}>
                {meta.label}
              </p>
              <h2 style={{
                fontSize: "0.92rem", fontWeight: 800, margin: 0,
                color: "rgba(255,255,255,0.92)", letterSpacing: "-0.015em", lineHeight: 1.3,
              }}>
                {config.title}
              </h2>
              {config.subtitle && (
                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.28)", margin: "3px 0 0" }}>
                  {config.subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "rgba(255,255,255,0.38)",
                fontSize: "0.85rem", transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.1)"; b.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(255,255,255,0.05)"; b.style.color = "rgba(255,255,255,0.38)"; }}
            >
              ✕
            </button>
          </div>

          {streaming && !streamText && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 9 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: meta.accent, opacity: 0.55, animation: `pulseGlow 1.2s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
              <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.22)", marginLeft: 2 }}>Generating...</span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, overflowY: "auto", padding: "18px",
            display: "flex", flexDirection: "column", gap: 12,
          }}
        >
          {isEmpty && isAsk && (
            <div style={{ padding: "36px 0 16px", textAlign: "center" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, margin: "0 auto 16px",
                background: meta.bg, border: `1px solid ${meta.accent}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: meta.accent,
              }}>
                ✦
              </div>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.35)", margin: "0 0 4px", fontWeight: 500 }}>
                Ask me anything about your build
              </p>
              <p style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.18)" }}>
                Architecture, risks, next steps, code...
              </p>
            </div>
          )}

          {history.map((msg, i) => {
            const isLatest = msg.role === "assistant" && i === history.length - 1 && !streaming;
            if (msg.role === "user") {
              return (
                <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                    borderRadius: "11px 11px 3px 11px", padding: "8px 12px", maxWidth: "85%",
                  }}>
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.68)", margin: 0, lineHeight: 1.5 }}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <div key={i} style={{ opacity: isLatest ? 1 : 0.42, transition: "opacity 0.2s" }}>
                {!isLatest && i > 0 && (
                  <div style={{ height: 1, background: "rgba(255,255,255,0.04)", marginBottom: 12 }} />
                )}
                <Render text={msg.content} />
              </div>
            );
          })}

          {/* Live stream */}
          {streaming && streamText && <Render text={streamText} />}

          {/* Loading dots */}
          {streaming && !streamText && (
            <div style={{ display: "flex", gap: 5, padding: "8px 0" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: meta.accent, opacity: 0.45, animation: `pulseGlow 1.3s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 14px",
          flexShrink: 0,
          background: "rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {/* Step: mark complete */}
          {config.type === "step" && config.onStepComplete && !streaming && history.length > 0 && (
            <button
              type="button"
              onClick={() => { config.onStepComplete?.(); onClose(); }}
              style={{
                width: "100%", padding: "9px", borderRadius: 8,
                background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)",
                color: "#34d399", fontSize: "0.82rem", fontWeight: 700,
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(52,211,153,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(52,211,153,0.1)"; }}
            >
              ✓ Mark step as addressed
            </button>
          )}

          {/* Follow-up input */}
          {showInput && (
            <div style={{ display: "flex", gap: 7 }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isAsk && history.length === 0 ? "Ask anything about your build..." : "Ask a follow-up..."}
                rows={1}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                  padding: "8px 11px", fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.75)", resize: "none",
                  outline: "none", fontFamily: "inherit", lineHeight: 1.5,
                  caretColor: meta.accent, transition: "border-color 0.15s",
                }}
                onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = `${meta.accent}44`; }}
                onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
              <button
                type="button"
                onClick={send}
                disabled={!input.trim() || streaming}
                style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0, alignSelf: "flex-end",
                  background: input.trim() ? meta.bg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${input.trim() ? `${meta.accent}40` : "rgba(255,255,255,0.07)"}`,
                  color: input.trim() ? meta.accent : "rgba(255,255,255,0.2)",
                  cursor: input.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem", transition: "all 0.15s",
                }}
              >
                ↑
              </button>
            </div>
          )}

          {streaming && (
            <p style={{ fontSize: "0.67rem", color: "rgba(255,255,255,0.18)", textAlign: "center", margin: 0 }}>
              Generating — don&apos;t close this panel
            </p>
          )}
        </div>
      </div>
    </>
  );
}
