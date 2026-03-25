import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppHeader } from "@/components/app-header";
import { type ProjectRow, type StepStats } from "@/components/project-card";
import { OnboardingModal } from "@/components/onboarding-modal";
import { ExtensionPromoBanner } from "@/components/extension-promo-banner";
import { QuickAnalyzeWidget, RecentInsightsWidget, type InsightItem } from "@/components/dashboard-widgets";
import { DashboardAnalysesList, type AnalysisListEntry } from "@/components/dashboard-analyses-list";
import type { AnalysisData } from "@/app/api/analyze/route";
import { UsageIndicatorClient } from "@/components/usage-indicator-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard – Axiom",
  description: "Manage your analyses, build clarity reports, and execution paths.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: projects, error }, { data: profile }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, raw_idea, created_at, updated_at, analysis")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("analyses_used, bonus_analyses, plan")
      .eq("id", user.id)
      .single(),
  ]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--vs-bg)", color: "var(--vs-text)" }}>
        <AppHeader />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 28px" }}>
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: 28 }}>
            <p style={{ color: "rgba(252,165,165,0.8)", fontSize: "0.875rem", margin: 0 }}>
              Could not load projects: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const rows = (projects ?? []) as ProjectRow[];

  /* ── Step stats ── */
  const stepStatsMap: Record<string, StepStats> = {};
  const toolTypeMap: Record<string, string | null> = {};

  if (rows.length > 0) {
    const { data: stepsData } = await supabase
      .from("build_steps")
      .select("project_id, status, step_index, phase")
      .in("project_id", rows.map(r => r.id));

    for (const step of stepsData ?? []) {
      if (!stepStatsMap[step.project_id]) stepStatsMap[step.project_id] = { total: 0, completed: 0 };
      stepStatsMap[step.project_id].total++;
      if (step.status === "complete") stepStatsMap[step.project_id].completed++;
      if (step.step_index === 0 && step.phase) {
        const TOOL_PHASES = ["validator", "stack", "monetization"];
        toolTypeMap[step.project_id] = TOOL_PHASES.includes(step.phase) ? step.phase : "sprint";
      }
    }
  }

  const entries = rows.map(project => {
    const stats = stepStatsMap[project.id] ?? { total: 0, completed: 0 };
    const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const isDone = stats.total > 0 && stats.completed === stats.total;
    const a = project.analysis as AnalysisData | null;
    return {
      project, stats, pct, isDone,
      toolType: toolTypeMap[project.id] ?? null,
      health_score: a?.health_score,
      health_label: a?.health_label,
      topRisk: a?.risk_areas?.[0] ?? null,
    };
  });

  const completedCount = entries.filter(e => e.isDone).length;
  const inProgressCount = rows.length - completedCount;
  const name = user.email?.split("@")[0] ?? "there";

  const isPro = (profile?.plan ?? "free") !== "free";
  const analysesUsed = profile?.analyses_used ?? 0;
  const analysesLimit = 3 + (profile?.bonus_analyses ?? 0);

  /* ── Avg health score ── */
  const scoredEntries = entries.filter(e => e.health_score !== undefined);
  const avgHealthScore = scoredEntries.length > 0
    ? Math.round(scoredEntries.reduce((s, e) => s + (e.health_score ?? 0), 0) / scoredEntries.length)
    : null;

  /* ── Today's Focus ── */
  const focusEntry = entries
    .filter(e => !e.isDone && e.project.analysis)
    .sort((a, b) => new Date(b.project.updated_at ?? 0).getTime() - new Date(a.project.updated_at ?? 0).getTime())[0] ?? null;

  const focusProject = focusEntry ? (() => {
    const diff = Date.now() - new Date(focusEntry.project.updated_at ?? focusEntry.project.created_at ?? 0).getTime();
    const daysAgo = Math.floor(diff / (1000 * 60 * 60 * 24));
    return {
      id: focusEntry.project.id,
      title: focusEntry.project.title ?? "Untitled",
      health_score: focusEntry.health_score,
      health_label: focusEntry.health_label,
      pct: focusEntry.pct,
      topRisk: focusEntry.topRisk ? `${focusEntry.topRisk.title}: ${focusEntry.topRisk.description}` : null,
      lastActivity: daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo}d ago`,
    };
  })() : null;

  /* ── Recent insights ── */
  const recentInsights: InsightItem[] = entries
    .filter(e => e.project.analysis)
    .slice(0, 3)
    .map(e => {
      const a = e.project.analysis as AnalysisData;
      const risk = a.risk_areas?.[0];
      return {
        projectId: e.project.id,
        projectTitle: e.project.title ?? "Untitled",
        insight: risk ? `Top risk: ${risk.title} — ${risk.description}` : a.summary ?? "",
        type: risk ? "risk" : "health",
      };
    });

  /* ── List entries for DashboardAnalysesList ── */
  const listEntries: AnalysisListEntry[] = entries.map(e => ({
    id: e.project.id,
    title: e.project.title ?? "Untitled",
    pct: e.pct,
    isDone: e.isDone,
    health_score: e.health_score,
    health_label: e.health_label,
  }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--vs-bg)", color: "var(--vs-text)", position: "relative" }}>
      <OnboardingModal />

      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 55% 35% at 75% 0%, rgba(124,58,237,0.14) 0%, transparent 65%)",
          "radial-gradient(ellipse 35% 25% at 10% 85%, rgba(139,92,246,0.06) 0%, transparent 60%)",
        ].join(","),
      }} />

      <AppHeader />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "48px 28px 96px" }}>

        {/* Extension promo */}
        <ExtensionPromoBanner />

        {/* ── 1. Header row: greeting + new analysis ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, marginBottom: 28, flexWrap: "wrap",
        }}>
          <div>
            <h1 style={{
              fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.88)", margin: "0 0 4px",
            }}>
              Hey, {name} 👋
            </h1>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>
              {rows.length === 0
                ? "Start your first analysis to get clarity on your build."
                : inProgressCount > 0
                  ? `${inProgressCount} in progress · ${completedCount} completed`
                  : `${completedCount} ${completedCount === 1 ? "analysis" : "analyses"} completed`}
            </p>
          </div>
          <Link
            href="/create"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "white", padding: "10px 20px", borderRadius: 10,
              fontSize: "0.875rem", fontWeight: 700, textDecoration: "none",
              boxShadow: "0 0 24px rgba(139,92,246,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Analysis
          </Link>
        </div>

        {/* Usage indicator (free plan) */}
        {!isPro && (
          <div style={{ marginBottom: 20 }}>
            <UsageIndicatorClient used={analysesUsed} limit={analysesLimit} />
          </div>
        )}

        {/* ── 2. Stats row: 4 equal cards ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12,
          marginBottom: 24,
        }}>
          {[
            { label: "Total", value: rows.length, color: "#a78bfa" },
            { label: "In Progress", value: inProgressCount, color: "#60a5fa" },
            { label: "Completed", value: completedCount, color: "#34d399" },
            {
              label: "Avg Health Score",
              value: avgHealthScore !== null ? `${avgHealthScore}/100` : "—",
              color: avgHealthScore !== null
                ? avgHealthScore >= 76 ? "#34d399" : avgHealthScore >= 61 ? "#60a5fa" : avgHealthScore >= 41 ? "#fbbf24" : "#fb923c"
                : "rgba(255,255,255,0.25)",
            },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "18px 20px",
            }}>
              <div style={{
                fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
                color: stat.color, marginBottom: 6,
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.32)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── 3. Two columns 60/40: Today's Focus + Quick Analyze ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24,
          marginBottom: 24,
        }}>
          {/* TODAY'S FOCUS */}
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: "0 0 10px" }}>
              Today&apos;s Focus
            </p>
            {focusProject ? (
              <TodayFocusCard project={focusProject} />
            ) : (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "28px 24px", textAlign: "center",
              }}>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.3)", margin: "0 0 14px", lineHeight: 1.6 }}>
                  {rows.length === 0
                    ? "Analyze your first build idea to see your focus here."
                    : "All analyses completed! Start a new one to keep momentum."}
                </p>
                <Link href="/create" style={{
                  display: "inline-block",
                  background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
                  color: "#a78bfa", padding: "8px 20px", borderRadius: 8,
                  fontSize: "0.82rem", fontWeight: 600, textDecoration: "none",
                }}>
                  Start new →
                </Link>
              </div>
            )}
          </div>

          {/* QUICK ANALYZE */}
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: "0 0 10px" }}>
              Quick Analyze
            </p>
            <QuickAnalyzeWidget />
            <div style={{ marginTop: 10, textAlign: "center" }}>
              <Link href="/templates" style={{
                fontSize: "0.75rem", color: "rgba(167,139,250,0.5)", textDecoration: "none",
              }}>
                Browse templates →
              </Link>
            </div>
          </div>
        </div>

        {/* ── 4. YOUR ANALYSES — full-width list ── */}
        {rows.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>
                Your Analyses
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>
                {rows.length} {rows.length === 1 ? "analysis" : "analyses"}
              </span>
            </div>
            <DashboardAnalysesList entries={listEntries} />
          </div>
        )}

        {/* Empty state */}
        {rows.length === 0 && <EmptyState />}

        {/* ── 5. Two columns 50/50: Quick Actions + Recent Insights ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 8 }}>
          {/* QUICK ACTIONS 2×2 */}
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: "0 0 10px" }}>
              Quick Actions
            </p>
            <QuickActionsGrid />
          </div>

          {/* RECENT INSIGHTS */}
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: "0 0 10px" }}>
              Recent Insights
            </p>
            {recentInsights.length > 0 ? (
              <RecentInsightsWidget insights={recentInsights} />
            ) : (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, padding: "22px 20px",
                color: "rgba(255,255,255,0.22)", fontSize: "0.82rem", textAlign: "center",
              }}>
                Insights appear after your first analysis.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Today's Focus big card ── */
type FocusCardProps = {
  project: {
    id: string;
    title: string;
    health_score?: number;
    health_label?: string;
    pct: number;
    topRisk: string | null;
    lastActivity: string;
  };
};

function healthColor(score?: number) {
  if (!score) return "#a78bfa";
  if (score >= 76) return "#34d399";
  if (score >= 61) return "#60a5fa";
  if (score >= 41) return "#fbbf24";
  return "#fb923c";
}

function TodayFocusCard({ project }: FocusCardProps) {
  const hc = healthColor(project.health_score);
  return (
    <div style={{
      background: `linear-gradient(135deg, ${hc}07, rgba(255,255,255,0.015))`,
      border: `1px solid ${hc}22`,
      borderRadius: 14, padding: "22px 24px",
    }}>
      {/* Title + health */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <h3 style={{
          fontSize: "1rem", fontWeight: 800, color: "rgba(255,255,255,0.85)",
          margin: 0, letterSpacing: "-0.02em", lineHeight: 1.3,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {project.title}
        </h3>
        {project.health_score !== undefined && (
          <span style={{
            flexShrink: 0,
            fontSize: "0.7rem", fontWeight: 800,
            color: hc, background: `${hc}12`,
            border: `1px solid ${hc}30`,
            padding: "4px 10px", borderRadius: 9999,
            whiteSpace: "nowrap",
          }}>
            {project.health_score}/100 {project.health_label}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>Build progress</span>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: hc }}>{project.pct}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 9999,
            width: `${project.pct}%`,
            background: `linear-gradient(90deg,${hc}88,${hc})`,
          }} />
        </div>
      </div>

      {/* Top risk */}
      {project.topRisk && (
        <div style={{
          background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.12)",
          borderRadius: 8, padding: "9px 12px", marginBottom: 16,
        }}>
          <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(248,113,113,0.5)", margin: "0 0 3px" }}>
            Top risk
          </p>
          <p style={{
            fontSize: "0.78rem", color: "rgba(248,113,113,0.75)", margin: 0, lineHeight: 1.5,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {project.topRisk}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
          Last active {project.lastActivity}
        </span>
        <a
          href={`/project/${project.id}/analysis`}
          style={{
            background: `${hc}18`, border: `1px solid ${hc}35`,
            color: hc, padding: "8px 18px", borderRadius: 9,
            fontSize: "0.8rem", fontWeight: 700, textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Continue →
        </a>
      </div>
    </div>
  );
}

/* ── Quick Actions 2×2 grid ── */
const QUICK_ACTIONS = [
  { emoji: "⚡", title: "New Analysis", sub: "30-second build clarity", href: "/create", color: "#a78bfa", bg: "rgba(139,92,246,0.06)", border: "rgba(139,92,246,0.2)" },
  { emoji: "🔍", title: "Validate Idea", sub: "Score before you commit", href: "/validate", color: "#34d399", bg: "rgba(52,211,153,0.04)", border: "rgba(52,211,153,0.2)" },
  { emoji: "📐", title: "Templates", sub: "Start from proven patterns", href: "/templates", color: "#60a5fa", bg: "rgba(96,165,250,0.04)", border: "rgba(96,165,250,0.2)" },
  { emoji: "⚙️", title: "Settings", sub: "Manage your account", href: "/settings", color: "#fbbf24", bg: "rgba(251,191,36,0.04)", border: "rgba(251,191,36,0.2)" },
];

function QuickActionsGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {QUICK_ACTIONS.map(a => (
        <Link
          key={a.title}
          href={a.href}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: a.bg, border: `1px solid ${a.border}`,
            borderRadius: 11, padding: "12px 14px",
            textDecoration: "none", color: "inherit",
          }}
        >
          <span style={{ fontSize: "1.2rem", flexShrink: 0, lineHeight: 1 }}>{a.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.82)", marginBottom: 1, whiteSpace: "nowrap" }}>
              {a.title}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {a.sub}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ── Empty state ── */
function EmptyState() {
  const QUICK_TEMPLATES = [
    { icon: "🖥", title: "SaaS Tool", idea: "A B2B SaaS that helps marketing teams schedule and publish social media posts across all platforms. Built with Next.js and Supabase. Subscription pricing $29/mo." },
    { icon: "📱", title: "Mobile App", idea: "A habit tracker app for athletes — log workouts, streaks, and personal bests. Mobile-first. Syncs with Apple Health. Free + $4.99/mo premium." },
    { icon: "🧠", title: "AI Product", idea: "An AI writing assistant for content creators — paste a topic, get a full blog post draft with SEO suggestions. Built with Next.js + Claude API." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px 60px", textAlign: "center" }}>
      <div aria-hidden="true" style={{ position: "relative", width: 120, height: 90, marginBottom: 28 }}>
        {[
          { t: 4, l: 8, s: 5, c: "#a78bfa", o: 0.6 }, { t: 2, l: 55, s: 3, c: "#c084fc", o: 0.4 },
          { t: 16, l: 102, s: 4, c: "#818cf8", o: 0.5 }, { t: 58, l: 100, s: 3, c: "#a78bfa", o: 0.35 },
          { t: 68, l: 14, s: 4, c: "#7c3aed", o: 0.45 }, { t: 60, l: 52, s: 5, c: "#c084fc", o: 0.3 },
        ].map((d, i) => (
          <div key={i} style={{
            position: "absolute", top: d.t, left: d.l, width: d.s, height: d.s, borderRadius: "50%",
            background: d.c, opacity: d.o, boxShadow: `0 0 ${d.s * 2}px ${d.c}`,
          }} />
        ))}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(139,92,246,0.08))",
          border: "1px solid rgba(139,92,246,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem", boxShadow: "0 0 32px rgba(139,92,246,0.2)",
        }}>✦</div>
      </div>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.75)", margin: "0 0 8px" }}>
        No analyses yet
      </h2>
      <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.28)", margin: "0 0 24px", lineHeight: 1.7, maxWidth: 320 }}>
        Paste your first idea and get clarity in 30 seconds — risks, execution path, health score.
      </p>
      <Link href="/create" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "1px solid rgba(139,92,246,0.5)",
        color: "white", padding: "12px 26px", borderRadius: 11,
        fontSize: "0.9rem", fontWeight: 700, textDecoration: "none",
        boxShadow: "0 0 32px rgba(139,92,246,0.35)", marginBottom: 36,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Analyze my first build →
      </Link>
      <div style={{ width: "100%", maxWidth: 640 }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", marginBottom: 12 }}>
          Or start with a template
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
          {QUICK_TEMPLATES.map(tpl => (
            <Link
              key={tpl.title}
              href={`/create?idea=${encodeURIComponent(tpl.idea)}`}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "16px", textDecoration: "none", textAlign: "left",
              }}
            >
              <span style={{ fontSize: "1.4rem", marginBottom: 8 }}>{tpl.icon}</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 4 }}>
                {tpl.title}
              </span>
              <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {tpl.idea}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
