import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppHeader } from "@/components/app-header";
import { ReferralSection } from "@/components/referral-section";
import { AchievementBadges } from "@/components/achievement-badges";
import { EmailPreferencesForm } from "@/components/email-preferences-form";
import { DisplayNameEditor, PreferencesSection, DangerZone } from "@/components/settings-client";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings – Axiom",
  description: "Account settings, preferences, and usage.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "22px 24px", marginBottom: 14,
    }}>
      <p style={{
        fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 18px",
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, referral_code, analyses_used, bonus_analyses, plan, email_weekly_digest, email_risk_alerts, email_build_tips, display_name")
    .eq("id", user.id)
    .single();

  const { count: projectCount } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

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
  const displayName = profile?.display_name ?? (emailLocal.charAt(0).toUpperCase() + emailLocal.slice(1));

  const analysesUsed  = profile?.analyses_used ?? 0;
  const bonusAnalyses = profile?.bonus_analyses ?? 0;
  const analysesLimit = 3 + bonusAnalyses;
  const isPro         = (profile?.plan ?? "free") !== "free";
  const resetDate     = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    .toLocaleDateString("en-US", { month: "long", day: "numeric" });

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

      <main style={{ position: "relative", zIndex: 10, maxWidth: 760, margin: "0 auto", padding: "48px 24px 100px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", color: "rgba(167,139,250,0.55)", textTransform: "uppercase", marginBottom: 6 }}>
            Settings
          </p>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 900, letterSpacing: "-0.025em", margin: 0, color: "rgba(255,255,255,0.95)" }}>
            Account & Preferences
          </h1>
        </div>

        {/* ── ACCOUNT ── */}
        <Section title="Account">
          <DisplayNameEditor initial={displayName} email={user.email ?? ""} />

          {/* Streak badge */}
          {(currentStreak > 0 || longestStreak > 0) && (
            <div style={{
              marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", gap: 20, flexWrap: "wrap",
            }}>
              {currentStreak > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 10, padding: "8px 14px" }}>
                  <span>🔥</span>
                  <div>
                    <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Current streak</p>
                    <p style={{ fontSize: "1rem", fontWeight: 900, color: "#fb923c", margin: 0, lineHeight: 1.2 }}>{currentStreak} days</p>
                  </div>
                </div>
              )}
              {longestStreak > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 14px" }}>
                  <span>🏆</span>
                  <div>
                    <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Longest streak</p>
                    <p style={{ fontSize: "1rem", fontWeight: 900, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.2 }}>{longestStreak} days</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* ── USAGE ── */}
        <Section title="Usage">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "rgba(255,255,255,0.75)", margin: "0 0 3px" }}>
                Analyses this month
              </p>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                Resets {resetDate}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{
                fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em",
                color: isPro ? "#34d399" : analysesUsed >= analysesLimit ? "#f87171" : "#a78bfa",
              }}>
                {isPro ? "∞" : analysesUsed}
              </span>
              {!isPro && (
                <span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.25)", fontWeight: 700 }}>
                  /{analysesLimit}
                </span>
              )}
            </div>
          </div>

          {!isPro && (
            <>
              <div style={{ height: 6, borderRadius: 9999, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 12 }}>
                <div style={{
                  height: "100%", borderRadius: 9999,
                  width: `${Math.min(100, (analysesUsed / analysesLimit) * 100)}%`,
                  background: analysesUsed >= analysesLimit
                    ? "linear-gradient(90deg,#dc2626,#f87171)"
                    : analysesUsed >= analysesLimit - 1
                      ? "linear-gradient(90deg,#d97706,#fbbf24)"
                      : "linear-gradient(90deg,#7c3aed,#a78bfa)",
                  transition: "width 0.5s ease",
                }} />
              </div>
              <Link href="/pricing" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(91,33,182,0.1))",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "#a78bfa", padding: "8px 16px", borderRadius: 9,
                fontSize: "0.78rem", fontWeight: 700, textDecoration: "none",
                transition: "all 0.15s",
              }}>
                ✦ Upgrade for unlimited analyses →
              </Link>
            </>
          )}

          {isPro && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 700 }}>✓ Pro plan active</span>
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>Unlimited analyses</span>
            </div>
          )}

          {/* Stats this week */}
          <div style={{
            marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10,
          }}>
            {[
              { value: stepsThisWeek, label: "Steps done", color: "#34d399", icon: "✅" },
              { value: activeProjectsThisWeek, label: "Projects active", color: "#a78bfa", icon: "📁" },
              { value: currentStreak, label: "Day streak", color: "#fb923c", icon: "🔥" },
            ].map(stat => (
              <div key={stat.label} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 10, padding: "12px", textAlign: "center",
              }}>
                <div style={{ fontSize: "0.9rem", marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: stat.color, lineHeight: 1, marginBottom: 3 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── ACHIEVEMENTS ── */}
        <div style={{ marginBottom: 14 }}>
          <AchievementBadges />
        </div>

        {/* ── PREFERENCES ── */}
        <Section title="Preferences">
          <PreferencesSection defaultModel="haiku" />
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
              Email notifications
            </p>
            <EmailPreferencesForm
              weeklyDigest={profile?.email_weekly_digest ?? true}
              riskAlerts={profile?.email_risk_alerts ?? true}
              buildTips={profile?.email_build_tips ?? true}
            />
          </div>
        </Section>

        {/* ── REFERRAL ── */}
        <div style={{ marginBottom: 14 }}>
          <ReferralSection referralCode={profile?.referral_code ?? emailLocal} />
        </div>

        {/* ── TEAM ── */}
        <Section title="Team">
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
              <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>
                {user.email} · Owner
                <span style={{ marginLeft: 6, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24", fontSize: "0.6rem", padding: "1px 7px", borderRadius: 9999, fontWeight: 700 }}>
                  Solo plan
                </span>
              </p>
            </div>
          </div>
          <div style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: "0 0 10px", lineHeight: 1.6 }}>
              Upgrade to Team plan to share analyses and collaborate in real time.
            </p>
            <Link href="/pricing" style={{
              fontSize: "0.78rem", fontWeight: 700, color: "#a78bfa",
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              padding: "7px 14px", borderRadius: 8, textDecoration: "none",
            }}>
              View team plans →
            </Link>
          </div>
        </Section>

        {/* ── KEYBOARD SHORTCUTS ── */}
        <Section title="Keyboard Shortcuts">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { key: "N", action: "New analysis" },
              { key: "D", action: "Dashboard" },
              { key: "⌘K", action: "Search everything" },
              { key: "⌘↵", action: "Submit analysis" },
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
                }}>{key}</kbd>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)" }}>{action}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── WEEKLY DIGEST ── */}
        <Section title="Weekly Progress Report">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", margin: "0 0 3px" }}>
                Preview of your Monday digest email
              </p>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.22)", margin: 0 }}>
                {motivationalMessage}
              </p>
            </div>
            <span style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
              color: "#fbbf24", padding: "4px 10px", borderRadius: 9999, flexShrink: 0,
            }}>
              Coming soon
            </span>
          </div>
        </Section>

        {/* ── DANGER ZONE ── */}
        <div style={{
          background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.12)",
          borderRadius: 16, padding: "22px 24px",
        }}>
          <p style={{
            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "rgba(248,113,113,0.5)", margin: "0 0 18px",
          }}>
            Danger Zone
          </p>
          <DangerZone projectCount={projectCount ?? 0} />
        </div>

      </main>
    </div>
  );
}
