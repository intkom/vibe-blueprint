'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

/* ──────────────────────────────────────────────────────────────
   Star field
────────────────────────────────────────────────────────────── */
function StarField() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stars: HTMLDivElement[] = []
    for (let i = 0; i < 110; i++) {
      const s = document.createElement('div')
      const size = Math.random() * 1.6 + 0.3
      const bright = Math.random()
      s.style.cssText = [
        'position:absolute', 'border-radius:50%',
        `width:${size}px`, `height:${size}px`,
        `left:${Math.random() * 100}%`, `top:${Math.random() * 100}%`,
        `background:${bright > 0.88 ? `rgba(167,139,250,${bright * 0.9})` : 'white'}`,
        `opacity:${bright * 0.45 + 0.06}`,
        `animation:twinkle ${(Math.random() * 6 + 3).toFixed(1)}s ease-in-out ${(Math.random() * 9).toFixed(1)}s infinite`,
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

/* ──────────────────────────────────────────────────────────────
   Data
────────────────────────────────────────────────────────────── */
const outputBlocks = [
  {
    num: '01',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <path d="M12 9v4M12 17h.01"/>
      </svg>
    ),
    title: 'Risk Detection',
    desc: 'The exact architectural decisions most likely to kill your build. Named, specific, and timed — so you know what to avoid before you write line one.',
    accent: 'rgba(248,113,113,0.55)',
    accentBg: 'rgba(248,113,113,0.07)',
  },
  {
    num: '02',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2Z"/>
        <path d="M12 22v-6.5M22 8.5l-10 7-10-7"/>
      </svg>
    ),
    title: 'Architecture Clarity',
    desc: 'One concrete technology pick per layer. Not "consider using." The stack for your constraints, with the reason each choice was made.',
    accent: 'rgba(139,92,246,0.55)',
    accentBg: 'rgba(139,92,246,0.08)',
  },
  {
    num: '03',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    title: 'Build Intelligence',
    desc: 'Your idea scored across 7 dimensions: market size, technical risk, monetization clarity, competitive defensibility, and more. No cheerleading.',
    accent: 'rgba(251,191,36,0.55)',
    accentBg: 'rgba(251,191,36,0.07)',
  },
  {
    num: '04',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
      </svg>
    ),
    title: 'Execution Path',
    desc: '10 sequenced build steps. Each one 2–4 hours of focused work. In the order software is actually built — not the order that sounds good in a pitch deck.',
    accent: 'rgba(52,211,153,0.55)',
    accentBg: 'rgba(52,211,153,0.07)',
  },
]

const howItWorks = [
  {
    num: '01',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    title: 'Paste your build',
    desc: "Describe what you're building in plain language — your idea, your stack, or both. No templates, no structured forms.",
    color: '#a78bfa',
    colorBg: 'rgba(139,92,246,0.08)',
    colorBorder: 'rgba(139,92,246,0.18)',
  },
  {
    num: '02',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: 'Axiom analyzes it',
    desc: 'A structured analysis pipeline runs — not freeform generation. Risk evaluation, stack selection, dimension scoring, step sequencing.',
    color: '#60a5fa',
    colorBg: 'rgba(96,165,250,0.08)',
    colorBorder: 'rgba(96,165,250,0.18)',
  },
  {
    num: '03',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Get product truth',
    desc: 'Risk areas, architecture recommendations, a 7-dimension build score, and a sequenced execution path. Structured, specific, and ready to act on.',
    color: '#34d399',
    colorBg: 'rgba(52,211,153,0.08)',
    colorBorder: 'rgba(52,211,153,0.18)',
  },
]

