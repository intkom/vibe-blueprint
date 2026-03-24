"use client";

import { useEffect, useRef, useState } from "react";

const BASE = 147;
const MAX_EXTRA = 30;

export function LiveCounter() {
  const [count, setCount] = useState(BASE);
  const [flash, setFlash] = useState(false);
  const extra = useRef(Math.floor(Math.random() * 8));

  useEffect(() => {
    setCount(BASE + extra.current);

    const tick = () => {
      const delay = 4000 + Math.random() * 9000;
      return setTimeout(() => {
        extra.current = Math.min(extra.current + 1, MAX_EXTRA);
        setCount(BASE + extra.current);
        setFlash(true);
        setTimeout(() => setFlash(false), 600);
        timer = tick();
      }, delay);
    };

    let timer = tick();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)",
      backdropFilter: "blur(12px)",
      borderRadius: 9999, padding: "9px 20px",
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: "#34d399", flexShrink: 0,
        boxShadow: "0 0 8px rgba(52,211,153,0.8)",
        animation: "pulseGlow 2s ease-in-out infinite",
      }} />
      <span style={{
        fontSize: "0.88rem", fontWeight: 700,
        color: flash ? "#34d399" : "rgba(255,255,255,0.65)",
        transition: "color 0.3s ease",
      }}>
        <span style={{
          fontVariantNumeric: "tabular-nums",
          color: "#34d399", fontWeight: 900,
          transition: "all 0.3s ease",
          display: "inline-block",
          transform: flash ? "scale(1.1)" : "scale(1)",
        }}>
          {count}
        </span>
        {" "}analyses run today
      </span>
    </div>
  );
}
