import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { StepCard } from "@/components/step-card";
import { AppHeader } from "@/components/app-header";
import { ExportStepsButton } from "@/components/export-steps-button";
import { ShareButton } from "@/components/share-button";
import { ConfettiBurst } from "@/components/confetti-burst";
import { deserializeMeta, type Warning, type StackRecommendation } from "@/lib/generate-build-steps";
import { AIChatPanel } from "@/components/ai-chat-panel";
import {
  deserializeToolOutput, isToolType,
  type ValidatorOutput, type StackOutput, type MonetizationOutput,
} from "@/lib/tools";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("title")
    .eq("id", id)
    .single();
  const title = project?.title?.trim() || "Project";
  return {
    title: `${title} – VibeStep`,
    description: `Build plan and blueprint for: ${title}`,
  };
}

/* ── Phase config ─────────────────────────────────────── */
const PHASE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  discover: { bg: "rgba(96,165,250,0.08)",  text: "#60a5fa", border: "rgba(96,165,250,0.25)",  label: "Discover"  },
  define:   { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.25)",  label: "Define"    },
  design:   { bg: "rgba(236,72,153,0.08)",  text: "#ec4899", border: "rgba(236,72,153,0.25)",  label: "Design"    },
  build:    { bg: "rgba(139,92,246,0.08)",  text: "#a78bfa", border: "rgba(139,92,246,0.25)",  label: "Build"     },
  launch:   { bg: "rgba(52,211,153,0.08)",  text: "#34d399", border: "rgba(52,211,153,0.25)",  label: "Launch"    },
  reflect:  { bg: "rgba(248,113,113,0.08)", text: "#f87171", border: "rgba(248,113,113,0.25)", label: "Reflect"   },
};

const STACK_LABELS: Record<keyof StackRecommendation, string> = {
  frontend: "Frontend", backend: "Backend", database: "Database",
  auth: "Auth", payments: "Payments", hosting: "Hosting",
};

const VERDICT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "STRONG BUILD":         { bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.35)",  text: "#34d399" },
  "BUILD WITH CONDITIONS":{ bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.35)",  text: "#fbbf24" },
  "VALIDATE FURTHER":     { bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.35)",  text: "#fb923c" },
  "DO NOT BUILD":         { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.3)",    text: "#f87171" },
};

const TOOL_CHAIN: Partial<Record<string, { label: string; type: string; color: string; beam: string }>> = {
  validator:   { label: "Tech Blueprint",    type: "stack",        color: "#a78bfa", beam: "linear-gradient(90deg,transparent,rgba(139,92,246,0.6),transparent)" },
  stack:       { label: "Monetization Map",  type: "monetization", color: "#34d399", beam: "linear-gradient(90deg,transparent,rgba(52,211,153,0.6),transparent)" },
  monetization:{ label: "Sprint Planner",    type: "sprint",       color: "#60a5fa", beam: "linear-gradient(90deg,transparent,rgba(96,165,250,0.6),transparent)"  },
};

/* ── SVG Icons ─────────────────────────────────────────── */
function IconWarning() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}
function IconStack() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2Z" /><path d="M12 22v-6.5M22 8.5l-10 7-10-7" />
    </svg>
  );
}
function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7M5 12h14" />
    </svg>
  );
}
/* ── Shared section wrapper ─────────────────────────────── */
function Section({ beam, children }: { beam?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(10,6,30,0.7)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(139,92,246,0.15)",
      borderRadius: 20, overflow: "hidden",
      boxShadow: "0 0 40px rgba(139,92,246,0.05)",
      position: "relative", marginBottom: 16,
    }}>
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "60%", height: 1,
        background: beam ?? "linear-gradient(90deg,transparent,rgba(139,92,246,0.6),transparent)",
      }} />
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, sub, iconBg, iconColor }: {
  icon: React.ReactNode; title: string; sub: string; iconBg: string; iconColor: string;
}) {
  return (
    <div style={{
      padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: iconBg, display: "flex", alignItems: "center", justifyContent: "center",
        color: iconColor, boxShadow: `0 0 14px ${iconColor}44`,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "rgba(255,255,255,0.9)", margin: 0 }}>{title}</p>
        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>{sub}</p>
      </div>
    </div>
  );
}

