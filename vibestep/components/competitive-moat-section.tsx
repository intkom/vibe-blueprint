"use client";

import type { CompetitiveMoat } from "@/app/api/analyze/route";

const MOAT_META: Record<CompetitiveMoat["moat_type"], { label: string; icon: string; color: string }> = {
  network_effects:  { label: "Network Effects",   icon: "🕸",  color: "#a78bfa" },
  switching_costs:  { label: "Switching Costs",   icon: "🔒",  color: "#60a5fa" },
  data_advantage:   { label: "Data Advantage",    icon: "🧠",  color: "#34d399" },
  brand:            { label: "Brand Moat",         icon: "⭐",  color: "#fbbf24" },
  cost:             { label: "Cost Advantage",     icon: "💰",  color: "#4ade80" },
  none:             { label: "No Clear Moat",      icon: "⚠",   color: "#f87171" },
};

interface CompetitiveMoatSectionProps {
  moat: CompetitiveMoat;
}

export function CompetitiveMoatSection({ moat }: CompetitiveMoatSectionProps) {
  const meta = MOAT_META[moat.moat_type] ?? MOAT_META.none;
  const score = moat.moat_score;

  const strengthLabel =
    score >= 81 ? "Exceptional" :
    score >= 61 ? "Strong" :
    score >= 41 ? "Moderate" :
    score >= 21 ? "Weak" : "None";

  const barColor = meta.color;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Moat type + score */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          background: `${barColor}14`, border: `1px solid ${barColor}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem",
        }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: `${barColor}99` }}>
              {meta.label}
            </span>
            <span style={{
              fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              background: `${barColor}14`, border: `1px solid ${barColor}30`,
              color: barColor, padding: "2px 8px", borderRadius: 9999,
            }}>
              {strengthLabel}
            </span>
          </div>
          {/* Score bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 5, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${score}%`, borderRadius: 9999,
                background: barColor,
                boxShadow: `0 0 8px ${barColor}60`,
                transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
              }} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: barColor, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
              {score}/100
            </span>
          </div>
        </div>
      </div>

      {/* Defensibility */}
      <div style={{
        background: `${barColor}08`, border: `1px solid ${barColor}1a`,
        borderRadius: 12, padding: "12px 16px",
      }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: `${barColor}80`, margin: "0 0 6px" }}>
          Defensibility
        </p>
        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>
          &ldquo;{moat.defensibility}&rdquo;
        </p>
      </div>

      {/* Risks + build actions in two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Moat risks */}
        <div style={{
          background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.14)",
          borderRadius: 12, padding: "14px 16px",
        }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(248,113,113,0.65)", margin: "0 0 10px" }}>
            Moat risks
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {moat.risks.map((risk, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "#f87171", fontSize: "0.7rem", flexShrink: 0, marginTop: 2 }}>↓</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>{risk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Build actions */}
        <div style={{
          background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.14)",
          borderRadius: 12, padding: "14px 16px",
        }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(52,211,153,0.65)", margin: "0 0 10px" }}>
            Build now
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {moat.build_actions.map((action, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "#34d399", fontSize: "0.7rem", flexShrink: 0, marginTop: 2 }}>↑</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
