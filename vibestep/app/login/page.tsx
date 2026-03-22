import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LoginForm } from "@/components/login-form";
import { GoogleAuthButton } from "@/components/google-auth-button";

function messageForUrlError(code: string | undefined): string | null {
  if (!code) return null;
  if (code === "auth") return "Could not complete sign-in. Try again or request a new link.";
  try { return decodeURIComponent(code); } catch { return "Something went wrong."; }
}

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const urlError = messageForUrlError(params.error);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vs-bg)', color: 'var(--vs-text)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ── Gradient mesh background ── */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(124,58,237,0.22) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 40% at 15% 70%, rgba(236,72,153,0.1) 0%, transparent 55%)',
          'radial-gradient(ellipse 40% 40% at 85% 30%, rgba(96,165,250,0.09) 0%, transparent 55%)',
          '#030014',
        ].join(','),
      }} />

      {/* Grid mesh */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.018,
        backgroundImage: 'linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)',
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 20%, black 30%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 20%, black 30%, transparent 75%)',
      }} />

      {/* CSS star dots */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: [
          'radial-gradient(1.5px 1.5px at 8% 12%, rgba(167,139,250,0.85) 0%, transparent 100%)',
          'radial-gradient(1px 1px at 18% 38%, rgba(255,255,255,0.55) 0%, transparent 100%)',
          'radial-gradient(1px 1px at 29% 72%, rgba(255,255,255,0.4) 0%, transparent 100%)',
          'radial-gradient(2px 2px at 42% 8%, rgba(167,139,250,0.9) 0%, transparent 100%)',
          'radial-gradient(1px 1px at 55% 55%, rgba(255,255,255,0.45) 0%, transparent 100%)',
          'radial-gradient(1.5px 1.5px at 67% 22%, rgba(167,139,250,0.7) 0%, transparent 100%)',
          'radial-gradient(1px 1px at 74% 80%, rgba(255,255,255,0.35) 0%, transparent 100%)',
          'radial-gradient(1px 1px at 83% 45%, rgba(255,255,255,0.5) 0%, transparent 100%)',
          'radial-gradient(1.5px 1.5px at 91% 15%, rgba(167,139,250,0.65) 0%, transparent 100%)',
          'radial-gradient(1px 1px at 96% 68%, rgba(255,255,255,0.3) 0%, transparent 100%)',
          'radial-gradient(1px 1px at 33% 90%, rgba(255,255,255,0.35) 0%, transparent 100%)',
          'radial-gradient(1px 1px at 62% 95%, rgba(255,255,255,0.28) 0%, transparent 100%)',
          'radial-gradient(1px 1px at 12% 58%, rgba(255,255,255,0.3) 0%, transparent 100%)',
          'radial-gradient(1.5px 1.5px at 50% 30%, rgba(167,139,250,0.6) 0%, transparent 100%)',
          'radial-gradient(1px 1px at 78% 60%, rgba(255,255,255,0.4) 0%, transparent 100%)',
        ].join(','),
      }} />

      {/* ── Minimal logo nav ── */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: 'white',
            boxShadow: '0 0 16px rgba(139,92,246,0.5)',
          }}>V</div>
          <span style={{
            fontSize: '1.1rem', fontWeight: 800,
            background: 'linear-gradient(135deg,#c4b5fd,#a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>VibeStep</span>
        </Link>
        <Link href="/" style={{
          fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
          transition: 'color 0.2s ease',
        }}>
          ← Back home
        </Link>
      </nav>

      {/* ── Centered login card ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px 60px',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

          {/* Outer glow halo */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: -24, borderRadius: 40,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
            filter: 'blur(20px)', pointerEvents: 'none',
          }} />

          {/* Card */}
          <div style={{
            position: 'relative',
            background: 'rgba(10,6,30,0.82)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 24,
            padding: '40px 36px 36px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)',
            animation: 'scaleIn 0.4s ease both',
          }}>

            {/* Top beam */}
            <div aria-hidden="true" style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '60%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(236,72,153,0.4), transparent)',
              borderRadius: 1,
            }} />

            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                display: 'inline-flex', width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 28px rgba(139,92,246,0.55), 0 0 60px rgba(139,92,246,0.2)',
                marginBottom: 20, fontSize: 22,
              }}>✦</div>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: 'rgba(255,255,255,0.95)', margin: 0, letterSpacing: '-0.02em' }}>
                Welcome back
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>
                Sign in to your VibeStep account
              </p>
            </div>

            <LoginForm urlError={urlError} />

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <GoogleAuthButton label="Continue with Google" />

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', margin: '20px 0 0' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: 'rgba(167,139,250,0.7)', textDecoration: 'none', fontWeight: 500 }}>
                Sign up free
              </Link>
            </p>
          </div>

          {/* Trust note */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.72rem', color: 'rgba(255,255,255,0.18)' }}>
            Protected · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
