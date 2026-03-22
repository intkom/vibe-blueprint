"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  stepTitle: string;
  stepPhase: string;
  stepObjective: string;
  stepGuidance: string | null;
  projectTitle: string;
  projectIdea: string;
  stepIndex: number;
};

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "#a78bfa",
            animation: `pulseScale 1.3s ease-in-out ${i * 0.22}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function StepAiChat({
  stepTitle, stepPhase, stepObjective, stepGuidance,
  projectTitle, projectIdea, stepIndex,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const systemPrompt = `You are an expert technical advisor helping implement one specific build step in a startup project.

PROJECT: ${projectTitle}
IDEA: ${projectIdea}

CURRENT STEP (Step ${stepIndex + 1}): ${stepTitle}
Phase: ${stepPhase}
Objective: ${stepObjective}${stepGuidance ? `\nGuidance: ${stepGuidance}` : ""}

Focus exclusively on THIS step. Give:
- Concrete code snippets and exact commands when relevant
- Specific libraries, tools, and services for their exact use case
- Step-by-step actions (3-5 bullet points, no fluff)
- The most common pitfall to avoid on this specific step
Keep responses concise and hands-on. Be the senior engineer sitting next to them, not a consultant writing a report.`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, systemPrompt }),
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
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsg.id
            ? { ...m, content: "Something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [messages, systemPrompt, isStreaming]);

  const openAndInit = () => {
    setIsOpen(true);
    if (!initialized) {
      setInitialized(true);
      // Auto-send a focused opener
      setTimeout(() => {
        handleSend(
          `Help me implement Step ${stepIndex + 1}: "${stepTitle}" for "${projectTitle}". What are the exact first 3 things I should do?`
        );
      }, 100);
    }
  };

  return (
    <div style={{
      background: "rgba(139,92,246,0.04)",
      border: "1px solid rgba(139,92,246,0.18)",
      borderRadius: 16,
      overflow: "hidden",
    }}>
      {/* Toggle header */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : openAndInit}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(139,92,246,0.4)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#a78bfa", margin: 0 }}>
              Ask AI about this step
            </p>
            <p style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>
              {initialized ? `${messages.filter(m => m.role === "assistant").length} responses` : "Get implementation help"}
            </p>
          </div>
        </div>
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.22s ease", flexShrink: 0 }}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* Chat body */}
      {isOpen && (
        <div style={{ borderTop: "1px solid rgba(139,92,246,0.12)" }}>
          {/* Messages */}
          <div style={{
            maxHeight: 380, overflowY: "auto",
            padding: "14px 16px",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: 8, alignItems: "flex-start",
                  animation: "fadeInUp 0.2s ease both",
                }}
              >
                <div style={{
                  maxWidth: "87%",
                  background: msg.role === "user"
                    ? "rgba(124,58,237,0.2)"
                    : "rgba(255,255,255,0.04)",
                  border: msg.role === "user"
                    ? "1px solid rgba(139,92,246,0.3)"
                    : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: msg.role === "user"
                    ? "11px 11px 3px 11px"
                    : "11px 11px 11px 3px",
                  padding: "9px 13px",
                }}>
                  {msg.content === "" ? (
                    <TypingDots />
                  ) : (
                    <p style={{
                      fontSize: "0.8rem", color: "rgba(255,255,255,0.75)",
                      margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap",
                    }}>
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "0 14px 14px" }}>
            <div style={{
              display: "flex", gap: 8, alignItems: "flex-end",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 11, padding: "9px 12px",
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Ask a follow-up question…"
                rows={1}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "rgba(255,255,255,0.85)", fontSize: "0.82rem",
                  resize: "none", lineHeight: 1.5,
                  caretColor: "#a78bfa", fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isStreaming}
                style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: input.trim() && !isStreaming
                    ? "linear-gradient(135deg,#7c3aed,#5b21b6)"
                    : "rgba(255,255,255,0.04)",
                  border: "none",
                  cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s ease",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke={input.trim() && !isStreaming ? "white" : "rgba(255,255,255,0.2)"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
