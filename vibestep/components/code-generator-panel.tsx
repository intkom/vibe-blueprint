"use client";

import { useState, useRef, useCallback } from "react";
import type { TechStack } from "@/app/api/generate-code/route";
import type { CodeEvent } from "@/app/api/generate-code/route";

const STACKS: { id: TechStack; label: string; icon: string }[] = [
  { id: "next_supabase",  label: "Next.js + Supabase",   icon: "⚡" },
  { id: "react_firebase", label: "React + Firebase",      icon: "🔥" },
  { id: "vue_node",       label: "Vue + Node.js",         icon: "💚" },
  { id: "react_native",   label: "React Native + Expo",   icon: "📱" },
  { id: "python_fastapi", label: "Python + FastAPI",      icon: "🐍" },
];

interface CodeGeneratorPanelProps {
  step: string;
  idea: string;
  projectTitle: string;
  onClose: () => void;
}

export function CodeGeneratorPanel({ step, idea, projectTitle, onClose }: CodeGeneratorPanelProps) {
  const [stack, setStack] = useState<TechStack>("next_supabase");
  const [phase, setPhase] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  // Extract filename suggestion from generated code
  const filename = code.match(/\/\/ filename:\s*(.+)/)?.[1]?.trim() ?? "generated.ts";

  const generate = useCallback(async (selectedStack: TechStack) => {
    setPhase("generating");
    setCode("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, idea, stack: selectedStack, projectTitle }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as CodeEvent;
            if (event.type === "chunk") setCode(prev => prev + event.text);
            if (event.type === "done") setPhase("done");
            if (event.type === "error") throw new Error(event.message);
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err) {
      setPhase("error");
      setErrorMsg(err instanceof Error ? err.message : "Generation failed");
    }
  }, [step, idea, projectTitle]);

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadCode() {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      animation: "fadeIn 0.2s ease",
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "rgba(6,3,22,0.99)",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: 18, overflow: "hidden",
        width: "min(820px, 100%)", maxHeight: "85vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
        animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", gap: 12,
          flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem",
          }}>⌨</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(96,165,250,0.6)", margin: "0 0 2px" }}>
              Code Generator
            </p>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {step}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "1.1rem", padding: 4, flexShrink: 0 }}
            aria-label="Close"
          >✕</button>
        </div>

        {/* Stack selector */}
        <div style={{
          padding: "14px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 10px" }}>
            Tech stack
          </p>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {STACKS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setStack(s.id); if (phase === "done" || phase === "error") { setPhase("idle"); setCode(""); } }}
                style={{
                  padding: "6px 12px", borderRadius: 8,
                  border: `1px solid ${stack === s.id ? "rgba(96,165,250,0.45)" : "rgba(255,255,255,0.08)"}`,
                  background: stack === s.id ? "rgba(96,165,250,0.12)" : "transparent",
                  color: stack === s.id ? "#60a5fa" : "rgba(255,255,255,0.4)",
                  fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {/* Idle */}
          {phase === "idle" && (
            <div style={{ padding: "40px 22px", textAlign: "center" }}>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.35)", margin: "0 0 24px", lineHeight: 1.7 }}>
                Generate production-ready <strong style={{ color: "rgba(255,255,255,0.55)" }}>{STACKS.find(s => s.id === stack)?.label}</strong> code for:
                <br />
                <em style={{ color: "rgba(255,255,255,0.5)" }}>&ldquo;{step}&rdquo;</em>
              </p>
              <button
                onClick={() => generate(stack)}
                style={{
                  background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
                  border: "1px solid rgba(96,165,250,0.4)",
                  color: "white", padding: "12px 28px", borderRadius: 11,
                  fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 0 24px rgba(96,165,250,0.25)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
              >
                ⌨ Generate code →
              </button>
            </div>
          )}

          {/* Generating or done */}
          {(phase === "generating" || phase === "done") && (
            <div style={{ fontFamily: "'Geist Mono','JetBrains Mono','Fira Code',monospace" }}>
              {/* Toolbar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px",
                background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.05)",
                position: "sticky", top: 0, zIndex: 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {["#f87171","#fbbf24","#34d399"].map((c, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.4 }} />
                  ))}
                  <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", marginLeft: 8 }}>
                    {phase === "generating" ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa", animation: "pulseGlow 1s ease-in-out infinite", display: "inline-block" }} />
                        Generating...
                      </span>
                    ) : filename}
                  </span>
                </div>
                {phase === "done" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={copyCode}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: copied ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.06)",
                        border: copied ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.1)",
                        color: copied ? "#34d399" : "rgba(255,255,255,0.5)",
                        padding: "4px 10px", borderRadius: 7,
                        fontSize: "0.68rem", fontWeight: 700, cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {copied ? "✓ Copied" : "⎘ Copy"}
                    </button>
                    <button
                      onClick={downloadCode}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.4)",
                        padding: "4px 10px", borderRadius: 7,
                        fontSize: "0.68rem", fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      ↓ {filename}
                    </button>
                    <button
                      onClick={() => { setPhase("idle"); setCode(""); }}
                      style={{
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.3)",
                        padding: "4px 10px", borderRadius: 7,
                        fontSize: "0.68rem", fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      ↺ Regenerate
                    </button>
                  </div>
                )}
              </div>

              {/* Code */}
              <pre
                ref={codeRef}
                style={{
                  margin: 0, padding: "20px 22px",
                  fontSize: "0.8rem", lineHeight: 1.75,
                  color: "rgba(255,255,255,0.82)",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                  minHeight: 200,
                }}
              >
                {code || " "}
                {phase === "generating" && (
                  <span style={{ display: "inline-block", width: 7, height: "0.82em", background: "#a78bfa", verticalAlign: "text-bottom", marginLeft: 2, animation: "pulseGlow 0.7s ease-in-out infinite" }} />
                )}
              </pre>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div style={{ padding: "32px 22px", textAlign: "center" }}>
              <p style={{ fontSize: "0.88rem", color: "#f87171", marginBottom: 16 }}>{errorMsg}</p>
              <button
                onClick={() => generate(stack)}
                style={{
                  background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)",
                  color: "#60a5fa", padding: "9px 20px", borderRadius: 9,
                  fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                }}
              >
                Retry →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {phase === "idle" && (
          <div style={{ padding: "12px 22px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.18)", margin: 0, textAlign: "center" }}>
              Powered by Claude Sonnet · Production-ready code, not pseudocode
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        @keyframes pulseGlow {
          0%,100%{opacity:1} 50%{opacity:0.4}
        }
      `}</style>
    </div>
  );
}
