"use client";

import { useEffect, useState } from "react";

const EVENTS = [
  { user: "Marcus K.",  action: "validated",       thing: "'AI writing assistant'",  time: "just now",  color: "#a78bfa" },
  { user: "Sarah A.",   action: "completed step",   thing: "Auth & user onboarding",  time: "1 min ago", color: "#60a5fa" },
  { user: "Thiago D.",  action: "generated",        thing: "SaaS billing blueprint",  time: "2 min ago", color: "#34d399" },
  { user: "Priya L.",   action: "forked",           thing: "AI Chrome Extension",     time: "3 min ago", color: "#ec4899" },
  { user: "Jakub R.",   action: "completed step",   thing: "Stripe integration",      time: "4 min ago", color: "#fbbf24" },
  { user: "Alex O.",    action: "validated",        thing: "'B2B analytics tool'",    time: "5 min ago", color: "#a78bfa" },
  { user: "Kira L.",    action: "generated",        thing: "Mobile app blueprint",    time: "6 min ago", color: "#34d399" },
  { user: "Nate B.",    action: "completed step",   thing: "Deploy to Vercel",        time: "8 min ago", color: "#60a5fa" },
  { user: "Fatima M.",  action: "validated",        thing: "'EdTech platform'",       time: "9 min ago", color: "#fb923c" },
  { user: "Lucas Z.",   action: "generated",        thing: "E-commerce blueprint",    time: "11 min ago", color: "#a78bfa" },
];

const ACTION_ICONS: Record<string, string> = {
  "validated":     "✓",
  "completed step":"⚡",
  "generated":     "✨",
  "forked":        "↗",
};

export function ActivityFeed() {
  const [visible, setVisible] = useState<typeof EVENTS>([]);
  const [pointer, setPointer] = useState(0);

  useEffect(() => {
    // Seed with 3 initial entries (reversed = newest first)
    setVisible(EVENTS.slice(0, 3).reverse());
    setPointer(3);
  }, []);

  useEffect(() => {
    if (pointer === 0) return; // not seeded yet
    const delay = 5000 + Math.random() * 6000;
    const timer = setTimeout(() => {
      const next = EVENTS[pointer % EVENTS.length];
      setVisible(prev => [next, ...prev].slice(0, 5));
      setPointer(p => p + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [pointer]);

  if (visible.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 420 }}>
      {visible.map((ev, i) => (
        <div
          key={`${ev.user}-${i}`}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
            borderRadius: 10, padding: "9px 14px",
            animation: i === 0 ? "fadeInUp 0.35s ease both" : "none",
            opacity: 1 - i * 0.15,
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: `${ev.color}22`, border: `1px solid ${ev.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 800, color: ev.color,
          }}>
            {ev.user[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{ev.user}</span>
              {" "}{ev.action}{" "}
              <span style={{ color: ev.color, fontWeight: 600 }}>{ev.thing}</span>
            </p>
          </div>
          <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", flexShrink: 0, whiteSpace: "nowrap" }}>
            {i === 0 && pointer > 3 ? "just now" : ev.time}
          </span>
        </div>
      ))}
    </div>
  );
}
