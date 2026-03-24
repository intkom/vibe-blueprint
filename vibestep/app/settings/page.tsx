import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppHeader } from "@/components/app-header";
import { ReferralSection } from "@/components/referral-section";
import { AchievementBadges } from "@/components/achievement-badges";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings – Axiom",
  description: "Account settings and weekly progress digest preview.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch streak profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak")
    .eq("id", user.id)
    .single();

  // Steps completed this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentSteps } = await supabase
    .from("build_steps")
    .select("id, title, project_id, completed_at")
    .eq("status", "complete")
    .gte("completed_at", oneWeekAgo)
    .order("completed_at", { ascending: false });

  const currentStreak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const stepsThisWeek = recentSteps?.length ?? 0;
  const activeProjectsThisWeek = new Set(recentSteps?.map(s => s.project_id) ?? []).size;

  const emailLocal = user.email?.split("@")[0] ?? "there";
  const displayName = emailLocal.charAt(0).toUpperCase() + emailLocal.slice(1);

  const motivationalMessage =
    stepsThisWeek === 0
      ? "Every great product starts with a single step. Open your project and keep the momentum going."
      : stepsThisWeek < 3
      ? "Good progress! Even small steps compound. Keep pushing — you're closer than you think."
      : "Incredible week! You're building real momentum. Don't stop now.";

  return (
    <div style={{ minHeight: "100vh", background: "var(--vs-bg)", color: "var(--vs-text)", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 85% 5%, rgba(124,58,237,0.1) 0%, transparent 60%), var(--vs-bg)",
      }} />

      <AppHeader />

      <main style={{
        position: "relative", zIndex: 10,
        maxWidth: 760, margin: "0 auto", padding: "48px 24px 100px",
      }}>
        {/* ── Page header ── */}
        <div style={{ marginBottom: 36 }}>
          <p style={{
            fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em",
            color: "rgba(167,139,250,0.55)", textTransform: "uppercase", marginBottom: 6,
          }}>
            Settings
          </p>
          <h1 style={{
            fontSize: "1.9rem", fontWeight: 900, letterSpacing: "-0.025em",
            margin: 0, color: "rgba(255,255,255,0.95)",
          }}>
            Account & Preferences
          </h1>
        </div>

        {/* ── Account card ── */}
        <div style={{
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "20px 24px", marginBottom: 14,
        }}>
          <p style={{
            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 14px",
          }}>
            Account
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", fontWeight: 800, color: "white",
              boxShadow: "0 0 20px rgba(139,92,246,0.4)",
            }}>
              {displayName[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "rgba(255,255,255,0.88)", margin: "0 0 2px" }}>
                {displayName}
              </p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                {user.email}
              </p>
            </div>
            {currentStreak > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)",
                borderRadius: 9999, padding: "5px 12px", flexShrink: 0,
              }}>
                <span style={{ fontSize: "0.9rem" }}>🔥</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fb923c" }}>
                  {currentStreak} day streak
                </span>
              </div>
            )}
          </div>

          {longestStreak > 0 && (
            <div style={{
              marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", gap: 20,
            }}>
              <div>
                <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                  Current streak
                </p>
                <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fb923c", margin: 0 }}>
                  {currentStreak} days
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                  Longest streak
                </p>
                <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                  {longestStreak} days
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Weekly digest preview ── */}
        <div style={{
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "20px 24px", marginBottom: 14,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20, flexWrap: "wrap", gap: 10,
          }}>
            <div>
              <p style={{
                fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 3px",
              }}>
                Weekly Progress Report
              </p>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.32)", margin: 0 }}>
                Preview of your Monday digest email
              </p>
            </div>
            <span style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
              color: "#fbbf24", padding: "4px 10px", borderRadius: 9999,
            }}>
              Coming soon
            </span>
          </div>

          {/* ── Email mockup ── */}
          <div style={{
            background: "rgba(8,5,24,0.95)", border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: 14, overflow: "hidden",
          }}>
            {/* Email header */}
            <div style={{
              background: "linear-gradient(135deg,rgba(124,58,237,0.18),rgba(91,33,182,0.1))",
              padding: "22px 26px",
              borderBottom: "1px solid rgba(139,92,246,0.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8rem", fontWeight: 800, color: "white",
                }}>V</div>
                <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#c4b5fd" }}>Axiom</span>
                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>
                  · Weekly digest
                </span>
              </div>
              <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "rgba(255,255,255,0.92)", margin: "0 0 4px" }}>
                Your weekly build report 🚀
              </p>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.32)", margin: 0 }}>
                Hey {displayName}, here&apos;s what you shipped this week
              </p>
            </div>

            {/* Email body */}
            <div style={{ padding: "20px 26px" }}>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  { value: stepsThisWeek, label: "Steps done", color: "#34d399", icon: "✅" },
                  { value: activeProjectsThisWeek, label: "Projects active", color: "#a78bfa", icon: "📁" },
                  { value: currentStreak, label: "Day streak", color: "#fb923c", icon: "🔥" },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 11, padding: "14px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "1rem", marginBottom: 5 }}>{stat.icon}</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 900, color: stat.color, lineHeight: 1, marginBottom: 4 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent steps */}
              {stepsThisWeek > 0 ? (
                <div style={{ marginBottom: 18 }}>
                  <p style={{
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 10px",
                  }}>
                    Completed this week
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(recentSteps ?? []).slice(0, 5).map(step => (
                      <div key={step.id} style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "8px 12px", borderRadius: 9,
                        background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.1)",
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                          background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {step.title}
                        </span>
                      </div>
                    ))}
                    {stepsThisWeek > 5 && (
                      <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.22)", margin: "2px 0 0 40px" }}>
                        +{stepsThisWeek - 5} more
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: "center", padding: "20px",
                  background: "rgba(255,255,255,0.02)", borderRadius: 10,
                  border: "1px dashed rgba(255,255,255,0.06)",
                  marginBottom: 18,
                }}>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.22)", margin: 0 }}>
                    No steps completed this week yet. Get building! 💪
                  </p>
                </div>
              )}

              {/* Footer */}
              <div style={{ paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.7, margin: 0 }}>
                  {motivationalMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Toggle row */}
          <div style={{
            marginTop: 14, padding: "13px 16px",
            background: "rgba(255,255,255,0.02)", borderRadius: 11,
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.55)", margin: "0 0 2px" }}>
                Weekly email digest
              </p>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", margin: 0 }}>
                Sent every Monday · {user.email}
              </p>
            </div>
            {/* Decorative toggle (not yet functional) */}
            <div style={{
              width: 44, height: 24, borderRadius: 9999,
              background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.25)",
              position: "relative", cursor: "not-allowed", flexShrink: 0,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: "#a78bfa", boxShadow: "0 0 8px rgba(167,139,250,0.5)",
                position: "absolute", top: 2, right: 2,
              }} />
            </div>
          </div>
        </div>

        {/* ── Achievements ── */}
        <div style={{ marginBottom: 14 }}>
          <AchievementBadges />
        </div>

        {/* ── Team ── */}
        <div style={{
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "20px 24px", marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: 0 }}>
              Team
            </p>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, padding: "3px 10px", borderRadius: 9999,
              background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24",
            }}>
              Solo plan
            </span>
          </div>

          {/* Current member */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 800, color: "white",
            }}>
              {displayName.charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.72)", margin: 0 }}>{displayName}</p>
              <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>{user.email} · Owner</p>
            </div>
          </div>

          {/* Invite input */}
          <div style={{
            background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)",
            borderRadius: 12, padding: "16px 18px",
          }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.55)", margin: "0 0 4px" }}>
              Invite a teammate
            </p>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", margin: "0 0 12px" }}>
              Upgrade to Team plan to share analyses and collaborate in real time.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                placeholder="teammate@company.com"
                disabled
                style={{
                  flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.3)", outline: "none", fontFamily: "inherit",
                  cursor: "not-allowed",
                }}
              />
              <button
                type="button"
                disabled
                style={{
                  background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
                  color: "#a78bfa", padding: "8px 16px", borderRadius: 8,
                  fontSize: "0.8rem", fontWeight: 700, cursor: "not-allowed", opacity: 0.6,
                }}
              >
                Upgrade →
              </button>
            </div>
          </div>
        </div>

        {/* ── Referral ── */}
        <div style={{ marginBottom: 14 }}>
          <ReferralSection username={emailLocal} />
        </div>

        {/* ── Keyboard shortcuts ── */}
        <div style={{
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "20px 24px",
        }}>
          <p style={{
            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 14px",
          }}>
            Keyboard Shortcuts
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { key: "N", action: "New analysis" },
              { key: "D", action: "Dashboard" },
              { key: "⌘K", action: "Search everything" },
              { key: "?", action: "Show shortcuts" },
              { key: "Esc", action: "Close panels" },
            ].map(({ key, action }) => (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 9,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <kbd style={{
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6, padding: "2px 8px",
                  fontSize: "0.72rem", fontFamily: "monospace",
                  color: "rgba(255,255,255,0.55)", flexShrink: 0,
                }}>
                  {key}
                </kbd>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)" }}>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
