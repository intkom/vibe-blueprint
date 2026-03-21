import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LoginForm } from "@/components/login-form";

function messageForUrlError(code: string | undefined): string | null {
  if (!code) return null;
  if (code === "auth") {
    return "Could not complete sign-in. Try again or request a new link from your email.";
  }
  try {
    return decodeURIComponent(code);
  } catch {
    return "Something went wrong.";
  }
}

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const urlError = messageForUrlError(params.error);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Use the email and password for your VibeStep account.
      </p>
      <div className="mt-8">
        <LoginForm urlError={urlError} />
      </div>
      <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href="/dashboard"
          className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
        >
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
