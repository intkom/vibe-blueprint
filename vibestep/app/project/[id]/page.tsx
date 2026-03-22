import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { markStepComplete } from "@/app/actions/build-steps";
import { AppHeader } from "@/components/app-header";
import { deserializeMeta, type Warning, type StackRecommendation } from "@/lib/generate-build-steps";

type Props = {
  params: Promise<{ id: string }>;
};

/* ── Phase config ─────────────────────────────────────── */
const PHASE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  discover: { bg: "rgba(96,165,250,0.08)",  text: "#60a5fa", border: "rgba(96,165,250,0.25)",  label: "Discover"  },
  define:   { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.25)",  label: "Define"    },
  design:   { bg: "rgba(236,72,153,0.08)",  text: "#ec4899", border: "rgba(236,72,153,0.25)",  label: "Design"    },
  build:    { bg: "rgba(139,92,246,0.08)",  text: "#a78bfa", border: "rgba(139,92,246,0.25)",  label: "Build"     },
  launch:   { bg: "rgba(52,211,153,0.08)",  text: "#34d399", border: "rgba(52,211,153,0.25)",  label: "Launch"    },
  reflect:  { bg: "rgba(248,113,113,0.08)", text: "#f87171", border: "rgba(248,113,113,0.25)", label: "Reflect"   },
};

const STACK_LABELS: Record<keyof StackRecommendation, string> = {
  frontend: "Frontend",
  backend:  "Backend",
  database: "Database",
  auth:     "Auth",
  payments: "Payments",
  hosting:  "Hosting",
};

/* ── SVG Icons ─────────────────────────────────────────── */
function IconWarning() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function IconStack() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2Z" />
      <path d="M12 22v-6.5M22 8.5l-10 7-10-7" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7M5 12h14" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ── Stack Blueprint section ───────────────────────────── */
