'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

/* ── Star field ──────────────────────────────────────────── */
function StarField() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stars: HTMLDivElement[] = []
    for (let i = 0; i < 160; i++) {
      const s = document.createElement('div')
      const size = Math.random() * 2 + 0.4
      const bright = Math.random()
      s.style.cssText = [
        'position:absolute', 'border-radius:50%',
        `width:${size}px`, `height:${size}px`,
        `left:${Math.random() * 100}%`, `top:${Math.random() * 100}%`,
        `background:${bright > 0.85 ? `rgba(167,139,250,${bright})` : 'white'}`,
        `opacity:${bright * 0.6 + 0.15}`,
        `animation:twinkle ${(Math.random() * 4 + 2).toFixed(1)}s ease-in-out ${(Math.random() * 6).toFixed(1)}s infinite`,
        bright > 0.85 ? `box-shadow:0 0 ${size * 2}px rgba(167,139,250,0.8)` : '',
      ].join(';')
      el.appendChild(s)
      stars.push(s)
    }
    return () => stars.forEach(s => s.remove())
  }, [])
  return <div ref={ref} aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

/* ── Data ────────────────────────────────────────────────── */
const features = [
  {
    num: '01',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2Z" /><path d="M12 22v-6.5M22 8.5l-10 7-10-7" />
      </svg>
    ),
    title: 'Get your exact tech stack',
    desc: 'Not "use React or Vue." The specific technology for each layer of your idea — with the reason it was chosen and what breaks if you ignore it.',
    accent: 'rgba(139,92,246,0.5)',
    accentBg: 'rgba(139,92,246,0.08)',
  },
  {
    num: '02',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" />
      </svg>
    ),
    title: 'Dead-End Detector',
    desc: 'The 3 architectural decisions most likely to kill your specific idea. Named. Detailed. The kind of warning a $300/hr CTO would give you after reading your spec.',
    accent: 'rgba(239,68,68,0.5)',
    accentBg: 'rgba(239,68,68,0.07)',
  },
  {
    num: '03',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
    title: '10 atomic build steps',
    desc: "Each step is 2–4 hours of focused work. In sequence. With guidance that tells you the wrong way to do it — so you don't waste a week finding out.",
    accent: 'rgba(52,211,153,0.5)',
    accentBg: 'rgba(52,211,153,0.07)',
  },
]

const testimonials = [
  {
    quote: "I was about to build real-time collaboration in v1. The Dead-End Detector told me exactly why that would have wrecked my timeline. Saved me 3 weeks minimum.",
    name: "Marcus Chen",
    role: "Indie hacker, 4 shipped products",
    avatar: "MC",
    avatarColor: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    stars: 5,
  },
  {
    quote: "Every other AI told me 'use PostgreSQL.' This one told me WHY — and explained that my multi-tenant setup needed row-level security from day one, not week 12.",
    name: "Priya Nair",
    role: "Solo SaaS founder · $2.4k MRR",
    avatar: "PN",
    avatarColor: 'linear-gradient(135deg,#ec4899,#be185d)',
    stars: 5,
  },
  {
    quote: "Replaced my 2-hour planning session with a 30-second paste. The output was more opinionated than the senior dev I paid $150/hr to do the same review.",
    name: "Tom Åberg",
    role: "Startup builder · 3rd company",
    avatar: "TÅ",
    avatarColor: 'linear-gradient(135deg,#0ea5e9,#0369a1)',
    stars: 5,
  },
]

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: "See if it's real before you pay.",
    cta: 'Start free',
    ctaHref: '/signup',
    features: [
      '3 blueprints per month',
      'Full tech stack output',
      'Dead-End Detector (3 warnings)',
      '10 atomic build steps',
    ],
    highlight: false,
    badge: null,
    comingSoon: false,
  },
  {
    name: 'Builder',
    price: '$29',
    period: '/mo',
    description: 'For founders who ship constantly.',
    cta: 'Start building',
    ctaHref: '/signup',
    features: [
      'Unlimited blueprints',
      'Everything in Free',
      'Export to PDF',
      'Shareable blueprint links',
      'Priority analysis',
    ],
    highlight: true,
    badge: 'Most popular',
    comingSoon: true,
  },
  {
    name: 'Team',
    price: '$79',
    period: '/mo',
    description: 'For agencies and small build teams.',
    cta: 'Contact us',
    ctaHref: '/signup',
    features: [
      'Unlimited blueprints',
      'Everything in Builder',
      'Team workspace',
      '5 team seats',
      'Priority support',
    ],
    highlight: false,
    badge: null,
    comingSoon: true,
  },
]

