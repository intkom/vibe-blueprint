import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { CreateProjectForm } from "@/components/create-project-form";
import { TOOL_META, type ToolType, TOOL_TYPES } from "@/lib/tools";

type Props = {
  searchParams: Promise<{ tool?: string }>;
};

function IconArrowLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7M5 12h14" />
    </svg>
  );
}

export default async function CreatePage({ searchParams }: Props) {
  const params = await searchParams;
  const rawTool = params.tool ?? "sprint";
  const toolType: ToolType = (TOOL_TYPES as readonly string[]).includes(rawTool)
    ? (rawTool as ToolType)
    : "sprint";
  const meta = TOOL_META[toolType];

  // Accent colours per tool
  const accentColors: Record<ToolType, { beam: string; iconBg: string; iconColor: string }> = {
    validator: {
      beam: "linear-gradient(90deg, transparent, rgba(251,191,36,0.6), rgba(251,191,36,0.3), transparent)",
      iconBg: "linear-gradient(135deg,#d97706,#f59e0b)",
      iconColor: "#fbbf24",
    },
    stack: {
      beam: "linear-gradient(90deg, transparent, rgba(139,92,246,0.65), rgba(236,72,153,0.35), transparent)",
      iconBg: "linear-gradient(135deg,#7c3aed,#5b21b6)",
      iconColor: "#a78bfa",
    },
    monetization: {
      beam: "linear-gradient(90deg, transparent, rgba(52,211,153,0.6), rgba(52,211,153,0.3), transparent)",
      iconBg: "linear-gradient(135deg,#059669,#34d399)",
      iconColor: "#34d399",
    },
    sprint: {
      beam: "linear-gradient(90deg, transparent, rgba(96,165,250,0.6), rgba(96,165,250,0.3), transparent)",
      iconBg: "linear-gradient(135deg,#2563eb,#60a5fa)",
      iconColor: "#60a5fa",
    },
  };
  const colors = accentColors[toolType];

  const tips: Record<ToolType, { icon: string; text: string }[]> = {
    validator: [
      { icon: "🎯", text: "Who specifically has this problem? Name a job title or type of person." },
      { icon: "🔥", text: "How often do they feel this pain? Daily hurts more than quarterly." },
      { icon: "💸", text: "Have you seen anyone pay for a solution to this, even a hacky one?" },
      { icon: "⚡", text: "What's the one reason this idea could be dead on arrival?" },
    ],
    stack: [
      { icon: "👤", text: "Mention your team size — solo changes the stack vs 3-person team." },
      { icon: "⏱", text: "How fast do you need to ship? 2 weeks vs 3 months matters." },
      { icon: "🔑", text: "Any hard requirements? Real-time, mobile, file uploads, multi-tenant?" },
      { icon: "🚫", text: "Technologies you've already ruled out — saves time on the output." },
    ],
    monetization: [
      { icon: "💰", text: "Who pays — the user, their employer, or someone else entirely?" },
      { icon: "📈", text: "How does value grow over time? More data, more users, more features?" },
      { icon: "🧱", text: "Do users get more value the longer they use it? Or is it one-shot?" },
      { icon: "🏢", text: "Is this B2C, B2B SMB, or enterprise? Each needs a different model." },
    ],
    sprint: [
      { icon: "🎯", text: "Describe your target user — who has this problem?" },
      { icon: "🛠", text: "Mention your preferred tech stack if you have one." },
      { icon: "💡", text: "Explain the core problem your product solves." },
      { icon: "📦", text: "Note any features that are must-haves for v1." },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--vs-bg)", color: "var(--vs-text)", position: "relative", overflow: "hidden" }}>

      {/* Gradient mesh */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 70% 55% at 70% -5%, rgba(124,58,237,0.18) 0%, transparent 60%)",
          "radial-gradient(ellipse 45% 35% at 10% 75%, rgba(236,72,153,0.08) 0%, transparent 55%)",
          "#030014",
        ].join(","),
      }} />
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.015,
        backgroundImage: "linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(ellipse 80% 50% at 70% 0%, black 20%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 70% 0%, black 20%, transparent 70%)",
      }} />

      <AppHeader />

      <main style={{ position: "relative", zIndex: 10, maxWidth: 680, margin: "0 auto", padding: "44px 24px 80px" }}>

        {/* Back link */}
        <Link href="/tools" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontSize: "0.82rem", color: "rgba(255,255,255,0.32)",
          textDecoration: "none", marginBottom: 32,
        }}>
          <IconArrowLeft />
          Back to tools
        </Link>

        {/* ── Main card ── */}
        <div style={{
          background: "rgba(10,6,30,0.75)",
          backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(139,92,246,0.18)",
          borderRadius: 24, overflow: "hidden",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.08)",
          position: "relative",
        }}>
          {/* Top beam — colour per tool */}
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "70%", height: 1,
            background: colors.beam,
          }} />

          {/* Card header */}
          <div style={{
            padding: "28px 32px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: colors.iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 20px ${colors.iconColor}44`,
                color: "white", fontSize: 18,
              }}>
                ✦
              </div>
              <div>
                <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.95)" }}>
                  {meta.label}
                </h1>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>
                  {meta.tagline} · Powered by Claude
                </p>
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)",
              borderRadius: 9999, padding: "5px 12px",
              fontSize: "0.72rem", fontWeight: 600, color: "rgba(167,139,250,0.8)",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa", flexShrink: 0 }} />
              {meta.badge}
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: "28px 32px 32px" }}>
            <CreateProjectForm toolType={toolType} />
          </div>
        </div>

        {/* ── Tips ── */}
        <div style={{
          marginTop: 16,
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 18, padding: "20px 24px",
        }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 14 }}>
            Tips for better output
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px 24px" }}>
            {tips[toolType].map(tip => (
              <div key={tip.text} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <span style={{ fontSize: "0.9rem", flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.32)", lineHeight: 1.55 }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
