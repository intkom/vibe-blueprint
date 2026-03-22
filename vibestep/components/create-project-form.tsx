"use client";

import { useActionState, useState, useEffect, useRef, useMemo } from "react";
import { createProject, type CreateProjectState } from "@/app/actions/projects";
import { TOOL_META, type ToolType } from "@/lib/tools";

/* ── Example ideas ──────────────────────────────────────── */
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

/* ── Smart suggestion templates ─────────────────────────── */
type Template = { label: string; text: string };
type Category = { keywords: string[]; headline: string; templates: Template[] };

const SMART_CATEGORIES: Category[] = [
  {
    keywords: ["saas", "dashboard", "subscription", "b2b", "enterprise", "team", "admin", "business", "crm", "erp"],
    headline: "Sounds like a B2B SaaS — here are blueprints that worked",
    templates: [
      { label: "Team Analytics", text: "A SaaS analytics dashboard for marketing teams. Shows campaign performance, conversion funnels, and A/B test results. Teams of 5–20. Subscription at $49/seat/month." },
      { label: "Client Portal", text: "A white-label client portal for creative agencies. Clients view project progress, approve deliverables, and pay invoices. B2B, $99/month per agency with annual discount." },
      { label: "HR Platform", text: "An HR SaaS for small businesses (10–100 employees). Onboarding checklists, time tracking, leave management, payroll integration. $12/employee/month." },
    ],
  },
  {
    keywords: ["marketplace", "buy", "sell", "rent", "booking", "hire", "freelance", "gig", "p2p"],
    headline: "Sounds like a marketplace — here are blueprints that worked",
    templates: [
      { label: "Services Marketplace", text: "A marketplace for niche professional services. Clients post briefs, vetted freelancers bid. Platform takes 15%. Focus on video/content production." },
      { label: "Equipment Rental", text: "A peer-to-peer equipment rental platform for photographers and filmmakers. Insurance included, calendar availability, Stripe, local pickup or shipping." },
      { label: "Expert Booking", text: "An on-demand booking platform for licensed professionals — lawyers, accountants, coaches. 30-min video calls, upfront payment, automated reminders." },
    ],
  },
  {
    keywords: ["ai", "gpt", "llm", "generate", "automate", "intelligent", "chatbot", "ml", "claude", "openai"],
    headline: "Sounds like an AI tool — here are blueprints that worked",
    templates: [
      { label: "AI Content Writer", text: "An AI writing assistant for content marketers. Paste a URL or topic, get a full SEO-optimized blog post with meta descriptions and headline variants. Integrates with WordPress." },
      { label: "AI Data Analyst", text: "An AI tool for non-technical analysts. Upload a CSV, ask questions in plain English, get instant charts and insights. Exports to Google Sheets. $29/month." },
      { label: "AI Support Agent", text: "An AI customer support agent trained on your docs and tickets. Handles 80% of tier-1 queries, escalates edge cases. Integrates with Intercom and Zendesk." },
    ],
  },
  {
    keywords: ["mobile", "ios", "android", "app", "health", "fitness", "workout", "habit", "wellness", "track"],
    headline: "Sounds like a mobile or health app — here are blueprints that worked",
    templates: [
      { label: "Fitness Tracker", text: "A workout tracking app for strength athletes. Log exercises, weights, and reps. Auto-calculates progressive overload, strength curves, syncs with Apple Health. $7/month." },
      { label: "Habit Tracker", text: "A minimalist habit tracking app. Daily check-ins, streak visualization, weekly review prompts. Private by design. Annual subscription at $29/year." },
      { label: "Nutrition Logger", text: "A meal logging app for macro tracking. Barcode scanner, AI meal recognition from photo, macro goals, and weekly summaries. Freemium with premium meal plans." },
    ],
  },
  {
    keywords: ["developer", "dev", "api", "code", "github", "deploy", "backend", "frontend", "engineer", "cli", "sdk"],
    headline: "Sounds like a developer tool — here are blueprints that worked",
    templates: [
      { label: "API Platform", text: "An API testing and documentation platform for small teams. Auto-generates docs from OpenAPI spec, collaborative test suites, environment variables, Slack failure alerts." },
      { label: "AI Code Reviewer", text: "An async code review tool. AI summarizes PR changes, flags security issues, suggests improvements before human review. GitHub App, $29/dev/month." },
      { label: "Deployment Dashboard", text: "A unified deployment dashboard for indie hackers. Connect GitHub, Vercel, Railway, PlanetScale — see all deployments, logs, and costs in one place. $9/month." },
    ],
  },
];

