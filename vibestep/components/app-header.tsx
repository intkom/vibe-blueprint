import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/actions/auth";

export async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight text-violet-600 dark:text-violet-400"
        >
          VibeStep
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:gap-4">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Dashboard
          </Link>
          {user ? (
            <Link
              href="/create"
              className="rounded-full bg-violet-600 px-3 py-1.5 text-white transition-colors hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
            >
              New idea
            </Link>
          ) : null}
          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-zinc-300 px-3 py-1.5 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-600 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
