'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

/* ─── Star field ─────────────────────────────────────────────── */
function StarField() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const stars: HTMLDivElement[] = []
    for (let i = 0; i < 180; i++) {
      const s = document.createElement('div')
      const size = Math.random() * 2.2 + 0.4
      const bright = Math.random()
      s.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        `width:${size}px`,
        `height:${size}px`,
        `left:${Math.random() * 100}%`,
        `top:${Math.random() * 100}%`,
        `background:${bright > 0.85 ? `rgba(167,139,250,${bright})` : 'white'}`,
        `opacity:${bright * 0.7 + 0.15}`,
        `--dur:${(Math.random() * 4 + 2).toFixed(1)}s`,
        `--delay:${(Math.random() * 6).toFixed(1)}s`,
        `animation:twinkle var(--dur) ease-in-out ${(Math.random() * 6).toFixed(1)}s infinite`,
        bright > 0.85 ? `box-shadow:0 0 ${size * 2}px rgba(167,139,250,0.9)` : '',
      ].join(';')
      el.appendChild(s)
      stars.push(s)
    }
    return () => stars.forEach(s => s.remove())
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  )
}

/* ─── Data ───────────────────────────────────────────────────── */
const features = [
  {
    icon: '💡',
    num: '01',
    title: 'Describe your idea',
    desc: 'Type your vague idea in plain English. No structure, no templates — just your raw vision.',
    accentColor: 'rgba(139,92,246,0.25)',
    borderHover: '#7c3aed',
  },
  {
    icon: '🤖',
    num: '02',
    title: 'AI breaks it down',
    desc: 'Claude generates exactly 10 atomic, bug-free build steps tailored to your stack and goals.',
    accentColor: 'rgba(236,72,153,0.2)',
    borderHover: '#ec4899',
  },
  {
    icon: '✅',
    num: '03',
    title: 'Ship step by step',
    desc: 'Complete each step before moving forward. Stay focused, build faster, ship confidently.',
    accentColor: 'rgba(96,165,250,0.2)',
    borderHover: '#60a5fa',
  },
]