/* ── Idea quality scoring ─────────────────────────────── */
function scoreIdea(text: string): { score: number; tip: string | null } {
  if (text.length < 10) return { score: 0, tip: null };
  let score = 0;

  // Length (up to 30 pts)
  score += Math.min(30, Math.floor((text.length / 150) * 30));

  // Target audience (20 pts)
  const hasAudience = /\b(for|users?|customers?|teams?|founders?|developers?|businesses?|startups?|freelancers?|agencies?|clients?|students?|creators?|marketers?)\b/i.test(text);
  if (hasAudience) score += 20;

  // Problem statement (20 pts)
  const hasProblem = /\b(problem|pain|issue|solve|need|want|frustrat|difficult|struggle|automat|replac|save time|too slow|too expensive|manual)\b/i.test(text);
  if (hasProblem) score += 20;

  // Specificity — numbers, tech, pricing (15 pts)
  const hasSpecificity = /(\$\d|\d+\/|\d+ (hour|min|day|user|team)|b2b|b2c|saas|api|mobile|ios|android|dashboard|real.?time)/i.test(text);
  if (hasSpecificity) score += 15;

  // Business model hint (15 pts)
  const hasBizModel = /\b(subscription|freemium|per (user|seat|month)|one.time|pay|revenue|monetiz|pricing|\$)/i.test(text);
  if (hasBizModel) score += 15;

  score = Math.min(100, score);

  let tip: string | null = null;
  if (!hasAudience)    tip = "Add a target audience — who specifically will use this?";
  else if (!hasProblem) tip = "Describe the core problem your product solves.";
  else if (!hasSpecificity) tip = "Add specificity — tech stack, scale, or use case details.";
  else if (!hasBizModel)  tip = "Mention a pricing model to strengthen the idea.";

  return { score, tip };
}

const DEFAULT_SUGGESTIONS: Template[] = [
  { label: "SaaS Starter", text: "A subscription SaaS tool for small teams that automates repetitive workflows and shows analytics. B2B, $49/month per team." },
  { label: "Marketplace MVP", text: "A two-sided marketplace connecting service providers with customers. Handles booking, payments, reviews. 12% transaction fee." },
  { label: "Mobile Productivity", text: "A mobile-first productivity app for busy professionals. Organize tasks, track goals, build habits. Freemium with $5/month premium." },
];

function detectCategory(text: string): Category | null {
  const lower = text.toLowerCase();
  let best: { cat: Category; count: number } | null = null;
  for (const cat of SMART_CATEGORIES) {
    const count = cat.keywords.filter(k => lower.includes(k)).length;
    if (count > 0 && (!best || count > best.count)) {
      best = { cat, count };
    }
  }
  return best?.cat ?? null;
}

/* ── Subcomponents ──────────────────────────────────────── */
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
        border: "2.5px solid rgba(255,255,255,0.25)", borderTopColor: "white",
        borderRadius: "50%", animation: "spin 0.75s linear infinite", display: "inline-block",
      }} />
      <span key={idx} style={{ animation: "fadeInUp 0.35s ease both" }}>
        {messages[idx]}
      </span>
    </span>
  );
}

const TOOL_CTA: Record<ToolType, string> = {
  validator:    "Validate this idea →",
  stack:        "Build my tech blueprint →",
  monetization: "Map my monetization →",
  sprint:       "Generate build steps →",
};

