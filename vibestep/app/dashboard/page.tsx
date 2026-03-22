import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppHeader } from "@/components/app-header";
import { ProjectCard, IconFolder, type ProjectRow, type StepStats } from "@/components/project-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, raw_idea, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#030014', color: 'white' }}>
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

  return (
    <div style={{ minHeight: '100vh', background: '#030014', color: 'white', position: 'relative', overflow: 'hidden' }}>

      {/* Gradient mesh */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 70% 50% at 80% -10%, rgba(124,58,237,0.16) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 40% at 10% 80%, rgba(236,72,153,0.08) 0%, transparent 55%)',
          '#030014',
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
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.025em', margin: 0, color: 'rgba(255,255,255,0.95)' }}>
                Welcome back 👋
              </h1>
              <p style={{ margin: '5px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
                {user.email}
              </p>
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

        {/* ── Project grid ── */}
        {rows.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '80px 32px', textAlign: 'center',
          }}>
            {/* Illustration */}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
            {rows.map((project) => {
              const stats = stepStatsMap[project.id] ?? { total: 0, completed: 0 };
              const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              const isDone = stats.total > 0 && stats.completed === stats.total;

              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  stats={stats}
                  pct={pct}
                  isDone={isDone}
                  toolType={toolTypeMap[project.id] ?? null}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

