import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard – VibeStep",
  description: "The top builders on VibeStep. See who's shipping the most and fastest.",
};

const LEADERS = [
  { rank: 1,  initials: "MK", name: "marcus_k",      username: "marcus_k",     projects: 12, steps: 118, streak: 21, badge: "🏆", color: "#fbbf24", bg: "linear-gradient(135deg,#fbbf24,#f59e0b)" },
  { rank: 2,  initials: "SA", name: "sarah_algo",     username: "sarah_algo",   projects: 9,  steps: 87,  streak: 14, badge: "🥈", color: "#94a3b8", bg: "linear-gradient(135deg,#94a3b8,#64748b)" },
  { rank: 3,  initials: "DT", name: "devthiago",      username: "devthiago",    projects: 8,  steps: 76,  streak: 9,  badge: "🥉", color: "#fb923c", bg: "linear-gradient(135deg,#fb923c,#f97316)" },
  { rank: 4,  initials: "PL", name: "priya_launches", username: "priya_l",      projects: 7,  steps: 68,  streak: 7,  badge: null, color: "#a78bfa", bg: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
  { rank: 5,  initials: "JR", name: "jakub_r",        username: "jakub_r",      projects: 6,  steps: 59,  streak: 12, badge: null, color: "#a78bfa", bg: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
  { rank: 6,  initials: "AO", name: "alex_opens",     username: "alex_opens",   projects: 6,  steps: 54,  streak: 5,  badge: null, color: "#a78bfa", bg: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
  { rank: 7,  initials: "KL", name: "kira_launches",  username: "kira_l",       projects: 5,  steps: 49,  streak: 3,  badge: null, color: "#a78bfa", bg: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
  { rank: 8,  initials: "NB", name: "nate_builds",    username: "nate_builds",  projects: 5,  steps: 44,  streak: 8,  badge: null, color: "#a78bfa", bg: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
  { rank: 9,  initials: "FM", name: "fatima_m",       username: "fatima_m",     projects: 4,  steps: 38,  streak: 2,  badge: null, color: "#a78bfa", bg: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
  { rank: 10, initials: "LZ", name: "lucas_zero",     username: "lucas_zero",   projects: 4,  steps: 33,  streak: 6,  badge: null, color: "#a78bfa", bg: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
];

const RANK_STYLES: Record<number, { glow: string; border: string; rankColor: string }> = {
  1: { glow: "0 0 30px rgba(251,191,36,0.2)",  border: "rgba(251,191,36,0.25)",  rankColor: "#fbbf24" },
  2: { glow: "0 0 20px rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.2)", rankColor: "#94a3b8" },
  3: { glow: "0 0 20px rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.2)",  rankColor: "#fb923c" },
};

export default function LeaderboardPage() {
  const top3 = LEADERS.slice(0, 3);
  const rest = LEADERS.slice(3);

  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "white", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 55% 45% at 50% -5%, rgba(124,58,237,0.18) 0%, transparent 60%)",
          "radial-gradient(ellipse 40% 30% at 85% 85%, rgba(251,191,36,0.05) 0%, transparent 55%)",
          "#030014",
        ].join(","),
      }} />

      {/* Mini nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(3,0,20,0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, padding: "0 1.5rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white" }}>V</div>
            <span style={{ fontSize: "0.95rem", fontWeight: 800, background: "linear-gradient(135deg,#c4b5fd,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>VibeStep</span>
          </Link>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center",
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "1px solid rgba(139,92,246,0.45)",
            color: "white", padding: "7px 16px", borderRadius: 9, fontSize: "0.8rem", fontWeight: 600, textDecoration: "none",
          }}>
            Join the leaderboard →
          </Link>
        </div>
      </nav>

      <main style={{ position: "relative", zIndex: 10, maxWidth: 860, margin: "0 auto", padding: "52px 24px 100px" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🏆</div>
          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 900, letterSpacing: "-0.03em",
            margin: "0 0 12px",
            background: "linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,255,255,0.6))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Top Builders
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.7 }}>
            The founders shipping the most with VibeStep. Updated weekly.
          </p>
        </div>

        {/* ── Podium — top 3 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
          {[top3[1], top3[0], top3[2]].map((u, visualIdx) => {
            const isCenter = visualIdx === 1;
            const rs = RANK_STYLES[u.rank] ?? {};
            const podiumHeight = isCenter ? 96 : 64;
            return (
              <div key={u.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  background: "rgba(255,255,255,0.025)",
                  backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                  border: `1px solid ${rs.border ?? "rgba(255,255,255,0.08)"}`,
                  borderRadius: 18, padding: "24px 16px",
                  textAlign: "center", width: "100%",
                  boxShadow: rs.glow,
                  marginBottom: 8,
                }}>
                  {u.badge && <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{u.badge}</div>}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, margin: "0 auto 10px",
                    background: u.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem", fontWeight: 800, color: "white",
                    boxShadow: `0 0 20px ${u.color}44`,
                  }}>
                    {u.initials}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "rgba(255,255,255,0.85)", margin: "0 0 2px" }}>{u.name}</p>
                  <p style={{ fontSize: "0.68rem", color: rs.rankColor ?? "#a78bfa", fontWeight: 800, margin: "0 0 12px" }}>
                    #{u.rank}
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 900, color: rs.rankColor ?? "#a78bfa" }}>{u.projects}</div>
                      <div style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em" }}>projects</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 900, color: rs.rankColor ?? "#a78bfa" }}>{u.steps}</div>
                      <div style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em" }}>steps</div>
                    </div>
                  </div>
                  {u.streak > 0 && (
                    <div style={{ marginTop: 10, fontSize: "0.65rem", color: "#fb923c", fontWeight: 700 }}>
                      🔥 {u.streak}d streak
                    </div>
                  )}
                </div>
                {/* Podium base */}
                <div style={{
                  width: "80%", height: podiumHeight,
                  background: `linear-gradient(180deg, ${rs.border ?? "rgba(255,255,255,0.06)"}, transparent)`,
                  borderRadius: "8px 8px 0 0",
                  border: `1px solid ${rs.border ?? "rgba(255,255,255,0.07)"}`,
                  borderBottom: "none",
                }} />
              </div>
            );
          })}
        </div>

        {/* ── Rest of leaderboard ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 48 }}>
          {rest.map((u, i) => (
            <div
              key={u.rank}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "14px 18px",
                animation: "slideInLeft 0.3s ease both",
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.2)", width: 24, textAlign: "center", flexShrink: 0 }}>
                #{u.rank}
              </span>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: u.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.78rem", fontWeight: 800, color: "white",
              }}>
                {u.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>{u.name}</p>
                {u.streak > 3 && (
                  <p style={{ fontSize: "0.65rem", color: "#fb923c", margin: "1px 0 0", fontWeight: 600 }}>🔥 {u.streak}d streak</p>
                )}
              </div>
              <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#a78bfa" }}>{u.projects}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>projects</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#34d399" }}>{u.steps}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>steps</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Join CTA ── */}
        <div style={{
          textAlign: "center",
          background: "rgba(10,6,30,0.7)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(139,92,246,0.2)", borderRadius: 20, padding: "40px 28px",
          position: "relative", overflow: "hidden",
        }}>
          <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.6),transparent)" }} />
          <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "rgba(255,255,255,0.88)", margin: "0 0 8px" }}>
            Your name could be here 👆
          </p>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.32)", margin: "0 0 24px" }}>
            Start building with VibeStep and earn your spot on the leaderboard.
          </p>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center",
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
            border: "1px solid rgba(139,92,246,0.45)", color: "white",
            padding: "12px 28px", borderRadius: 11, fontSize: "0.9rem", fontWeight: 700, textDecoration: "none",
            boxShadow: "0 0 28px rgba(139,92,246,0.35)",
          }}>
            Join the leaderboard free →
          </Link>
        </div>
      </main>

      {/* Footer note */}
      <div style={{ textAlign: "center", padding: "0 24px 40px", position: "relative", zIndex: 10 }}>
        <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.12)" }}>
          Rankings based on projects completed and steps shipped. Updated every Monday.
        </p>
      </div>
    </div>
  );
}
