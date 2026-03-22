import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blueprint Templates – VibeStep",
  description: "Start faster with 6 battle-tested startup blueprints. SaaS, AI tools, APIs, mobile apps — pick a template and go.",
};

const TEMPLATES = [
  {
    id: "ai-saas",
    category: "AI Tool",
    categoryColor: "#a78bfa",
    categoryBg: "rgba(139,92,246,0.1)",
    categoryBorder: "rgba(139,92,246,0.25)",
    title: "AI SaaS Starter",
    description: "Full-stack AI-powered SaaS with subscription billing, user auth, and Claude/GPT integration. Production-ready from day one.",
    stack: ["Next.js 15", "Supabase", "Stripe", "Claude API"],
    steps: 10,
    timeEstimate: "3–5 weeks",
    difficulty: "Intermediate",
    difficultyColor: "#fbbf24",
    emoji: "🤖",
    idea: "Build an AI SaaS product with subscription billing, user authentication, Claude AI integration, and a clean dashboard for users to manage their usage.",
  },
  {
    id: "mobile-app",
    category: "Mobile App",
    categoryColor: "#60a5fa",
    categoryBg: "rgba(96,165,250,0.1)",
    categoryBorder: "rgba(96,165,250,0.25)",
    title: "React Native Companion App",
    description: "Cross-platform mobile app with push notifications, offline sync, and onboarding flow. iOS and Android from one codebase.",
    stack: ["React Native", "Expo", "Supabase", "OneSignal"],
    steps: 10,
    timeEstimate: "4–6 weeks",
    difficulty: "Intermediate",
    difficultyColor: "#fbbf24",
    emoji: "📱",
    idea: "Build a React Native mobile app with Expo, user authentication, push notifications, offline data sync, and a polished onboarding flow for iOS and Android.",
  },
  {
    id: "api-platform",
    category: "Developer Tool",
    categoryColor: "#34d399",
    categoryBg: "rgba(52,211,153,0.1)",
    categoryBorder: "rgba(52,211,153,0.25)",
    title: "REST API Platform",
    description: "Production-grade API with rate limiting, API keys, docs site, and a developer dashboard. Monetize your data or service.",
    stack: ["Node.js", "Hono", "PostgreSQL", "Redis"],
    steps: 10,
    timeEstimate: "2–3 weeks",
    difficulty: "Advanced",
    difficultyColor: "#f87171",
    emoji: "⚡",
    idea: "Build a production REST API platform with API key authentication, rate limiting, usage analytics, auto-generated docs, and a developer dashboard for managing integrations.",
  },
  {
    id: "ecommerce",
    category: "E-commerce",
    categoryColor: "#fb923c",
    categoryBg: "rgba(251,146,60,0.1)",
    categoryBorder: "rgba(251,146,60,0.25)",
    title: "Niche E-commerce Store",
    description: "High-converting online store with cart, checkout, inventory management, and abandoned cart emails. Built to sell.",
    stack: ["Next.js", "Stripe", "Sanity CMS", "Resend"],
    steps: 10,
    timeEstimate: "2–4 weeks",
    difficulty: "Beginner",
    difficultyColor: "#34d399",
    emoji: "🛍️",
    idea: "Build a niche e-commerce store with product catalog, shopping cart, Stripe checkout, inventory management, and automated abandoned cart recovery emails.",
  },
  {
    id: "b2b-saas",
    category: "SaaS",
    categoryColor: "#ec4899",
    categoryBg: "rgba(236,72,153,0.1)",
    categoryBorder: "rgba(236,72,153,0.25)",
    title: "B2B Analytics Dashboard",
    description: "Multi-tenant analytics dashboard with org management, custom reports, CSV export, and role-based access control.",
    stack: ["Next.js", "Prisma", "PostgreSQL", "Recharts"],
    steps: 10,
    timeEstimate: "4–7 weeks",
    difficulty: "Advanced",
    difficultyColor: "#f87171",
    emoji: "📊",
    idea: "Build a multi-tenant B2B analytics dashboard with organization management, role-based access control, customizable reports, data visualization, and CSV/PDF export.",
  },
  {
    id: "chrome-extension",
    category: "Developer Tool",
    categoryColor: "#34d399",
    categoryBg: "rgba(52,211,153,0.1)",
    categoryBorder: "rgba(52,211,153,0.25)",
    title: "AI Chrome Extension",
    description: "Browser extension that adds AI superpowers to any website. Summarize, rewrite, translate — all without leaving the tab.",
    stack: ["React", "TypeScript", "Chrome APIs", "OpenAI"],
    steps: 10,
    timeEstimate: "1–2 weeks",
    difficulty: "Intermediate",
    difficultyColor: "#fbbf24",
    emoji: "🔌",
    idea: "Build a Chrome extension that uses AI to help users summarize pages, rewrite selected text, translate content, and save highlights — with a popup UI and background sync.",
  },
];

