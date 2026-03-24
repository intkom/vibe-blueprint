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
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard – Axiom",
  description: "Manage your analyses, build clarity reports, and execution paths.",
};


export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, raw_idea, created_at, updated_at, analysis")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

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
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"64px 24px 80px", textAlign:"center",
    }}>
      {/* Constellation */}
      <div aria-hidden="true" style={{ position:"relative", width:110, height:80, marginBottom:28 }}>
        {[
          { t:4,  l:8,  s:5, c:"#a78bfa", o:0.6 },
          { t:2,  l:55, s:3, c:"#c084fc", o:0.4 },
          { t:16, l:95, s:4, c:"#818cf8", o:0.5 },
          { t:55, l:98, s:3, c:"#a78bfa", o:0.35 },
          { t:65, l:16, s:4, c:"#7c3aed", o:0.45 },
          { t:58, l:52, s:5, c:"#c084fc", o:0.3 },
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
          width:52, height:52, borderRadius:14,
          background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(139,92,246,0.08))",
          border:"1px solid rgba(139,92,246,0.25)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"1.5rem", boxShadow:"0 0 28px rgba(139,92,246,0.15)",
        }}>✦</div>
      </div>

      <h2 style={{ fontSize:"1.25rem", fontWeight:800, letterSpacing:"-0.02em", color:"rgba(255,255,255,0.72)", margin:"0 0 10px" }}>
        Nothing analyzed yet
      </h2>
      <p style={{ fontSize:"0.875rem", color:"rgba(255,255,255,0.28)", margin:"0 0 28px", lineHeight:1.65, maxWidth:280 }}>
        Paste your first build to get your product truth. Risk detection, architecture clarity, and execution path in 30 seconds.
      </p>
      <Link href="/create" style={{
        display:"inline-flex", alignItems:"center", gap:8,
        background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
        border:"1px solid rgba(139,92,246,0.5)",
        color:"white", padding:"11px 24px", borderRadius:10,
        fontSize:"0.875rem", fontWeight:600, textDecoration:"none",
        boxShadow:"0 0 28px rgba(139,92,246,0.3)",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Analyze a new build →
      </Link>
    </div>
  );
}
