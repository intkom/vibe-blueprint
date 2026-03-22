import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppHeader } from "@/components/app-header";
import { StepDetailClient } from "@/components/step-detail-client";
import { enrichSingleStep, type StepEnrichment } from "@/lib/enrich-step";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string; stepId: string }> };

/* ── Metadata ─────────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, stepId } = await params;
  const supabase = await createClient();
  const { data: step } = await supabase
    .from("build_steps")
    .select("title, step_index")
    .eq("id", stepId)
    .single();
  const { data: project } = await supabase
    .from("projects")
    .select("title")
    .eq("id", id)
    .single();
  const title = step?.title?.trim() ?? "Step";
  const n = (step?.step_index ?? 0) + 1;
  return {
    title: `Step ${n}: ${title} – ${project?.title ?? "VibeStep"}`,
    description: `Detailed guidance, acceptance criteria, and common mistakes for: ${title}`,
  };
}

/* ── Phase config ─────────────────────────────────────────────── */
const PHASE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  discover: { bg: "rgba(96,165,250,0.08)",  text: "#60a5fa", border: "rgba(96,165,250,0.25)",  label: "Discover" },
  define:   { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.25)",  label: "Define"   },
  design:   { bg: "rgba(236,72,153,0.08)",  text: "#ec4899", border: "rgba(236,72,153,0.25)",  label: "Design"   },
  build:    { bg: "rgba(139,92,246,0.08)",  text: "#a78bfa", border: "rgba(139,92,246,0.25)",  label: "Build"    },
  launch:   { bg: "rgba(52,211,153,0.08)",  text: "#34d399", border: "rgba(52,211,153,0.25)",  label: "Launch"   },
  reflect:  { bg: "rgba(248,113,113,0.08)", text: "#f87171", border: "rgba(248,113,113,0.25)", label: "Reflect"  },
};

const DIFFICULTY_COLORS = {
  easy:   { bg: "rgba(52,211,153,0.08)",  text: "#34d399", border: "rgba(52,211,153,0.25)"  },
  medium: { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.25)"  },
  hard:   { bg: "rgba(248,113,113,0.08)", text: "#f87171", border: "rgba(248,113,113,0.25)" },
};

/* ── Static phase resources ───────────────────────────────────── */
const PHASE_RESOURCES: Record<string, Array<{ topic: string; why: string }>> = {
  discover: [
    { topic: "Jobs-to-be-Done Framework", why: "Uncover what users are actually hiring your product to do — not just what they say they want." },
    { topic: "User Interview Protocol", why: "Run 5 discovery calls using the mom test: ask about past behaviour, not future intentions." },
    { topic: "Competitive Feature Matrix", why: "Map 3–5 competitors across 10 dimensions to find the gap that's real and defensible." },
  ],
  define: [
    { topic: "One-Page PRD Template", why: "If your requirements doc exceeds one page, your scope is already too large for a first build." },
    { topic: "User Story Mapping", why: "Map the full journey horizontally, slice vertically — your MVP must be an end-to-end vertical slice." },
    { topic: "MoSCoW Prioritization", why: "Everything in 'Must Have' is a feature you're betting the launch on. Be brutally selective." },
  ],
  design: [
    { topic: "Prototype Before Code", why: "Spend 2 hours in Figma for every 1 you'll save from rework. Prototype the core flow, not every screen." },
    { topic: "Design System Selection", why: "Use Shadcn UI, Radix, or Tailwind UI. Don't build a component library until you have 1,000 users." },
    { topic: "5-Second Usability Test", why: "Show your UI to someone for 5 seconds — if they can't explain what it does, the hierarchy is wrong." },
  ],
  build: [
    { topic: "Feature Flags Strategy", why: "Ship incomplete features behind flags. Never maintain a long-lived feature branch. Merge to main daily." },
    { topic: "API Contract First", why: "Define types + endpoints before writing handlers. Saves painful refactors when requirements shift mid-build." },
    { topic: "Test Critical Paths Only", why: "TDD for auth, payments, data mutations. Skip it for UI. Draw the line at anything that moves money." },
  ],
  launch: [
    { topic: "Soft Launch Sequence", why: "Launch to 10 hand-picked users before Product Hunt. Fix obvious bugs first, then hit the big channels." },
    { topic: "Error Monitoring Setup", why: "Sentry or LogRocket from day one. You will not catch bugs in server logs — you need automatic surfacing." },
    { topic: "North Star Metric Definition", why: "Before launch: write down the one number that proves users got value today. Not signups — value delivered." },
  ],
  reflect: [
    { topic: "Retention Cohort Analysis", why: "If Week-4 retention is under 20%, don't spend on acquisition. Fix the product first." },
    { topic: "Churned User Interviews", why: "Every churned user is worth 10 active ones for insight. Email within 48 hours of churn — not later." },
    { topic: "Weekly Metrics Ritual", why: "Pick 3 metrics, review every Monday, write one insight. Small consistent reviews beat quarterly deep-dives." },
  ],
};

