"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppHeader } from "@/components/app-header";

type ProjectRow = {
  id: string;
  title: string | null;
  raw_idea: string | null;
};

type StepStats = {
  total: number;
  completed: number;
};

/* Thin SVG chevron for project cards */
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* Folder icon for empty state */
function IconFolder() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, raw_idea")
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

  // Fetch step stats for all projects
  const stepStatsMap: Record<string, StepStats> = {};
  if (rows.length > 0) {
    const { data: stepsData } = await supabase
      .from("build_steps")
      .select("project_id, status")
      .in("project_id", rows.map(r => r.id));

    for (const step of stepsData ?? []) {
      if (!stepStatsMap[step.project_id]) stepStatsMap[step.project_id] = { total: 0, completed: 0 };
      stepStatsMap[step.project_id].total++;
      if (step.status === "complete") stepStatsMap[step.project_id].completed++;
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

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 840, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 8 }}>
                Your workspace
              </p>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.025em', margin: 0, color: 'rgba(255,255,255,0.95)' }}>
                Your projects
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>
                Signed in as{' '}
                <span style={{ color: 'rgba(167,139,250,0.8)', fontWeight: 500 }}>{user.email}</span>
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

          {/* Stats strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 28,
          }}>
            {[
              { label: 'Total projects', value: rows.length, sub: 'all time' },
              { label: 'In progress', value: rows.length - totalCompleted, sub: 'active' },
              { label: 'Completed', value: totalCompleted, sub: 'shipped' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '16px 18px', textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '1.6rem', fontWeight: 800,
                  background: 'linear-gradient(135deg,#c4b5fd,#a78bfa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: 3, fontWeight: 500 }}>{stat.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)', marginTop: 1 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Project list ── */}
        {rows.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '72px 32px', textAlign: 'center',
          }}>
            <div style={{ marginBottom: 16, opacity: 0.6 }}><IconFolder /></div>
            <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>No projects yet</p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.22)', marginBottom: 28 }}>
              Your ideas will appear here once you create them.
            </p>
            <Link href="/create" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              border: '1px solid rgba(139,92,246,0.4)',
              color: 'white', padding: '10px 24px', borderRadius: 11,
              fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
            }}>
              Capture your first idea →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map((project, i) => {
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
                  index={i}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Project card — client-side hover via server-rendered markup ── */
function ProjectCard({
  project, stats, pct, isDone, index,
}: {
  project: ProjectRow;
  stats: StepStats;
  pct: number;
  isDone: boolean;
  index: number;
}) {
  const hasSteps = stats.total > 0;

  return (
    <Link
      href={`/project/${project.id}`}
      style={{
        display: 'block',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        border: isDone ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18, padding: '20px 22px',
        textDecoration: 'none', color: 'white',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseOver={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = 'translateY(-3px)';
        el.style.borderColor = isDone ? 'rgba(52,211,153,0.4)' : 'rgba(139,92,246,0.4)';
        el.style.boxShadow = isDone
          ? '0 16px 40px rgba(52,211,153,0.1)'
          : '0 16px 40px rgba(139,92,246,0.12), 0 0 0 1px rgba(139,92,246,0.15)';
        el.style.background = 'rgba(255,255,255,0.055)';
      }}
      onMouseOut={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = 'translateY(0)';
        el.style.borderColor = isDone ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)';
        el.style.boxShadow = '';
        el.style.background = 'rgba(255,255,255,0.03)';
      }}
    >
      {/* Hover top-beam */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: isDone
          ? 'linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)',
        opacity: 0,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        {/* Left */}
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: isDone ? '#34d399' : '#a78bfa',
              boxShadow: isDone ? '0 0 8px rgba(52,211,153,0.7)' : '0 0 8px rgba(167,139,250,0.7)',
            }} />
            <h2 style={{
              fontSize: '0.975rem', fontWeight: 700, margin: 0,
              color: 'rgba(255,255,255,0.9)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {project.title?.trim() || "Untitled"}
            </h2>
            {isDone && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', flexShrink: 0,
                background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
                color: '#34d399', padding: '2px 8px', borderRadius: 9999,
              }}>Done</span>
            )}
          </div>

          {/* Idea preview */}
          {project.raw_idea && (
            <p style={{
              fontSize: '0.82rem', color: 'rgba(255,255,255,0.32)', margin: '0 0 14px 15px',
              lineHeight: 1.6,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {project.raw_idea}
            </p>
          )}

          {/* Progress bar */}
          {hasSteps ? (
            <div style={{ marginLeft: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>
                  Progress
                </span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600,
                  color: isDone ? 'rgba(52,211,153,0.8)' : 'rgba(167,139,250,0.7)',
                }}>
                  {stats.completed}/{stats.total} steps · {pct}%
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 9999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 9999,
                  width: `${pct}%`,
                  background: isDone
                    ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
                    : 'linear-gradient(90deg, #7c3aed, #a78bfa, #ec4899)',
                  boxShadow: isDone
                    ? '0 0 8px rgba(52,211,153,0.5)'
                    : '0 0 8px rgba(139,92,246,0.5)',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginLeft: 15, margin: '0 0 0 15px' }}>
              No steps generated yet
            </p>
          )}
        </div>

        {/* Arrow */}
        <div style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: 2, transition: 'color 0.2s, transform 0.2s' }}>
          <IconChevron />
        </div>
      </div>
    </Link>
  );
}
