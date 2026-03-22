'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────────────────────────
   Star field
───────────────────────────────────────────────────────────────── */
function StarField() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stars: HTMLDivElement[] = []
    for (let i = 0; i < 200; i++) {
      const s = document.createElement('div')
      const size   = Math.random() * 2.4 + 0.3
      const bright = Math.random()
      const violet = bright > 0.82
      s.style.cssText = [
        'position:absolute', 'border-radius:50%',
        `width:${size}px`, `height:${size}px`,
        `left:${(Math.random() * 100).toFixed(2)}%`,
        `top:${(Math.random() * 100).toFixed(2)}%`,
        `background:${violet ? `rgba(167,139,250,${(bright * 0.9).toFixed(2)})` : 'white'}`,
        `opacity:${(bright * 0.65 + 0.12).toFixed(2)}`,
        `animation:twinkle ${(Math.random() * 4 + 2).toFixed(1)}s ease-in-out ${(Math.random() * 7).toFixed(1)}s infinite`,
        violet ? `box-shadow:0 0 ${(size * 2.5).toFixed(1)}px rgba(167,139,250,0.85)` : '',
      ].join(';')
      el.appendChild(s)
      stars.push(s)
    }
    return () => stars.forEach(s => s.remove())
  }, [])
  return <div ref={ref} aria-hidden="true" style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }} />
}

/* ─────────────────────────────────────────────────────────────────
   SVG Icons (Heroicons-style, 24px stroke)
───────────────────────────────────────────────────────────────── */
function IconLightbulb({ color = 'currentColor' }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 5.196 11.785C16.4 15 16 16 16 17H8c0-1-.4-2-1.196-3.215A7 7 0 0 1 12 2z"/>
    </svg>
  )
}
function IconSparkles({ color = 'currentColor' }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
      <path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/>
    </svg>
  )
}
function IconRocket({ color = 'currentColor' }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  )
}
function IconStar({ filled = false }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#fbbf24' : 'none'} stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}
function IconQuote() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(139,92,246,0.4)" aria-hidden="true">
      <path d="M11.3 6c-2.4 1.3-4 3.2-4.7 5.7.4-.2.8-.3 1.3-.3 1.7 0 3.1 1.4 3.1 3.1S9.3 17.6 7.6 17.6C5.5 17.6 4 16 4 13.5c0-3.8 2.2-6.9 6.5-9.2L11.3 6zm8.3 0c-2.4 1.3-4 3.2-4.7 5.7.4-.2.8-.3 1.3-.3 1.7 0 3.1 1.4 3.1 3.1s-1.4 3.1-3.1 3.1c-2.1 0-3.6-1.6-3.6-4.1 0-3.8 2.2-6.9 6.5-9.2L19.6 6z"/>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────── */
const features = [
  {
    Icon: IconLightbulb,
    num: '01',
    title: 'Describe your idea',
    desc: 'Type your vision in plain English. No structure, no templates — raw thoughts become structured plans.',
    iconColor: '#a78bfa',
    glowColor: 'rgba(139,92,246,0.55)',
    shadowColor: 'rgba(139,92,246,0.18)',
    borderColor: 'rgba(139,92,246,0.6)',
    bgHover: 'rgba(139,92,246,0.07)',
  },
  {
    Icon: IconSparkles,
    num: '02',
    title: 'AI breaks it down',
    desc: 'Claude generates exactly 10 atomic, sequenced build steps tailored to your stack and goals.',
    iconColor: '#f472b6',
    glowColor: 'rgba(244,114,182,0.55)',
    shadowColor: 'rgba(236,72,153,0.18)',
    borderColor: 'rgba(236,72,153,0.6)',
    bgHover: 'rgba(236,72,153,0.06)',
  },
  {
    Icon: IconRocket,
    num: '03',
    title: 'Ship step by step',
    desc: 'Complete each step before advancing. Stay focused, build momentum, ship with confidence.',
    iconColor: '#60a5fa',
    glowColor: 'rgba(96,165,250,0.55)',
    shadowColor: 'rgba(96,165,250,0.18)',
    borderColor: 'rgba(96,165,250,0.6)',
    bgHover: 'rgba(96,165,250,0.06)',
  },
]

const testimonials = [
  {
    quote: "I had this SaaS idea for 6 months but never started. VibeStep turned it into 10 concrete steps in 20 seconds. I shipped the MVP in a week.",
    name: 'Marcus Williams',
    role: 'Indie Founder',
    avatar: 'MW',
    avatarBg: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
  },
  {
    quote: "We use VibeStep for every new feature. The atomic step format prevents scope creep and keeps the whole team aligned on what's actually happening.",
    name: 'Priya Patel',
    role: 'Product Manager at Vercel',
    avatar: 'PP',
    avatarBg: 'linear-gradient(135deg, #ec4899, #be185d)',
  },
  {
    quote: "Finally a tool that speaks to how developers actually think. No fluff, no Gantt charts — just clear steps that map to real code and real commits.",
    name: 'Sarah Chen',
    role: 'Senior Engineer at Linear',
    avatar: 'SC',
    avatarBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  },
]

/* ─────────────────────────────────────────────────────────────────
   Animated gradient title span
───────────────────────────────────────────────────────────────── */
function AnimatedGradientText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: 'linear-gradient(90deg, #a78bfa, #ec4899, #60a5fa, #a78bfa)',
      backgroundSize: '300% 100%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'gradientShift 5s ease infinite',
      display: 'inline',
    }}>
      {children}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Navbar
