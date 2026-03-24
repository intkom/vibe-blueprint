"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  { text: "Ankit just ran an analysis on his SaaS idea", time: "2m ago" },
  { text: "Sarah spotted 3 critical risks before shipping", time: "5m ago" },
  { text: "Marcus used the execution path to ship in 12 days", time: "11m ago" },
  { text: "Priya shared her analysis — 78 health score", time: "18m ago" },
  { text: "Tom validated his fintech idea before building", time: "24m ago" },
  { text: "47 builders upgraded to Pro this week", time: "1h ago" },
  { text: "Luna identified her ICP profile in under 30s", time: "2h ago" },
  { text: "Dev studio ran 12 analyses for their client pitch", time: "3h ago" },
];

export function SocialProofTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const msg = MESSAGES[idx];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "rgba(139,92,246,0.06)",
      border: "1px solid rgba(139,92,246,0.15)",
      borderRadius: 9999,
      padding: "7px 16px",
      width: "fit-content",
      margin: "0 auto",
      overflow: "hidden",
      maxWidth: "100%",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "#34d399", flexShrink: 0,
        boxShadow: "0 0 6px rgba(52,211,153,0.7)",
        animation: "pulseGlow 1.5s ease-in-out infinite",
      }} />
      <span style={{
        fontSize: "0.75rem",
        color: "rgba(255,255,255,0.45)",
        fontWeight: 500,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {msg.text}
      </span>
      <span style={{
        fontSize: "0.68rem",
        color: "rgba(255,255,255,0.22)",
        flexShrink: 0,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}>
        {msg.time}
      </span>
    </div>
  );
}
