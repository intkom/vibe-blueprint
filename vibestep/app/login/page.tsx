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
    <div className="min-h-screen bg-[#030014] text-white flex flex-col relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-violet w-[700px] h-[700px] top-[-20%] left-[50%] -translate-x-1/2" />
      <div className="orb orb-pink w-[350px] h-[350px] bottom-[10%] left-[10%]" />
      <div className="orb orb-blue w-[350px] h-[350px] top-[20%] right-[5%]" />

      {/* Static stars via CSS */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 40% 10%, rgba(167,139,250,0.8) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 30%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 65%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 20%, rgba(167,139,250,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 75%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 50%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 90%, rgba(255,255,255,0.35) 0%, transparent 100%)
          `
        }}
      />

      {/* Logo nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold">V</div>
          <span className="text-lg font-bold gradient-text">VibeStep</span>
        </Link>
        <Link href="/" className="text-sm text-white/40 hover:text-white/80 transition-colors">
          ← Back home
        </Link>
      </nav>

      {/* Centered card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-scale-in">
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-violet-500/10 blur-2xl -z-10 scale-105" />

          <div className="glass-strong rounded-3xl p-10 border border-white/10 shadow-2xl shadow-violet-900/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 items-center justify-center text-2xl mb-5 glow">
                ✦
              </div>
              <h1 className="text-2xl font-black text-white">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-white/40 leading-relaxed">
                Sign in to your VibeStep account
              </p>
            </div>

            <LoginForm urlError={urlError} />

            <p className="mt-8 text-center text-xs text-white/25">
              Don&apos;t have an account?{" "}
              <Link href="/dashboard" className="text-violet-400/70 hover:text-violet-300 transition-colors">
                Get started free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
