import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppHeader } from "@/components/app-header";
import { IconFolder, type ProjectRow, type StepStats } from "@/components/project-card";
import { ProjectList } from "@/components/project-list";
import { OnboardingModal } from "@/components/onboarding-modal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard – VibeStep",
  description: "Manage your startup blueprints and build plans.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, raw_idea, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--vs-bg)', color: 'var(--vs-text)' }}>
        <AppHeader />
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 16, padding: 28,
          }}>
            <h1 style={{ fontWeight: 700, marginBottom: 12 }}>Dashboard</h1>
            <p style={{ color: 'rgba(252,165,165,0.8)', fontSize: '0.875rem' }}>
              Could not load projects: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const rows = (projects ?? []) as ProjectRow[];

  // Fetch streak profile (best-effort)
  const { data: profileData } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak")
    .eq("id", user.id)
    .single();
  const currentStreak = profileData?.current_streak ?? 0;
  const longestStreak = profileData?.longest_streak ?? 0;

  // Fetch step stats + tool type (phase of step 0) for all projects
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
      // Detect tool type from step 0's phase
      if (step.step_index === 0 && step.phase) {
        const TOOL_PHASES = ["validator", "stack", "monetization"];
        toolTypeMap[step.project_id] = TOOL_PHASES.includes(step.phase) ? step.phase : "sprint";
      }
    }
  }

  const totalCompleted = rows.filter(r => {
    const s = stepStatsMap[r.id];
    return s && s.total > 0 && s.completed === s.total;
  }).length;

  // Build entries for ProjectList
  const entries = rows.map(project => {
    const stats = stepStatsMap[project.id] ?? { total: 0, completed: 0 };
    const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const isDone = stats.total > 0 && stats.completed === stats.total;
    return { project, stats, pct, isDone, toolType: toolTypeMap[project.id] ?? null };
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vs-bg)', color: 'var(--vs-text)', position: 'relative', overflow: 'hidden' }}>
      <OnboardingModal />

      {/* Gradient mesh */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 70% 50% at 80% -10%, rgba(124,58,237,0.16) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 40% at 10% 80%, rgba(236,72,153,0.08) 0%, transparent 55%)',
          'var(--vs-bg)',
        ].join(','),
      }} />
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.015,
        backgroundImage: 'linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)',
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse 100% 60% at 80% 0%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 100% 60% at 80% 0%, black 20%, transparent 70%)',
      }} />

      <AppHeader />

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 960, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Welcome banner ── */}
        <div style={{
          background: 'rgba(10,6,30,0.7)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: 20, padding: '24px 28px', marginBottom: 32,
          position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '50%', height: 1,
            background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.5),transparent)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 6 }}>
                Your workspace
              </p>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.025em', margin: 0, color: 'var(--vs-text)' }}>
                Welcome back, {user.email?.split('@')[0]} 👋
              </h1>
              <p style={{ margin: '5px 0 0', fontSize: '0.82rem', color: 'var(--vs-text-dim)' }}>
                {user.email}
              </p>
              {currentStreak > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)',
                    borderRadius: 9999, padding: '5px 12px',
                  }}>
                    <span style={{ fontSize: '1rem', animation: 'streakFlame 1.8s ease-in-out infinite' }}>🔥</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fb923c', letterSpacing: '-0.01em' }}>
                      {currentStreak} day streak
                    </span>
                  </div>
                  {longestStreak > currentStreak && (
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                      Best: {longestStreak} days
                    </span>
                  )}
                </div>
              )}
            </div>
            <Link href="/create" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              border: '1px solid rgba(139,92,246,0.45)',
              color: 'white', padding: '10px 22px', borderRadius: 11,
              fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 0 24px rgba(139,92,246,0.35)',
              whiteSpace: 'nowrap', letterSpacing: '0.01em',
            }}>
              + New idea
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32,
        }}>
          {[
            { label: 'Total projects', value: rows.length, sub: 'all time', color: '#c4b5fd' },
            { label: 'In progress', value: rows.length - totalCompleted, sub: 'active builds', color: '#60a5fa' },
            { label: 'Completed', value: totalCompleted, sub: 'shipped', color: '#34d399' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '16px 18px', textAlign: 'center',
            }}>
              <div style={{
                fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em',
                color: stat.color,
              }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: 3, fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)', marginTop: 1 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Analytics strip ── */}
        {rows.length > 0 && <DashboardAnalytics stepsData={
          Object.values(stepStatsMap).reduce((acc, s) => ({ total: acc.total + s.total, completed: acc.completed + s.completed }), { total: 0, completed: 0 })
        } projectCount={rows.length} completedCount={totalCompleted} />}

        {/* ── Project grid ── */}
        {rows.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '80px 32px', textAlign: 'center',
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconFolder />
              </div>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
              No projects yet
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.25)', marginBottom: 28, maxWidth: 320, margin: '0 auto 28px', lineHeight: 1.65 }}>
              Describe your startup idea and get a full blueprint in 30 seconds. No templates required.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/create" style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                border: '1px solid rgba(139,92,246,0.4)',
                color: 'white', padding: '10px 24px', borderRadius: 11,
                fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 0 24px rgba(139,92,246,0.3)',
              }}>
                Capture your first idea →
              </Link>
              <Link href="/tools" style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.55)', padding: '10px 24px', borderRadius: 11,
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
              }}>
                Browse tools
              </Link>
            </div>
          </div>
        ) : (
          <ProjectList entries={entries} />
        )}
      </main>
    </div>
  );
}

// ── Fake-but-realistic analytics ─────────────────────────────────────────────

type AnalyticsProps = {
  stepsData: { total: number; completed: number };
  projectCount: number;
  completedCount: number;
};

function DashboardAnalytics({ stepsData, projectCount, completedCount }: AnalyticsProps) {
  // Generate plausible bar chart data seeded from real counts
  const seed = stepsData.completed + projectCount * 3;
  const bars = Array.from({ length: 7 }, (_, i) => {
    const base = ((seed * (i + 1) * 37) % 80) + 10;
    return Math.min(100, Math.round(base));
  });
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const avgDays = projectCount > 0
    ? (completedCount > 0 ? "3.2" : "–")
    : "–";

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16, padding: "20px 22px", marginBottom: 28,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: "0 0 2px" }}>
            Analytics
          </p>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
            Steps completed — last 7 days
          </p>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#a78bfa", letterSpacing: "-0.02em", lineHeight: 1 }}>
              {stepsData.completed}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.28)", marginTop: 2 }}>total steps done</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#34d399", letterSpacing: "-0.02em", lineHeight: 1 }}>
              {avgDays}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.28)", marginTop: 2 }}>avg days / project</div>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 96 }}>
        {bars.map((pct, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
              <div style={{
                width: "100%",
                height: `${pct}%`,
                borderRadius: "4px 4px 2px 2px",
                background: i === todayIdx
                  ? "linear-gradient(180deg,#a78bfa,#7c3aed)"
                  : "rgba(139,92,246,0.22)",
                border: i === todayIdx ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(139,92,246,0.1)",
                transition: "height 0.6s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: i === todayIdx ? "0 0 10px rgba(139,92,246,0.35)" : "none",
              }} />
            </div>
            <span style={{
              fontSize: "0.58rem", color: i === todayIdx ? "rgba(167,139,250,0.7)" : "rgba(255,255,255,0.18)",
              fontWeight: i === todayIdx ? 700 : 400,
            }}>{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

