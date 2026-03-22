import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { markStepComplete } from "@/app/actions/build-steps";

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

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        ← Back to dashboard
      </Link>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {project.title?.trim() || "Untitled"}
        </h1>
        {project.raw_idea ? (
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {project.raw_idea}
          </p>
        ) : null}
      </div>

      <h2 className="mt-10 text-lg font-medium text-zinc-900 dark:text-zinc-50">
        Build steps
      </h2>
      <ol className="mt-4 flex flex-col gap-4">
        {stepsList.map((step) => {
          const isComplete = step.status === "complete";
          return (
            <li
              key={step.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Step {step.step_index + 1}
                  </p>
                  <h3 className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-50">
                    {step.title?.trim() || "Untitled step"}
                  </h3>
                  {step.objective ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {step.objective}
                    </p>
                  ) : null}
                </div>
                {isComplete ? (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Complete
                  </span>
                ) : (
                  <form action={markStepComplete}>
                    <input type="hidden" name="stepId" value={step.id} />
                    <input type="hidden" name="projectId" value={id} />
                    <button
                      type="submit"
                      className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
                    >
                      Mark complete
                    </button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {stepsList.length === 0 ? (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          No build steps yet.
        </p>
      ) : null}
    </div>
  );
}
