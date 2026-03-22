import { AppHeader } from "@/components/app-header";
import { IdeaValidatorForm } from "@/components/idea-validator-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Idea Validator – VibeStep",
  description: "Get a brutally honest AI analysis of your startup idea — market size, competitors, risks, and a go/no-go verdict in 15 seconds.",
};

export default function ValidatePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "white", position: "relative", overflow: "hidden" }}>

      {/* Gradient mesh */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 65% 50% at 85% -10%, rgba(124,58,237,0.2) 0%, transparent 60%)",
          "radial-gradient(ellipse 45% 35% at 10% 80%, rgba(52,211,153,0.07) 0%, transparent 55%)",
          "#030014",
        ].join(","),
      }} />

      <AppHeader />

      <main style={{
        position: "relative", zIndex: 10,
        maxWidth: 760, margin: "0 auto", padding: "48px 24px 100px",
      }}>
        {/* ── Hero ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{
              fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em",
              textTransform: "uppercase",
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              color: "#a78bfa", padding: "4px 12px", borderRadius: 9999,
            }}>
              AI-Powered
            </span>
            <span style={{
              fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
              color: "#fbbf24", padding: "4px 12px", borderRadius: 9999,
            }}>
              15 second verdict
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: 900, letterSpacing: "-0.03em",
            margin: "0 0 12px",
            background: "linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,255,255,0.6))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Should you build it?
          </h1>

          <p style={{
            fontSize: "0.95rem", color: "rgba(255,255,255,0.38)",
            lineHeight: 1.7, margin: 0, maxWidth: 560,
          }}>
            Paste your idea. Get market size, top competitors, your unique angle,
            the biggest risk, and a brutally honest verdict — all in under 15 seconds.
          </p>
        </div>

        {/* ── What you get ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 8, marginBottom: 28,
        }}>
          {[
            { icon: "📊", label: "Market size estimate" },
            { icon: "⚔️", label: "Top 3 competitors" },
            { icon: "🎯", label: "Your unique angle" },
            { icon: "⚠️", label: "Biggest risk" },
            { icon: "🏁", label: "Build / Pivot / Skip" },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, padding: "10px 12px",
            }}>
              <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Form ── */}
        <IdeaValidatorForm />
      </main>
    </div>
  );
}