const DIFFICULTY_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  Beginner:     { bg: "rgba(52,211,153,0.08)",  text: "#34d399", border: "rgba(52,211,153,0.2)"  },
  Intermediate: { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.2)"  },
  Advanced:     { bg: "rgba(248,113,113,0.08)", text: "#f87171", border: "rgba(248,113,113,0.2)" },
};

export default function TemplatesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "white", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 60% 40% at 80% 5%, rgba(124,58,237,0.15) 0%, transparent 60%)",
          "radial-gradient(ellipse 45% 35% at 10% 80%, rgba(52,211,153,0.06) 0%, transparent 55%)",
          "#030014",
        ].join(","),
      }} />

      <AppHeader />

      <main style={{ position: "relative", zIndex: 10, maxWidth: 1060, margin: "0 auto", padding: "52px 24px 100px" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            display: "inline-block", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
            color: "#a78bfa", padding: "5px 14px", borderRadius: 9999, marginBottom: 20,
          }}>
            Blueprint Templates
          </span>
          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, letterSpacing: "-0.03em",
            margin: "0 0 14px",
            background: "linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,255,255,0.6))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Start with a proven blueprint
          </h1>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.38)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            6 battle-tested templates built for common startup patterns. Pick one, customize the idea, and get your full build plan in 30 seconds.
          </p>
        </div>

        {/* ── Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {TEMPLATES.map((t) => {
            const diff = DIFFICULTY_BADGE[t.difficulty];
            const idea = encodeURIComponent(t.idea);
            return (
              <div
                key={t.id}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20, padding: "24px",
                  display: "flex", flexDirection: "column", gap: 0,
                  transition: "all 0.22s ease",
                  position: "relative", overflow: "hidden",
                }}
              >
                {/* Top beam */}
                <div aria-hidden="true" style={{
                  position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
                  background: `linear-gradient(90deg,transparent,${t.categoryColor}55,transparent)`,
                }} />

                {/* Emoji + category */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: "2rem" }}>{t.emoji}</span>
                  <span style={{
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                    background: t.categoryBg, border: `1px solid ${t.categoryBorder}`,
                    color: t.categoryColor, padding: "4px 10px", borderRadius: 9999,
                  }}>
                    {t.category}
                  </span>
                </div>

                {/* Title + description */}
                <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "rgba(255,255,255,0.9)", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                  {t.title}
                </h2>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: "0 0 18px", flex: 1 }}>
                  {t.description}
                </p>

                {/* Stack tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                  {t.stack.map(tag => (
                    <span key={tag} style={{
                      fontSize: "0.65rem", fontWeight: 600,
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.45)", padding: "3px 9px", borderRadius: 6,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta row */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>⏱ {t.timeEstimate}</span>
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.15)" }}>·</span>
                  <span style={{
                    fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em",
                    background: diff.bg, border: `1px solid ${diff.border}`,
                    color: diff.text, padding: "2px 8px", borderRadius: 9999,
                  }}>{t.difficulty}</span>
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{t.steps} steps</span>
                </div>

                {/* CTA */}
                <Link
                  href={`/create?idea=${idea}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    border: "1px solid rgba(139,92,246,0.45)", color: "white",
                    padding: "10px 16px", borderRadius: 11,
                    fontSize: "0.82rem", fontWeight: 700, textDecoration: "none",
                    letterSpacing: "0.01em",
                  }}
                >
                  Use this template →
                </Link>
              </div>
            );
          })}
        </div>

        {/* ── Custom CTA ── */}
        <div style={{
          marginTop: 56, textAlign: "center",
          background: "rgba(10,6,30,0.6)", backdropFilter: "blur(16px)",
          border: "1px dashed rgba(139,92,246,0.2)", borderRadius: 20, padding: "40px 28px",
        }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "rgba(255,255,255,0.75)", margin: "0 0 8px" }}>
            Have your own idea?
          </p>
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", margin: "0 0 20px" }}>
            Skip the templates — paste your raw idea and get a custom blueprint in 30 seconds.
          </p>
          <Link href="/create" style={{
            display: "inline-flex", alignItems: "center",
            background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
            color: "#a78bfa", padding: "10px 24px", borderRadius: 10,
            fontSize: "0.88rem", fontWeight: 600, textDecoration: "none",
          }}>
            Start from scratch →
          </Link>
        </div>
      </main>
    </div>
  );
}
