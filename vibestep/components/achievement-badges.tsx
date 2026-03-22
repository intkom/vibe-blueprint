"use client";

import { useEffect, useState } from "react";
import { getUnlockedAchievements, ACHIEVEMENTS, type AchievementId } from "@/lib/achievements";

const ALL_ACHIEVEMENTS: AchievementId[] = ["first_step", "halfway", "shipped", "speed_builder"];

export function AchievementBadges() {
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUnlocked(getUnlockedAchievements());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "20px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{
          fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: 0,
        }}>
          Achievements
        </p>
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
          {unlocked.length}/{ALL_ACHIEVEMENTS.length} unlocked
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        {ALL_ACHIEVEMENTS.map(id => {
          const ach = ACHIEVEMENTS[id];
          const isUnlocked = unlocked.includes(id);
          return (
            <div
              key={id}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 12,
                background: isUnlocked ? `${ach.color}10` : "rgba(255,255,255,0.02)",
                border: `1px solid ${isUnlocked ? `${ach.color}30` : "rgba(255,255,255,0.06)"}`,
                opacity: isUnlocked ? 1 : 0.45,
                transition: "all 0.2s ease",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: isUnlocked ? `${ach.color}18` : "rgba(255,255,255,0.04)",
                border: `1px solid ${isUnlocked ? `${ach.color}30` : "rgba(255,255,255,0.08)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isUnlocked ? "1.1rem" : "0.9rem",
                filter: isUnlocked ? "none" : "grayscale(1)",
              }}>
                {isUnlocked ? ach.emoji : "🔒"}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: isUnlocked ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)", margin: "0 0 2px" }}>
                  {ach.title}
                </p>
                <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", margin: 0, lineHeight: 1.4 }}>
                  {ach.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {unlocked.length === 0 && (
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.2)", margin: "8px 0 0", textAlign: "center" }}>
          Complete build steps to unlock achievements 🎯
        </p>
      )}
    </div>
  );
}
