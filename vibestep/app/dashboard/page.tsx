import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppHeader } from "@/components/app-header";
import { type ProjectRow, type StepStats } from "@/components/project-card";
import { ProjectList } from "@/components/project-list";
import { OnboardingModal } from "@/components/onboarding-modal";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import { QuickActions } from "@/components/quick-actions";
import { ExtensionPromoBanner } from "@/components/extension-promo-banner";
import { TodayFocusWidget, QuickAnalyzeWidget, RecentInsightsWidget, type FocusProject, type InsightItem } from "@/components/dashboard-widgets";
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
      <div style={{ minHeight:"100vh", background:"var(--vs-bg)", color:"var(--vs-text)" }}>
        <AppHeader />
        <div style={{ maxWidth:900, margin:"0 auto", padding:"64px 28px" }}>
          <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:14, padding:28 }}>
            <p style={{ color:"rgba(252,165,165,0.8)", fontSize:"0.875rem", margin:0 }}>
              Could not load projects: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const rows = (projects ?? []) as ProjectRow[];

  /* ── Step stats ─────────────────────────────────────────── */
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
    return { project, stats, pct, isDone, toolType: toolTypeMap[project.id] ?? null };
  });

  const completedCount = entries.filter(e => e.isDone).length;
  const inProgressCount = rows.length - completedCount;
  const name = user.email?.split("@")[0] ?? "there";

  const isPro = (profile?.plan ?? "free") !== "free";
  const analysesUsed = profile?.analyses_used ?? 0;
  const analysesLimit = 3 + (profile?.bonus_analyses ?? 0);

  // Today's Focus — most recently updated project with analysis but not fully done
  const focusProject: FocusProject | null = (() => {
    const candidates = entries
      .filter(e => !e.isDone && e.project.analysis)
      .sort((a, b) => new Date(b.project.updated_at ?? 0).getTime() - new Date(a.project.updated_at ?? 0).getTime());
    const p = candidates[0]?.project;
    if (!p) return null;
    const a = p.analysis as AnalysisData | null;
    const diff = Date.now() - new Date(p.updated_at ?? p.created_at ?? 0).getTime();
    const daysAgo = Math.floor(diff / (1000 * 60 * 60 * 24));
    return {
      id: p.id,
      title: p.title ?? "Untitled",
      health_score: a?.health_score,
      health_label: a?.health_label,
      lastActivity: daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo}d ago`,
    };
  })();

  // Recent insights from analyses
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

  return (
    <div style={{ minHeight:"100vh", background:"var(--vs-bg)", color:"var(--vs-text)", position:"relative" }}>
      <OnboardingModal />

      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:[
          "radial-gradient(ellipse 55% 35% at 75% 0%, rgba(124,58,237,0.14) 0%, transparent 65%)",
          "radial-gradient(ellipse 35% 25% at 10% 85%, rgba(139,92,246,0.06) 0%, transparent 60%)",
        ].join(","),
      }} />

      <AppHeader />

      <main style={{ position:"relative", zIndex:1, maxWidth:960, margin:"0 auto", padding:"48px 28px 96px" }}>

        {/* ── Extension promo banner ── */}
        <ExtensionPromoBanner />

        {/* ── Greeting + New idea ── */}
        <div style={{ marginBottom:36 }}>
          <DashboardGreeting
            name={name}
            totalProjects={rows.length}
            inProgressCount={inProgressCount}
          />
        </div>

        {/* ── Stats row — always visible ── */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12,
          marginBottom:28,
        }}>
          {[
            { label:"Total analyses", value:rows.length,       color:"#a78bfa" },
            { label:"In progress",    value:inProgressCount,   color:"#60a5fa" },
            { label:"Completed",      value:completedCount,    color:"#34d399" },
          ].map(stat => (
            <div key={stat.label} style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:12, padding:"18px 20px",
            }}>
              <div style={{
                fontSize:"2rem", fontWeight:800, letterSpacing:"-0.04em", lineHeight:1,
                color:stat.color, marginBottom:6,
              }}>{stat.value}</div>
              <div style={{ fontSize:"0.73rem", color:"rgba(255,255,255,0.35)", fontWeight:500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Usage indicator (free plan only) ── */}
        {!isPro && (
          <div style={{ marginBottom: 16 }}>
            <UsageIndicatorClient used={analysesUsed} limit={analysesLimit} />
          </div>
        )}

        {/* ── Smart widgets row ── */}
        {(focusProject || recentInsights.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            {focusProject && <TodayFocusWidget project={focusProject} />}
            <QuickAnalyzeWidget />
            {recentInsights.length > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <RecentInsightsWidget insights={recentInsights} />
              </div>
            )}
          </div>
        )}
        {!focusProject && (
          <div style={{ marginBottom: 28 }}>
            <QuickAnalyzeWidget />
          </div>
        )}

        {/* ── Quick actions row ── */}
        <div style={{ marginBottom:48 }}>
          <QuickActions />
        </div>

        {/* ── Projects section ── */}
        {rows.length > 0 ? (
          <>
            {/* Section label */}
            <div style={{
              display:"flex", alignItems:"center", gap:14, marginBottom:18,
            }}>
              <span style={{
                fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.16em",
                textTransform:"uppercase", color:"rgba(255,255,255,0.28)",
              }}>Your analyses</span>
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.22)", fontWeight:500 }}>
                {rows.length} {rows.length === 1 ? "analysis" : "analyses"}
              </span>
            </div>

            <ProjectList entries={entries} />
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────── */
function EmptyState() {
  const QUICK_TEMPLATES = [
    { icon: "🖥", title: "SaaS Tool",      idea: "A B2B SaaS that helps marketing teams schedule and publish social media posts across all platforms. Built with Next.js and Supabase. Subscription pricing $29/mo." },
    { icon: "📱", title: "Mobile App",     idea: "A habit tracker app for athletes — log workouts, streaks, and personal bests. Mobile-first. Syncs with Apple Health. Free + $4.99/mo premium." },
    { icon: "🧠", title: "AI Product",     idea: "An AI writing assistant for content creators — paste a topic, get a full blog post draft with SEO suggestions. Built with Next.js + Claude API." },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"56px 24px 80px", textAlign:"center" }}>
      {/* Constellation illustration */}
      <div aria-hidden="true" style={{ position:"relative", width:120, height:90, marginBottom:32 }}>
        {[
          { t:4,  l:8,  s:5, c:"#a78bfa", o:0.6 },
          { t:2,  l:55, s:3, c:"#c084fc", o:0.4 },
          { t:16, l:102,s:4, c:"#818cf8", o:0.5 },
          { t:58, l:100,s:3, c:"#a78bfa", o:0.35 },
          { t:68, l:14, s:4, c:"#7c3aed", o:0.45 },
          { t:60, l:52, s:5, c:"#c084fc", o:0.3 },
          { t:28, l:0,  s:3, c:"#818cf8", o:0.4 },
        ].map((d,i) => (
          <div key={i} style={{
            position:"absolute", top:d.t, left:d.l,
            width:d.s, height:d.s, borderRadius:"50%",
            background:d.c, opacity:d.o,
            boxShadow:`0 0 ${d.s*2}px ${d.c}`,
            animation:`pulseGlow ${2.4+i*0.35}s ease-in-out infinite`,
          }} />
        ))}
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:56, height:56, borderRadius:16,
          background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(139,92,246,0.08))",
          border:"1px solid rgba(139,92,246,0.25)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"1.6rem", boxShadow:"0 0 32px rgba(139,92,246,0.2)",
        }}>✦</div>
      </div>

      <h2 style={{ fontSize:"1.3rem", fontWeight:800, letterSpacing:"-0.02em", color:"rgba(255,255,255,0.75)", margin:"0 0 10px" }}>
        No analyses yet
      </h2>
      <p style={{ fontSize:"0.875rem", color:"rgba(255,255,255,0.28)", margin:"0 0 28px", lineHeight:1.7, maxWidth:320 }}>
        Paste your first idea and get clarity in 30 seconds — risks, execution path, health score.
      </p>

      <Link href="/create" style={{
        display:"inline-flex", alignItems:"center", gap:8,
        background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
        border:"1px solid rgba(139,92,246,0.5)",
        color:"white", padding:"12px 26px", borderRadius:11,
        fontSize:"0.9rem", fontWeight:700, textDecoration:"none",
        boxShadow:"0 0 32px rgba(139,92,246,0.35)",
        marginBottom:40,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Analyze my first build →
      </Link>

      {/* Template cards */}
      <div style={{ width:"100%", maxWidth:700 }}>
        <p style={{ fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)", marginBottom:14 }}>
          Or start with a template
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
          {QUICK_TEMPLATES.map(tpl => (
            <Link
              key={tpl.title}
              href={`/create?idea=${encodeURIComponent(tpl.idea)}`}
              style={{
                display:"flex", flexDirection:"column", alignItems:"flex-start",
                background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:12, padding:"16px",
                textDecoration:"none", textAlign:"left",
                transition:"all 0.18s ease",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor="rgba(139,92,246,0.35)"; el.style.background="rgba(139,92,246,0.06)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor="rgba(255,255,255,0.07)"; el.style.background="rgba(255,255,255,0.025)"; }}
            >
              <span style={{ fontSize:"1.4rem", marginBottom:10 }}>{tpl.icon}</span>
              <span style={{ fontSize:"0.82rem", fontWeight:700, color:"rgba(255,255,255,0.7)", display:"block", marginBottom:4 }}>
                {tpl.title}
              </span>
              <span style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.25)", lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                {tpl.idea}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
