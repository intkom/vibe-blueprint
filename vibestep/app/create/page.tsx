import Link from "next/link";
import { CreateProjectForm } from "@/components/create-project-form";

export default function CreatePage() {
  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        New project
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Give it a title and write your raw idea. You can refine it later.
      </p>
      <div className="mt-8">
        <CreateProjectForm />
      </div>
    </div>
  );
}
