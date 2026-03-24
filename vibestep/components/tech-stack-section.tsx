"use client";

import { useState } from "react";
import type { TechStackItem } from "@/app/api/analyze/route";

const LAYER_ICONS: Record<string, string> = {
  Frontend: "🖥",
  Backend: "⚙",
  Database: "🗄",
  Auth: "🔐",
  Payments: "💳",
  Hosting: "☁",
  Monitoring: "📊",
  Analytics: "📈",
  Storage: "📦",
  Email: "✉",
  Search: "🔍",
  Cache: "⚡",
};

function getIcon(layer: string): string {
  const key = Object.keys(LAYER_ICONS).find(k => layer.toLowerCase().includes(k.toLowerCase()));
  return key ? LAYER_ICONS[key] : "🔧";
}

interface TechStackSectionProps {
  items: TechStackItem[];
  onGenerateGuide?: (stack: TechStackItem[]) => void;
}

export function TechStackSection({ items, onGenerateGuide }: TechStackSectionProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!items.length) return null;

  const totalSetupHours = items.reduce((sum, item) => sum + item.setup_hours, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 18, flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(96,165,250,0.6)", marginBottom: 4 }}>
            Recommended Stack
          </p>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>
            ~{totalSetupHours}h total setup · {items.length} layers
          </p>
        </div>
        {onGenerateGuide && (
          <button
            onClick={() => onGenerateGuide(items)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)",
              color: "#60a5fa", padding: "6px 14px", borderRadius: 8,
              fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(96,165,250,0.18)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(96,165,250,0.1)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Generate setup guide →
          </button>
        )}
      </div>

      {/* Stack grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => {
          const isOpen = expanded === i;
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  width: "100%", textAlign: "left",
                  background: isOpen ? "rgba(96,165,250,0.06)" : "rgba(255,255,255,0.025)",
                  border: `1px solid ${isOpen ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: isOpen ? "12px 12px 0 0" : 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 12,
                }}
                onMouseEnter={e => {
                  if (!isOpen) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={e => {
                  if (!isOpen) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.025)";
                }}
              >
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{getIcon(item.layer)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(96,165,250,0.65)" }}>
                      {item.layer}
                    </span>
                    <span style={{
                      fontSize: "0.6rem", color: "rgba(255,255,255,0.22)",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      padding: "1px 6px", borderRadius: 9999,
                    }}>
                      ~{item.setup_hours}h setup
                    </span>
                  </div>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                    {item.tool}
                  </span>
                </div>
                <span style={{
                  fontSize: "0.7rem", color: "rgba(255,255,255,0.25)",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  flexShrink: 0,
                }}>▾</span>
              </button>

              {/* Expanded details */}
              {isOpen && (
                <div style={{
                  background: "rgba(96,165,250,0.03)",
                  border: "1px solid rgba(96,165,250,0.25)",
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                  padding: "14px 16px",
                  animation: "fadeIn 0.15s ease",
                }}>
                  <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: "0 0 12px" }}>
                    {item.why}
                  </p>
                  {item.alternatives.length > 0 && (
                    <div>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 6px" }}>
                        Alternatives
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {item.alternatives.map((alt, j) => (
                          <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ color: "rgba(96,165,250,0.5)", fontSize: "0.7rem", flexShrink: 0, marginTop: 2 }}>›</span>
                            <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{alt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
