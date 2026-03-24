"use client";

import Link from "next/link";

const ACTIONS = [
  {
    emoji: "⚡",
    title: "New Analysis",
    sub: "Analyze your build in 30 seconds",
    href: "/create",
    color: "#a78bfa",
    border: "rgba(139,92,246,0.2)",
    hoverBorder: "rgba(139,92,246,0.5)",
    hoverBg: "rgba(139,92,246,0.1)",
    bg: "rgba(139,92,246,0.06)",
    shadow: "rgba(139,92,246,0.18)",
  },
  {
    emoji: "🔍",
    title: "Validate Build",
    sub: "Score your idea before committing",
    href: "/validate",
    color: "#34d399",
    border: "rgba(52,211,153,0.2)",
    hoverBorder: "rgba(52,211,153,0.5)",
    hoverBg: "rgba(52,211,153,0.08)",
    bg: "rgba(52,211,153,0.04)",
    shadow: "rgba(52,211,153,0.14)",
  },
  {
    emoji: "📐",
    title: "Browse Templates",
    sub: "Start from proven build patterns",
    href: "/templates",
    color: "#60a5fa",
    border: "rgba(96,165,250,0.2)",
    hoverBorder: "rgba(96,165,250,0.5)",
    hoverBg: "rgba(96,165,250,0.08)",
    bg: "rgba(96,165,250,0.04)",
    shadow: "rgba(96,165,250,0.14)",
  },
  {
    emoji: "🤖",
    title: "AI Advisor",
    sub: "Chat with your AI build advisor",
    href: "/create",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.2)",
    hoverBorder: "rgba(251,191,36,0.5)",
    hoverBg: "rgba(251,191,36,0.08)",
    bg: "rgba(251,191,36,0.04)",
    shadow: "rgba(251,191,36,0.14)",
  },
];

export function QuickActions() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 10,
    }}>
      {ACTIONS.map((a) => (
        <Link
          key={a.title}
          href={a.href}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            background: a.bg,
            border: `1px solid ${a.border}`,
            borderRadius: 12, padding: "13px 15px",
            textDecoration: "none", color: "inherit",
            transition: "all 0.18s ease",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.borderColor = a.hoverBorder;
            el.style.background = a.hoverBg;
            el.style.transform = "translateY(-2px)";
            el.style.boxShadow = `0 8px 24px ${a.shadow}`;
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.borderColor = a.border;
            el.style.background = a.bg;
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "none";
          }}
        >
          <span style={{ fontSize: "1.3rem", flexShrink: 0, lineHeight: 1 }}>
            {a.emoji}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: "0.82rem", fontWeight: 700,
              color: "rgba(255,255,255,0.88)",
              marginBottom: 2, whiteSpace: "nowrap",
            }}>
              {a.title}
            </div>
            <div style={{
              fontSize: "0.68rem", color: "rgba(255,255,255,0.38)",
              lineHeight: 1.35, overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {a.sub}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
