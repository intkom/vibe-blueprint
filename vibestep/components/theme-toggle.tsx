"use client";

import { useTheme } from "@/lib/theme-context";

function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 34, height: 34, borderRadius: 9,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(124,58,237,0.1)",
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(124,58,237,0.3)",
        cursor: "pointer",
        color: isDark ? "rgba(255,255,255,0.4)" : "#7c3aed",
        transition: "all 0.18s ease",
      }}
    >
      {isDark ? <IconSun /> : <IconMoon />}
    </button>
  );
}