/* ── Score bar ──────────────────────────────────────────── */
function ScoreBar({ score }: { score: number }) {
  const color = score >= 7 ? "#34d399" : score >= 5 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <div style={{ width: 72, height: 5, borderRadius: 9999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 9999, width: `${score * 10}%`,
          background: color, boxShadow: `0 0 6px ${color}88`,
        }} />
      </div>
      <span style={{ fontSize: "0.8rem", fontWeight: 700, color, minWidth: 18, textAlign: "right" }}>{score}</span>
    </div>
  );
}

/* ── Validator renderer ─────────────────────────────────── */
function ValidatorView({ output }: { output: ValidatorOutput }) {
  const vc = VERDICT_COLORS[output.verdict] ?? VERDICT_COLORS["VALIDATE FURTHER"];

  return (
    <>
      {/* Dimensions */}
      <Section beam="linear-gradient(90deg,transparent,rgba(251,191,36,0.6),transparent)">
        <SectionHeader
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
          title="7-Dimension Scorecard"
          sub="Honest scoring — no cheerleading"
          iconBg="linear-gradient(135deg,#d97706,#f59e0b)"
          iconColor="#fbbf24"
        />
        <div style={{ padding: "8px 0" }}>
          {output.dimensions.map((dim, i) => (
            <div key={dim.name} style={{
              display: "flex", alignItems: "flex-start", gap: 16,
              padding: "14px 24px",
              borderBottom: i < output.dimensions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>{dim.name}</span>
                  <ScoreBar score={dim.score} />
                </div>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.55 }}>{dim.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Verdict */}
      <div style={{
        background: vc.bg, border: `1px solid ${vc.border}`,
        borderRadius: 20, padding: "24px 28px", marginBottom: 16,
        position: "relative", overflow: "hidden",
      }}>
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "60%", height: 1, background: `linear-gradient(90deg,transparent,${vc.text}88,transparent)`,
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{
            fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
            background: vc.bg, border: `1px solid ${vc.border}`,
            color: vc.text, padding: "4px 12px", borderRadius: 9999,
          }}>
            Verdict
          </span>
          <span style={{ fontSize: "1.1rem", fontWeight: 900, color: vc.text, letterSpacing: "-0.01em" }}>
            {output.verdict}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          {[
            { label: "Kill risk", value: output.kill_risk },
            { label: "Proceed if", value: output.proceed_if },
            { label: "Next action", value: output.next_action },
          ].map(item => (
            <div key={item.label} style={{
              background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: "12px 14px",
              border: `1px solid ${vc.border}44`,
            }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: `${vc.text}88`, margin: "0 0 5px" }}>
                {item.label}
              </p>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.55 }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Stack tool renderer ────────────────────────────────── */
function StackToolView({ output }: { output: StackOutput }) {
  return (
    <>
      {/* Layers */}
      <Section beam="linear-gradient(90deg,transparent,rgba(139,92,246,0.65),rgba(236,72,153,0.35),transparent)">
        <SectionHeader
          icon={<IconStack />}
          title="Stack Layers"
          sub="One pick per layer — with reasons and what to skip"
          iconBg="linear-gradient(135deg,#7c3aed,#5b21b6)"
          iconColor="#a78bfa"
        />
        <div style={{ padding: "8px 0" }}>
          {output.layers.map((layer, i) => (
            <div key={layer.layer} style={{
              display: "flex", alignItems: "flex-start", gap: 16,
              padding: "14px 24px",
              borderBottom: i < output.layers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <div style={{
                fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(139,92,246,0.6)", minWidth: 76, paddingTop: 3, flexShrink: 0,
              }}>
                {layer.layer}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{layer.pick}</span>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: "3px 0 0", lineHeight: 1.55 }}>{layer.reason}</p>
              </div>
              <div style={{
                fontSize: "0.72rem", color: "rgba(248,113,113,0.6)", flexShrink: 0,
                maxWidth: 160, textAlign: "right", lineHeight: 1.4, paddingTop: 3,
              }}>
                Skip: {layer.skip}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Decisions now + Defer */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 16 }}>
        {/* Decisions Now */}
        <Section beam="linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)">
          <SectionHeader
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
            title="Decide Now"
            sub="3 architectural choices before writing code"
            iconBg="rgba(251,191,36,0.15)"
            iconColor="#fbbf24"
          />
          <div style={{ padding: "8px 0" }}>
            {output.decisions_now.map((d, i) => (
              <div key={i} style={{
                padding: "14px 24px",
                borderBottom: i < output.decisions_now.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "rgba(255,255,255,0.88)", margin: "0 0 4px" }}>{d.decision}</p>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.55 }}>{d.how}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Defer */}
        <Section beam="linear-gradient(90deg,transparent,rgba(248,113,113,0.4),transparent)">
          <SectionHeader
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64A9 9 0 0 1 20.77 15"/><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"/><path d="m2 2 20 20"/></svg>}
            title="Defer These"
            sub="Temptations — add them when triggered"
            iconBg="rgba(248,113,113,0.12)"
            iconColor="#f87171"
          />
          <div style={{ padding: "8px 0" }}>
            {output.defer.map((d, i) => (
              <div key={i} style={{
                padding: "14px 24px",
                borderBottom: i < output.defer.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "rgba(248,113,113,0.8)", margin: "0 0 4px" }}>{d.item}</p>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.55 }}>When: {d.when}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Next action */}
      <div style={{
        background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: 14, padding: "16px 20px", marginBottom: 16,
      }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(167,139,250,0.5)", margin: "0 0 6px" }}>
          First action
        </p>
        <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.78)", margin: 0, lineHeight: 1.6, fontFamily: "monospace" }}>
          {output.next_action}
        </p>
      </div>
    </>
  );
}

/* ── Monetization renderer ──────────────────────────────── */
function MonetizationView({ output }: { output: MonetizationOutput }) {
  return (
    <>
      {/* Models */}
      <Section beam="linear-gradient(90deg,transparent,rgba(52,211,153,0.6),rgba(52,211,153,0.3),transparent)">
        <SectionHeader
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          title="Pricing Model Comparison"
          sub="4 models scored for your specific product"
          iconBg="linear-gradient(135deg,#059669,#34d399)"
          iconColor="#34d399"
        />
        <div style={{ padding: "8px 0" }}>
          {output.models.map((m, i) => {
            const isWinner = output.recommended.toLowerCase().includes(m.model.toLowerCase());
            return (
              <div key={m.model} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 24px",
                borderBottom: i < output.models.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: isWinner ? "rgba(52,211,153,0.04)" : "transparent",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: isWinner ? "#34d399" : "rgba(255,255,255,0.8)" }}>{m.model}</span>
                      {isWinner && (
                        <span style={{
                          fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                          background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)",
                          color: "#34d399", padding: "2px 7px", borderRadius: 9999,
                        }}>Recommended</span>
                      )}
                    </div>
                    <ScoreBar score={m.fit_score} />
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: "0 0 3px", lineHeight: 1.5 }}>{m.why}</p>
                  <p style={{ fontSize: "0.75rem", color: "rgba(248,113,113,0.5)", margin: 0, lineHeight: 1.4 }}>Risk: {m.risk}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Pricing tiers */}
      <Section beam="linear-gradient(90deg,transparent,rgba(52,211,153,0.4),transparent)">
        <SectionHeader
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>}
          title="Pricing Architecture"
          sub={`${output.recommended} · 4 tiers`}
          iconBg="rgba(52,211,153,0.12)"
          iconColor="#34d399"
        />
        <div style={{
          padding: "16px 24px",
          display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10,
        }}>
          {output.tiers.map(tier => (
            <div key={tier.name} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "16px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "rgba(255,255,255,0.88)" }}>{tier.name}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#34d399" }}>{tier.price}</span>
              </div>
              <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em", color: "rgba(52,211,153,0.5)", textTransform: "uppercase", margin: "0 0 6px" }}>
                {tier.purpose}
              </p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.55 }}>
                {tier.limits}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Upgrade triggers */}
      <Section beam="linear-gradient(90deg,transparent,rgba(251,146,60,0.4),transparent)">
        <SectionHeader
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
          title="Upgrade Triggers"
          sub="Exact UX moments that force payment"
          iconBg="rgba(251,146,60,0.12)"
          iconColor="#fb923c"
        />
        <div style={{ padding: "8px 0" }}>
          {output.upgrade_triggers.map((trigger, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "12px 24px",
              borderBottom: i < output.upgrade_triggers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "rgba(251,146,60,0.5)", flexShrink: 0, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                0{i + 1}
              </span>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.55 }}>{trigger}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Next action */}
      <div style={{
        background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.18)",
        borderRadius: 14, padding: "16px 20px", marginBottom: 16,
      }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(52,211,153,0.5)", margin: "0 0 6px" }}>
          Next pricing decision
        </p>
        <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.6 }}>
          {output.next_action}
        </p>
      </div>
    </>
  );
}

