import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { markStepComplete } from "@/app/actions/build-steps";
import { AppHeader } from "@/components/app-header";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, title, raw_idea")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  const { data: steps, error: stepsError } = await supabase
    .from("build_steps")
    .select("id, step_index, title, objective, status")
    .eq("project_id", id)
    .order("step_index", { ascending: true });

  if (stepsError) {
    notFound();
  }

  const stepsList = (steps ?? []) as {
    id: string;
    step_index: number;
    title: string | null;
    objective: string | null;
    status: string | null;
  }[];

  const completedCount = stepsList.filter((s) => s.status === "complete").length;
  const totalCount = stepsList.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-violet w-[500px] h-[500px] top-[-10%] right-[-5%]" />
      <div className="orb orb-blue w-[400px] h-[400px] bottom-[20%] left-[-10%]" />

      <AppHeader />

      <main className="relative z-10 mx-auto w-full max-w-2xl px-6 py-12">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/70 transition-colors duration-200 mb-8 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
          Back to dashboard
        </Link>

        {/* Project header */}
        <div className="animate-fade-in-up mb-8">
          <div className="glass-strong rounded-2xl p-6 border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-base flex-shrink-0">
                🚀
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-black text-white leading-tight">
                  {project.title?.trim() || "Untitled"}
                </h1>
                {project.raw_idea ? (
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    {project.raw_idea}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Progress section */}
            {totalCount > 0 && (
              <div className="mt-5 pt-5 border-t border-white/6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    Progress
                  </span>
                  <span className="text-sm font-bold gradient-text-violet">
                    {completedCount}/{totalCount} steps
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/6 overflow-hidden">
                  <div
                    className="progress-bar h-full rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-white/25 mt-2">
                  {progressPct === 100
                    ? "🎉 Project complete!"
                    : `${100 - progressPct}% remaining`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="animate-fade-in-up delay-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest">
              Build steps
            </h2>
            <span className="badge-pending text-xs">
              {totalCount} steps
            </span>
          </div>

          {stepsList.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center border border-white/7">
              <div className="text-4xl mb-3">⚙️</div>
              <p className="text-white/40 text-sm">No build steps yet.</p>
            </div>
          ) : (
            <ol className="flex flex-col gap-3">
              {stepsList.map((step, i) => {
                const isComplete = step.status === "complete";
                return (
                  <li
                    key={step.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${0.1 + i * 0.04}s` }}
                  >
                    <div className={`glass rounded-2xl border step-card p-5 ${
                      isComplete
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-white/7"
                    }`}>
                      <div className="flex items-start gap-4">
                        {/* Step number */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          isComplete
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-violet-500/15 text-violet-300 border border-violet-500/25"
                        }`}>
                          {isComplete ? "✓" : step.step_index + 1}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-1">
                                Step {step.step_index + 1}
                              </p>
                              <h3 className={`font-bold leading-snug ${
                                isComplete ? "text-white/60 line-through decoration-white/20" : "text-white/90"
                              }`}>
                                {step.title?.trim() || "Untitled step"}
                              </h3>
                              {step.objective ? (
                                <p className={`mt-1.5 text-sm leading-relaxed ${
                                  isComplete ? "text-white/25" : "text-white/45"
                                }`}>
                                  {step.objective}
                                </p>
                              ) : null}
                            </div>

                            {/* Action */}
                            <div className="flex-shrink-0">
                              {isComplete ? (
                                <span className="badge-complete">
                                  Done
                                </span>
                              ) : (
                                <form action={markStepComplete}>
                                  <input type="hidden" name="stepId" value={step.id} />
                                  <input type="hidden" name="projectId" value={id} />
                                  <button
                                    type="submit"
                                    className="btn-primary text-xs py-2 px-4"
                                  >
                                    Mark done ✓
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Completion message */}
        {progressPct === 100 && totalCount > 0 && (
          <div className="mt-8 glass-strong rounded-2xl p-8 border border-emerald-500/20 text-center animate-scale-in">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-black text-white mb-2">Project complete!</h3>
            <p className="text-sm text-white/40 mb-6">
              You shipped all {totalCount} steps. Time to celebrate and start the next one.
            </p>
            <Link href="/create" className="btn-primary text-sm py-2.5 px-6 inline-block">
              Start next project →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
