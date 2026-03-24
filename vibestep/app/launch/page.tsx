import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Axiom is live on Product Hunt – Axiom",
  description: "We launched on Product Hunt. Get structured product intelligence for your indie build.",
};

const TESTIMONIALS = [
  { text: "Axiom showed me 3 risks I would have shipped into production. Saved me weeks of debugging.", author: "Marcus T.", role: "Indie hacker" },
  { text: "I got a full ICP profile and competitor analysis in 30 seconds. Usually takes me a full day of research.", author: "Priya S.", role: "Founder" },
  { text: "The execution path alone was worth it. I stopped building the wrong thing first.", author: "Alex K.", role: "Solo dev" },
];

export default function LaunchPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "rgba(255,255,255,0.9)", fontFamily: "inherit" }}>

      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(124,58,237,0.2) 0%, transparent 60%)",
          "radial-gradient(ellipse 40% 30% at 80% 80%, rgba(236,72,153,0.06) 0%, transparent 55%)",
        ].join(","),
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "64px 28px 96px" }}>

        {/* PH badge */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <a
            href="https://www.producthunt.com/posts/axiom"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "rgba(255,88,31,0.1)", border: "1px solid rgba(255,88,31,0.3)",
              borderRadius: 9999, padding: "8px 18px",
              fontSize: "0.82rem", fontWeight: 700, color: "#ff8c5a",
              textDecoration: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 240 240" fill="none">
              <circle cx="120" cy="120" r="120" fill="#FF6154"/>
              <path d="M140.7 120c0 14.7-11.9 26.7-26.6 26.7H96V93.3h18.1c14.7 0 26.6 11.9 26.6 26.7z" fill="white"/>
              <path d="M96 120h18.1" stroke="white" strokeWidth="13.3"/>
            </svg>
            Featured on Product Hunt
          </a>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.6rem", fontWeight: 800, color: "white",
            boxShadow: "0 0 32px rgba(139,92,246,0.5)",
            margin: "0 auto 24px",
          }}>A</div>

          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900,
            letterSpacing: "-0.04em", lineHeight: 1.1,
            margin: "0 0 20px",
          }}>
            Understand your product<br />
            <span style={{ background: "linear-gradient(135deg,#a78bfa,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              before it breaks
            </span>
          </h1>

          <p style={{
            fontSize: "1.05rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7,
            margin: "0 auto 32px", maxWidth: 480,
          }}>
            Paste your build idea. Get risk detection, architecture insights, ICP profiling, and a sequenced execution path — in 30 seconds.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "white", padding: "14px 28px", borderRadius: 12,
              fontSize: "0.95rem", fontWeight: 700, textDecoration: "none",
              boxShadow: "0 0 32px rgba(139,92,246,0.35)",
            }}>
              Try free — no card needed →
            </Link>
            <a
              href="https://www.producthunt.com/posts/axiom"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)", padding: "14px 28px", borderRadius: 12,
                fontSize: "0.95rem", fontWeight: 600, textDecoration: "none",
              }}
            >
              Upvote on PH ↑
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 56,
        }}>
          {[
            { value: "30s", label: "Time to insight" },
            { value: "3 free", label: "Analyses included" },
            { value: "0", label: "Credit card needed" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "20px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#a78bfa", marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.32)", fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div style={{ marginBottom: 56 }}>
          <p style={{
            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
            textAlign: "center", marginBottom: 20,
          }}>What builders say</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: "rgba(139,92,246,0.05)",
                border: "1px solid rgba(139,92,246,0.15)",
                borderRadius: 14, padding: "20px 22px",
              }}>
                <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 12px", fontStyle: "italic" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `linear-gradient(135deg,hsl(${(i * 60 + 220) % 360},70%,60%),hsl(${(i * 60 + 270) % 360},60%,45%))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700, color: "white",
                  }}>
                    {t.author[0]}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
                    {t.author} · {t.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{
          background: "rgba(139,92,246,0.07)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: 18, padding: "36px 28px", textAlign: "center",
        }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 10px" }}>
            Ship smarter, not harder.
          </h2>
          <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.4)", margin: "0 0 24px", lineHeight: 1.65 }}>
            3 free analyses. No signup friction. No credit card.
          </p>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
            border: "1px solid rgba(139,92,246,0.5)",
            color: "white", padding: "13px 32px", borderRadius: 12,
            fontSize: "0.95rem", fontWeight: 700, textDecoration: "none",
            boxShadow: "0 0 28px rgba(139,92,246,0.3)",
          }}>
            Analyze my build for free →
          </Link>
        </div>
      </div>
    </div>
  );
}
