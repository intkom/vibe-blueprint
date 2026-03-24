import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { CopyBlueprintButton } from "@/components/copy-blueprint-button";

/*
  SQL needed in Supabase for public share pages to work for non-logged-in visitors:
  CREATE POLICY "Projects are publicly readable"
    ON projects FOR SELECT USING (true);
  CREATE POLICY "Build steps are publicly readable"
    ON build_steps FOR SELECT USING (true);
*/

type Props = { params: Promise<{ id: string }> };

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  discover: { bg: "rgba(96,165,250,0.08)",  text: "#60a5fa", border: "rgba(96,165,250,0.2)"  },
  define:   { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.2)"  },
  design:   { bg: "rgba(236,72,153,0.08)",  text: "#ec4899", border: "rgba(236,72,153,0.2)"  },
  build:    { bg: "rgba(139,92,246,0.08)",  text: "#a78bfa", border: "rgba(139,92,246,0.2)"  },
  launch:   { bg: "rgba(52,211,153,0.08)",  text: "#34d399", border: "rgba(52,211,153,0.2)"  },
  reflect:  { bg: "rgba(248,113,113,0.08)", text: "#f87171", border: "rgba(248,113,113,0.2)" },
  validator:    { bg: "rgba(139,92,246,0.08)", text: "#a78bfa", border: "rgba(139,92,246,0.2)" },
  stack:        { bg: "rgba(96,165,250,0.08)", text: "#60a5fa", border: "rgba(96,165,250,0.2)" },
  monetization: { bg: "rgba(52,211,153,0.08)", text: "#34d399", border: "rgba(52,211,153,0.2)" },
  sprint:       { bg: "rgba(251,146,60,0.08)", text: "#fb923c", border: "rgba(251,146,60,0.2)" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("title, raw_idea")
    .eq("id", id)
    .single();

  if (!data) return { title: "Blueprint – Axiom" };

  const title = data.title ?? "Startup Blueprint";
  const desc = data.raw_idea?.slice(0, 160) ?? "A product analysis built with Axiom";

  return {
    title: `${title} — Analysis`,
    description: desc,
    openGraph: {
      title: `${title} — Analysis | Axiom`,
      description: desc,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Analysis`,
      description: desc,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, raw_idea, created_at")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: stepsRaw } = await supabase
    .from("build_steps")
    .select("id, title, phase, status, step_index, objective")
    .eq("project_id", id)
    .order("step_index", { ascending: true });

  const steps = stepsRaw ?? [];
  const completed = steps.filter(s => s.status === "complete").length;
  const pct = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
  const createdDate = new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "white", position: "relative", overflowX: "hidden" }}>
      {/* Ambient orbs */}
      <div aria-hidden="true" style={{ position: "fixed", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: "fixed", bottom: "5%", right: "-5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Mini navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(3,0,20,0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, padding: "0 1.5rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white" }}>A</div>
            <span style={{ fontSize: "0.95rem", fontWeight: 800, background: "linear-gradient(135deg,#c4b5fd,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Axiom</span>
          </Link>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center",
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
            border: "1px solid rgba(139,92,246,0.45)", color: "white",
            padding: "7px 16px", borderRadius: 9, fontSize: "0.8rem", fontWeight: 600, textDecoration: "none",
          }}>
            Build your own free →
          </Link>
        </div>
      </nav>

      <main style={{ position: "relative", zIndex: 10, maxWidth: 800, margin: "0 auto", padding: "48px 24px 100px" }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              color: "#a78bfa", padding: "4px 10px", borderRadius: 9999,
            }}>
              Shared Analysis
            </span>
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
              Created {createdDate}
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900,
            letterSpacing: "-0.03em", margin: "0 0 16px",
            background: "linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,255,255,0.65))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            {project.title}
          </h1>

          {project.raw_idea && (
            <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.72, margin: "0 0 24px", maxWidth: 600 }}>
              {project.raw_idea}
            </p>
          )}

          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius: 9999, boxShadow: "0 0 10px rgba(139,92,246,0.5)" }} />
            </div>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#a78bfa", flexShrink: 0 }}>
              {completed}/{steps.length} steps · {pct}%
            </span>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href={`/signup?blueprint=${id}`} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              border: "1px solid rgba(139,92,246,0.45)", color: "white",
              padding: "10px 20px", borderRadius: 10, fontSize: "0.88rem", fontWeight: 600, textDecoration: "none",
              boxShadow: "0 0 24px rgba(139,92,246,0.35)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 17l4 4 4-4M12 12v9"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>
              Copy this analysis
            </Link>
            <CopyBlueprintButton url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/share/${id}`} />
          </div>
        </div>

        {/* ── Steps ── */}
        <div style={{ marginBottom: 60 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 16 }}>
            Build plan · {steps.length} steps
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {steps.map((step, i) => {
              const phase = PHASE_COLORS[step.phase ?? "build"] ?? PHASE_COLORS.build;
              const isDone = step.status === "complete";
              return (
                <div
                  key={step.id}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    background: isDone ? "rgba(52,211,153,0.03)" : "rgba(255,255,255,0.025)",
                    border: `1px solid ${isDone ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 14, padding: "14px 18px",
                    animation: `slideInLeft 0.35s ease both`,
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  {/* Number / check */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: isDone ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isDone ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isDone ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    ) : (
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>{i + 1}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                        background: phase.bg, border: `1px solid ${phase.border}`,
                        color: phase.text, padding: "2px 7px", borderRadius: 9999,
                      }}>
                        {step.phase ?? "build"}
                      </span>
                      {isDone && (
                        <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "#34d399", letterSpacing: "0.08em" }}>✓ Done</span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, color: isDone ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.82)", margin: 0, textDecoration: isDone ? "line-through" : "none" }}>
                      {step.title}
                    </p>
                    {step.objective && (
                      <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.28)", margin: "4px 0 0", lineHeight: 1.55 }}>
                        {step.objective}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Watermark / CTA ── */}
        <div style={{
          textAlign: "center", padding: "40px 24px",
          background: "rgba(10,6,30,0.7)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(139,92,246,0.15)", borderRadius: 20,
          position: "relative", overflow: "hidden",
        }}>
          <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.6),transparent)" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white" }}>A</div>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>Built with Axiom</span>
          </div>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px", color: "rgba(255,255,255,0.9)" }}>
            Got a build? Get product clarity in 30s.
          </h3>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: "0 0 24px" }}>
            Risk detection · Architecture · Execution path. Free.
          </p>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center",
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
            border: "1px solid rgba(139,92,246,0.45)", color: "white",
            padding: "12px 28px", borderRadius: 11, fontSize: "0.9rem", fontWeight: 700, textDecoration: "none",
            boxShadow: "0 0 28px rgba(139,92,246,0.4)",
          }}>
            Get your free analysis →
          </Link>
        </div>
      </main>
    </div>
  );
}
