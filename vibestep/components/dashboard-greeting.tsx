"use client";

import { useMemo } from "react";
import Link from "next/link";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "Good night";
}

export function DashboardGreeting({
  name,
  totalProjects,
  inProgressCount,
}: {
  name: string;
  totalProjects: number;
  inProgressCount: number;
}) {
  const greeting = useMemo(() => getGreeting(), []);

  const subtitle = useMemo(() => {
    if (totalProjects === 0) return "Ready to build your first idea?";
    if (inProgressCount === 0) return "All projects completed. Start something new!";
    if (inProgressCount === 1) return "You have 1 idea in progress.";
    return `You have ${inProgressCount} ideas in progress.`;
  }, [totalProjects, inProgressCount]);

  return (
    <div style={{
      display: "flex", alignItems: "flex-start",
      justifyContent: "space-between", gap: 20, flexWrap: "wrap",
    }}>
      <div>
        <h1 style={{
          fontSize: "1.75rem", fontWeight: 800,
          letterSpacing: "-0.03em", margin: "0 0 6px",
          color: "rgba(255,255,255,0.95)",
          lineHeight: 1.15,
        }}>
          {greeting}, {name} 👋
        </h1>
        <p style={{
          fontSize: "0.9rem", color: "rgba(255,255,255,0.38)",
          margin: 0, fontWeight: 400,
        }}>
          {subtitle}
        </p>
      </div>

      <Link href="/create" style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        border: "1px solid rgba(139,92,246,0.5)",
        color: "white", padding: "10px 20px", borderRadius: 10,
        fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
        boxShadow: "0 0 28px rgba(139,92,246,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
        whiteSpace: "nowrap", flexShrink: 0,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 36px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.1)";
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 28px rgba(139,92,246,0.28), inset 0 1px 0 rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
      }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        New idea
      </Link>
    </div>
  );
}
