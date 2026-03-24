"use client";

import { useState } from "react";

interface ShareBarProps {
  projectId: string;
  projectTitle: string;
  healthScore?: number;
}

export function ShareBar({ projectId, projectTitle, healthScore }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${projectId}`;
  const scoreText = healthScore != null ? ` (health score: ${healthScore}/100)` : "";
  const tweetText = encodeURIComponent(
    `Just analyzed my build idea with @AxiomBuild${scoreText} — got a full risk breakdown, architecture plan, and execution path in 30 seconds.\n\nTry it free: ${shareUrl}`
  );
  const linkedInText = encodeURIComponent(
    `I ran my product idea "${projectTitle}" through Axiom and got a full analysis${scoreText} — risk areas, architecture insights, ICP profile, and an execution path.\n\n${shareUrl}`
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  const buttons = [
    {
      label: "Share on X",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${tweetText}`,
      bg: "rgba(0,0,0,0.4)",
      border: "rgba(255,255,255,0.12)",
      color: "rgba(255,255,255,0.7)",
    },
    {
      label: "Share on LinkedIn",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${linkedInText}`,
      bg: "rgba(10,102,194,0.12)",
      border: "rgba(10,102,194,0.3)",
      color: "rgba(147,197,253,0.8)",
    },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
    }}>
      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginRight: 4 }}>
        Share
      </span>
      {buttons.map(btn => (
        <a
          key={btn.label}
          href={btn.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: btn.bg, border: `1px solid ${btn.border}`,
            color: btn.color,
            padding: "6px 12px", borderRadius: 8,
            fontSize: "0.75rem", fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.75"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
        >
          {btn.icon}
          {btn.label}
        </a>
      ))}
      <button
        onClick={copyLink}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: copied ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
          color: copied ? "#34d399" : "rgba(255,255,255,0.45)",
          padding: "6px 12px", borderRadius: 8,
          fontSize: "0.75rem", fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {copied ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Copied
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
