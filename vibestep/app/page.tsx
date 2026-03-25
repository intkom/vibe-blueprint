'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { SocialProofTicker } from '@/components/social-proof-ticker'
import { ExitIntentPopup } from '@/components/exit-intent-popup'
import { useTranslations } from 'next-intl'
import { useLocale, LANGUAGES, type Locale } from '@/lib/i18n-provider'

/* ─────────────────────────────────────────────────────────────
   Star field
───────────────────────────────────────────────────────────── */
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
  return <div ref={ref} aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

/* ─────────────────────────────────────────────────────────────
   Demo data
───────────────────────────────────────────────────────────── */
const DEMO_IDEA = "A habit tracker for athletes — streak logic, Apple Health sync, and a social leaderboard. Solo dev, 6-week timeline."
const DEMO_SCORE = 74
const DEMO_SCORE_LABEL = "Good"

const DEMO_RISKS = [
  { label: "Real-time leaderboard architecture", detail: "Adding live updates in v1 will double your timeline. Use polling first, upgrade later.", severity: "High", color: "#f87171" },
  { label: "Apple HealthKit rate limits", detail: "HealthKit throttles background sync. Design your sync cadence before building the UI.", severity: "Medium", color: "#fbbf24" },
  { label: "Social features without moderation", detail: "A public leaderboard without abuse prevention will ship a bug, not a feature.", severity: "Low", color: "#60a5fa" },
]

const DEMO_STEPS = [
  { phase: "Discover", title: "Map athlete pain points & competitor gaps", color: "#60a5fa" },
  { phase: "Define",   title: "Spec streak logic + HealthKit sync cadence", color: "#fbbf24" },
  { phase: "Build",    title: "Scaffold Expo + Supabase auth + schema", color: "#a78bfa" },
  { phase: "Build",    title: "Build workout logging with streak calculation", color: "#a78bfa" },
  { phase: "Build",    title: "Integrate Apple HealthKit — polling, not realtime", color: "#a78bfa" },
  { phase: "Build",    title: "Leaderboard with static refresh (no websockets)", color: "#a78bfa" },
  { phase: "Build",    title: "Notifications & streak reminders", color: "#a78bfa" },
  { phase: "Test",     title: "Beta with 10 athletes — collect streak feedback", color: "#34d399" },
  { phase: "Launch",   title: "App Store submission + landing page", color: "#34d399" },
  { phase: "Iterate",  title: "Add realtime leaderboard after v1 traction", color: "#ec4899" },
]

/* ─────────────────────────────────────────────────────────────
   Animated health gauge (used in demo)
───────────────────────────────────────────────────────────── */
function HealthRing({ score, label }: { score: number; label: string }) {
  const R = 28
  const circ = 2 * Math.PI * R
  const color = score >= 76 ? "#34d399" : score >= 61 ? "#60a5fa" : score >= 41 ? "#fbbf24" : "#fb923c"
  const offset = circ - (score / 100) * circ
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
        <svg viewBox="0 0 72 72" style={{ width: 72, height: 72, display: "block", transform: "rotate(-90deg)" }}>
          <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle cx="36" cy="36" r={R} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "1rem", fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        </div>
      </div>
      <div>
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: `${color}80`, margin: "0 0 2px" }}>
          Build Health
        </p>
        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", margin: "0 0 1px" }}>
          {label}
        </p>
        <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>
          {DEMO_RISKS.length} risks · {DEMO_STEPS.length} steps
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Demo section
───────────────────────────────────────────────────────────── */
type DemoPhase = "typing" | "scoring" | "risks" | "steps" | "done"

