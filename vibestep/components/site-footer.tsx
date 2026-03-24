"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = {
  Product: [
    { label: "Dashboard",  href: "/dashboard" },
    { label: "Analyze",    href: "/create" },
    { label: "Templates",  href: "/templates" },
    { label: "Validate",   href: "/validate" },
    { label: "Status",     href: "/status" },
  ],
  Resources: [
    { label: "How it works", href: "/#demo" },
    { label: "Pricing",      href: "/#pricing" },
    { label: "FAQ",          href: "/#faq" },
    { label: "Changelog",    href: "#" },
  ],
  Company: [
    { label: "About",    href: "#" },
    { label: "Twitter",  href: "#" },
    { label: "GitHub",   href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms",   href: "/terms" },
  ],
};

const SOCIALS = [
  {
    label: "Twitter / X",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMsg(data.message ?? "You're in. Welcome to the build.");
        setEmail("");
      } else {
        setStatus("error");
        setMsg(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Try again.");
    }
  }

  return (
    <footer style={{
      position: "relative", zIndex: 10,
      borderTop: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(3,0,20,0.85)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    }}>
      {/* Newsletter strip */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "44px 2rem" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 40, flexWrap: "wrap",
        }}>
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(167,139,250,0.5)", marginBottom: 8 }}>
              Build Intelligence Weekly
            </p>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.02em", margin: "0 0 5px" }}>
              Get weekly build intelligence
            </h3>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>
              Join{" "}
              <span style={{ color: "rgba(167,139,250,0.65)", fontWeight: 600 }}>1,247 builders</span>
              {" "}getting risk patterns, stack picks, and real analysis examples.
            </p>
          </div>
          <div>
            {status === "done" ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.22)",
                borderRadius: 10, padding: "11px 20px",
                fontSize: "0.875rem", color: "#34d399", fontWeight: 600,
              }}>
                ✓ {msg}
              </div>
            ) : (
              <form onSubmit={subscribe} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, padding: "10px 16px",
                    fontSize: "0.875rem", color: "rgba(255,255,255,0.8)",
                    outline: "none", width: 230, fontFamily: "inherit",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(139,92,246,0.45)"; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    border: "1px solid rgba(139,92,246,0.4)",
                    color: "white", padding: "10px 20px", borderRadius: 10,
                    fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s ease", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 22px rgba(139,92,246,0.4)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                >
                  {status === "loading" ? "Subscribing…" : "Subscribe →"}
                </button>
              </form>
            )}
            {status === "error" && (
              <p style={{ fontSize: "0.75rem", color: "#f87171", margin: "8px 0 0" }}>{msg}</p>
            )}
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 2rem 28px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px,2fr) repeat(4,1fr)",
          gap: 32, marginBottom: 44,
        }}>
          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: "white",
                boxShadow: "0 0 14px rgba(139,92,246,0.4)",
              }}>A</div>
              <span style={{ fontSize: "1rem", fontWeight: 800, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.02em" }}>Axiom</span>
            </div>
            <p style={{ fontSize: "0.81rem", color: "rgba(255,255,255,0.26)", lineHeight: 1.65, margin: "0 0 18px", maxWidth: 210 }}>
              Structured product intelligence for indie hackers and AI builders.
            </p>
            <div style={{ display: "flex", gap: 7 }}>
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.32)", textDecoration: "none",
                    transition: "all 0.14s ease",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = "rgba(139,92,246,0.12)";
                    el.style.borderColor = "rgba(139,92,246,0.28)";
                    el.style.color = "#a78bfa";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = "rgba(255,255,255,0.04)";
                    el.style.borderColor = "rgba(255,255,255,0.08)";
                    el.style.color = "rgba(255,255,255,0.32)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([cat, items]) => (
            <div key={cat}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>
                {cat}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {items.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      fontSize: "0.84rem", color: "rgba(255,255,255,0.36)",
                      textDecoration: "none", transition: "color 0.13s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.72)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.36)"; }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 22,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.18)", margin: 0 }}>
            © 2026 Axiom. Built with{" "}
            <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(167,139,250,0.4)", textDecoration: "none" }}>
              Anthropic Claude
            </a>.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {[{ l: "Privacy", h: "/privacy" }, { l: "Terms", h: "/terms" }, { l: "Status", h: "/status" }].map(x => (
              <Link key={x.l} href={x.h} style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.18)", textDecoration: "none" }}>
                {x.l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
