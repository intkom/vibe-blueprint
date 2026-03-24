"use client";

import { useState } from "react";

interface EmailPreferencesFormProps {
  weeklyDigest: boolean;
  riskAlerts: boolean;
  buildTips: boolean;
}

const PREFS = [
  {
    key: "weeklyDigest" as const,
    label: "Weekly build digest",
    description: "A summary of your progress, streaks, and top risk updates.",
  },
  {
    key: "riskAlerts" as const,
    label: "Risk alerts",
    description: "Get notified when a new risk pattern matches your active projects.",
  },
  {
    key: "buildTips" as const,
    label: "Build tips",
    description: "Practical advice for indie builders — shipped every week or two.",
  },
];

export function EmailPreferencesForm({ weeklyDigest, riskAlerts, buildTips }: EmailPreferencesFormProps) {
  const [prefs, setPrefs] = useState({ weeklyDigest, riskAlerts, buildTips });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function toggle(key: keyof typeof prefs) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setStatus("saving");
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_weekly_digest: updated.weeklyDigest,
          email_risk_alerts: updated.riskAlerts,
          email_build_tips: updated.buildTips,
        }),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "20px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <p style={{
          fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: 0,
        }}>
          Email Preferences
        </p>
        {status === "saved" && (
          <span style={{ fontSize: "0.68rem", color: "#34d399", fontWeight: 600 }}>✓ Saved</span>
        )}
        {status === "saving" && (
          <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>Saving…</span>
        )}
        {status === "error" && (
          <span style={{ fontSize: "0.68rem", color: "#f87171", fontWeight: 600 }}>Failed to save</span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PREFS.map(pref => (
          <div
            key={pref.key}
            onClick={() => toggle(pref.key)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10, padding: "12px 14px",
              cursor: "pointer", transition: "background 0.15s",
              userSelect: "none",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; }}
          >
            <div>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", margin: "0 0 2px" }}>
                {pref.label}
              </p>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: 0, lineHeight: 1.5 }}>
                {pref.description}
              </p>
            </div>

            {/* Toggle */}
            <div style={{
              width: 38, height: 22, borderRadius: 9999, flexShrink: 0,
              background: prefs[pref.key] ? "rgba(139,92,246,0.7)" : "rgba(255,255,255,0.1)",
              border: prefs[pref.key] ? "1px solid rgba(139,92,246,0.9)" : "1px solid rgba(255,255,255,0.12)",
              position: "relative", transition: "all 0.2s ease",
              boxShadow: prefs[pref.key] ? "0 0 10px rgba(139,92,246,0.35)" : "none",
            }}>
              <div style={{
                position: "absolute", top: 2,
                left: prefs[pref.key] ? "calc(100% - 20px)" : 2,
                width: 16, height: 16, borderRadius: "50%",
                background: "white",
                transition: "left 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
