import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/actions/auth";

export async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="nav-cosmic sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold gradient-text tracking-tight"
        >
          VibeStep
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/dashboard"
            className="text-white/50 hover:text-white/90 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Dashboard
          </Link>
          {user ? (
            <Link
              href="/create"
              className="btn-primary text-sm py-2 px-4"
            >
              + New idea
            </Link>
          ) : null}
          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="text-white/40 hover:text-white/80 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 text-sm"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="text-white/50 hover:text-white border border-white/10 hover:border-violet-500/50 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-violet-500/10"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
