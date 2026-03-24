"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type StepContext = {
  id: string;
  step_index: number;
  phase: string | null;
  title: string | null;
  objective: string | null;
  status: string | null;
};

type Props = {
  projectId: string;
  projectTitle: string;
  projectIdea: string;
  steps: StepContext[];
};

function buildSystemPrompt(
  projectTitle: string,
  projectIdea: string,
  steps: StepContext[]
): string {
  const completedCount = steps.filter(s => s.status === "complete").length;
  const activeIdx = steps.findIndex(s => s.status !== "complete");

  const stepsText = steps
    .map(s => {
      const state =
        s.status === "complete"
          ? "✓ Done"
          : s.step_index === activeIdx
          ? "→ Active"
          : "○ Pending";
      return `  Step ${s.step_index + 1} [${state}] (${s.phase ?? "build"}): ${s.title}\n    Objective: ${s.objective}`;
    })
    .join("\n");

  return `You are a technical co-founder and startup advisor for this specific project. Be direct, specific, and actionable. Never give generic advice — always tie everything back to this exact project.

PROJECT: ${projectTitle}
IDEA: ${projectIdea}

BUILD PLAN (${completedCount}/${steps.length} steps complete):
${stepsText}

RESPONSE GUIDELINES:
- Reference their specific project by name when relevant
- Give implementation-ready advice with concrete next actions
- Suggest specific technologies and libraries for their use case
- Keep it focused: 2-4 paragraphs OR a tight bullet list (3-6 points max)
- If they're stuck, give the exact next 3 actions they should take
- Be direct like a co-founder — no fluff, no generic "it depends"`;
}

const SUGGESTED_QUESTIONS = [
  "What should I tackle first?",
  "I'm stuck on the current step — help me break through",
  "What's the riskiest assumption in my plan?",
  "What tech stack fits this idea best?",
  "How do I validate this faster without building everything?",
];

/* ── Typing dots ── */
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#a78bfa",
            animation: `pulseScale 1.3s ease-in-out ${i * 0.22}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Main component ── */
export function AIChatPanel({ projectId, projectTitle, projectIdea, steps }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const storageKey = `axiom_chat_${projectId}`;
  const systemPrompt = buildSystemPrompt(projectTitle, projectIdea, steps);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setMessages(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [storageKey]);

  // Save to localStorage (cap at 60 messages)
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages.slice(-60)));
      } catch { /* ignore */ }
    }
  }, [messages, storageKey]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 320);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(), role: "user", content: trimmed, timestamp: Date.now(),
    };
    const assistantMsg: Message = {
      id: crypto.randomUUID(), role: "assistant", content: "", timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, systemPrompt }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snap = acc;
        setMessages(prev =>
          prev.map(m => m.id === assistantMsg.id ? { ...m, content: snap } : m)
        );
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, systemPrompt, isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const completedCount = steps.filter(s => s.status === "complete").length;

  return (
    <>
      {/* ── Floating trigger ── */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Chat with AI Co-Founder"
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 200,
          display: "flex", alignItems: "center", gap: 9,
          background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
          border: "1px solid rgba(139,92,246,0.55)",
          color: "white", padding: "13px 22px", borderRadius: 9999,
          fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
          boxShadow: "0 0 36px rgba(139,92,246,0.55), 0 4px 20px rgba(0,0,0,0.5)",
          animation: "ringPulse 3.5s ease-in-out infinite",
          letterSpacing: "0.01em", userSelect: "none",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        AI Co-Founder
        {messages.length > 0 && (
          <span style={{
            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
            background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
            fontSize: "0.6rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {messages.filter(m => m.role === "assistant").length}
          </span>
        )}
      </button>

      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease both",
          }}
        />
      )}

      {/* ── Sliding panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI Co-Founder Chat"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 400,
          width: "min(500px, 100vw)",
          background: "rgba(3,1,16,0.98)",
          borderLeft: "1px solid rgba(139,92,246,0.2)",
          display: "flex", flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: isOpen ? "-12px 0 60px rgba(0,0,0,0.6)" : "none",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(139,92,246,0.06)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 18px rgba(139,92,246,0.55)",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 5v5l3 3"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: "0.9rem", color: "rgba(255,255,255,0.95)", margin: 0 }}>
                AI Co-Founder
              </p>
              <p style={{ fontSize: "0.65rem", color: "rgba(139,92,246,0.7)", margin: 0 }}>
                Knows your full project · {completedCount}/{steps.length} steps done
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
                }}
                style={{
                  background: "none", border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.3)", padding: "4px 9px", borderRadius: 7,
                  fontSize: "0.65rem", cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: "none", border: "none",
                color: "rgba(255,255,255,0.4)", cursor: "pointer",
                width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 7,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Project context pill */}
        <div style={{
          padding: "8px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(139,92,246,0.03)",
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: "0.62rem", fontWeight: 600,
            color: "rgba(139,92,246,0.65)",
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
            padding: "3px 9px", borderRadius: 9999,
          }}>
            {projectTitle}
          </span>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          {messages.length === 0 ? (
            <div style={{ paddingTop: 8 }}>
              {/* Empty state */}
              <div style={{ textAlign: "center", marginBottom: 28, paddingTop: 8 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.75)", margin: "0 0 5px" }}>
                  Your AI co-founder is ready.
                </p>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", margin: 0, lineHeight: 1.65 }}>
                  I&apos;ve read your entire plan.<br />Ask me anything about your project.
                </p>
              </div>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 8px" }}>
                Try asking
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10, padding: "10px 14px", textAlign: "left",
                      color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", cursor: "pointer",
                      transition: "all 0.15s ease", fontFamily: "inherit",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: 9, alignItems: "flex-start",
                  animation: "fadeInUp 0.2s ease both",
                }}
              >
                {msg.role === "assistant" && (
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: 1,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                    </svg>
                  </div>
                )}
                <div style={{
                  maxWidth: "83%",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg,rgba(124,58,237,0.22),rgba(91,33,182,0.18))"
                    : "rgba(255,255,255,0.04)",
                  border: msg.role === "user"
                    ? "1px solid rgba(139,92,246,0.32)"
                    : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: msg.role === "user"
                    ? "14px 14px 4px 14px"
                    : "14px 14px 14px 4px",
                  padding: "10px 14px",
                }}>
                  {msg.content === "" && msg.role === "assistant" ? (
                    <TypingDots />
                  ) : (
                    <p style={{
                      fontSize: "0.82rem", lineHeight: 1.72,
                      color: msg.role === "user"
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.78)",
                      margin: 0, whiteSpace: "pre-wrap",
                    }}>
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
          background: "rgba(0,0,0,0.35)",
        }}>
          <div style={{
            display: "flex", gap: 8, alignItems: "flex-end",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${input.trim() ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.09)"}`,
            borderRadius: 13, padding: "10px 12px",
            transition: "border-color 0.2s ease",
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI co-founder anything…"
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "rgba(255,255,255,0.88)", fontSize: "0.85rem", resize: "none",
                lineHeight: 1.5, caretColor: "#a78bfa", fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              aria-label="Send message"
              style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: input.trim() && !isStreaming
                  ? "linear-gradient(135deg,#7c3aed,#5b21b6)"
                  : "rgba(255,255,255,0.05)",
                border: "none",
                cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: input.trim() && !isStreaming ? "0 0 14px rgba(139,92,246,0.4)" : "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() && !isStreaming ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
          <p style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.13)", margin: "5px 0 0 3px" }}>
            Enter to send · Shift+Enter for new line · Esc to close
          </p>
        </div>
      </div>
    </>
  );
}