/* ── Main form ──────────────────────────────────────────── */
export function CreateProjectForm({ toolType = "sprint" }: { toolType?: ToolType }) {
  const [state, formAction, pending] = useActionState(createProject, initialState);
  const [focused, setFocused] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [ideaText, setIdeaText] = useState("");
  const [suggestions, setSuggestions] = useState<{ headline: string; templates: Template[] } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const meta = TOOL_META[toolType];
  const examples = EXAMPLE_IDEAS[toolType] ?? [];

  function fillExample(text: string) {
    if (textareaRef.current) {
      textareaRef.current.value = text;
      setCharCount(text.length);
      setIdeaText(text);
      textareaRef.current.focus();
    }
  }

  function handleTextChange(value: string) {
    setCharCount(value.length);
    setIdeaText(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 10) {
      setSuggestions(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const cat = detectCategory(value);
      if (cat) {
        setSuggestions({ headline: cat.headline, templates: cat.templates });
      } else if (value.length >= 15) {
        setSuggestions({ headline: "Here are some starting blueprints that worked", templates: DEFAULT_SUGGESTIONS });
      } else {
        setSuggestions(null);
      }
    }, 600);
  }

  // Cleanup debounce on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const ideaScore = useMemo(() => scoreIdea(ideaText), [ideaText]);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <input type="hidden" name="tool_type" value={toolType} />

      {/* Error */}
      {state.error && (
        <div role="alert" style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)",
          borderRadius: 10, padding: "12px 14px",
          fontSize: "0.85rem", color: "rgba(252,165,165,0.85)",
        }}>
          <span style={{ flexShrink: 0, lineHeight: 1.3 }}>⚠</span>
          <span>{state.error}</span>
        </div>
      )}

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
            onChange={e => handleTextChange(e.target.value)}
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

      {/* ── Idea quality score ── */}
      {charCount >= 10 && !pending && (
        <div style={{ animation: "fadeInUp 0.3s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
              Idea quality
            </span>
            <span style={{
              fontSize: "0.75rem", fontWeight: 700,
              color: ideaScore.score >= 71 ? "#34d399" : ideaScore.score >= 41 ? "#fbbf24" : "#f87171",
            }}>
              {ideaScore.score}/100
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${ideaScore.score}%`,
              borderRadius: 9999,
              background: ideaScore.score >= 71
                ? "linear-gradient(90deg,#059669,#34d399)"
                : ideaScore.score >= 41
                ? "linear-gradient(90deg,#d97706,#fbbf24)"
                : "linear-gradient(90deg,#dc2626,#f87171)",
              transition: "width 0.4s ease, background 0.4s ease",
            }} />
          </div>
          {ideaScore.tip && (
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: "6px 0 0", lineHeight: 1.5 }}>
              💡 {ideaScore.tip}
            </p>
          )}
        </div>
      )}

      {/* ── Smart suggestions panel ── */}
      {suggestions && !pending && (
        <div style={{ animation: "fadeInUp 0.35s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#a78bfa", boxShadow: "0 0 6px rgba(167,139,250,0.7)",
              flexShrink: 0, animation: "pulseGlow 2s ease-in-out infinite",
            }} />
            <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(167,139,250,0.7)", margin: 0, letterSpacing: "0.02em" }}>
              {suggestions.headline}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {suggestions.templates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => fillExample(tpl.text)}
                style={{
                  background: "rgba(139,92,246,0.06)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: 12, padding: "12px 14px",
                  textAlign: "left", cursor: "pointer",
                  transition: "all 0.18s ease",
                  animation: `fadeInUp 0.3s ease ${i * 0.07}s both`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.45)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.2)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa", margin: "0 0 5px" }}>
                  {tpl.label}
                </p>
                <p style={{
                  fontSize: "0.72rem", color: "rgba(255,255,255,0.35)",
                  margin: 0, lineHeight: 1.55,
                  display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {tpl.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        onMouseEnter={() => !pending && setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          width: "100%",
          background: pending
            ? "rgba(109,40,217,0.4)"
            : btnHover
              ? "linear-gradient(135deg,#8b5cf6,#7c3aed)"
              : "linear-gradient(135deg,#7c3aed,#6d28d9)",
          border: "1px solid rgba(139,92,246,0.45)",
          color: "white", padding: "14px 20px", borderRadius: 12,
          fontSize: "0.95rem", fontWeight: 600,
          cursor: pending ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: btnHover && !pending ? "translateY(-2px)" : "translateY(0)",
          transition: "all 0.22s ease",
          opacity: pending ? 0.85 : 1,
          letterSpacing: "0.01em",
          minHeight: 50,
          position: "relative", overflow: "hidden",
          // Pulse ring while generating
          animation: pending ? "ringPulse 1.4s ease-in-out infinite" : "none",
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