function StackBlueprint({ stack }: { stack: StackRecommendation }) {
  const layers = Object.entries(STACK_LABELS) as [keyof StackRecommendation, string][];

  return (
    <div style={{
      background: 'rgba(10,6,30,0.7)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 0 40px rgba(139,92,246,0.06)',
      position: 'relative',
    }}>
      {/* Top beam */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(96,165,250,0.4), transparent)',
      }} />

      {/* Header */}
      <div style={{
        padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#c4b5fd', boxShadow: '0 0 14px rgba(139,92,246,0.4)',
        }}>
          <IconStack />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Tech Stack Blueprint
          </p>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Chosen specifically for your idea — with reasons
          </p>
        </div>
      </div>

      {/* Stack rows */}
      <div style={{ padding: '8px 0' }}>
        {layers.map(([key, label], i) => {
          const value = stack[key];
          // Split on em dash or double dash to separate tech from reason
          const dashIdx = value.indexOf(' — ');
          const tech = dashIdx !== -1 ? value.slice(0, dashIdx) : value;
          const reason = dashIdx !== -1 ? value.slice(dashIdx + 3) : null;

          return (
            <div key={key} style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              padding: '14px 24px',
              borderBottom: i < layers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'rgba(139,92,246,0.6)',
                minWidth: 72, paddingTop: 2, flexShrink: 0,
              }}>
                {label}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{
                  fontSize: '0.875rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.88)',
                }}>
                  {tech}
                </span>
                {reason && (
                  <span style={{
                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)',
                    display: 'block', marginTop: 2, lineHeight: 1.55,
                  }}>
                    {reason}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Dead-End Detector section ─────────────────────────── */
function DeadEndDetector({ warnings }: { warnings: Warning[] }) {
  if (!warnings.length) return null;

  return (
    <div style={{
      background: 'rgba(239,68,68,0.04)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(239,68,68,0.18)',
      borderRadius: 20, overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Top beam */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '50%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)',
      }} />

      {/* Header */}
      <div style={{
        padding: '18px 24px', borderBottom: '1px solid rgba(239,68,68,0.1)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#f87171',
        }}>
          <IconWarning />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Dead-End Detector
          </p>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            {warnings.length} critical failure {warnings.length === 1 ? 'point' : 'points'} for your specific idea
          </p>
        </div>
      </div>

      {/* Warnings */}
      <div style={{ padding: '8px 0' }}>
        {warnings.map((w, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            padding: '16px 24px',
            borderBottom: i < warnings.length - 1 ? '1px solid rgba(239,68,68,0.07)' : 'none',
          }}>
            <div style={{
              fontSize: '0.7rem', fontWeight: 800, flexShrink: 0,
              color: 'rgba(248,113,113,0.5)', marginTop: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              0{i + 1}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'rgba(248,113,113,0.9)', margin: '0 0 5px' }}>
                {w.title}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.65 }}>
                {w.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────── */
export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, title, raw_idea")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) notFound();

  const { data: steps, error: stepsError } = await supabase
    .from("build_steps")
    .select("id, step_index, phase, title, objective, guidance, ai_output, status")
    .eq("project_id", id)
    .order("step_index", { ascending: true });

  if (stepsError) notFound();

  const stepsList = (steps ?? []) as {
    id: string;
    step_index: number;
    phase: string | null;
    title: string | null;
    objective: string | null;
    guidance: string | null;
    ai_output: string | null;
    status: string | null;
  }[];

  // Extract stack + warnings from step 0's ai_output
  const step0 = stepsList.find(s => s.step_index === 0);
  const meta = deserializeMeta(step0?.ai_output ?? null);

  const completedCount = stepsList.filter((s) => s.status === "complete").length;
  const totalCount = stepsList.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = progressPct === 100 && totalCount > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#030014', color: 'white', position: 'relative', overflow: 'hidden' }}>

      {/* Gradient mesh */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 65% 50% at 75% -5%, rgba(124,58,237,0.16) 0%, transparent 60%)',
          'radial-gradient(ellipse 45% 35% at 10% 80%, rgba(96,165,250,0.07) 0%, transparent 55%)',
          '#030014',
        ].join(','),
      }} />

      <AppHeader />

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 780, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Back link */}
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)',
          textDecoration: 'none', marginBottom: 28,
          transition: 'color 0.2s ease',
        }}>
          <IconArrowLeft />
          Back to dashboard
        </Link>

        {/* ── Project header ── */}
        <div style={{
          background: 'rgba(10,6,30,0.7)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: isComplete ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,255,255,0.09)',
          borderRadius: 20, padding: '24px 26px', marginBottom: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top beam */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '50%', height: 1,
            background: isComplete
              ? 'linear-gradient(90deg, transparent, rgba(52,211,153,0.6), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: isComplete
                ? 'linear-gradient(135deg,#059669,#34d399)'
                : 'linear-gradient(135deg,#7c3aed,#5b21b6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isComplete
                ? '0 0 20px rgba(52,211,153,0.4)'
                : '0 0 20px rgba(139,92,246,0.4)',
              fontSize: 18,
            }}>
              {isComplete ? '✓' : '🚀'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{
                fontSize: '1.3rem', fontWeight: 900, margin: 0,
                color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.02em', lineHeight: 1.2,
              }}>
                {project.title?.trim() || "Untitled"}
              </h1>
              {project.raw_idea && (
                <p style={{
                  marginTop: 6, fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.6, display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {project.raw_idea}
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          {totalCount > 0 && (
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                  Progress
                </span>
                <span style={{
                  fontSize: '0.8rem', fontWeight: 700,
                  color: isComplete ? 'rgba(52,211,153,0.9)' : 'rgba(167,139,250,0.8)',
                }}>
                  {completedCount}/{totalCount} steps · {progressPct}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 9999, width: `${progressPct}%`,
                  background: isComplete
                    ? 'linear-gradient(90deg,#059669,#34d399)'
                    : 'linear-gradient(90deg,#7c3aed,#a78bfa,#ec4899)',
                  boxShadow: isComplete
                    ? '0 0 10px rgba(52,211,153,0.5)'
                    : '0 0 10px rgba(139,92,246,0.5)',
                  transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Stack Blueprint ── */}
        {meta?.stack && (
          <div style={{ marginBottom: 16 }}>
            <StackBlueprint stack={meta.stack} />
          </div>
        )}

        {/* ── Dead-End Detector ── */}
        {meta?.warnings && meta.warnings.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <DeadEndDetector warnings={meta.warnings} />
          </div>
        )}

        {/* ── Build Steps ── */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <p style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', margin: 0,
            }}>
              Build steps
            </p>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, color: 'rgba(139,92,246,0.7)',
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
              padding: '3px 10px', borderRadius: 9999,
            }}>
              {totalCount} steps
            </span>
          </div>

          {stepsList.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: '56px 32px', textAlign: 'center',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>No build steps yet.</p>
            </div>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stepsList.map((step) => {
                const isStepDone = step.status === "complete";
                const phaseKey = (step.phase ?? "build").toLowerCase();
                const phaseStyle = PHASE_COLORS[phaseKey] ?? PHASE_COLORS.build;

                return (
                  <li key={step.id}>
                    <div style={{
                      background: isStepDone ? 'rgba(52,211,153,0.03)' : 'rgba(255,255,255,0.025)',
                      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                      border: isStepDone ? '1px solid rgba(52,211,153,0.18)' : '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 16, padding: '18px 20px',
                      position: 'relative', overflow: 'hidden',
                      transition: 'all 0.22s ease',
                    }}>
                      {/* Left accent bar */}
                      <div aria-hidden="true" style={{
                        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
                        background: isStepDone
                          ? 'linear-gradient(180deg,#059669,#34d399)'
                          : `linear-gradient(180deg,${phaseStyle.text},${phaseStyle.text}88)`,
                        opacity: isStepDone ? 1 : 0.5,
                      }} />

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingLeft: 6 }}>

                        {/* Step number circle */}
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isStepDone ? 'rgba(52,211,153,0.15)' : `${phaseStyle.bg}`,
                          border: `1px solid ${isStepDone ? 'rgba(52,211,153,0.3)' : phaseStyle.border}`,
                          color: isStepDone ? '#34d399' : phaseStyle.text,
                          fontSize: '0.75rem', fontWeight: 800,
                        }}>
                          {isStepDone ? <IconCheck /> : step.step_index + 1}
                        </div>

                        {/* Content */}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          {/* Title row */}
                          <div style={{
                            display: 'flex', alignItems: 'flex-start',
                            justifyContent: 'space-between', gap: 12, marginBottom: 6,
                          }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              {/* Phase badge + step number */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                                <span style={{
                                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
                                  textTransform: 'uppercase', padding: '2px 7px', borderRadius: 9999,
                                  background: phaseStyle.bg, border: `1px solid ${phaseStyle.border}`,
                                  color: phaseStyle.text,
                                }}>
                                  {phaseStyle.label}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
                                  Step {step.step_index + 1}
                                </span>
                              </div>

                              <h3 style={{
                                fontWeight: 700, fontSize: '0.925rem', margin: 0, lineHeight: 1.3,
                                color: isStepDone ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)',
                                textDecoration: isStepDone ? 'line-through' : 'none',
                              }}>
                                {step.title?.trim() || "Untitled step"}
                              </h3>
                            </div>

                            {/* Status badge / button */}
                            <div style={{ flexShrink: 0, marginTop: 2 }}>
                              {isStepDone ? (
                                <span style={{
                                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em',
                                  textTransform: 'uppercase',
                                  background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
                                  color: '#34d399', padding: '4px 10px', borderRadius: 9999,
                                  display: 'inline-block',
                                }}>
                                  Done
                                </span>
                              ) : (
                                <form action={markStepComplete}>
                                  <input type="hidden" name="stepId" value={step.id} />
                                  <input type="hidden" name="projectId" value={id} />
                                  <button type="submit" style={{
                                    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                                    border: '1px solid rgba(139,92,246,0.4)',
                                    color: 'white', padding: '5px 13px', borderRadius: 8,
                                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                                  }}>
                                    Mark done ✓
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>

                          {/* Objective */}
                          {step.objective && (
                            <p style={{
                              fontSize: '0.82rem', lineHeight: 1.65,
                              color: isStepDone ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
                              margin: '0 0 10px',
                            }}>
                              {step.objective}
                            </p>
                          )}

                          {/* Guidance — the expert opinion */}
                          {step.guidance && !isStepDone && (
                            <div style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.07)',
                              borderRadius: 10, padding: '10px 14px',
                              borderLeft: `3px solid ${phaseStyle.text}44`,
                            }}>
                              <p style={{
                                fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)',
                                lineHeight: 1.7, margin: 0,
                                fontStyle: 'italic',
                              }}>
                                {step.guidance}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* ── Completion banner ── */}
        {isComplete && (
          <div style={{
            marginTop: 32,
            background: 'rgba(5,150,105,0.07)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 20, padding: '36px 32px', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, borderRadius: 20,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.1) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'rgba(255,255,255,0.95)', margin: '0 0 8px' }}>
                Blueprint complete — you shipped.
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.38)', marginBottom: 24, lineHeight: 1.65 }}>
                All {totalCount} steps done. What&apos;s the next idea?
              </p>
              <Link href="/create" style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                border: '1px solid rgba(139,92,246,0.4)',
                color: 'white', padding: '11px 28px', borderRadius: 11,
                fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 0 24px rgba(139,92,246,0.3)',
              }}>
                Start next project →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