function LiveDemo() {
  const [typed, setTyped] = useState("")
  const [score, setScore] = useState(0)
  const [risksVisible, setRisksVisible] = useState(0)
  const [stepsVisible, setStepsVisible] = useState(0)
  const [phase, setPhase] = useState<DemoPhase>("typing")

  // Typing phase
  useEffect(() => {
    if (phase !== "typing") return
    if (typed.length < DEMO_IDEA.length) {
      const t = setTimeout(() => setTyped(DEMO_IDEA.slice(0, typed.length + 1)), 22)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setPhase("scoring"), 700)
      return () => clearTimeout(t)
    }
  }, [typed, phase])

  // Score count-up
  useEffect(() => {
    if (phase !== "scoring") return
    let val = 0
    const interval = setInterval(() => {
      val = Math.min(val + 2, DEMO_SCORE)
      setScore(val)
      if (val >= DEMO_SCORE) {
        clearInterval(interval)
        setTimeout(() => setPhase("risks"), 700)
      }
    }, 28)
    return () => clearInterval(interval)
  }, [phase])

  // Risks
  useEffect(() => {
    if (phase !== "risks") return
    if (risksVisible < DEMO_RISKS.length) {
      const t = setTimeout(() => setRisksVisible(n => n + 1), 420)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setPhase("steps"), 600)
      return () => clearTimeout(t)
    }
  }, [phase, risksVisible])

  // Steps
  useEffect(() => {
    if (phase !== "steps") return
    if (stepsVisible < DEMO_STEPS.length) {
      const t = setTimeout(() => setStepsVisible(n => n + 1), 240)
      return () => clearTimeout(t)
    } else {
      setPhase("done")
    }
  }, [phase, stepsVisible])

  function restart() {
    setTyped(""); setScore(0); setRisksVisible(0); setStepsVisible(0); setPhase("typing")
  }

  return (
    <section id="demo" style={{ position: 'relative', zIndex: 10, padding: '0 2rem 96px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
          Live demo
        </p>
        <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.025em', margin: '0 0 12px' }}>
          This is what you get in 30 seconds
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          Real output. No templates. Specific to what you described.
        </p>
      </div>

      <div style={{
        background: 'rgba(8,4,26,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(139,92,246,0.22)', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.08)',
      }}>
        {/* Browser chrome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          {['#f87171','#fbbf24','#34d399'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.65 }} />
          ))}
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginLeft: 8 }}>axiom.build/analyze</span>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Input */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>
              What you&apos;re building
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.32)',
              borderRadius: 12, padding: '12px 14px', minHeight: 60,
              fontSize: '0.875rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65,
            }}>
              {typed}
              {phase === "typing" && (
                <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#a78bfa', marginLeft: 2, verticalAlign: 'text-bottom', animation: 'pulseGlow 0.8s ease-in-out infinite' }} />
              )}
            </div>
          </div>

          {/* Score ring */}
          {score > 0 && (
            <div style={{
              marginBottom: 16, padding: '14px 16px',
              background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.15)',
              borderRadius: 14, animation: 'fadeInUp 0.35s ease both',
            }}>
              <HealthRing score={score} label={score >= DEMO_SCORE ? DEMO_SCORE_LABEL : "Scoring…"} />
            </div>
          )}

          {/* Risks */}
          {risksVisible > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(248,113,113,0.65)', marginBottom: 8 }}>
                ⚠ Risk Detection
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DEMO_RISKS.slice(0, risksVisible).map((risk, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, padding: '10px 13px',
                    background: 'rgba(248,113,113,0.04)', border: `1px solid ${risk.color}28`,
                    borderRadius: 10, animation: 'fadeInUp 0.3s ease both',
                  }}>
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.05em',
                      color: risk.color, flexShrink: 0, marginTop: 3,
                      background: `${risk.color}18`, border: `1px solid ${risk.color}40`,
                      padding: '2px 6px', borderRadius: 4, height: 'fit-content',
                    }}>{risk.severity}</span>
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.82)', margin: '0 0 3px' }}>{risk.label}</p>
                      <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>{risk.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {stepsVisible > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(52,211,153,0.65)', margin: 0 }}>
                  Execution Path
                </p>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(139,92,246,0.7)', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', padding: '2px 9px', borderRadius: 9999 }}>
                  {stepsVisible} / {DEMO_STEPS.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {DEMO_STEPS.slice(0, stepsVisible).map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)',
                    borderRadius: 8, animation: 'fadeInUp 0.28s ease both',
                  }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${step.color}18`, border: `1px solid ${step.color}44`,
                      fontSize: '0.58rem', fontWeight: 800, color: step.color,
                    }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.57rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: step.color, marginRight: 6 }}>{step.phase}</span>
                      <span style={{ fontSize: '0.79rem', color: 'rgba(255,255,255,0.7)' }}>{step.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {phase === "done" && (
            <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href="/signup" style={{
                flex: 1, display: 'block', textAlign: 'center', textDecoration: 'none',
                padding: '11px 20px', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem',
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                border: '1px solid rgba(139,92,246,0.45)', color: 'white',
                boxShadow: '0 0 24px rgba(139,92,246,0.3)',
              }}>
                Get your real analysis →
              </Link>
              <button
                onClick={restart}
                style={{
                  padding: '11px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                ↺ Replay
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Trust logos
───────────────────────────────────────────────────────────── */
function TrustLogos() {
  const logos = [
    {
      name: "Anthropic",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-3.654 0H6.57L0 20h3.603l1.357-3.405h6.712L13.03 20h3.603L10.173 3.52zm-3.604 9.944 2.25-5.65 2.25 5.65H6.569z"/>
        </svg>
      ),
    },
    {
      name: "Supabase",
      icon: (
        <svg width="18" height="20" viewBox="0 0 109 113" fill="none">
          <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874l-43.151 54.347z" fill="url(#a)"/>
          <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874l-43.151 54.347z" fill="url(#b)" fillOpacity="0.2"/>
          <path d="M45.317 2.071C48.178-1.53 53.976.443 54.045 5.041l.796 67.251H9.957C1.766 72.292-2.802 62.83 2.292 56.418l43.025-54.347z" fill="#3ECF8E"/>
          <defs>
            <linearGradient id="a" x1="53.974" y1="40.063" x2="94.163" y2="71.72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#249361"/>
              <stop offset="1" stopColor="#3ECF8E"/>
            </linearGradient>
            <linearGradient id="b" x1="36.156" y1="30.578" x2="54.484" y2="65.081" gradientUnits="userSpaceOnUse">
              <stop/><stop offset="1" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      name: "Vercel",
      icon: (
        <svg width="18" height="16" viewBox="0 0 512 512" fill="currentColor">
          <path d="M256 48 496 464H16L256 48z"/>
        </svg>
      ),
    },
    {
      name: "Next.js",
      icon: (
        <svg width="20" height="20" viewBox="0 0 128 128" fill="currentColor">
          <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64c11.2 0 21.7-2.9 30.8-7.9L48.4 55.3v36.6h-6.8V41.8h6.8l50.5 75.8C116.4 106.2 128 86.5 128 64c0-35.3-28.7-64-64-64zm-3.6 26.5h7.4v51.4l-7.4-11V26.5z"/>
        </svg>
      ),
    },
  ]

  return (
    <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 80px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', marginBottom: 24 }}>
          Built on
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {logos.map(logo => (
            <div
              key={logo.name}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: '10px 18px',
                color: 'rgba(255,255,255,0.5)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.background = 'rgba(255,255,255,0.05)'
                el.style.borderColor = 'rgba(255,255,255,0.12)'
                el.style.color = 'rgba(255,255,255,0.82)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.background = 'rgba(255,255,255,0.025)'
                el.style.borderColor = 'rgba(255,255,255,0.07)'
                el.style.color = 'rgba(255,255,255,0.5)'
              }}
            >
              {logo.icon}
              <span style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '-0.01em' }}>{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Features grid
───────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: "Health Score",
    desc: "0–100 product health scored across 7 dimensions. See exactly where you're strong and where you'll break.",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.07)",
    border: "rgba(96,165,250,0.18)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <path d="M12 9v4M12 17h.01"/>
      </svg>
    ),
    title: "Risk Detection",
    desc: "Named, prioritized risks with severity and the architectural decision behind each one — before you write a line.",
    color: "#f87171",
    bg: "rgba(248,113,113,0.07)",
    border: "rgba(248,113,113,0.18)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
      </svg>
    ),
    title: "Execution Path",
    desc: "10 sequenced build steps, each 2–4 hours of focused work, ordered for how software is actually built.",
    color: "#34d399",
    bg: "rgba(52,211,153,0.07)",
    border: "rgba(52,211,153,0.18)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "AI Chat",
    desc: "Ask anything about your analysis. Your AI co-founder who has read every line of your build.",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.07)",
    border: "rgba(167,139,250,0.18)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: "Code Generator",
    desc: "One click to get production-ready starter code for any execution step, with your stack baked in.",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.07)",
    border: "rgba(251,191,36,0.18)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    title: "Build Journal",
    desc: "Log your progress, mood, and wins. Know how your build actually feels to ship — not just what's done.",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.07)",
    border: "rgba(236,72,153,0.18)",
  },
]

function FeaturesGrid() {
  return (
    <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1060, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
          Everything you need
        </p>
        <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.025em', margin: '0 0 12px' }}>
          Six tools. One analysis.
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.32)', maxWidth: 400, margin: '0 auto' }}>
          Everything you need to go from idea to shipping, without the guesswork.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 14 }}>
        {FEATURES.map(f => (
          <div
            key={f.title}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: '24px 22px',
              transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = 'translateY(-3px)'
              el.style.borderColor = f.border
              el.style.boxShadow = `0 16px 40px ${f.bg}`
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = 'translateY(0)'
              el.style.borderColor = 'rgba(255,255,255,0.07)'
              el.style.boxShadow = ''
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 11, marginBottom: 16,
              background: f.bg, border: `1px solid ${f.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: f.color,
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '0.975rem', color: 'rgba(255,255,255,0.9)', marginBottom: 8, letterSpacing: '-0.01em' }}>
              {f.title}
            </h3>
            <p style={{ fontSize: '0.845rem', color: 'rgba(255,255,255,0.36)', lineHeight: 1.7, margin: 0 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Static data
───────────────────────────────────────────────────────────── */
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
      'AI Chat workspace',
      'Code generator',
      'Export to Markdown',
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
    a: "Each analysis gives you: a Build Health Score (0–100 across 7 dimensions), Risk Detection (named risks with severity and fixes), Architecture Clarity (one concrete tech pick per layer), and an Execution Path (10 sequenced steps, each 2–4 hours of focused work).",
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

/* ─────────────────────────────────────────────────────────────
   Pricing card
───────────────────────────────────────────────────────────── */
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
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '65%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.75), transparent)' }} />
      )}
      {tier.comingSoon && (
        <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', padding: '3px 9px', borderRadius: 9999 }}>Soon</div>
      )}
      {!tier.comingSoon && tier.badge && (
        <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.38)', color: '#c4b5fd', padding: '3px 9px', borderRadius: 9999 }}>{tier.badge}</div>
      )}
      <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: tier.highlight ? 'rgba(167,139,250,0.75)' : 'rgba(255,255,255,0.38)', margin: '0 0 10px' }}>{tier.name}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.03em' }}>{tier.price}</span>
        {tier.period && <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.32)', fontWeight: 500 }}>{tier.period}</span>}
      </div>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.32)', marginBottom: 24, lineHeight: 1.5 }}>{tier.description}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        {tier.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: '0.82rem', color: 'rgba(255,255,255,0.58)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tier.highlight ? '#a78bfa' : 'rgba(255,255,255,0.35)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6 9 17l-5-5"/></svg>
            {f}
          </li>
        ))}
      </ul>
      {tier.comingSoon ? (
        <div style={{ display: 'block', textAlign: 'center', padding: '11px 20px', borderRadius: 11, fontWeight: 600, fontSize: '0.875rem', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.18)', cursor: 'not-allowed' }}>
          Coming soon
        </div>
      ) : (
        <Link href={tier.ctaHref} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '11px 20px', borderRadius: 11, fontWeight: 600, fontSize: '0.875rem', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: '1px solid rgba(139,92,246,0.45)', color: 'white', boxShadow: '0 0 22px rgba(139,92,246,0.28)' }}>
          {tier.cta}
        </Link>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   FAQ
───────────────────────────────────────────────────────────── */
function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="faq" style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>FAQ</p>
        <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,1.9rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>Common questions</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} style={{ background: open === i ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.022)', border: open === i ? '1px solid rgba(139,92,246,0.22)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', transition: 'all 0.2s ease' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
              <span style={{ fontSize: '0.925rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{item.q}</span>
              <span style={{ fontSize: '1rem', color: open === i ? '#a78bfa' : 'rgba(255,255,255,0.28)', flexShrink: 0, transition: 'transform 0.2s ease, color 0.2s ease', transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}>+</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 22px 18px' }}>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, margin: 0 }}>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
const CYCLE_WORDS = ["your SaaS", "your mobile app", "your API", "your AI tool"]

export default function Home() {
  const tLanding = useTranslations('landing')
  const tAuth    = useTranslations('auth')
  const { locale, setLocale } = useLocale()
  const [cycleIdx, setCycleIdx] = useState(0)
  const [cycleVisible, setCycleVisible] = useState(true)
  const [langOpen, setLangOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setCycleVisible(false)
      setTimeout(() => {
        setCycleIdx(i => (i + 1) % CYCLE_WORDS.length)
        setCycleVisible(true)
      }, 320)
    }, 2600)
    return () => clearInterval(t)
  }, [])

  // Close lang dropdown on outside click
  useEffect(() => {
    if (!langOpen) return
    const fn = () => setLangOpen(false)
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [langOpen])

  return (
    <main style={{ minHeight: '100vh', background: 'var(--vs-bg)', color: 'var(--vs-text)', position: 'relative', overflowX: 'hidden' }}>
      <ExitIntentPopup />
      <StarField />

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes cycleSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .lp-hero-h1 { font-size: 2.4rem !important; }
          .lp-cta-row { flex-direction: column !important; align-items: stretch !important; }
          .lp-stats-row { gap: 32px !important; }
          .lp-trust-row { gap: 6px !important; }
          .lp-features-grid { grid-template-columns: 1fr !important; }
          .lp-testimonials { grid-template-columns: 1fr !important; }
          .lp-pricing { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Ambient orbs */}
      <div aria-hidden="true" style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'fixed', bottom: '10%', right: '-12%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 2rem', background: 'rgba(3,0,20,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', boxShadow: '0 0 16px rgba(139,92,246,0.45)' }}>A</div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.02em' }}>Axiom</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
            <a href="#demo" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.14s' }} onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.72)' }} onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)' }}>Demo</a>
            <a href="#pricing" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.14s' }} onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.72)' }} onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)' }}>Pricing</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Globe language switcher */}
            <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLangOpen(o => !o)}
                aria-label="Switch language"
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, cursor: 'pointer', padding: '7px 9px',
                  color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1,
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.14s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                🌐 <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{locale}</span>
              </button>
              {langOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 192, background: 'rgba(6,3,22,0.98)',
                  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.8)', zIndex: 200, padding: 6,
                }}>
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} type="button"
                      onClick={() => { setLocale(lang.code as Locale); setLangOpen(false) }}
                      style={{
                        width: '100%', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', borderRadius: 8, border: 'none',
                        background: locale === lang.code ? 'rgba(139,92,246,0.12)' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (locale !== lang.code) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={e => { if (locale !== lang.code) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: 'block', fontSize: '0.83rem', fontWeight: locale === lang.code ? 600 : 400, color: locale === lang.code ? '#a78bfa' : 'rgba(255,255,255,0.7)' }}>{lang.native}</span>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)' }}>{lang.label}</span>
                      </span>
                      {locale === lang.code && <span style={{ color: '#a78bfa', fontSize: '0.8rem' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/login" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.42)', padding: '8px 14px', borderRadius: 8, textDecoration: 'none', transition: 'color 0.14s' }}>{tAuth('logIn')}</Link>
            <Link href="/signup" style={{ fontSize: '0.875rem', padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: '1px solid rgba(139,92,246,0.4)', color: 'white', textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 18px rgba(139,92,246,0.28)', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 28px rgba(139,92,246,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 18px rgba(139,92,246,0.28)' }}
            >
              {tAuth('signUpFree')} →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '108px 2rem 80px' }}>
        {/* Eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)', padding: '7px 18px', borderRadius: 9999, marginBottom: 36, fontSize: '0.78rem', color: 'rgba(196,181,253,0.75)', letterSpacing: '0.03em' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', animation: 'pulseScale 2s ease-in-out infinite', display: 'inline-block' }} />
          Product intelligence for builders
        </div>

        <h1
          className="lp-hero-h1"
          style={{ fontSize: 'clamp(2.7rem,6vw,4.6rem)', fontWeight: 900, lineHeight: 1.07, marginBottom: 20, letterSpacing: '-0.03em', maxWidth: 820, marginLeft: 'auto', marginRight: 'auto', color: 'rgba(255,255,255,0.96)' }}
        >
          {locale === 'en' ? (
            <>
              Understand{' '}
              <span style={{
                background: 'linear-gradient(135deg,#c4b5fd 0%,#a78bfa 55%,#818cf8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                <span
                  key={cycleIdx}
                  style={{
                    display: 'inline-block',
                    opacity: cycleVisible ? 1 : 0,
                    transform: cycleVisible ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                  }}
                >
                  {CYCLE_WORDS[cycleIdx]}
                </span>
              </span>
              <br />before it breaks
            </>
          ) : (
            <span style={{
              background: 'linear-gradient(135deg,#c4b5fd 0%,#a78bfa 55%,#818cf8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {tLanding('headline')}
            </span>
          )}
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto 18px', lineHeight: 1.78 }}>
          {tLanding('subline')}
        </p>
        <p style={{ fontSize: '0.82rem', color: 'rgba(167,139,250,0.5)', margin: '0 auto 24px', fontWeight: 500 }}>
          Join 500+ builders who shipped with clarity
        </p>

        <div style={{ marginBottom: 36 }}>
          <SocialProofTicker />
        </div>

        <div className="lp-cta-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 80 }}>
          <Link href="/signup" style={{
            fontSize: '1rem', padding: '14px 34px', borderRadius: 12,
            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border: '1px solid rgba(139,92,246,0.45)', color: 'white',
            textDecoration: 'none', fontWeight: 600,
            boxShadow: '0 0 32px rgba(139,92,246,0.4)', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 0 48px rgba(139,92,246,0.6)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 0 32px rgba(139,92,246,0.4)' }}
          >
            {tLanding('cta')}
          </Link>
          <a href="#demo" style={{
            fontSize: '1rem', padding: '14px 34px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)',
            textDecoration: 'none', fontWeight: 500, transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,255,255,0.06)'; el.style.color = 'rgba(255,255,255,0.78)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.color = 'rgba(255,255,255,0.55)' }}
          >
            {tLanding('howItWorks')} →
          </a>
        </div>

        {/* Stats */}
        <div className="lp-stats-row" style={{ display: 'flex', gap: 60, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: '30s',  label: 'Time to analysis' },
            { value: '7',    label: 'Risk dimensions' },
            { value: '10',   label: 'Build steps' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'rgba(196,181,253,0.82)' }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust logos ── */}
      <TrustLogos />

      {/* ── Live demo ── */}
      <LiveDemo />

      {/* ── Features grid ── */}
      <FeaturesGrid />

      {/* ── Testimonials ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>From builders</p>
          <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,1.9rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>What people are finding</h2>
        </div>
        <div className="lp-testimonials" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ background: 'rgba(255,255,255,0.028)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 20, transition: 'transform 0.2s ease, border-color 0.2s ease' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-2px)'; el.style.borderColor = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              <div style={{ display: 'flex', gap: 3 }}>
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#a78bfa" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <p style={{ fontSize: '0.895rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: 0, flex: 1, fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: t.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800, color: 'white' }}>{t.avatar}</div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.88)', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 680, margin: '0 auto',
          background: 'rgba(139,92,246,0.06)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(139,92,246,0.22)',
          borderRadius: 28, padding: '64px 48px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 0 80px rgba(139,92,246,0.18), 0 32px 64px rgba(0,0,0,0.4)',
        }}>
          <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)' }} />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, margin: '0 auto 24px', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white', boxShadow: '0 0 32px rgba(139,92,246,0.5)' }}>A</div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.1rem)', fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.025em', margin: '0 0 12px' }}>
              Your next build deserves clarity
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.38)', margin: '0 0 36px', lineHeight: 1.7 }}>
              Start free. No credit card. Your first analysis in 30 seconds.
            </p>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: '1rem', padding: '14px 40px', borderRadius: 13,
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              border: '1px solid rgba(139,92,246,0.5)', color: 'white',
              textDecoration: 'none', fontWeight: 700,
              boxShadow: '0 0 40px rgba(139,92,246,0.5)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 0 60px rgba(139,92,246,0.7)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 0 40px rgba(139,92,246,0.5)' }}
            >
              Analyze my build free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ position: 'relative', zIndex: 10, padding: '0 2rem 100px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,1.9rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', margin: '0 0 12px' }}>Start free. Upgrade when you need it.</h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.32)', margin: 0 }}>No trial limits on the Starter plan. Analyze 3 builds per month, forever.</p>
        </div>
        {/* Urgency badge */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.75rem', fontWeight: 700,
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
            color: 'rgba(251,191,36,0.85)', padding: '6px 14px', borderRadius: 9999,
          }}>
            🔥 47 builders upgraded to Pro this week
          </span>
        </div>
        <div className="lp-pricing" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {pricingTiers.map(tier => <PricingCard key={tier.name} tier={tier} />)}
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── Footer ── */}
      <SiteFooter />
    </main>
  )
}
