"use client";

import { useState, useEffect, useRef } from "react";

function storageKey(stepId: string) {
  return `vibestep_time_${stepId}`;
}

export function getStoredStepSeconds(stepId: string): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(storageKey(stepId)) ?? "0", 10) || 0;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function StepTimer({ stepId, size = "md" }: { stepId: string; size?: "sm" | "md" }) {
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const accumulatedRef = useRef(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    // Load accumulated time from localStorage
    const saved = parseInt(localStorage.getItem(storageKey(stepId)) ?? "0", 10) || 0;
    accumulatedRef.current = saved;
    setDisplaySeconds(saved);

    // Start counting
    startRef.current = Date.now();

    const interval = setInterval(() => {
      if (startRef.current !== null) {
        const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
        setDisplaySeconds(accumulatedRef.current + elapsed);
      }
    }, 1000);

    function currentTotal() {
      const elapsed = startRef.current !== null
        ? Math.floor((Date.now() - startRef.current) / 1000)
        : 0;
      return accumulatedRef.current + elapsed;
    }

    function save() {
      const total = currentTotal();
      localStorage.setItem(storageKey(stepId), String(total));
    }

    function onVisibilityChange() {
      if (document.hidden) {
        // Pause: save current total and reset accumulated
        const total = currentTotal();
        accumulatedRef.current = total;
        startRef.current = null;
        localStorage.setItem(storageKey(stepId), String(total));
      } else {
        // Resume: restart the clock
        startRef.current = Date.now();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", save);

    return () => {
      save();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", save);
    };
  }, [stepId]);

  const isSmall = size === "sm";

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "rgba(139,92,246,0.08)",
      border: "1px solid rgba(139,92,246,0.2)",
      borderRadius: 20, padding: isSmall ? "3px 10px" : "4px 12px",
    }}>
      <svg
        width={isSmall ? 10 : 12} height={isSmall ? 10 : 12}
        viewBox="0 0 24 24" fill="none" stroke="#a78bfa"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span style={{
        fontSize: isSmall ? "0.65rem" : "0.75rem",
        fontWeight: 700, color: "#a78bfa",
        fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em",
      }}>
        {formatTime(displaySeconds)}
      </span>
    </div>
  );
}