/* ── Step row type (manual cast for new JSONB columns) ─────────── */
type StepRow = {
  id: string;
  project_id: string;
  step_index: number;
  phase: string | null;
  title: string | null;
  objective: string | null;
  guidance: string | null;
  status: string | null;
  acceptance_criteria: string[] | null;
  common_mistakes: { title: string; detail: string }[] | null;
  estimated_hours: number | null;
  difficulty: string | null;
};

type NavStep = { id: string; step_index: number; title: string | null; status: string | null };

/* ── Page ─────────────────────────────────────────────────────── */
export default async function StepDetailPage({ params }: Props) {
  const { id: projectId, stepId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the step
  const { data: rawStep, error: stepError } = await supabase
    .from("build_steps")
    .select("*")
    .eq("id", stepId)
    .single();
  if (stepError || !rawStep) notFound();

  const step = rawStep as StepRow;

  // Verify ownership via project
  const { data: project } = await supabase
    .from("projects")
    .select("id, title")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();
  if (!project) redirect("/dashboard");

  // Verify this step belongs to this project
  if (step.project_id !== projectId) redirect("/dashboard");

  // Fetch all steps for this project (navigation + active step calc)
  const { data: allSteps } = await supabase
    .from("build_steps")
    .select("id, step_index, title, status")
    .eq("project_id", projectId)
    .order("step_index", { ascending: true });

  const navSteps: NavStep[] = (allSteps ?? []) as NavStep[];
  const totalSteps = navSteps.length;
  const activeIdx = navSteps.findIndex(s => s.status !== "complete");
  const isActive = activeIdx === step.step_index;
  const isLocked = activeIdx !== -1 && step.step_index > activeIdx;
  const prevStep = navSteps.find(s => s.step_index === step.step_index - 1) ?? null;
  const nextStep = navSteps.find(s => s.step_index === step.step_index + 1) ?? null;

  // Lazy enrichment — generate on first visit if not yet done
  let enrichment: StepEnrichment | null = null;

  if (step.acceptance_criteria !== null) {
    // Already enriched — use cached data
    enrichment = {
      acceptance_criteria: step.acceptance_criteria,
      common_mistakes: step.common_mistakes ?? [],
      estimated_hours: step.estimated_hours ?? 3,
      difficulty: (step.difficulty as StepEnrichment["difficulty"]) ?? "medium",
    };
  } else {
    // Generate enrichment on-demand
    try {
      enrichment = await enrichSingleStep({
        phase: step.phase ?? "build",
        title: step.title ?? "",
        objective: step.objective ?? "",
        guidance: step.guidance ?? "",
      });
      // Persist to DB (fire and forget — render uses the local variable)
      void supabase.from("build_steps").update({
        acceptance_criteria: enrichment.acceptance_criteria,
        common_mistakes: enrichment.common_mistakes,
        estimated_hours: enrichment.estimated_hours,
        difficulty: enrichment.difficulty,
      }).eq("id", stepId).then(() => {});
    } catch {
      // Enrichment failed — render with empty fallback
      enrichment = { acceptance_criteria: [], common_mistakes: [], estimated_hours: 3, difficulty: "medium" };
    }
  }

  const phaseKey = (step.phase ?? "build").toLowerCase();
  const phaseStyle = PHASE_COLORS[phaseKey] ?? PHASE_COLORS.build;
  const diffKey = enrichment.difficulty;
  const diffStyle = DIFFICULTY_COLORS[diffKey] ?? DIFFICULTY_COLORS.medium;
  const resources = PHASE_RESOURCES[phaseKey] ?? PHASE_RESOURCES.build;

  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "white", position: "relative", overflow: "hidden" }}>
      {/* Gradient mesh */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: [
          `radial-gradient(ellipse 60% 45% at 75% -5%, ${phaseStyle.bg.replace("0.08", "0.12")} 0%, transparent 55%)`,
          "radial-gradient(ellipse 45% 35% at 10% 85%, rgba(236,72,153,0.06) 0%, transparent 50%)",
          "#030014",
        ].join(","),
      }} />

      <AppHeader />

      <main style={{ position: "relative", zIndex: 10, maxWidth: 820, margin: "0 auto", padding: "32px 24px 100px" }}>

        {/* ── Back link + step position ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 10 }}>
          <Link href={`/project/${projectId}`} style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            color: "rgba(255,255,255,0.4)", textDecoration: "none",
            fontSize: "0.82rem", fontWeight: 500, transition: "color 0.18s ease",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7M5 12h14"/>
            </svg>
            {project.title}
          </Link>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.22)", fontWeight: 500 }}>
            Step {step.step_index + 1} of {totalSteps}
          </span>
        </div>

        {/* ── Step header card ── */}
        <div style={{
          background: "rgba(10,6,30,0.7)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${phaseStyle.border}`,
          borderRadius: 20, padding: "24px 28px", marginBottom: 20,
          position: "relative", overflow: "hidden",
        }}>
          {/* Top shimmer line */}
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
            background: `linear-gradient(90deg,transparent,${phaseStyle.text}60,transparent)`,
          }} />
          {/* Left accent bar */}
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: 4,
            background: `linear-gradient(180deg,${phaseStyle.text},${phaseStyle.text}44)`,
            borderRadius: "0 2px 2px 0",
          }} />

          <div style={{ paddingLeft: 12 }}>
            {/* Badges row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{
                fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "3px 10px", borderRadius: 9999,
                background: phaseStyle.bg, border: `1px solid ${phaseStyle.border}`, color: phaseStyle.text,
              }}>{phaseStyle.label}</span>

              <span style={{
                fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "3px 10px", borderRadius: 9999,
                background: diffStyle.bg, border: `1px solid ${diffStyle.border}`, color: diffStyle.text,
              }}>{enrichment.difficulty}</span>

              <span style={{
                fontSize: "0.62rem", fontWeight: 600, color: "rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                ~{enrichment.estimated_hours}h
              </span>

              {isActive && (
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "3px 10px", borderRadius: 9999,
                  background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399",
                }}>Current</span>
              )}
              {step.status === "complete" && (
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "3px 10px", borderRadius: 9999,
                  background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399",
                }}>✓ Done</span>
              )}
              {isLocked && (
                <span style={{
                  fontSize: "0.6rem", fontWeight: 600, color: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Locked
                </span>
              )}
            </div>

            <h1 style={{
              fontSize: "1.5rem", fontWeight: 900, margin: "0 0 8px",
              letterSpacing: "-0.02em", lineHeight: 1.25,
              color: step.status === "complete" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.95)",
              textDecoration: step.status === "complete" ? "line-through" : "none",
            }}>
              {step.title?.trim() || "Untitled step"}
            </h1>

            {step.objective && (
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                {step.objective}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>

          {/* ── Guidance ── */}
          {step.guidance && step.status !== "complete" && (
            <Section title="How to do this">
              <div style={{
                borderLeft: `3px solid ${phaseStyle.text}44`,
                paddingLeft: 16,
              }}>
                <p style={{
                  fontSize: "0.875rem", color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.75, margin: 0, fontStyle: "italic",
                }}>
                  {step.guidance}
                </p>
              </div>
            </Section>
          )}

          {/* ── Interactive client zone ── */}
          <StepDetailClient
            stepId={step.id}
            projectId={projectId}
            stepIndex={step.step_index}
            stepStatus={step.status}
            isActive={isActive && !isLocked}
            criteria={enrichment.acceptance_criteria}
            isLastStep={step.step_index === totalSteps - 1}
          />

          {/* ── Common mistakes ── */}
          {enrichment.common_mistakes.length > 0 && (
            <Section title="⚠️ Common Mistakes">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {enrichment.common_mistakes.map((m, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 14, alignItems: "flex-start",
                    background: "rgba(248,113,113,0.04)",
                    border: "1px solid rgba(248,113,113,0.15)",
                    borderRadius: 12, padding: "14px 16px",
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.72rem", fontWeight: 800, color: "#f87171",
                    }}>{i + 1}</div>
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f87171", margin: "0 0 4px" }}>
                        {m.title}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.65, margin: 0 }}>
                        {m.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Resources ── */}
          <Section title="Resources">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {resources.map((r, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "14px 16px",
                  display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: phaseStyle.bg, border: `1px solid ${phaseStyle.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem",
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={phaseStyle.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", margin: "0 0 3px" }}>
                      {r.topic}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, margin: 0 }}>
                      {r.why}
                    </p>
                    <span style={{
                      display: "inline-block", marginTop: 6,
                      fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em",
                      color: phaseStyle.text, opacity: 0.6,
                    }}>
                      Search for this →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

        </div>

        {/* ── Step navigation ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, marginTop: 36, paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          {prevStep ? (
            <Link href={`/project/${projectId}/step/${prevStep.id}`} style={{
              display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 11, padding: "10px 16px", flex: 1, maxWidth: 280,
              color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", fontWeight: 500,
              transition: "all 0.18s ease",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7M5 12h14"/>
              </svg>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.25)", marginBottom: 2 }}>Previous</div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {prevStep.title ?? `Step ${prevStep.step_index + 1}`}
                </div>
              </div>
            </Link>
          ) : <div style={{ flex: 1 }} />}

          {nextStep ? (
            <Link href={`/project/${projectId}/step/${nextStep.id}`} style={{
              display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8,
              textDecoration: "none",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 11, padding: "10px 16px", flex: 1, maxWidth: 280,
              color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", fontWeight: 500,
              transition: "all 0.18s ease",
            }}>
              <div style={{ minWidth: 0, textAlign: "right" }}>
                <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.25)", marginBottom: 2 }}>Next</div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {nextStep.title ?? `Step ${nextStep.step_index + 1}`}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 14 0M12 5l7 7-7 7"/>
              </svg>
            </Link>
          ) : <div style={{ flex: 1 }} />}
        </div>

      </main>
    </div>
  );
}

/* ── Section wrapper ──────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: "20px 22px",
    }}>
      <p style={{
        fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: "0 0 16px",
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}