───────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      padding: '0 2rem',
      background: scrolled ? 'rgba(3,0,20,0.88)' : 'rgba(3,0,20,0.5)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      transition: 'background 0.35s ease, border-color 0.35s ease',
    }}>
      <div style={{ maxWidth: 1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height: 64 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <div style={{
            width:34, height:34, borderRadius:10,
            background:'linear-gradient(135deg,#7c3aed,#5b21b6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:15, fontWeight:800, color:'white',
            boxShadow:'0 0 18px rgba(139,92,246,0.55)',
            flexShrink:0,
          }}>V</div>
          <span style={{
            fontSize:'1.15rem', fontWeight:800,
            background:'linear-gradient(135deg,#c4b5fd,#a78bfa)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>VibeStep</span>
        </div>
        {/* Links */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <NavLink href="#how-it-works">How it works</NavLink>
          <NavLink href="#testimonials">Testimonials</NavLink>
          <div style={{ width:1, height:18, background:'rgba(255,255,255,0.1)', margin:'0 6px' }} />
          <NavLink href="/login">Log in</NavLink>
          <Link href="/login" style={{
            display:'inline-block',
            background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border:'1px solid rgba(139,92,246,0.45)',
            color:'white', padding:'8px 18px', borderRadius:10,
            fontSize:'0.85rem', fontWeight:600, textDecoration:'none',
            transition:'all 0.22s ease', marginLeft:4,
            boxShadow:'0 0 20px rgba(139,92,246,0.2)',
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.boxShadow = '0 0 28px rgba(139,92,246,0.55)'
              el.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.boxShadow = '0 0 20px rgba(139,92,246,0.2)'
              el.style.transform = 'translateY(0)'
            }}
          >
            Get started →
          </Link>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{
      fontSize:'0.85rem', color:'rgba(255,255,255,0.45)',
      padding:'8px 12px', borderRadius:8, textDecoration:'none',
      transition:'color 0.18s ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
    >{children}</a>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Feature card
───────────────────────────────────────────────────────────────── */
function FeatureCard({ f, index }: { f: typeof features[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? f.bgHover : 'rgba(255,255,255,0.03)',
        backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
        border: `1px solid ${hovered ? f.borderColor : 'rgba(255,255,255,0.07)'}`,
        borderRadius:20, padding:'32px 28px',
        position:'relative', overflow:'hidden', cursor:'default',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 0 0 1px ${f.borderColor}, 0 20px 50px ${f.shadowColor}, 0 0 40px ${f.shadowColor}`
          : '0 0 0 0 transparent',
        transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
      }}
    >
      {/* Top glow beam on hover */}
      {hovered && (
        <div aria-hidden="true" style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          width:'60%', height:1,
          background:`linear-gradient(90deg, transparent, ${f.borderColor}, transparent)`,
        }} />
      )}

      {/* Watermark */}
      <span aria-hidden="true" style={{
        position:'absolute', top:14, right:18,
        fontSize:'3.8rem', fontWeight:900, lineHeight:1,
        color: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        userSelect:'none', transition:'color 0.3s ease',
        fontVariantNumeric:'tabular-nums',
      }}>{f.num}</span>

      {/* Icon container */}
      <div style={{
        width:52, height:52, borderRadius:14, marginBottom:22,
        background: hovered ? `${f.bgHover}` : 'rgba(255,255,255,0.04)',
        border:`1px solid ${hovered ? f.borderColor : 'rgba(255,255,255,0.08)'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow: hovered ? `0 0 24px ${f.glowColor}` : 'none',
        transition:'all 0.3s ease',
      }}>
        <f.Icon color={f.iconColor} />
      </div>

      <h3 style={{ fontWeight:700, fontSize:'1.05rem', color:'rgba(255,255,255,0.92)', marginBottom:10, letterSpacing:'-0.01em' }}>
        {f.title}
      </h3>
      <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.4)', lineHeight:1.72, margin:0 }}>
        {f.desc}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Testimonial card
───────────────────────────────────────────────────────────────── */
function TestimonialCard({ t, index }: { t: typeof testimonials[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.03)',
        backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
        border: `1px solid ${hovered ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius:20, padding:'28px',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 40px rgba(139,92,246,0.12)' : 'none',
        transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        cursor:'default',
      }}
    >
      {/* Top accent line */}
      <div style={{
        height:2, borderRadius:1, marginBottom:22,
        background:`linear-gradient(90deg, rgba(139,92,246,${hovered ? '0.8' : '0.35'}), rgba(236,72,153,${hovered ? '0.6' : '0.2'}), transparent)`,
        transition:'all 0.3s ease',
      }} />

      {/* Quote icon */}
      <div style={{ marginBottom:14 }}>
        <IconQuote />
      </div>

      {/* Quote text */}
      <p style={{
        fontSize:'0.9rem', color:'rgba(255,255,255,0.6)', lineHeight:1.75,
        marginBottom:24, fontStyle:'italic', letterSpacing:'0.005em',
      }}>
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Stars */}
      <div style={{ display:'flex', gap:3, marginBottom:18 }}>
        {[0,1,2,3,4].map(i => <IconStar key={i} filled />)}
      </div>

      {/* Author */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{
          width:38, height:38, borderRadius:'50%',
          background:t.avatarBg,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'0.72rem', fontWeight:700, color:'white', flexShrink:0,
          boxShadow:'0 0 12px rgba(0,0,0,0.4)',
        }}>
          {t.avatar}
        </div>
        <div>
          <div style={{ fontSize:'0.875rem', fontWeight:600, color:'rgba(255,255,255,0.88)' }}>{t.name}</div>
          <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginTop:1 }}>{t.role}</div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <main style={{ minHeight:'100vh', color:'white', position:'relative', overflowX:'hidden' }}>
      {/* ── Gradient mesh background ── */}
      <div aria-hidden="true" style={{
        position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background: [
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 60%)',
          'radial-gradient(ellipse 60% 40% at 80% 60%, rgba(96,165,250,0.07) 0%, transparent 55%)',
          'radial-gradient(ellipse 50% 40% at 20% 80%, rgba(236,72,153,0.07) 0%, transparent 55%)',
          'radial-gradient(ellipse 100% 80% at 50% 110%, rgba(109,40,217,0.12) 0%, transparent 55%)',
          '#030014',
        ].join(','),
      }} />
      {/* Subtle grid mesh overlay */}
      <div aria-hidden="true" style={{
        position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity:0.025,
        backgroundImage: 'linear-gradient(rgba(167,139,250,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.8) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%)',
      }} />

      <StarField />
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ position:'relative', zIndex:10, textAlign:'center', padding:'96px 2rem 80px' }}>
        {/* Eyebrow badge */}
        <div style={{ marginBottom:36 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'6px 14px', borderRadius:9999,
            background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.28)',
            fontSize:'0.75rem', fontWeight:500, color:'#c4b5fd', letterSpacing:'0.02em',
          }}>
            <span style={{
              width:6, height:6, borderRadius:'50%', background:'#a78bfa',
              boxShadow:'0 0 8px rgba(167,139,250,0.9)',
              animation:'pulseGlow 2s ease-in-out infinite',
              flexShrink:0,
            }} />
            Powered by Claude · AI Project Planning
          </div>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize:'clamp(2.6rem,7.5vw,5.2rem)', fontWeight:900,
          lineHeight:1.06, letterSpacing:'-0.03em',
          maxWidth:860, margin:'0 auto 6px',
        }}>
          <span style={{ color:'rgba(255,255,255,0.95)' }}>Turn your vague idea</span>
          <br />
          <span style={{ color:'rgba(255,255,255,0.95)' }}>into </span>
          <AnimatedGradientText>10 atomic steps</AnimatedGradientText>
        </h1>

        {/* Sub-headline */}
        <p style={{
          fontSize:'1.1rem', fontWeight:400,
          color:'rgba(255,255,255,0.38)', lineHeight:1.78,
          maxWidth:500, margin:'28px auto 48px',
        }}>
          Stop staring at a blank doc. VibeStep breaks down any idea into
          clear, sequenced build steps so you can ship without losing
          momentum.
        </p>

        {/* CTAs */}
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', alignItems:'center' }}>
          <Link href="/login" style={{
            display:'inline-block',
            background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border:'1px solid rgba(139,92,246,0.5)',
            color:'white', padding:'14px 34px', borderRadius:12,
            fontSize:'0.975rem', fontWeight:600, textDecoration:'none',
            boxShadow:'0 0 30px rgba(139,92,246,0.35), 0 4px 16px rgba(0,0,0,0.5)',
            animation:'ctaGlow 3s ease-in-out infinite',
            transition:'transform 0.2s ease',
            letterSpacing:'0.01em',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Start building for free →
          </Link>
          <Link href="/dashboard" style={{
            display:'inline-block',
            background:'rgba(255,255,255,0.04)',
            backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
            border:'1px solid rgba(255,255,255,0.1)',
            color:'rgba(255,255,255,0.6)', padding:'14px 34px', borderRadius:12,
            fontSize:'0.975rem', fontWeight:500, textDecoration:'none',
            transition:'all 0.22s ease',
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.color = 'rgba(255,255,255,0.9)'
              el.style.borderColor = 'rgba(139,92,246,0.35)'
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.color = 'rgba(255,255,255,0.6)'
              el.style.borderColor = 'rgba(255,255,255,0.1)'
              el.style.transform = 'translateY(0)'
            }}
          >
            View dashboard
          </Link>
        </div>

        {/* Social proof micro-copy */}
        <p style={{ marginTop:20, fontSize:'0.78rem', color:'rgba(255,255,255,0.22)', fontWeight:400 }}>
          No credit card required · Free forever for solo builders
        </p>

        {/* Stats strip */}
        <div style={{
          display:'flex', gap:0, marginTop:72, justifyContent:'center',
          maxWidth:560, marginLeft:'auto', marginRight:'auto',
          background:'rgba(255,255,255,0.03)',
          backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:16, overflow:'hidden',
        }}>
          {[
            { value:'10', label:'Atomic steps', sub:'per project' },
            { value:'< 1min', label:'Time to plan', sub:'seriously' },
            { value:'∞', label:'Ideas to build', sub:'no limits' },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex:1, textAlign:'center', padding:'20px 12px',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{
                fontSize:'1.6rem', fontWeight:800,
                background:'linear-gradient(135deg,#c4b5fd,#a78bfa)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>{s.value}</div>
              <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', marginTop:3, fontWeight:500 }}>{s.label}</div>
              <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.2)', marginTop:1 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ position:'relative', zIndex:10, padding:'80px 2rem 100px', maxWidth:1080, margin:'0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{
            display:'inline-block', fontSize:'0.68rem', fontWeight:700,
            letterSpacing:'0.2em', color:'rgba(167,139,250,0.55)',
            textTransform:'uppercase', marginBottom:14,
            padding:'5px 14px', borderRadius:9999,
            border:'1px solid rgba(139,92,246,0.2)',
            background:'rgba(139,92,246,0.06)',
          }}>
            How it works
          </div>
          <h2 style={{
            fontSize:'clamp(1.6rem,3.5vw,2.1rem)', fontWeight:800,
            color:'rgba(255,255,255,0.92)', letterSpacing:'-0.025em',
            maxWidth:480, margin:'0 auto',
          }}>
            From idea to execution plan<br />
            <span style={{ color:'rgba(255,255,255,0.38)', fontWeight:400 }}>in three simple steps</span>
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.25rem' }}>
          {features.map((f, i) => <FeatureCard key={f.title} f={f} index={i} />)}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={{ position:'relative', zIndex:10, padding:'0 2rem 100px', maxWidth:1080, margin:'0 auto' }}>
        {/* Divider */}
        <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(139,92,246,0.25),transparent)', marginBottom:72 }} />

        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{
            display:'inline-block', fontSize:'0.68rem', fontWeight:700,
            letterSpacing:'0.2em', color:'rgba(167,139,250,0.55)',
            textTransform:'uppercase', marginBottom:14,
            padding:'5px 14px', borderRadius:9999,
            border:'1px solid rgba(139,92,246,0.2)',
            background:'rgba(139,92,246,0.06)',
          }}>
            Testimonials
          </div>
          <h2 style={{
            fontSize:'clamp(1.6rem,3.5vw,2.1rem)', fontWeight:800,
            color:'rgba(255,255,255,0.92)', letterSpacing:'-0.025em',
          }}>
            Builders ship faster with VibeStep
          </h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.25rem' }}>
          {testimonials.map((t, i) => <TestimonialCard key={t.name} t={t} index={i} />)}
        </div>
      </section>

      {/* ── CTA section ── */}
      <section style={{ position:'relative', zIndex:10, textAlign:'center', padding:'0 2rem 120px' }}>
        <CtaCard />
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position:'relative', zIndex:10, textAlign:'center',
        padding:'24px 0 40px',
        borderTop:'1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ color:'rgba(255,255,255,0.18)', fontSize:'0.82rem', display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
          <span>
            <span style={{
              fontWeight:700,
              background:'linear-gradient(135deg,#a78bfa,#ec4899)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>VibeStep</span>
            {' '}· Turn ideas into atomic steps
          </span>
          <span style={{ color:'rgba(255,255,255,0.08)' }}>·</span>
          <a href="/login" style={{ color:'rgba(255,255,255,0.25)', textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
          >Privacy</a>
          <a href="/login" style={{ color:'rgba(255,255,255,0.25)', textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
          >Terms</a>
        </div>
      </footer>
    </main>
  )
}

/* ─────────────────────────────────────────────────────────────────
   CTA card (isolated to use useState for hover)
───────────────────────────────────────────────────────────────── */
function CtaCard() {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        maxWidth:680, margin:'0 auto',
        position:'relative',
        borderRadius:28,
        padding: '2px', /* border width */
        background: hovered
          ? 'linear-gradient(135deg, rgba(139,92,246,0.7), rgba(236,72,153,0.5), rgba(96,165,250,0.4))'
          : 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.15), rgba(96,165,250,0.15))',
        animation: 'ctaGlow 4s ease-in-out infinite',
        transition: 'background 0.4s ease',
      }}
    >
      {/* Inner card */}
      <div style={{
        borderRadius:26,
        background:'rgba(8,4,30,0.92)',
        backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
        padding:'64px 48px',
        position:'relative', overflow:'hidden',
      }}>
        {/* Top glow */}
        <div aria-hidden="true" style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          width:'70%', height:1,
          background:'linear-gradient(90deg,transparent,rgba(139,92,246,0.6),rgba(236,72,153,0.4),transparent)',
        }} />
        {/* Radial glow */}
        <div aria-hidden="true" style={{
          position:'absolute', top:'-40%', left:'50%', transform:'translateX(-50%)',
          width:500, height:300, borderRadius:'50%',
          background:'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:7,
            padding:'5px 13px', borderRadius:9999, marginBottom:24,
            background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.22)',
            fontSize:'0.72rem', fontWeight:500, color:'rgba(167,139,250,0.75)',
          }}>
            <span style={{ width:6, height:6, background:'#34d399', borderRadius:'50%', flexShrink:0, boxShadow:'0 0 8px rgba(52,211,153,0.7)' }} />
            Join builders shipping real products
          </div>

          <h2 style={{
            fontSize:'clamp(1.65rem,4vw,2.25rem)', fontWeight:900,
            letterSpacing:'-0.025em', lineHeight:1.18, marginBottom:16,
          }}>
            Ready to stop vibing<br />and start{' '}
            <AnimatedGradientText>shipping?</AnimatedGradientText>
          </h2>

          <p style={{
            color:'rgba(255,255,255,0.36)', fontSize:'0.95rem', lineHeight:1.72,
            maxWidth:400, margin:'0 auto 36px',
          }}>
            Turn your next big idea into a clear execution plan
            in under 60 seconds. Free, forever.
          </p>

          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/login" style={{
              display:'inline-block',
              background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
              border:'1px solid rgba(139,92,246,0.5)',
              color:'white', padding:'13px 34px', borderRadius:11,
              fontSize:'0.975rem', fontWeight:600, textDecoration:'none',
              boxShadow:'0 0 24px rgba(139,92,246,0.4)',
              transition:'all 0.22s ease',
              letterSpacing:'0.01em',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 0 40px rgba(139,92,246,0.65)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 0 24px rgba(139,92,246,0.4)'
              }}
            >
              Start for free →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
