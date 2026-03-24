import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations – Axiom",
  description: "Axiom works alongside the tools you already use.",
};

const INTEGRATIONS = [
  {
    name: "Vercel",
    description: "Deploy your builds instantly. Axiom analyzes stack fit before you commit.",
    category: "Deployment",
    status: "available",
    icon: "▲",
    color: "#ffffff",
  },
  {
    name: "Supabase",
    description: "Default database recommendation for most Axiom execution paths.",
    category: "Database",
    status: "available",
    icon: "⚡",
    color: "#3ecf8e",
  },
  {
    name: "Stripe",
    description: "Axiom suggests Stripe for all payment layer architecture recommendations.",
    category: "Payments",
    status: "available",
    icon: "💳",
    color: "#635bff",
  },
  {
    name: "GitHub",
    description: "Connect your repo and run analyses from CI. Coming soon.",
    category: "Dev tools",
    status: "coming_soon",
    icon: "🐙",
    color: "#f0f6fc",
  },
  {
    name: "Notion",
    description: "Export your execution path directly to a Notion database.",
    category: "Productivity",
    status: "coming_soon",
    icon: "📝",
    color: "#ffffff",
  },
  {
    name: "Linear",
    description: "Convert execution path steps into Linear issues automatically.",
    category: "Project management",
    status: "coming_soon",
    icon: "◆",
    color: "#5e6ad2",
  },
  {
    name: "Slack",
    description: "Get analysis summaries posted to your build channel.",
    category: "Communication",
    status: "coming_soon",
    icon: "💬",
    color: "#4a154b",
  },
  {
    name: "Anthropic",
    description: "Powered by Claude — the AI engine behind every analysis.",
    category: "AI",
    status: "available",
    icon: "∞",
    color: "#cc9b7a",
  },
  {
    name: "Next.js",
    description: "The default frontend recommendation for web-based build analyses.",
    category: "Framework",
    status: "available",
    icon: "N",
    color: "#ffffff",
  },
  {
    name: "Resend",
    description: "Email delivery for weekly build digests and risk alerts.",
    category: "Email",
    status: "coming_soon",
    icon: "✉",
    color: "#4a90d9",
  },
  {
    name: "Zapier",
    description: "Trigger analyses from any workflow. Coming soon.",
    category: "Automation",
    status: "coming_soon",
    icon: "⚡",
    color: "#ff4a00",
  },
  {
    name: "PostHog",
    description: "Track which analysis insights led to product changes.",
    category: "Analytics",
    status: "coming_soon",
    icon: "🦔",
    color: "#f9bd2b",
  },
];

export default function IntegrationsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "rgba(255,255,255,0.88)", fontFamily: "inherit" }}>

      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 50% 30% at 50% -5%, rgba(124,58,237,0.14) 0%, transparent 60%)",
      }} />

      {/* Nav */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "white",
          }}>A</div>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>Axiom</span>
        </Link>
        <Link href="/dashboard" style={{
          fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.45)",
          textDecoration: "none",
        }}>
          Dashboard →
        </Link>
      </nav>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "56px 28px 96px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{
            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "rgba(167,139,250,0.6)",
            marginBottom: 14,
          }}>Ecosystem</p>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 900, letterSpacing: "-0.035em", margin: "0 0 16px" }}>
            Works with your stack
          </h1>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.7, margin: 0, maxWidth: 460, marginInline: "auto" }}>
            Axiom recommends the right tools for your build. Deep integrations coming — vote on what matters most.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
          {[
            { value: "4", label: "Available now" },
            { value: "8", label: "Coming soon" },
            { value: "∞", label: "API connections" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#a78bfa" }}>{s.value}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 14,
          marginBottom: 56,
        }}>
          {INTEGRATIONS.map(integration => (
            <div key={integration.name} style={{
              background: integration.status === "available"
                ? "rgba(255,255,255,0.04)"
                : "rgba(255,255,255,0.02)",
              border: integration.status === "available"
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(255,255,255,0.05)",
              borderRadius: 14, padding: "18px 20px",
              opacity: integration.status === "coming_soon" ? 0.65 : 1,
              position: "relative", overflow: "hidden",
            }}>
              {integration.status === "coming_soon" && (
                <span style={{
                  position: "absolute", top: 10, right: 10,
                  fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  padding: "2px 7px", borderRadius: 9999,
                }}>
                  Soon
                </span>
              )}
              <div style={{
                width: 36, height: 36, borderRadius: 10, marginBottom: 12,
                background: `${integration.color}14`,
                border: `1px solid ${integration.color}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", color: integration.color,
                fontWeight: 800,
              }}>
                {integration.icon}
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
                  {integration.name}
                </span>
                <span style={{
                  marginLeft: 7, fontSize: "0.6rem", fontWeight: 600,
                  color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  {integration.category}
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.55, margin: 0 }}>
                {integration.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16, padding: "28px 24px", textAlign: "center",
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 8px" }}>
            Request an integration
          </h3>
          <p style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.38)", margin: "0 0 18px" }}>
            Missing a tool you need? Let us know and we&apos;ll prioritize it.
          </p>
          <a
            href="mailto:integrations@axiom.build"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "white", padding: "11px 24px", borderRadius: 10,
              fontSize: "0.875rem", fontWeight: 700, textDecoration: "none",
            }}
          >
            Request integration →
          </a>
        </div>
      </div>
    </div>
  );
}
