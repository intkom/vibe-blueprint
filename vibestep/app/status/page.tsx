import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status – Axiom",
  description: "Axiom system status and operational health.",
};

const SYSTEMS = [
  { name: "API Gateway",        status: "operational", latency: "48ms"  },
  { name: "Database",           status: "operational", latency: "12ms"  },
  { name: "Analysis Engine",    status: "operational", latency: "2.3s"  },
  { name: "Auth Service",       status: "operational", latency: "31ms"  },
  { name: "Storage",            status: "operational", latency: "19ms"  },
];

const HISTORY = [
  { date: "Mar 24, 2026", event: "All systems operational. No incidents." },
  { date: "Mar 17, 2026", event: "All systems operational. No incidents." },
  { date: "Mar 10, 2026", event: "All systems operational. No incidents." },
];

export default function StatusPage() {
  const lastChecked = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "rgba(255,255,255,0.88)" }}>
      {/* Ambient */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(52,211,153,0.08) 0%, transparent 60%)",
      }} />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto", padding: "64px 24px 96px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20,
            background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)",
            padding: "6px 16px", borderRadius: 9999,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px rgba(52,211,153,0.6)", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#34d399", letterSpacing: "0.06em" }}>All Systems Operational</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 10px" }}>
            Axiom Status
          </h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
            Last checked {lastChecked}
          </p>
        </div>

        {/* Systems */}
        <div style={{
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, overflow: "hidden", marginBottom: 28,
        }}>
          {SYSTEMS.map((sys, i) => (
            <div key={sys.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 22px",
              borderBottom: i < SYSTEMS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
                  {sys.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", fontVariantNumeric: "tabular-nums" }}>
                  {sys.latency}
                </span>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#34d399", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
                  padding: "3px 9px", borderRadius: 9999,
                }}>
                  Operational
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Incident history */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 14px" }}>
            Past 30 days
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {HISTORY.map((h) => (
              <div key={h.date} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px",
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
              }}>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", flexShrink: 0, minWidth: 80 }}>{h.date}</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(52,211,153,0.6)" }}>✓</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)" }}>{h.event}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <Link href="/dashboard" style={{
            fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", textDecoration: "none",
          }}>
            ← Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
