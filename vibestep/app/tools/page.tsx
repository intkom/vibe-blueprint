"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";

const tools = [
  {
    type: "validator",
    label: "Idea Validator",
    tagline: "Is it worth building?",
    description: "Score your idea on 7 dimensions — market size, distribution, differentiation, and more. Get a verdict before you write a line of code.",
    output: "7-dimension scorecard · Verdict · Kill risk · Next action",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    accentColor: "#fbbf24",
    accentBg: "rgba(251,191,36,0.08)",
    accentBorder: "rgba(251,191,36,0.25)",
    gradient: "linear-gradient(135deg,#d97706,#f59e0b)",
    recommended: true,
  },
  {
    type: "stack",
    label: "Architecture Analysis",
    tagline: "Exactly what to build with",
    description: "Get the exact tech stack for your specific build — not generic advice. Every layer decided, with reasons and what to avoid.",
    output: "Stack table · Decisions now · Defer list · First command",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2Z" /><path d="M12 22v-6.5M22 8.5l-10 7-10-7" />
      </svg>
    ),
    accentColor: "#a78bfa",
    accentBg: "rgba(139,92,246,0.08)",
    accentBorder: "rgba(139,92,246,0.25)",
    gradient: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
    recommended: false,
  },
  {
    type: "monetization",
    label: "Pricing Intelligence",
    tagline: "How to make money from it",
    description: "Evaluate 4 pricing models for your specific product. Get an exact pricing architecture with tier limits and the UX moments that trigger upgrades.",
    output: "Model comparison · Tier structure · Upgrade triggers · Recommendation",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    accentColor: "#34d399",
    accentBg: "rgba(52,211,153,0.08)",
    accentBorder: "rgba(52,211,153,0.25)",
    gradient: "linear-gradient(135deg,#059669,#34d399)",
    recommended: false,
  },
  {
    type: "sprint",
    label: "Build Planner",
    tagline: "How to build it, step by step",
    description: "Break your build into sequenced execution steps — each 2–4 hours of focused work. With a full tech stack and architectural risk detection.",
    output: "Tech stack · Risk flags · Sequenced steps · Phase badges",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
    accentColor: "#60a5fa",
    accentBg: "rgba(96,165,250,0.08)",
    accentBorder: "rgba(96,165,250,0.25)",
    gradient: "linear-gradient(135deg,#2563eb,#60a5fa)",
    recommended: false,
  },
];

export default function ToolsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--vs-bg)", color: "var(--vs-text)", position: "relative", overflow: "hidden" }}>

      {/* Gradient mesh */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 65% 45% at 60% -5%, rgba(124,58,237,0.16) 0%, transparent 60%)",
          "radial-gradient(ellipse 40% 35% at 10% 70%, rgba(251,191,36,0.06) 0%, transparent 55%)",
          "#030014",
        ].join(","),
      }} />

      <AppHeader />

      <main style={{ position: "relative", zIndex: 10, maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", color: "rgba(167,139,250,0.55)", textTransform: "uppercase", marginBottom: 10 }}>
            Tools
          </p>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 10px", color: "rgba(255,255,255,0.95)" }}>
            Pick an analysis. Get product clarity.
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.38)", margin: 0, maxWidth: 480, lineHeight: 1.65 }}>
            Each tool takes your build description and returns a decision-ready output — not paragraphs. Run them in sequence for complete product intelligence.
          </p>
        </div>

        {/* Tool grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "1rem" }}>
          {tools.map((tool) => (
            <ToolCard key={tool.type} tool={tool} />
          ))}
        </div>

        {/* Sequence hint */}
        <div style={{
          marginTop: 40,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, padding: "18px 22px",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
            Recommended sequence
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Validate", color: "#fbbf24" },
              { label: "Architecture", color: "#a78bfa" },
              { label: "Pricing", color: "#34d399" },
              { label: "Build", color: "#60a5fa" },
            ].map((step, i) => (
              <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.8rem" }}>→</span>}
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: step.color }}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolCard({ tool }: { tool: typeof tools[0] }) {
  return (
    <Link
      href={`/create?tool=${tool.type}`}
      style={{
        display: "block", textDecoration: "none", color: "white",
        background: "rgba(255,255,255,0.025)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        border: `1px solid ${tool.accentBorder}`,
        borderRadius: 20, padding: "26px 24px",
        position: "relative", overflow: "hidden",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = `0 20px 44px ${tool.accentBg}, 0 0 0 1px ${tool.accentBorder.replace("0.25)", "0.5)")}`;
        el.style.background = "rgba(255,255,255,0.045)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "";
        el.style.background = "rgba(255,255,255,0.025)";
      }}
    >
      {/* Top beam */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "55%", height: 1,
        background: `linear-gradient(90deg, transparent, ${tool.accentColor}88, transparent)`,
      }} />

      {/* Recommended badge */}
      {tool.recommended && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)",
          color: "#fbbf24", padding: "3px 8px", borderRadius: 9999,
        }}>Start here</div>
      )}

      {/* Icon */}
      <div style={{
        width: 46, height: 46, borderRadius: 12, marginBottom: 16,
        background: tool.accentBg, border: `1px solid ${tool.accentBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: tool.accentColor,
      }}>
        {tool.icon}
      </div>

      {/* Text */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <h2 style={{ fontWeight: 800, fontSize: "1rem", margin: 0, color: "rgba(255,255,255,0.92)" }}>
            {tool.label}
          </h2>
          <span style={{ fontSize: "0.75rem", color: tool.accentColor, fontWeight: 500 }}>
            {tool.tagline}
          </span>
        </div>
        <p style={{ fontSize: "0.845rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.68, margin: 0 }}>
          {tool.description}
        </p>
      </div>

      {/* Output preview */}
      <div style={{
        background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10, padding: "10px 14px",
      }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 6px" }}>
          Output
        </p>
        <p style={{ fontSize: "0.78rem", color: tool.accentColor, margin: 0, fontWeight: 500, opacity: 0.85 }}>
          {tool.output}
        </p>
      </div>

      {/* CTA row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 16 }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: tool.accentColor }}>
          Run this tool →
        </span>
      </div>
    </Link>
  );
}
