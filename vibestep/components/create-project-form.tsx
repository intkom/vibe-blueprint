"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createProject, type CreateProjectState } from "@/app/actions/projects";
import { TOOL_META, type ToolType } from "@/lib/tools";

const EXAMPLE_IDEAS: Record<ToolType, string[]> = {
  sprint: [
    "A Notion clone for developers — markdown-first, with code blocks, GitHub integration, and keyboard shortcuts everywhere.",
    "A habit tracker for athletes — log workouts, streaks, and personal bests. Mobile-first. Syncs with Apple Health.",
    "An AI writing assistant for content creators — paste a topic, get a full blog post draft with SEO suggestions.",
    "A booking app for freelancers — clients can see availability, book sessions, pay upfront, and get automated reminders.",
    "A SaaS dashboard template marketplace — developers buy and sell pre-built admin dashboards for popular stacks.",
  ],
  validator: [
    "An app that lets people rent out their unused parking spots by the hour. Targeted at city apartment residents.",
    "A SaaS platform for gym owners to manage memberships, class bookings, and trainer schedules in one dashboard.",
    "A browser extension that automatically finds and applies discount codes at checkout across major e-commerce sites.",
  ],
  stack: [
    "A real-time collaborative Kanban board for remote teams. Needs live updates, file attachments, and team permissions. Solo dev, 3-month timeline.",
    "A multi-tenant B2B SaaS with role-based access, white-labelling, and REST API. Small team of 3, need to ship in 2 months.",
    "A mobile-first marketplace app where users buy and sell handmade crafts. Need payments, messaging, and image uploads.",
  ],
  monetization: [
    "An AI transcription tool for podcast creators. It transcribes, adds timestamps, and generates show notes. B2C, individual creators.",
    "A project management SaaS for small agencies. Teams of 5–20. They manage client projects, timelines, and billing.",
    "A Chrome extension that summarises any webpage into 5 bullet points. Individual users, knowledge workers.",
  ],
};

const initialState: CreateProjectState = { error: null };

function LoadingMessage({ messages }: { messages: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % messages.length), 1800);
    return () => clearInterval(id);
  }, [messages]);
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <span style={{
        width: 16, height: 16, flexShrink: 0,
        border: "2.5px solid rgba(255,255,255,0.2)", borderTopColor: "white",
        borderRadius: "50%", animation: "spin 0.75s linear infinite", display: "inline-block",
      }} />
      <span key={idx} style={{ animation: "fadeInUp 0.35s ease both" }}>
        {messages[idx]}
      </span>
    </span>
  );
}

const TOOL_CTA: Record<ToolType, string> = {
  validator: "Validate this idea →",
  stack:     "Build my tech blueprint →",
  monetization: "Map my monetization →",
  sprint:    "Generate build steps →",
};

export function CreateProjectForm({ toolType = "sprint" }: { toolType?: ToolType }) {
  const [state, formAction, pending] = useActionState(createProject, initialState);
  const [focused, setFocused] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const meta = TOOL_META[toolType];
  const examples = EXAMPLE_IDEAS[toolType] ?? [];

  function fillExample(text: string) {
    if (textareaRef.current) {
      textareaRef.current.value = text;
      setCharCount(text.length);
      textareaRef.current.focus();
    }
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Hidden tool type */}
      <input type="hidden" name="tool_type" value={toolType} />

      {state.error ? (
        <div role="alert" style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)",
          borderRadius: 10, padding: "12px 14px",
          fontSize: "0.85rem", color: "rgba(252,165,165,0.85)",
        }}>
          <span style={{ flexShrink: 0, lineHeight: 1.3 }}>⚠</span>
          <span>{state.error}</span>
        </div>
      ) : null}

      {/* Example chips */}
      {examples.length > 0 && (
        <div>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 10 }}>
            Try an example
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => fillExample(ex)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, padding: "9px 14px",
                  fontSize: "0.78rem", color: "rgba(255,255,255,0.4)",
                  cursor: "pointer", textAlign: "left", lineHeight: 1.5,
                  transition: "all 0.18s ease",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.4)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.06)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Textarea */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label htmlFor="idea" style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.01em" }}>
            Describe your idea
          </label>
          <span style={{ fontSize: "0.72rem", color: charCount > 0 ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.2)" }}>
            {charCount > 0 ? `${charCount} chars` : "min. 20 chars"}
          </span>
        </div>

        <div style={{
          position: "relative", borderRadius: 14, padding: 1,
          background: focused
            ? "linear-gradient(135deg, rgba(139,92,246,0.7), rgba(236,72,153,0.4))"
            : "rgba(255,255,255,0.08)",
          transition: "background 0.25s ease",
          boxShadow: focused ? "0 0 30px rgba(139,92,246,0.2)" : "none",
        }}>
          <textarea
            ref={textareaRef}
            id="idea"
            name="idea"
            required
            rows={9}
            disabled={pending}
            placeholder={meta.placeholder}
            onChange={e => setCharCount(e.target.value.length)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: "100%", display: "block",
              background: focused ? "rgba(15,8,40,0.95)" : "rgba(10,6,30,0.9)",
              borderRadius: 13, border: "none", outline: "none",
              padding: "16px 18px",
              fontSize: "0.9rem", color: "rgba(255,255,255,0.88)",
              lineHeight: 1.72, resize: "vertical", minHeight: 200,
              caretColor: "#a78bfa",
              transition: "background 0.25s ease",
              opacity: pending ? 0.55 : 1,
              fontFamily: "inherit",
            }}
          />
          {focused && (
            <div aria-hidden="true" style={{
              position: "absolute", bottom: 10, right: 12,
              width: 5, height: 5, borderRadius: "50%",
              background: "#a78bfa", boxShadow: "0 0 8px rgba(167,139,250,0.8)",
              animation: "pulseGlow 1.5s ease-in-out infinite",
            }} />
          )}
        </div>

        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.22)", margin: 0, lineHeight: 1.5 }}>
          The more specific you are, the more tailored the output.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        onMouseEnter={() => !pending && setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          width: "100%",
          background: pending ? "rgba(109,40,217,0.4)" : btnHover ? "linear-gradient(135deg,#8b5cf6,#7c3aed)" : "linear-gradient(135deg,#7c3aed,#6d28d9)",
          border: "1px solid rgba(139,92,246,0.45)",
          color: "white", padding: "14px 20px", borderRadius: 12,
          fontSize: "0.95rem", fontWeight: 600,
          cursor: pending ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: pending ? "none" : btnHover ? "0 0 36px rgba(139,92,246,0.6), 0 8px 24px rgba(0,0,0,0.4)" : "0 0 22px rgba(139,92,246,0.3)",
          transform: btnHover && !pending ? "translateY(-2px)" : "translateY(0)",
          transition: "all 0.22s ease",
          opacity: pending ? 0.85 : 1,
          letterSpacing: "0.01em",
          minHeight: 50,
          position: "relative", overflow: "hidden",
        }}
      >
        {btnHover && !pending && (
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
            animation: "shimmerSlide 1.2s ease infinite",
          }} />
        )}
        <span style={{ position: "relative", zIndex: 1 }}>
          {pending
            ? <LoadingMessage messages={meta.loadingMessages} />
            : TOOL_CTA[toolType]
          }
        </span>
      </button>

      {pending && (
        <div style={{
          textAlign: "center", fontSize: "0.75rem", color: "rgba(255,255,255,0.28)",
          padding: "4px 0", animation: "fadeInUp 0.4s ease both",
        }}>
          This usually takes 15–30 seconds. Please don&apos;t close the tab.
        </div>
      )}
    </form>
  );
}
