"use client";

interface ConfidenceBadgeProps {
  score: number; // 0-100
  showImprove?: boolean;
  onImprove?: () => void;
}

export function ConfidenceBadge({ score, showImprove = false, onImprove }: ConfidenceBadgeProps) {
  const isHigh     = score >= 90;
  const isMid      = score >= 70 && score < 90;
  const isLow      = score < 70;

  const color  = isHigh ? "#34d399" : isMid ? "#fbbf24" : "#fb923c";
  const label  = isHigh ? "High confidence" : isMid ? "Moderate confidence" : "Low confidence";
  const bg     = isHigh ? "rgba(52,211,153,0.08)"  : isMid ? "rgba(251,191,36,0.08)"  : "rgba(251,146,60,0.08)";
  const border = isHigh ? "rgba(52,211,153,0.22)"  : isMid ? "rgba(251,191,36,0.22)"  : "rgba(251,146,60,0.22)";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: bg, border: `1px solid ${border}`,
        borderRadius: 9999, padding: "2px 9px",
        fontSize: "0.62rem", fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color,
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: "50%",
          background: color, flexShrink: 0,
        }} />
        {label} · {score}%
      </span>
      {isLow && showImprove && onImprove && (
        <button
          onClick={onImprove}
          style={{
            fontSize: "0.6rem", fontWeight: 700,
            color: "rgba(251,146,60,0.7)", background: "none", border: "none",
            cursor: "pointer", padding: 0, textDecoration: "underline",
            letterSpacing: "0.04em",
          }}
        >
          Improve →
        </button>
      )}
    </div>
  );
}
