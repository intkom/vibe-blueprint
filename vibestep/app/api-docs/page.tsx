import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation – Axiom",
  description: "Use the Axiom API to run product analyses programmatically.",
};

const CODE_EXAMPLE = `curl -X POST https://axiom.build/api/public/analyze \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"idea": "A B2B SaaS for e-commerce brands..."}'`;

const RESPONSE_EXAMPLE = `{
  "title": "E-commerce Cart Recovery SaaS",
  "health_score": 74,
  "health_label": "Strong",
  "summary": "...",
  "risk_areas": [...],
  "execution_path": [...],
  "icp_profile": {...},
  ...
}`;

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/public/analyze",
    description: "Analyze a product idea. Returns full analysis JSON.",
    auth: true,
    rateLimit: "10 req/hour",
  },
];

const FIELDS = [
  { field: "idea", type: "string", required: true, description: "Your product idea (min 20 chars, max 2000 chars)" },
];

export default function ApiDocsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "rgba(255,255,255,0.88)", fontFamily: "inherit" }}>

      {/* Ambient */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 50% 30% at 50% -5%, rgba(124,58,237,0.16) 0%, transparent 60%)",
      }} />

      {/* Nav */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "white",
          }}>A</div>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>Axiom</span>
        </Link>
        <span style={{
          fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "rgba(167,139,250,0.6)",
          background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
          padding: "4px 10px", borderRadius: 9999,
        }}>
          API Docs
        </span>
      </nav>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "56px 28px 96px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.035em", margin: "0 0 12px" }}>
            Axiom Public API
          </h1>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.7, margin: 0 }}>
            Run product analyses programmatically. Integrate Axiom intelligence into your tools, pipelines, and workflows.
          </p>
        </div>

        {/* Getting started */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px", color: "rgba(255,255,255,0.85)" }}>
            Authentication
          </h2>
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "18px 22px", marginBottom: 16,
          }}>
            <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>
              Include your API key in the <code style={{ color: "#a78bfa", background: "rgba(139,92,246,0.12)", padding: "1px 5px", borderRadius: 4, fontSize: "0.85em" }}>Authorization</code> header as a Bearer token.
            </p>
          </div>
          <div style={{
            background: "#0a0520", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#f87171","#fbbf24","#34d399"].map((c,i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.4 }} />
                ))}
              </div>
              <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>bash</span>
            </div>
            <pre style={{
              padding: "18px 20px", margin: 0, overflow: "auto",
              fontSize: "0.8rem", lineHeight: 1.7,
              color: "rgba(167,139,250,0.8)",
              fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
            }}>
              {CODE_EXAMPLE}
            </pre>
          </div>
        </section>

        {/* Endpoints */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px", color: "rgba(255,255,255,0.85)" }}>
            Endpoints
          </h2>
          {ENDPOINTS.map(ep => (
            <div key={ep.path} style={{
              background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.18)",
              borderRadius: 14, padding: "20px 22px", marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em",
                  background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
                  color: "#34d399", padding: "3px 9px", borderRadius: 6,
                }}>{ep.method}</span>
                <code style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", fontFamily: "'Geist Mono', monospace" }}>
                  {ep.path}
                </code>
                <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)" }}>
                  {ep.rateLimit}
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                {ep.description}
              </p>
            </div>
          ))}
        </section>

        {/* Request parameters */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px", color: "rgba(255,255,255,0.85)" }}>
            Request body
          </h2>
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, overflow: "hidden",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 80px 1fr",
              padding: "10px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
            }}>
              <span>Field</span><span>Type</span><span>Required</span><span>Description</span>
            </div>
            {FIELDS.map(f => (
              <div key={f.field} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 80px 1fr",
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontSize: "0.83rem", alignItems: "start",
              }}>
                <code style={{ color: "#a78bfa", fontFamily: "monospace" }}>{f.field}</code>
                <span style={{ color: "rgba(255,255,255,0.35)" }}>{f.type}</span>
                <span style={{ color: f.required ? "#34d399" : "rgba(255,255,255,0.25)" }}>
                  {f.required ? "Yes" : "No"}
                </span>
                <span style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{f.description}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Response */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px", color: "rgba(255,255,255,0.85)" }}>
            Response
          </h2>
          <div style={{
            background: "#0a0520", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#f87171","#fbbf24","#34d399"].map((c,i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.4 }} />
                ))}
              </div>
              <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>json</span>
            </div>
            <pre style={{
              padding: "18px 20px", margin: 0, overflow: "auto",
              fontSize: "0.8rem", lineHeight: 1.7,
              color: "rgba(167,139,250,0.8)",
              fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
            }}>
              {RESPONSE_EXAMPLE}
            </pre>
          </div>
        </section>

        {/* Rate limits & CTA */}
        <div style={{
          background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16, padding: "24px 24px", textAlign: "center",
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 8px" }}>
            Get your API key
          </h3>
          <p style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.38)", margin: "0 0 18px" }}>
            API access is available on the Pro plan. Free tier coming soon.
          </p>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
            border: "1px solid rgba(139,92,246,0.5)",
            color: "white", padding: "11px 24px", borderRadius: 10,
            fontSize: "0.875rem", fontWeight: 700, textDecoration: "none",
          }}>
            Join the waitlist →
          </Link>
        </div>
      </div>
    </div>
  );
}