const marqueeItems = [
  'Product Hunt #1',
  'Indie Hackers',
  'Y Combinator Alumni',
  'Solo Founders',
  'Startup Studios',
  'Dev Agencies',
  'Technical Founders',
  'Non-Technical Founders',
  'SaaS Builders',
  'Micro-SaaS',
  'B2B Tools',
  'AI Startups',
]

const howItWorksSteps = [
  {
    num: '01',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    title: 'Describe your idea',
    desc: 'Paste your idea in plain English. No templates, no forms. Just tell it what you want to build and who it\'s for.',
    color: '#a78bfa',
    colorBg: 'rgba(139,92,246,0.08)',
    colorBorder: 'rgba(139,92,246,0.2)',
  },
  {
    num: '02',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: 'Claude analyses it',
    desc: 'Claude reads your spec like a senior technical co-founder. It evaluates your market, architecture, and failure risks in seconds.',
    color: '#ec4899',
    colorBg: 'rgba(236,72,153,0.08)',
    colorBorder: 'rgba(236,72,153,0.2)',
  },
  {
    num: '03',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Get your blueprint',
    desc: 'Receive your exact tech stack, 3 critical warnings, and 10 atomic build steps — each 2–4 hours of focused work. Ready to ship.',
    color: '#34d399',
    colorBg: 'rgba(52,211,153,0.08)',
    colorBorder: 'rgba(52,211,153,0.2)',
  },
]

