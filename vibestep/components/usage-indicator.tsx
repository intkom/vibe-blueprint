"use client";

interface UsageIndicatorProps {
  used: number;
  limit: number;
  onUpgrade?: () => void;
}

export function UsageIndicator({ used, limit, onUpgrade }: UsageIndicatorProps) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const remaining = Math.max(0, limit - used);
  const isFull = used >= limit;
  const isWarning = used >= limit - 1 && !isFull;

  const barColor = isFull
    ? "linear-gradient(90deg,#dc2626,#f87171)"
    : isWarning
    ? "linear-gradient(90deg,#d97706,#fbbf24)"
    : "linear-gradient(90deg,#7c3aed,#a78bfa)";

  const textColor = isFull ? "#f87171" : isWarning ? "#fbbf24" : "rgba(167,139,250,0.8)";

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${isFull ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 12,
      padding: "14px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
          Free analyses
        </span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: textColor, fontVariantNumeric: "tabular-nums" }}>
          {used} / {limit} used
        </span>
      </div>

      <div style={{ height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 8 }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 9999,
          background: barColor,
          transition: "width 0.4s ease",
          boxShadow: isFull ? "0 0 8px rgba(239,68,68,0.4)" : "0 0 8px rgba(139,92,246,0.3)",
        }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)" }}>
          {isFull
            ? "You've used all your free analyses this month"
            : `${remaining} ${remaining === 1 ? "analysis" : "analyses"} remaining this month`}
        </span>
        {(isFull || isWarning) && onUpgrade && (
          <button
            onClick={onUpgrade}
            style={{
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: "white",
              padding: "4px 12px",
              borderRadius: 8,
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              marginLeft: 12,
              flexShrink: 0,
            }}
          >
            Upgrade →
          </button>
        )}
      </div>
    </div>
  );
}
