import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppHeader } from "@/components/app-header";

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
      <div className="min-h-screen bg-[#030014] text-white">
        <AppHeader />
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          <div className="glass rounded-2xl p-8 border border-red-500/20">
            <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
            <p className="text-red-400 text-sm">
              Could not load projects: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const rows = (projects ?? []) as ProjectRow[];

  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-violet w-[600px] h-[600px] top-[-20%] right-[-10%]" />
      <div className="orb orb-pink w-[400px] h-[400px] bottom-[20%] left-[-5%]" />

      <AppHeader />

      <main className="relative z-10 mx-auto w-full max-w-3xl px-6 py-12">
        {/* Page header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-violet-400/70 uppercase mb-2">
                Your workspace
              </p>
              <h1 className="text-3xl font-black text-white">
                Your projects
              </h1>
              <p className="mt-2 text-sm text-white/40">
                Signed in as{" "}
                <span className="text-violet-300/80 font-medium">{user.email}</span>
              </p>
            </div>
            <Link href="/create" className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap self-start sm:self-auto">
              + New idea
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: 'Total projects', value: rows.length },
              { label: 'In progress', value: rows.length },
              { label: 'Completed', value: 0 },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 border border-white/6 text-center">
                <div className="text-2xl font-black gradient-text-violet">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Project list */}
        {rows.length === 0 ? (
          <div className="animate-fade-in-up delay-200 glass rounded-2xl border border-dashed border-white/10 px-8 py-20 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <p className="text-white/50 font-medium mb-2">No projects yet</p>
            <p className="text-white/25 text-sm mb-8">Your ideas will appear here once you create them.</p>
            <Link
              href="/create"
              className="btn-primary text-sm py-2.5 px-6 inline-block"
            >
              Capture your first idea →
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((project, i) => (
              <li
                key={project.id}
                className={`animate-fade-in-up`}
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                <Link
                  href={`/project/${project.id}`}
                  className="glass block rounded-2xl border border-white/7 p-5 card-hover group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
                        <h2 className="font-bold text-white/90 group-hover:text-white transition-colors truncate">
                          {project.title?.trim() || "Untitled"}
                        </h2>
                      </div>
                      {project.raw_idea ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/35 pl-4">
                          {project.raw_idea}
                        </p>
                      ) : null}
                    </div>
                    <span className="flex-shrink-0 text-white/20 group-hover:text-violet-400 transition-colors text-lg mt-0.5">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