/* ── Feature card ─────────────────────────────────────────── */
function FeatureCard({ feature }: { feature: typeof features[0] }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '28px 26px',
        position: 'relative', overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-5px)'
        el.style.boxShadow = `0 20px 44px ${feature.accentBg}, 0 0 0 1px ${feature.accent.replace('0.5)', '0.35)')}`
        el.style.borderColor = feature.accent.replace('0.5)', '0.35)')
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = ''
        el.style.borderColor = 'rgba(255,255,255,0.08)'
      }}
    >
      <span aria-hidden="true" style={{
        position: 'absolute', top: 14, right: 18,
        fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.035)', lineHeight: 1,
      }}>{feature.num}</span>

      <div style={{
        width: 46, height: 46, borderRadius: 12, marginBottom: 18,
        background: feature.accentBg,
        border: `1px solid ${feature.accent.replace('0.5)', '0.3)')}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: feature.accent.replace('0.5)', '0.9)'),
      }}>
        {feature.icon}
      </div>

      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.92)', marginBottom: 10 }}>
        {feature.title}
      </h3>
      <p style={{ fontSize: '0.845rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.72, margin: 0 }}>
        {feature.desc}
      </p>
    </div>
  )
}

/* ── Pricing card ─────────────────────────────────────────── */
function PricingCard({ tier }: { tier: typeof pricingTiers[0] }) {
  return (
    <div style={{
      background: tier.highlight ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.025)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: tier.highlight ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: '28px 26px',
      position: 'relative', overflow: 'hidden',
      boxShadow: tier.highlight ? '0 0 40px rgba(139,92,246,0.15)' : 'none',
      display: 'flex', flexDirection: 'column',
    }}>
      {tier.highlight && (
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '70%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)',
        }} />
      )}
      {tier.comingSoon && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.35)', padding: '3px 9px', borderRadius: 9999,
        }}>Coming Soon</div>
      )}
      {!tier.comingSoon && tier.badge && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)',
          color: '#c4b5fd', padding: '3px 9px', borderRadius: 9999,
        }}>{tier.badge}</div>
      )}
      <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: tier.highlight ? 'rgba(167,139,250,0.8)' : 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>
        {tier.name}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.03em' }}>{tier.price}</span>
        {tier.period && <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{tier.period}</span>}
      </div>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: 24, lineHeight: 1.5 }}>{tier.description}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        {tier.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tier.highlight ? '#a78bfa' : 'rgba(255,255,255,0.4)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      {tier.comingSoon ? (
        <div style={{
          display: 'block', textAlign: 'center',
          padding: '11px 20px', borderRadius: 11, fontWeight: 600, fontSize: '0.875rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          color: 'rgba(255,255,255,0.2)',
          cursor: 'not-allowed',
        }}>
          Coming soon
        </div>
      ) : (
        <Link href={tier.ctaHref} style={{
          display: 'block', textAlign: 'center', textDecoration: 'none',
          padding: '11px 20px', borderRadius: 11, fontWeight: 600, fontSize: '0.875rem',
          background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
          border: '1px solid rgba(139,92,246,0.45)',
          color: 'white',
          boxShadow: '0 0 22px rgba(139,92,246,0.3)',
        }}>
          {tier.cta}
        </Link>
      )}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#030014', color: 'white', position: 'relative', overflowX: 'hidden' }}>
      <StarField />

      {/* Marquee keyframes */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marqueeReverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      `}</style>

      {/* Ambient orbs */}
      <div aria-hidden="true" style={{ position: 'fixed', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'fixed', bottom: '10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'fixed', top: '40%', right: '-8%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, padding: '0 2rem',
        background: 'rgba(3,0,20,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', boxShadow: '0 0 16px rgba(139,92,246,0.5)' }}>V</div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(135deg,#c4b5fd,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>VibeStep</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', padding: '8px 14px', borderRadius: 8, textDecoration: 'none' }}>
              Log in
            </Link>
            <Link href="/signup" style={{
              fontSize: '0.875rem', padding: '9px 20px', borderRadius: 10,
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              border: '1px solid rgba(139,92,246,0.4)', color: 'white',
              textDecoration: 'none', fontWeight: 600,
              boxShadow: '0 0 18px rgba(139,92,246,0.3)',
            }}>
              Get started free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '96px 2rem 72px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
          backdropFilter: 'blur(10px)',
          padding: '7px 16px', borderRadius: 9999,
          fontSize: '0.75rem', color: '#c4b5fd', marginBottom: 36,
        }}>
          <span style={{ width: 7, height: 7, background: '#a78bfa', borderRadius: '50%', animation: 'pulseGlow 2s ease-in-out infinite' }} />
          Idea Validator · Tech Blueprint · Monetization Map · Sprint Planner
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 6.5vw, 4.8rem)', fontWeight: 900,
          lineHeight: 1.07, marginBottom: 22, letterSpacing: '-0.025em',
          maxWidth: 860, marginLeft: 'auto', marginRight: 'auto',
          color: 'rgba(255,255,255,0.95)',
        }}>
          We tell you exactly what to build —<br />
          <span style={{
            background: 'linear-gradient(135deg,#a78bfa 0%,#ec4899 45%,#60a5fa 100%)',
            backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            before you waste 6 months
          </span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: '0 auto 44px', lineHeight: 1.75 }}>
          Paste your startup idea. Get the exact tech stack, architecture decisions, and the failure points most founders hit — in 30 seconds.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
          <Link href="/signup" style={{
            fontSize: '1rem', padding: '14px 32px', borderRadius: 12,
            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border: '1px solid rgba(139,92,246,0.45)', color: 'white',
            textDecoration: 'none', fontWeight: 600,
            boxShadow: '0 0 28px rgba(139,92,246,0.45)',
            animation: 'pulseGlow 3s ease-in-out infinite',
          }}>
            Get your free blueprint →
          </Link>
          <Link href="/dashboard" style={{
            fontSize: '1rem', padding: '14px 32px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)',
            textDecoration: 'none', fontWeight: 500,
          }}>
            View dashboard
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 52, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: '30s', label: 'Time to blueprint', sub: 'avg generation' },
            { value: '1', label: 'AI tool live now', sub: 'more coming soon' },
            { value: '10', label: 'Atomic steps', sub: 'no guessing' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg,#c4b5fd,#a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{s.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marquee ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 0 80px', overflow: 'hidden' }}>
        <p style={{
          textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', marginBottom: 24,
        }}>Trusted by builders worldwide</p>

        <div style={{ position: 'relative' }}>
          {/* Fade edges */}
          <div aria-hidden="true" style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, zIndex: 1,
            background: 'linear-gradient(90deg, #030014, transparent)', pointerEvents: 'none',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, zIndex: 1,
            background: 'linear-gradient(270deg, #030014, transparent)', pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', gap: 12, animation: 'marquee 28s linear infinite',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 9999, padding: '8px 18px',
                  fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500,
                  flexShrink: 0,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(167,139,250,0.5)', flexShrink: 0 }} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
            How it works
          </p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', marginBottom: 12 }}>
            From idea to blueprint in 3 steps
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)', maxWidth: 420, margin: '0 auto' }}>
            No setup. No templates. Just paste and go.
          </p>
        </div>

        {/* Steps */}
        <div style={{ position: 'relative' }}>
          {/* Connector line */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 52, left: '16.6%', right: '16.6%', height: 1,
            background: 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3), rgba(52,211,153,0.3))',
            display: 'none',
          }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {howItWorksSteps.map((step, i) => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                {/* Number + icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 0, position: 'relative' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: step.colorBg, border: `1px solid ${step.colorBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.color,
                    boxShadow: `0 0 24px ${step.color}22`,
                    position: 'relative',
                  }}>
                    {step.icon}
                    <span style={{
                      position: 'absolute', top: -8, right: -8,
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#030014', border: `1px solid ${step.colorBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 800, color: step.color,
                    }}>{i + 1}</span>
                  </div>
                </div>

                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', marginBottom: 10 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.72, margin: '0 auto', maxWidth: 280 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mockup preview card */}
        <div style={{
          marginTop: 60,
          background: 'rgba(10,6,30,0.7)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 0 60px rgba(139,92,246,0.06)',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {['#f87171','#fbbf24','#34d399'].map((c,i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.6 }} />
            ))}
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginLeft: 8, fontFamily: 'monospace' }}>vibstep.app/project/blueprint</span>
          </div>
          <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { label: 'Tech Stack', value: 'Next.js + Supabase', color: '#a78bfa' },
              { label: 'Dead-End Risk', value: '3 warnings found', color: '#f87171' },
              { label: 'Build Steps', value: '10 atomic steps', color: '#34d399' },
              { label: 'Est. Time', value: '2–4 hrs per step', color: '#60a5fa' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '14px 16px',
              }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', margin: '0 0 6px' }}>{item.label}</p>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: item.color, margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
            What you actually get
          </p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>
            Not &ldquo;AI insights.&rdquo; The exact output.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {features.map((f) => <FeatureCard key={f.title} feature={f} />)}
        </div>
      </section>

      {/* ── Social proof ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
            From the founders using it
          </p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>
            What they said the first time
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{
              background: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: '26px 24px',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: t.stars }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, margin: 0, flex: 1 }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: t.avatarColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800, color: 'white',
                }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
            Pricing
          </p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', marginBottom: 10 }}>
            Start free. Pay when it saves you time.
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)' }}>
            No credit card required. 3 full blueprints, completely free.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {pricingTiers.map(tier => <PricingCard key={tier.name} tier={tier} />)}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 2rem 100px' }}>
        <div style={{
          maxWidth: 640, margin: '0 auto',
          background: 'rgba(10,6,30,0.75)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 28, padding: '56px 40px',
          position: 'relative', overflow: 'hidden',
          animation: 'ctaGlow 4s ease-in-out infinite',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '60%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(236,72,153,0.4), transparent)',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, borderRadius: 28,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              padding: '6px 14px', borderRadius: 9999,
              fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 22,
            }}>
              <span style={{ width: 6, height: 6, background: '#34d399', borderRadius: '50%', animation: 'pulseGlow 2s ease-in-out infinite' }} />
              No credit card · 3 free blueprints
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 900, marginBottom: 14, lineHeight: 1.18, letterSpacing: '-0.02em' }}>
              You&apos;re one paste away from knowing{' '}
              <span style={{
                background: 'linear-gradient(135deg,#a78bfa,#ec4899)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                exactly what to build.
              </span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.7, fontSize: '0.9rem' }}>
              Stop second-guessing your stack. Stop hitting dead ends. Get your blueprint in 30 seconds.
            </p>
            <Link href="/signup" style={{
              display: 'inline-block', textDecoration: 'none',
              fontSize: '1rem', padding: '13px 36px', borderRadius: 12,
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              border: '1px solid rgba(139,92,246,0.45)', color: 'white', fontWeight: 600,
              boxShadow: '0 0 28px rgba(139,92,246,0.4)',
            }}>
              Get my free blueprint →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '56px 2rem 40px',
      }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2.5rem', marginBottom: 48 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>V</div>
                <span style={{ fontWeight: 800, background: 'linear-gradient(135deg,#c4b5fd,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>VibeStep</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.65, maxWidth: 200 }}>
                Turn your startup idea into an actionable blueprint in 30 seconds.
              </p>
            </div>

            {/* Product */}
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>Product</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Features', href: '/#features' },
                  { label: 'Pricing', href: '/#pricing' },
                  { label: 'Tools', href: '/tools' },
                  { label: 'Dashboard', href: '/dashboard' },
                ].map(link => (
                  <Link key={link.label} href={link.href} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Account */}
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>Account</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Sign up', href: '/signup' },
                  { label: 'Log in', href: '/login' },
                  { label: 'Dashboard', href: '/dashboard' },
                ].map(link => (
                  <Link key={link.label} href={link.href} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>Legal</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                ].map(link => (
                  <Link key={link.label} href={link.href} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.18)', margin: 0 }}>
              © {new Date().getFullYear()} VibeStep. Built with Claude.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.18)', margin: 0 }}>
              Turn ideas into blueprints in 30 seconds.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