const testimonials = [
  {
    quote: "I was about to build real-time collaboration into v1. Axiom flagged it as the highest architectural risk, explained exactly why it would collapse my timeline, and told me what to build instead. Saved me three weeks minimum.",
    name: "Marcus Chen",
    role: "Solo founder · 4 shipped products",
    avatar: "MC",
    avatarBg: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
  },
  {
    quote: "Every AI tool said 'use PostgreSQL.' Axiom told me why — and then told me I needed row-level security from day one for my multi-tenant setup. Not month three. That's a different product.",
    name: "Priya Nair",
    role: "Indie hacker · $2.4k MRR",
    avatar: "PN",
    avatarBg: 'linear-gradient(135deg,#6d28d9,#4c1d95)',
  },
  {
    quote: "I paste my build and get back a structured analysis in 30 seconds. The risk section caught two architectural mistakes I would have shipped. It's not a generator. It's a diagnosis.",
    name: "Tom Åberg",
    role: "AI builder · 3rd product",
    avatar: "TÅ",
    avatarBg: 'linear-gradient(135deg,#1d4ed8,#1e40af)',
  },
]

const pricingTiers = [
  {
    name: 'Starter',
    price: '$0',
    period: '',
    description: 'Analyze your first builds. No card required.',
    cta: 'Start free',
    ctaHref: '/signup',
    features: [
      '3 analyses per month',
      'Risk detection report',
      'Architecture recommendations',
      '7-dimension build score',
      'Execution path (10 steps)',
    ],
    highlight: false,
    badge: null,
    comingSoon: false,
  },
  {
    name: 'Builder',
    price: '$29',
    period: '/mo',
    description: 'For builders who analyze and iterate constantly.',
    cta: 'Start building',
    ctaHref: '/signup',
    features: [
      'Unlimited analyses',
      'Everything in Starter',
      'Export to PDF',
      'Shareable analysis links',
      'Priority processing',
    ],
    highlight: true,
    badge: 'Most popular',
    comingSoon: true,
  },
  {
    name: 'Team',
    price: '$79',
    period: '/mo',
    description: 'For teams shipping with AI and moving fast.',
    cta: 'Contact us',
    ctaHref: '/signup',
    features: [
      'Unlimited analyses',
      'Everything in Builder',
      'Team workspace',
      '5 member seats',
      'Priority support',
    ],
    highlight: false,
    badge: null,
    comingSoon: true,
  },
]

const marqueeItems = [
  'Indie Hackers',
  'Solo Founders',
  'AI Builders',
  'Vibe Coders',
  'Technical Founders',
  'Non-Technical Founders',
  'SaaS Builders',
  'Startup Studios',
  'Dev Agencies',
  'Micro-SaaS',
  'AI Startups',
  'Side Project Builders',
]

const FAQ_ITEMS = [
  {
    q: "How is this different from asking ChatGPT?",
    a: "ChatGPT generates freeform text. Axiom runs a structured analysis pipeline — it evaluates your build across 7 risk dimensions, picks a concrete tech stack for your constraints, and outputs an execution path sequenced for how software actually gets built. The difference is structure, not speed.",
  },
  {
    q: "Who is Axiom built for?",
    a: "Axiom is built for indie hackers, solo founders, and AI builders — people who can ship quickly but want to understand what they're building before it breaks. You don't need deep technical expertise, but you do need to know what you're trying to build.",
  },
  {
    q: "What exactly does an analysis contain?",
    a: "Each analysis gives you four outputs: a Risk Detection report (the decisions most likely to kill your build), Architecture Clarity (one concrete tech pick per layer with reasoning), a Build Intelligence Score (7-dimension evaluation of your idea), and an Execution Path (10 sequenced steps, each 2–4 hours of focused work).",
  },
  {
    q: "How long does an analysis take?",
    a: "Around 15–30 seconds. You'll see a progress indicator while Axiom works. The output is structured and specific — not a wall of text.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your builds are stored privately in your account and are never shared with other users or used to train AI models. You can delete any analysis at any time from your dashboard.",
  },
]

/* ──────────────────────────────────────────────────────────────
   Demo
────────────────────────────────────────────────────────────── */
const DEMO_IDEA =
  "A habit tracker for athletes — streak logic, Apple Health sync, and a social leaderboard. Solo dev, 6-week timeline."

const DEMO_RISKS = [
  { label: "Real-time leaderboard architecture", detail: "Adding live updates in v1 will double your timeline. Use polling first, upgrade later.", severity: "High", color: "#f87171" },
  { label: "Apple HealthKit rate limits", detail: "HealthKit throttles background sync. Design your sync cadence before building the UI.", severity: "Watch", color: "#fbbf24" },
]

