import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { CreateProjectForm } from "@/components/create-project-form";

function IconArrowLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7M5 12h14" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

const tips = [
  { icon: '🎯', text: 'Describe your target user — who has this problem?' },
  { icon: '🛠', text: 'Mention your preferred tech stack if you have one' },
  { icon: '💡', text: 'Explain the core problem your product solves' },
  { icon: '📦', text: 'Note any features that are must-haves for v1' },
];

export default function CreatePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#030014', color: 'white', position: 'relative', overflow: 'hidden' }}>

      {/* Gradient mesh */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 70% 55% at 70% -5%, rgba(124,58,237,0.18) 0%, transparent 60%)',
          'radial-gradient(ellipse 45% 35% at 10% 75%, rgba(236,72,153,0.08) 0%, transparent 55%)',
          '#030014',
        ].join(','),
      }} />
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.015,
        backgroundImage: 'linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)',
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse 80% 50% at 70% 0%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 70% 0%, black 20%, transparent 70%)',
      }} />

      <AppHeader />

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 680, margin: '0 auto', padding: '44px 24px 80px' }}>

        {/* Back link */}
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: '0.82rem', color: 'rgba(255,255,255,0.32)',
          textDecoration: 'none', marginBottom: 32,
          transition: 'color 0.2s ease',
        }}>
          <IconArrowLeft />
          Back to dashboard
        </Link>

        {/* ── Main card ── */}
        <div style={{
          background: 'rgba(10,6,30,0.75)',
          backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(139,92,246,0.18)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.08)',
          position: 'relative',
        }}>
          {/* Top beam */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '70%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.65), rgba(236,72,153,0.35), transparent)',
          }} />

          {/* Card header */}
          <div style={{
            padding: '28px 32px 22px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(139,92,246,0.5)',
                color: 'white',
              }}>
                <IconSparkle />
              </div>
              <div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.95)' }}>
                  New project
                </h1>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>
                  Powered by Claude AI
                </p>
              </div>
            </div>

            {/* Step count badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.22)',
              borderRadius: 9999, padding: '5px 12px',
              fontSize: '0.72rem', fontWeight: 600, color: 'rgba(167,139,250,0.8)',
              letterSpacing: '0.02em',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }} />
              10 atomic steps
            </div>
          </div>

          {/* Description strip */}
          <div style={{
            padding: '14px 32px',
            background: 'rgba(139,92,246,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.65 }}>
              Describe your idea in plain English — no structure needed.{' '}
              <span style={{ color: 'rgba(167,139,250,0.75)', fontWeight: 500 }}>
                Claude will generate 10 atomic build steps
              </span>{' '}
              and save everything automatically.
            </p>
          </div>

          {/* Form */}
          <div style={{ padding: '28px 32px 32px' }}>
            <CreateProjectForm />
          </div>
        </div>

        {/* ── Tips card ── */}
        <div style={{
          marginTop: 16,
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18, padding: '20px 24px',
        }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 14 }}>
            Tips for great results
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px 24px' }}>
            {tips.map(tip => (
              <div key={tip.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.32)', lineHeight: 1.55 }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