/* ── Tool-chain CTA ─────────────────────────────────────── */
function ToolChainCTA({ currentTool, rawIdea }: { currentTool: string; rawIdea: string }) {
  const next = TOOL_CHAIN[currentTool];
  if (!next) return null;
  const hint = rawIdea ? `?tool=${next.type}` : `?tool=${next.type}`;
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20, padding: "24px 28px", position: "relative", overflow: "hidden",
    }}>
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "50%", height: 1, background: next.beam,
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 5px" }}>
            Next step
          </p>
          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "rgba(255,255,255,0.82)", margin: 0 }}>
            Run the {next.label} on this idea
          </p>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", margin: "4px 0 0", lineHeight: 1.5 }}>
            Continue building your complete product plan
          </p>
        </div>
        <Link href={`/create${hint}`} style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.04)", border: `1px solid ${next.color}44`,
          color: next.color, padding: "10px 22px", borderRadius: 11,
          fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
          whiteSpace: "nowrap", flexShrink: 0,
          boxShadow: `0 0 20px ${next.color}22`,
        }}>
          {next.label} →
        </Link>
      </div>
    </div>
  );
}

/* ── Sprint: Stack Blueprint ────────────────────────────── */
function SprintStackBlueprint({ stack }: { stack: StackRecommendation }) {
  const layers = Object.entries(STACK_LABELS) as [keyof StackRecommendation, string][];
  return (
    <Section>
      <SectionHeader
        icon={<IconStack />}
        title="Tech Stack Blueprint"
        sub="Chosen specifically for your idea — with reasons"
        iconBg="linear-gradient(135deg,#7c3aed,#5b21b6)"
        iconColor="#c4b5fd"
      />
      <div style={{ padding: "8px 0" }}>
        {layers.map(([key, label], i) => {
          const value = stack[key];
          const dashIdx = value.indexOf(" — ");
          const tech = dashIdx !== -1 ? value.slice(0, dashIdx) : value;
          const reason = dashIdx !== -1 ? value.slice(dashIdx + 3) : null;
          return (
            <div key={key} style={{
              display: "flex", alignItems: "flex-start", gap: 16, padding: "14px 24px",
              borderBottom: i < layers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <div style={{
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(139,92,246,0.6)", minWidth: 72, paddingTop: 2, flexShrink: 0,
              }}>{label}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>{tech}</span>
                {reason && (
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", display: "block", marginTop: 2, lineHeight: 1.55 }}>
                    {reason}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ── Sprint: Dead-End Detector ──────────────────────────── */
function DeadEndDetector({ warnings }: { warnings: Warning[] }) {
  if (!warnings.length) return null;
  return (
    <div style={{
      background: "rgba(239,68,68,0.04)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(239,68,68,0.18)",
      borderRadius: 20, overflow: "hidden", position: "relative", marginBottom: 16,
    }}>
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "50%", height: 1, background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.5),transparent)",
      }} />
      <div style={{
        padding: "18px 24px", borderBottom: "1px solid rgba(239,68,68,0.1)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171",
        }}><IconWarning /></div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "rgba(255,255,255,0.9)", margin: 0 }}>Dead-End Detector</p>
          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>
            {warnings.length} critical failure {warnings.length === 1 ? "point" : "points"} for your specific idea
          </p>
        </div>
      </div>
      <div style={{ padding: "8px 0" }}>
        {warnings.map((w, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 24px",
            borderBottom: i < warnings.length - 1 ? "1px solid rgba(239,68,68,0.07)" : "none",
          }}>
            <div style={{
              fontSize: "0.7rem", fontWeight: 800, flexShrink: 0,
              color: "rgba(248,113,113,0.5)", marginTop: 1, fontVariantNumeric: "tabular-nums",
            }}>0{i + 1}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "rgba(248,113,113,0.9)", margin: "0 0 5px" }}>{w.title}</p>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.42)", margin: 0, lineHeight: 1.65 }}>{w.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────── */
export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, title, raw_idea")
    .eq("id", id).eq("user_id", user.id).single();

  if (projectError || !project) notFound();

  const { data: steps, error: stepsError } = await supabase
    .from("build_steps")
    .select("id, step_index, phase, title, objective, guidance, ai_output, status")
    .eq("project_id", id)
    .order("step_index", { ascending: true });

  if (stepsError) notFound();

  const stepsList = (steps ?? []) as {
    id: string; step_index: number; phase: string | null; title: string | null;
    objective: string | null; guidance: string | null; ai_output: string | null; status: string | null;
  }[];

  const step0 = stepsList.find(s => s.step_index === 0);
  const toolPhase = step0?.phase ?? null;
  const isTool = isToolType(toolPhase);
  const toolOutput = isTool ? deserializeToolOutput(step0?.ai_output ?? null) : null;

  // Sprint meta (stack + warnings)
  const meta = !isTool ? deserializeMeta(step0?.ai_output ?? null) : null;

  // Sprint progress (non-tool projects only)
  const sprintSteps = isTool ? [] : stepsList;
  const completedCount = sprintSteps.filter(s => s.status === "complete").length;
  const totalCount = sprintSteps.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = progressPct === 100 && totalCount > 0;

  // Tool type badge config
  const TOOL_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
    validator:   { label: "Idea Validator",   color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)"  },
    stack:       { label: "Tech Blueprint",   color: "#a78bfa", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.25)"  },
    monetization:{ label: "Monetization Map", color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.25)"  },
    sprint:      { label: "Sprint Planner",   color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.25)"  },
  };
  const toolBadge = toolPhase && TOOL_BADGE[toolPhase];

  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "white", position: "relative", overflow: "hidden" }}>

      {/* Gradient mesh */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 65% 50% at 75% -5%, rgba(124,58,237,0.16) 0%, transparent 60%)",
          "radial-gradient(ellipse 45% 35% at 10% 80%, rgba(96,165,250,0.07) 0%, transparent 55%)",
          "#030014",
        ].join(","),
      }} />

      <AppHeader />
      <ConfettiBurst trigger={isComplete} />

      <main style={{ position: "relative", zIndex: 10, maxWidth: 780, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Back link + actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: "0.82rem", color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
          }}>
            <IconArrowLeft />
            Back to dashboard
          </Link>
          <ShareButton />
        </div>

        {/* ── Project header ── */}
        <div style={{
          background: "rgba(10,6,30,0.7)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: isComplete ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,255,255,0.09)",
          borderRadius: 20, padding: "24px 26px", marginBottom: 20,
          position: "relative", overflow: "hidden",
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "50%", height: 1,
            background: isComplete
              ? "linear-gradient(90deg,transparent,rgba(52,211,153,0.6),transparent)"
              : "linear-gradient(90deg,transparent,rgba(139,92,246,0.5),transparent)",
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: isComplete ? "linear-gradient(135deg,#059669,#34d399)" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isComplete ? "0 0 20px rgba(52,211,153,0.4)" : "0 0 20px rgba(139,92,246,0.4)",
              fontSize: 18,
            }}>
              {isComplete ? "✓" : "✦"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <h1 style={{
                  fontSize: "1.3rem", fontWeight: 900, margin: 0,
                  color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em", lineHeight: 1.2,
                }}>
                  {project.title?.trim() || "Untitled"}
                </h1>
                {toolBadge && (
                  <span style={{
                    fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    background: toolBadge.bg, border: `1px solid ${toolBadge.border}`,
                    color: toolBadge.color, padding: "3px 9px", borderRadius: 9999, flexShrink: 0,
                  }}>
                    {toolBadge.label}
                  </span>
                )}
              </div>
              {project.raw_idea && (
                <p style={{
                  marginTop: 4, fontSize: "0.82rem", color: "rgba(255,255,255,0.35)",
                  lineHeight: 1.6, display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {project.raw_idea}
                </p>
              )}
            </div>
          </div>

          {/* Progress — sprint only */}
          {!isTool && totalCount > 0 && (
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                  Progress
                </span>
                <span style={{
                  fontSize: "0.8rem", fontWeight: 700,
                  color: isComplete ? "rgba(52,211,153,0.9)" : "rgba(167,139,250,0.8)",
                }}>
                  {completedCount}/{totalCount} steps · {progressPct}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 9999, width: `${progressPct}%`,
                  background: isComplete ? "linear-gradient(90deg,#059669,#34d399)" : "linear-gradient(90deg,#7c3aed,#a78bfa,#ec4899)",
                  boxShadow: isComplete ? "0 0 10px rgba(52,211,153,0.5)" : "0 0 10px rgba(139,92,246,0.5)",
                  transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Tool output renderers ── */}
        {isTool && toolOutput?.tool_type === "validator" && (
          <ValidatorView output={toolOutput as ValidatorOutput} />
        )}
        {isTool && toolOutput?.tool_type === "stack" && (
          <StackToolView output={toolOutput as StackOutput} />
        )}
        {isTool && toolOutput?.tool_type === "monetization" && (
          <MonetizationView output={toolOutput as MonetizationOutput} />
        )}

        {/* ── Sprint: Stack Blueprint + Dead-End Detector + Steps ── */}
        {!isTool && (
          <>
            {meta?.stack && <SprintStackBlueprint stack={meta.stack} />}
            {meta?.warnings && meta.warnings.length > 0 && <DeadEndDetector warnings={meta.warnings} />}

            {/* Build Steps header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: 0 }}>
                  Build steps
                </p>
                <span style={{
                  fontSize: "0.7rem", fontWeight: 600, color: "rgba(139,92,246,0.7)",
                  background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                  padding: "3px 10px", borderRadius: 9999,
                }}>
                  {totalCount} steps
                </span>
              </div>
              {totalCount > 0 && (
                <ExportStepsButton
                  steps={sprintSteps}
                  projectTitle={project.title?.trim() || "Untitled"}
                />
              )}
            </div>

            {stepsList.length === 0 ? (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18, padding: "56px 32px", textAlign: "center",
              }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>No build steps yet.</p>
              </div>
            ) : (() => {
              // Find the first incomplete step (the "active" step)
              const activeIdx = stepsList.findIndex(s => s.status !== "complete");
              return (
                <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {stepsList.map((step, i) => {
                    const isActive = i === activeIdx;
                    const isLocked = activeIdx !== -1 && i > activeIdx;
                    return (
                      <li key={step.id} style={{
                        animation: "slideInLeft 0.35s ease both",
                        animationDelay: `${i * 0.045}s`,
                      }}>
                        <StepCard
                          step={step}
                          isActive={isActive}
                          isLocked={isLocked}
                          projectId={id}
                          isLastStep={i === stepsList.length - 1}
                        />
                      </li>
                    );
                  })}
                </ol>
              );
            })()}

            {/* Completion banner */}
            {isComplete && (
              <div style={{
                marginTop: 32,
                background: "rgba(5,150,105,0.07)",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: 20, padding: "36px 32px", textAlign: "center",
                position: "relative", overflow: "hidden",
              }}>
                <div aria-hidden="true" style={{
                  position: "absolute", inset: 0, borderRadius: 20,
                  background: "radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.1) 0%, transparent 65%)",
                  pointerEvents: "none",
                }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎉</div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "rgba(255,255,255,0.95)", margin: "0 0 8px" }}>
                    Blueprint complete — you shipped.
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.38)", marginBottom: 24, lineHeight: 1.65 }}>
                    All {totalCount} steps done. What&apos;s the next idea?
                  </p>
                  <Link href="/tools" style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "1px solid rgba(139,92,246,0.4)",
                    color: "white", padding: "11px 28px", borderRadius: 11,
                    fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
                    boxShadow: "0 0 24px rgba(139,92,246,0.3)",
                  }}>
                    Start next project →
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Tool-chain CTA ── */}
        {isTool && toolPhase && (
          <div style={{ marginTop: 8 }}>
            <ToolChainCTA currentTool={toolPhase} rawIdea={project.raw_idea ?? ""} />
          </div>
        )}

      </main>

      {/* ── AI Co-Founder Chat (sprint projects only) ── */}
      {!isTool && (
        <AIChatPanel
          projectId={id}
          projectTitle={project.title ?? "Your Project"}
          projectIdea={project.raw_idea ?? ""}
          steps={sprintSteps.map(s => ({
            id: s.id,
            step_index: s.step_index,
            phase: s.phase,
            title: s.title,
            objective: s.objective,
            status: s.status,
          }))}
        />
      )}
    </div>
  );
}