const DEMO_ARCH = [
  { layer: "Frontend", pick: "React Native (Expo)" },
  { layer: "Backend", pick: "Supabase (auth + db + realtime)" },
  { layer: "Health", pick: "react-native-health (HealthKit bridge)" },
]

const DEMO_STEPS = [
  { phase: "Discover", title: "Map athlete pain points & competitor gaps", color: "#60a5fa" },
  { phase: "Define",   title: "Spec streak logic + HealthKit sync cadence", color: "#fbbf24" },
  { phase: "Build",    title: "Scaffold Expo + Supabase auth + schema", color: "#a78bfa" },
  { phase: "Build",    title: "Build workout logging with streak calculation", color: "#a78bfa" },
  { phase: "Build",    title: "Integrate Apple HealthKit — polling, not realtime", color: "#a78bfa" },
  { phase: "Launch",   title: "Deploy, soft-launch with 10 beta athletes", color: "#34d399" },
]

type DemoPhase = "typing" | "analyzing" | "risks" | "arch" | "steps" | "done"

function TypewriterDemo() {
  const [typed, setTyped] = useState("")
  const [risksVisible, setRisksVisible] = useState(0)
  const [archVisible, setArchVisible] = useState(0)
  const [stepsVisible, setStepsVisible] = useState(0)
  const [phase, setPhase] = useState<DemoPhase>("typing")

  useEffect(() => {
    if (phase !== "typing") return
    if (typed.length < DEMO_IDEA.length) {
      const t = setTimeout(() => setTyped(DEMO_IDEA.slice(0, typed.length + 1)), 20)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setPhase("analyzing"), 700)
      return () => clearTimeout(t)
    }
  }, [typed, phase])

  useEffect(() => {
    if (phase !== "analyzing") return
    const t = setTimeout(() => setPhase("risks"), 1900)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== "risks") return
    if (risksVisible < DEMO_RISKS.length) {
      const t = setTimeout(() => setRisksVisible(n => n + 1), 450)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setPhase("arch"), 700)
      return () => clearTimeout(t)
    }
  }, [phase, risksVisible])

  useEffect(() => {
    if (phase !== "arch") return
    if (archVisible < DEMO_ARCH.length) {
      const t = setTimeout(() => setArchVisible(n => n + 1), 320)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setPhase("steps"), 600)
      return () => clearTimeout(t)
    }
  }, [phase, archVisible])

  useEffect(() => {
    if (phase !== "steps") return
    if (stepsVisible < DEMO_STEPS.length) {
      const t = setTimeout(() => setStepsVisible(n => n + 1), 260)
      return () => clearTimeout(t)
    } else {
      setPhase("done")
    }
  }, [phase, stepsVisible])

  function restart() {
    setTyped(""); setRisksVisible(0); setArchVisible(0); setStepsVisible(0); setPhase("typing")
  }

  return (
    <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
          Live demo
        </p>
        <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,1.9rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
          See what Axiom returns
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          This is what you get 30 seconds after you paste your build.
        </p>
      </div>

      <div style={{
        background: 'rgba(8,4,26,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(139,92,246,0.2)', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0,0,0,0.45)',
      }}>
        {/* Window chrome */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {['#f87171', '#fbbf24', '#34d399'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.65 }} />
          ))}
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginLeft: 8 }}>
            axiom.app/analyze
          </span>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Input */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>
              What you&apos;re building
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.32)',
              borderRadius: 12, padding: '14px 16px', minHeight: 68,
              fontSize: '0.875rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65,
            }}>
              {typed}
              {phase === "typing" && (
                <span style={{
                  display: 'inline-block', width: 2, height: '1em',
                  background: '#a78bfa', marginLeft: 2, verticalAlign: 'text-bottom',
                  animation: 'pulseGlow 0.8s ease-in-out infinite',
                }} />
              )}
            </div>
          </div>

          {/* Analyzing */}
          {phase === "analyzing" && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px',
              background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)',
              borderRadius: 12, marginBottom: 16,
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                border: '2px solid rgba(139,92,246,0.3)', borderTopColor: '#a78bfa',
                animation: 'spin 0.75s linear infinite', display: 'inline-block',
              }} />
              <span style={{ fontSize: '0.82rem', color: 'rgba(167,139,250,0.8)', fontWeight: 500 }}>
                Analyzing your build…
              </span>
            </div>
          )}

          {/* Risks */}
          {risksVisible > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(248,113,113,0.65)', marginBottom: 8 }}>
                ⚠ Risk Detection
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DEMO_RISKS.slice(0, risksVisible).map((risk, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, padding: '10px 14px',
                    background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.18)',
                    borderRadius: 10, animation: 'fadeInUp 0.3s ease both',
                  }}>
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.05em',
                      color: risk.color, flexShrink: 0, marginTop: 3,
                      background: `${risk.color}18`, border: `1px solid ${risk.color}40`,
                      padding: '2px 6px', borderRadius: 4,
                    }}>{risk.severity}</span>
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', margin: '0 0 3px' }}>
                        {risk.label}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.36)', margin: 0, lineHeight: 1.5 }}>
                        {risk.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture */}
          {archVisible > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.65)', marginBottom: 8 }}>
                Architecture
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {DEMO_ARCH.slice(0, archVisible).map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                    background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.14)',
                    borderRadius: 8, animation: 'fadeInUp 0.3s ease both',
                  }}>
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700, color: 'rgba(139,92,246,0.55)',
                      minWidth: 58, textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>{item.layer}</span>
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>
                      {item.pick}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution path */}
          {stepsVisible > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(52,211,153,0.65)', margin: 0 }}>
                  Execution Path
                </p>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 600, color: 'rgba(139,92,246,0.7)',
                  background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                  padding: '2px 9px', borderRadius: 9999,
                }}>
                  {stepsVisible} / {DEMO_STEPS.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {DEMO_STEPS.slice(0, stepsVisible).map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8, animation: 'fadeInUp 0.3s ease both',
                  }}>
                    <span style={{
                      width: 21, height: 21, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${step.color}18`, border: `1px solid ${step.color}44`,
                      fontSize: '0.6rem', fontWeight: 800, color: step.color,
                    }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.57rem', fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: step.color, marginRight: 7,
                      }}>{step.phase}</span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)' }}>
                        {step.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "done" && (
            <button
              onClick={restart}
              style={{
                marginTop: 16, width: '100%', padding: '10px', borderRadius: 10,
                background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)',
                color: 'rgba(167,139,250,0.65)', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.18s ease',
              }}
            >
              ↺ Replay
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   Pricing card
────────────────────────────────────────────────────────────── */
function PricingCard({ tier }: { tier: typeof pricingTiers[0] }) {
  return (
    <div style={{
      background: tier.highlight ? 'rgba(124,58,237,0.09)' : 'rgba(255,255,255,0.025)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: tier.highlight ? '1px solid rgba(139,92,246,0.38)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: '28px 26px',
      position: 'relative', overflow: 'hidden',
      boxShadow: tier.highlight ? '0 0 48px rgba(139,92,246,0.12)' : 'none',
      display: 'flex', flexDirection: 'column',
    }}>
      {tier.highlight && (
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '65%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.75), transparent)',
        }} />
      )}
      {tier.comingSoon && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.3)', padding: '3px 9px', borderRadius: 9999,
        }}>Soon</div>
      )}
      {!tier.comingSoon && tier.badge && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.38)',
          color: '#c4b5fd', padding: '3px 9px', borderRadius: 9999,
        }}>{tier.badge}</div>
      )}
      <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: tier.highlight ? 'rgba(167,139,250,0.75)' : 'rgba(255,255,255,0.38)', margin: '0 0 10px' }}>
        {tier.name}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.03em' }}>{tier.price}</span>
        {tier.period && <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.32)', fontWeight: 500 }}>{tier.period}</span>}
      </div>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.32)', marginBottom: 24, lineHeight: 1.5 }}>{tier.description}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        {tier.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: '0.82rem', color: 'rgba(255,255,255,0.58)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tier.highlight ? '#a78bfa' : 'rgba(255,255,255,0.35)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            {f}
          </li>
        ))}
      </ul>
      {tier.comingSoon ? (
        <div style={{
          display: 'block', textAlign: 'center', padding: '11px 20px', borderRadius: 11,
          fontWeight: 600, fontSize: '0.875rem',
          background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.18)', cursor: 'not-allowed',
        }}>
          Coming soon
        </div>
      ) : (
        <Link href={tier.ctaHref} style={{
          display: 'block', textAlign: 'center', textDecoration: 'none',
          padding: '11px 20px', borderRadius: 11, fontWeight: 600, fontSize: '0.875rem',
          background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
          border: '1px solid rgba(139,92,246,0.45)', color: 'white',
          boxShadow: '0 0 22px rgba(139,92,246,0.28)',
        }}>
          {tier.cta}
        </Link>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   FAQ accordion
────────────────────────────────────────────────────────────── */
function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
          FAQ
        </p>
        <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,1.9rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>
          Common questions
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} style={{
            background: open === i ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.022)',
            border: open === i ? '1px solid rgba(139,92,246,0.22)' : '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, overflow: 'hidden', transition: 'all 0.2s ease',
          }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 22px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', gap: 16,
              }}
            >
              <span style={{ fontSize: '0.925rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                {item.q}
              </span>
              <span style={{
                fontSize: '1rem', color: open === i ? '#a78bfa' : 'rgba(255,255,255,0.28)',
                flexShrink: 0, transition: 'transform 0.2s ease, color 0.2s ease',
                transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                display: 'inline-block',
              }}>+</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 22px 18px' }}>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, margin: 0 }}>
                  {item.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   Page
────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--vs-bg)', color: 'var(--vs-text)', position: 'relative', overflowX: 'hidden' }}>
      <StarField />

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      {/* Ambient orbs — restrained */}
      <div aria-hidden="true" style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'fixed', bottom: '10%', right: '-12%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, padding: '0 2rem',
        background: 'rgba(3,0,20,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: 'white',
              boxShadow: '0 0 16px rgba(139,92,246,0.45)',
            }}>A</div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.02em' }}>
              Axiom
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.42)', padding: '8px 14px', borderRadius: 8, textDecoration: 'none' }}>
              Log in
            </Link>
            <Link href="/signup" style={{
              fontSize: '0.875rem', padding: '9px 20px', borderRadius: 10,
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              border: '1px solid rgba(139,92,246,0.4)', color: 'white',
              textDecoration: 'none', fontWeight: 600,
              boxShadow: '0 0 18px rgba(139,92,246,0.28)',
            }}>
              Start free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '104px 2rem 84px' }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)',
          padding: '7px 18px', borderRadius: 9999, marginBottom: 36,
          fontSize: '0.78rem', color: 'rgba(196,181,253,0.75)', letterSpacing: '0.03em',
        }}>
          Product intelligence for builders
        </div>

        <h1 style={{
          fontSize: 'clamp(2.7rem,6vw,4.75rem)', fontWeight: 900,
          lineHeight: 1.07, marginBottom: 24, letterSpacing: '-0.03em',
          maxWidth: 840, marginLeft: 'auto', marginRight: 'auto',
          color: 'rgba(255,255,255,0.96)',
        }}>
          Find what&apos;s broken<br />
          <span style={{
            background: 'linear-gradient(135deg,#c4b5fd 0%,#a78bfa 55%,#818cf8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            before you ship it.
          </span>
        </h1>

        <p style={{
          fontSize: '1.05rem', color: 'rgba(255,255,255,0.4)', maxWidth: 510,
          margin: '0 auto 20px', lineHeight: 1.8,
        }}>
          Paste your idea, stack, or build description. Axiom reveals what&apos;s weak, what will fail, and exactly what to fix first.
        </p>

        <p style={{
          fontSize: '0.82rem', color: 'rgba(167,139,250,0.5)', margin: '0 auto 40px',
          fontWeight: 500, letterSpacing: '0.01em',
        }}>
          Join 500+ builders who shipped with clarity
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 76 }}>
          <Link href="/signup" style={{
            fontSize: '1rem', padding: '14px 34px', borderRadius: 12,
            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border: '1px solid rgba(139,92,246,0.45)', color: 'white',
            textDecoration: 'none', fontWeight: 600,
            boxShadow: '0 0 28px rgba(139,92,246,0.38)',
          }}>
            Analyze my build free →
          </Link>
          <Link href="/login" style={{
            fontSize: '1rem', padding: '14px 34px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none', fontWeight: 500,
          }}>
            Sign in
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: '30s',  label: 'Time to analysis' },
            { value: '7',    label: 'Risk dimensions scored' },
            { value: '10',   label: 'Sequenced build steps' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'rgba(196,181,253,0.82)' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.32)', marginTop: 4, fontWeight: 400 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marquee: audience ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 0 80px', overflow: 'hidden' }}>
        <p style={{
          textAlign: 'center', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.16)', textTransform: 'uppercase', marginBottom: 22,
        }}>
          Built for
        </p>
        <div style={{ position: 'relative' }}>
          <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, zIndex: 1, background: 'linear-gradient(90deg, #030014, transparent)', pointerEvents: 'none' }} />
          <div aria-hidden="true" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, zIndex: 1, background: 'linear-gradient(270deg, #030014, transparent)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 10, animation: 'marquee 28s linear infinite', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 9999, padding: '8px 18px',
                  fontSize: '0.78rem', color: 'rgba(255,255,255,0.32)', fontWeight: 500, flexShrink: 0,
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(167,139,250,0.45)', flexShrink: 0 }} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What Axiom gives you ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
            Outputs
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,1.9rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Four structured outputs. No fluff.
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.32)', maxWidth: 400, margin: '0 auto' }}>
            Every analysis returns the same four sections — specific to what you described.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {outputBlocks.map(block => (
            <div
              key={block.num}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '28px 26px',
                position: 'relative', overflow: 'hidden',
                transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-4px)'
                el.style.borderColor = block.accent.replace('0.55)', '0.28)')
                el.style.boxShadow = `0 20px 44px ${block.accentBg}`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.borderColor = 'rgba(255,255,255,0.07)'
                el.style.boxShadow = ''
              }}
            >
              <span aria-hidden="true" style={{
                position: 'absolute', top: 14, right: 18,
                fontSize: '2.8rem', fontWeight: 900, color: 'rgba(255,255,255,0.028)', lineHeight: 1,
              }}>{block.num}</span>

              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 18,
                background: block.accentBg,
                border: `1px solid ${block.accent.replace('0.55)', '0.25)')}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: block.accent.replace('0.55)', '0.9)'),
              }}>
                {block.icon}
              </div>

              <h3 style={{ fontWeight: 700, fontSize: '0.975rem', color: 'rgba(255,255,255,0.9)', marginBottom: 10, letterSpacing: '-0.01em' }}>
                {block.title}
              </h3>
              <p style={{ fontSize: '0.845rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.72, margin: 0 }}>
                {block.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
            How it works
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,1.9rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            From build to clarity in 3 steps
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.32)', maxWidth: 380, margin: '0 auto' }}>
            No setup. No templates. Paste and go.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {/* Connector */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 48, left: '20%', right: '20%', height: 1,
            background: 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(96,165,250,0.3), rgba(52,211,153,0.3))',
            pointerEvents: 'none',
          }} />

          {howItWorks.map(step => (
            <div key={step.num} style={{
              background: 'rgba(255,255,255,0.025)',
              border: `1px solid ${step.colorBorder}`,
              borderRadius: 20, padding: '28px 26px 26px',
              position: 'relative', textAlign: 'center',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: '0 auto 20px',
                background: step.colorBg,
                border: `1px solid ${step.colorBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: step.color,
                boxShadow: `0 0 20px ${step.colorBg}`,
              }}>
                {step.icon}
              </div>
              <div style={{
                fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em',
                color: `${step.color}80`, textTransform: 'uppercase', marginBottom: 10,
              }}>{step.num}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.9)', marginBottom: 10, letterSpacing: '-0.01em' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.845rem', color: 'rgba(255,255,255,0.36)', lineHeight: 1.7, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo ── */}
      <TypewriterDemo />

      {/* ── Why different ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
            Why Axiom
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,1.9rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Not ChatGPT. Not another AI wrapper.
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.32)', maxWidth: 420, margin: '0 auto' }}>
            Generic AI gives you options. Axiom gives you signal.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[
            {
              title: 'Structure, not generation',
              desc: "Axiom doesn't freeform generate text. It runs a pipeline: risk evaluation, stack selection, dimension scoring, step sequencing. The output is structured data derived from what you wrote — not a wall of suggestions.",
            },
            {
              title: 'Specific, not generic',
              desc: "Every output is tailored to your build. The stack picks match your constraints. The risks match your architecture. If your idea doesn't have a real problem, Axiom will tell you that too.",
            },
            {
              title: 'Built for builders who ship fast',
              desc: "Axiom is designed for people building with AI tools who can move quickly but need signal on what breaks. It's not a planning tool. It's a clarity layer — for the moment before you commit to a direction.",
            },
          ].map((p, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: '28px 26px',
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#a78bfa', marginBottom: 18,
                boxShadow: '0 0 10px rgba(167,139,250,0.65)',
              }} />
              <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'rgba(255,255,255,0.88)', marginBottom: 10, letterSpacing: '-0.01em' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '0.845rem', color: 'rgba(255,255,255,0.37)', lineHeight: 1.72, margin: 0 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
            From builders
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,1.9rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>
            What people are finding
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{
              background: 'rgba(255,255,255,0.028)',
              backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: '28px 26px',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3 }}>
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#a78bfa" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: '0.895rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: 0, flex: 1, fontStyle: 'italic' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: t.avatarBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.62rem', fontWeight: 800, color: 'white',
                }}>{t.avatar}</div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.88)', margin: 0 }}>
                    {t.name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
            Pricing
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,1.9rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Start free. Upgrade when you need it.
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.32)', margin: 0 }}>
            No trial limits on the Starter plan. Analyze 3 builds per month, forever.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {pricingTiers.map(tier => <PricingCard key={tier.name} tier={tier} />)}
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── Final CTA ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 120px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 680, margin: '0 auto',
          background: 'rgba(139,92,246,0.05)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(139,92,246,0.18)',
          borderRadius: 28, padding: '60px 48px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '60%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), transparent)',
          }} />

          <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 900, color: 'rgba(255,255,255,0.94)', letterSpacing: '-0.025em', margin: '0 0 16px' }}>
            Know what breaks before it does.
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.38)', margin: '0 0 36px', lineHeight: 1.7 }}>
            Paste your build. Get product truth in 30 seconds. Free to start.
          </p>
          <Link href="/signup" style={{
            display: 'inline-block',
            fontSize: '1rem', padding: '15px 38px', borderRadius: 12,
            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border: '1px solid rgba(139,92,246,0.5)', color: 'white',
            textDecoration: 'none', fontWeight: 600,
            boxShadow: '0 0 32px rgba(139,92,246,0.4)',
          }}>
            Analyze your build →
          </Link>
          <p style={{ marginTop: 18, fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}>
            No credit card required · 3 free analyses per month
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '48px 2rem',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Brand */}
          <div style={{ minWidth: 160 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: 'white',
              }}>A</div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.02em' }}>
                Axiom
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.22)', margin: 0, lineHeight: 1.65, maxWidth: 200 }}>
              Product intelligence for indie hackers and AI builders.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', margin: '0 0 14px' }}>
                Product
              </p>
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/templates', label: 'Templates' },
                { href: '/validate', label: 'Validate' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: '0.84rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', marginBottom: 9, transition: 'color 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)'}
                >{l.label}</Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', margin: '0 0 14px' }}>
                Legal
              </p>
              {[
                { href: '/privacy', label: 'Privacy' },
                { href: '/terms', label: 'Terms' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: '0.84rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', marginBottom: 9 }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '36px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.16)', margin: 0 }}>
            © {new Date().getFullYear()} Axiom. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
