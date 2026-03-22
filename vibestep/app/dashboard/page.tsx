import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type ProjectRow = {
  id: string;
  title: string | null;
  raw_idea: string | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, raw_idea")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-4 text-red-600 dark:text-red-400">
          Could not load projects: {error.message}
        </p>
      </div>
    );
  }

  const rows = (projects ?? []) as ProjectRow[];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Your projects
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {user.email}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-500">
            Ideas you have captured in VibeStep.
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          New idea
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-zinc-600 dark:text-zinc-400">No projects yet</p>
          <Link
            href="/create"
            className="mt-4 inline-block text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            Capture your first idea →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((project) => (
            <li key={project.id}>
              <Link
                href={`/project/${project.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50"
              >
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {project.title?.trim() || "Untitled"}
                </h2>
                {project.raw_idea ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {project.raw_idea}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