/* ─── Page ───────────────────────────────────────────────────── */
export default function Home() {
  return (
    <main
      style={{ minHeight: '100vh', background: '#030014', color: 'white', position: 'relative', overflowX: 'hidden' }}
    >
      <StarField />

      {/* Ambient orbs */}
      <div aria-hidden="true" style={{
        position: 'fixed', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden="true" style={{
        position: 'fixed', bottom: '10%', left: '-5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden="true" style={{
        position: 'fixed', top: '40%', right: '-8%',
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Navbar ── */}
      <nav
        className="nav-cosmic"
        style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 2rem' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: 'white',
              boxShadow: '0 0 16px rgba(139,92,246,0.5)',
            }}>V</div>
            <span className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 800 }}>VibeStep</span>
          </div>
          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" style={{
              fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)',
              padding: '8px 14px', borderRadius: 8,
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              Log in
            </Link>
            <Link href="/login" className="btn-primary" style={{ fontSize: '0.875rem', padding: '9px 20px', textDecoration: 'none' }}>
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '100px 2rem 80px' }}>
        {/* Badge */}
        <div
          className="glass animate-fade-in-up"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 9999,
            fontSize: '0.75rem', color: '#c4b5fd',
            marginBottom: 40, borderColor: 'rgba(139,92,246,0.25)',
          }}
        >
          <span style={{ width: 7, height: 7, background: '#a78bfa', borderRadius: '50%', animation: 'pulseGlow 2s ease-in-out infinite' }} />
          AI-Powered Project Planning · Powered by Claude
          <span style={{ width: 7, height: 7, background: '#a78bfa', borderRadius: '50%', animation: 'pulseGlow 2s ease-in-out infinite' }} />
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-up delay-100"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.07, marginBottom: 24, letterSpacing: '-0.02em', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}
        >
          Turn your vague idea into{' '}
          <span className="gradient-text">10 atomic steps</span>
        </h1>

        {/* Sub */}
        <p
          className="animate-fade-in-up delay-200"
          style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', maxWidth: 540, margin: '0 auto 48px', lineHeight: 1.75 }}
        >
          Stop getting stuck. VibeStep breaks down any idea into clear,
          actionable build steps so you can ship without losing momentum.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/login" className="btn-primary animate-pulse-glow" style={{ fontSize: '1rem', padding: '14px 32px', textDecoration: 'none' }}>
            Start building for free →
          </Link>
          <Link href="/dashboard" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px', textDecoration: 'none' }}>
            View dashboard
          </Link>
        </div>

        {/* Stats */}
        <div
          className="animate-fade-in-up delay-500"
          style={{ display: 'flex', gap: 56, marginTop: 72, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {[
            { value: '10', label: 'Atomic steps', sub: 'per project' },
            { value: 'AI', label: 'Powered by Claude', sub: 'Anthropic' },
            { value: '∞', label: 'Ideas to build', sub: 'no limits' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 900 }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 120px', maxWidth: 1060, margin: '0 auto' }}>
        {/* Section label */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.6)', textTransform: 'uppercase', marginBottom: 10 }}>
            How it works
          </p>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>
            Three steps to shipping
          </h2>
        </div>

        {/* Card grid — inline grid so it definitely works */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 2rem 120px' }}>
        <div
          className="animate-border-pulse"
          style={{
            maxWidth: 660, margin: '0 auto',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 28,
            border: '1px solid rgba(139,92,246,0.2)',
            padding: '64px 48px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* inner glow */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, borderRadius: 28, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              className="glass"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.72rem', color: 'rgba(167,139,250,0.7)', padding: '6px 14px', borderRadius: 9999, marginBottom: 24, borderColor: 'rgba(139,92,246,0.2)' }}
            >
              <span style={{ width: 6, height: 6, background: '#34d399', borderRadius: '50%', animation: 'pulseGlow 2s ease-in-out infinite' }} />
              Join builders shipping real products
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: 14, lineHeight: 1.2 }}>
              Ready to stop vibing and start{' '}
              <span className="gradient-text">shipping?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.38)', marginBottom: 36, maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Turn your next big idea into a clear execution plan in under 60 seconds.
            </p>
            <Link href="/login" className="btn-primary" style={{ fontSize: '1rem', padding: '13px 36px', textDecoration: 'none' }}>
              Start for free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '24px 0 40px', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.18)', fontSize: '0.82rem' }}>
        <span className="gradient-text" style={{ fontWeight: 700 }}>VibeStep</span> · Turn ideas into atomic steps
      </footer>
    </main>
  )
}

/* ─── Feature card (isolated so hover state works easily) ─────── */
function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 20,
        padding: '32px 28px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease, background 0.28s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-7px)'
        el.style.boxShadow = `0 24px 48px ${feature.accentColor}, 0 0 0 1px ${feature.borderHover}55`
        el.style.borderColor = `${feature.borderHover}55`
        el.style.background = 'rgba(255,255,255,0.07)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = ''
        el.style.borderColor = 'rgba(255,255,255,0.09)'
        el.style.background = 'rgba(255,255,255,0.04)'
      }}
    >
      {/* Watermark number */}
      <span aria-hidden="true" style={{
        position: 'absolute', top: 16, right: 20,
        fontSize: '3.5rem', fontWeight: 900,
        color: 'rgba(255,255,255,0.04)',
        lineHeight: 1, userSelect: 'none',
        transition: 'color 0.28s ease',
      }}>
        {feature.num}
      </span>

      {/* Icon */}
      <div
        className="animate-float"
        style={{ fontSize: '2.5rem', marginBottom: 20, animationDelay: `${index * 0.55}s` }}
      >
        {feature.icon}
      </div>

      {/* Text */}
      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'rgba(255,255,255,0.92)', marginBottom: 10 }}>
        {feature.title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, margin: 0 }}>
        {feature.desc}
      </p>
    </div>
  )
}
