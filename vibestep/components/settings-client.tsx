"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale, LANGUAGES, type Locale } from "@/lib/i18n-provider";
import { useTranslations } from "next-intl";

/* ── Display Name Editor ── */
export function DisplayNameEditor({ initial, email }: { initial: string; email: string }) {
  const [name, setName] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!name.trim() || name === initial) return;
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: name.trim() }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem", fontWeight: 800, color: "white",
          boxShadow: "0 0 20px rgba(139,92,246,0.4)",
        }}>
          {name.trim()[0]?.toUpperCase() ?? "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Display name
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") save(); }}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 9, padding: "8px 12px",
                fontSize: "0.88rem", color: "rgba(255,255,255,0.85)",
                outline: "none", fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(139,92,246,0.4)"; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
            <button
              type="button"
              onClick={save}
              disabled={saving || !name.trim() || name === initial}
              style={{
                background: saved ? "rgba(52,211,153,0.15)" : "rgba(139,92,246,0.15)",
                border: saved ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(139,92,246,0.3)",
                color: saved ? "#34d399" : "#a78bfa",
                padding: "8px 16px", borderRadius: 9,
                fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap", transition: "all 0.2s ease",
              }}
            >
              {saved ? "✓ Saved" : saving ? "..." : "Save"}
            </button>
          </div>
        </div>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px", borderRadius: 9,
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Email</span>
        <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", flex: 1 }}>{email}</span>
        <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "2px 8px" }}>
          read-only
        </span>
      </div>
    </div>
  );
}

/* ── Language Switcher (standalone) ── */
export function LanguageSwitcher() {
  const t = useTranslations("settings");
  const { locale, setLocale } = useLocale();

  return (
    <div>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
        {t("language")}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
        {LANGUAGES.map(lang => {
          const active = locale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLocale(lang.code as Locale)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                background: active ? "rgba(139,92,246,0.14)" : "rgba(255,255,255,0.03)",
                border: active ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.07)",
                transition: "all 0.15s",
                textAlign: "left",
              } as React.CSSProperties}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"; }}
            >
              <span style={{ fontSize: "1.3rem" }}>{lang.flag}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: "0.84rem", fontWeight: active ? 700 : 500, color: active ? "#a78bfa" : "rgba(255,255,255,0.7)" }}>{lang.native}</span>
                <span style={{ display: "block", fontSize: "0.7rem", color: "rgba(255,255,255,0.28)" }}>{lang.label}</span>
              </span>
              {active && <span style={{ color: "#a78bfa", fontSize: "0.9rem", flexShrink: 0 }}>✓</span>}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", margin: "8px 0 0", lineHeight: 1.5 }}>
        Changes apply instantly and persist across sessions.
      </p>
    </div>
  );
}

/* ── Preferences ── */
export function PreferencesSection({
  defaultModel: initialModel,
}: {
  defaultModel: "haiku" | "sonnet";
}) {
  const [model, setModel] = useState(initialModel);
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ default_model: model, language }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const pill = (active: boolean) => ({
    padding: "7px 14px", borderRadius: 8, cursor: "pointer",
    border: `1px solid ${active ? "rgba(139,92,246,0.45)" : "rgba(255,255,255,0.08)"}`,
    background: active ? "rgba(139,92,246,0.14)" : "transparent",
    color: active ? "#a78bfa" : "rgba(255,255,255,0.35)",
    fontSize: "0.8rem", fontWeight: 700, transition: "all 0.15s",
  } as React.CSSProperties);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Default model */}
      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>
          Default analysis model
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setModel("haiku")} style={pill(model === "haiku")}>
            ⚡ Haiku — Fast (~5s)
          </button>
          <button type="button" onClick={() => setModel("sonnet")} style={pill(model === "sonnet")}>
            🧠 Sonnet — Deep (~25s)
          </button>
        </div>
        <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", margin: "6px 0 0", lineHeight: 1.5 }}>
          {model === "haiku" ? "Faster results — great for quick validation" : "Deep analysis with tech stack + moat sections"}
        </p>
      </div>

      {/* Language */}
      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>
          Analysis language
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { code: "en", label: "English" },
            { code: "es", label: "Español" },
            { code: "fr", label: "Français" },
            { code: "de", label: "Deutsch" },
          ].map(l => (
            <button key={l.code} type="button" onClick={() => setLanguage(l.code)} style={pill(language === l.code)}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        style={{
          alignSelf: "flex-start",
          background: saved ? "rgba(52,211,153,0.12)" : "rgba(139,92,246,0.12)",
          border: saved ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(139,92,246,0.25)",
          color: saved ? "#34d399" : "#a78bfa",
          padding: "8px 20px", borderRadius: 9,
          fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {saved ? "✓ Preferences saved" : saving ? "Saving..." : "Save preferences"}
      </button>
    </div>
  );
}

/* ── Danger Zone ── */
export function DangerZone({ projectCount }: { projectCount: number }) {
  const router = useRouter();
  const [confirmStep, setConfirmStep] = useState<null | "projects" | "account">(null);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  async function deleteAllProjects() {
    setLoading(true);
    try {
      await fetch("/api/projects/delete-all", { method: "DELETE" });
      router.refresh();
      setConfirmStep(null);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount() {
    setLoading(true);
    try {
      await fetch("/api/account/delete", { method: "DELETE" });
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }

  const CONFIRM_DELETE_PROJECTS = "delete my projects";
  const CONFIRM_DELETE_ACCOUNT  = "delete my account";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Delete all projects */}
      {confirmStep !== "account" && (
        <div style={{
          background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: 12, padding: "16px 18px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(252,165,165,0.8)", margin: "0 0 3px" }}>
                Delete all projects
              </p>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                Permanently removes all {projectCount} analyses and steps. Cannot be undone.
              </p>
            </div>
            {confirmStep !== "projects" ? (
              <button
                type="button"
                onClick={() => setConfirmStep("projects")}
                disabled={projectCount === 0}
                style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  color: projectCount === 0 ? "rgba(255,255,255,0.2)" : "#f87171",
                  padding: "7px 16px", borderRadius: 8,
                  fontSize: "0.78rem", fontWeight: 700,
                  cursor: projectCount === 0 ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Delete all →
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.75rem", color: "rgba(252,165,165,0.65)", margin: 0 }}>
                  Type <strong style={{ color: "#f87171" }}>{CONFIRM_DELETE_PROJECTS}</strong> to confirm
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder={CONFIRM_DELETE_PROJECTS}
                    style={{
                      flex: 1, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 8, padding: "7px 10px",
                      fontSize: "0.78rem", color: "rgba(255,255,255,0.7)",
                      outline: "none", fontFamily: "inherit",
                    }}
                  />
                  <button
                    type="button"
                    onClick={deleteAllProjects}
                    disabled={confirmText !== CONFIRM_DELETE_PROJECTS || loading}
                    style={{
                      background: confirmText === CONFIRM_DELETE_PROJECTS ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: confirmText === CONFIRM_DELETE_PROJECTS ? "#f87171" : "rgba(255,255,255,0.2)",
                      padding: "7px 14px", borderRadius: 8,
                      fontSize: "0.78rem", fontWeight: 700,
                      cursor: confirmText === CONFIRM_DELETE_PROJECTS ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {loading ? "..." : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setConfirmStep(null); setConfirmText(""); }}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", padding: "0 4px", fontSize: "1rem" }}
                  >✕</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete account */}
      {confirmStep !== "projects" && (
        <div style={{
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12, padding: "16px 18px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(252,165,165,0.9)", margin: "0 0 3px" }}>
                Delete account
              </p>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                Permanently deletes your account, all projects, and all data.
              </p>
            </div>
            {confirmStep !== "account" ? (
              <button
                type="button"
                onClick={() => setConfirmStep("account")}
                style={{
                  background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.4)",
                  color: "#f87171",
                  padding: "7px 16px", borderRadius: 8,
                  fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Delete account →
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.75rem", color: "rgba(252,165,165,0.65)", margin: 0 }}>
                  Type <strong style={{ color: "#f87171" }}>{CONFIRM_DELETE_ACCOUNT}</strong> to confirm
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder={CONFIRM_DELETE_ACCOUNT}
                    style={{
                      flex: 1, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 8, padding: "7px 10px",
                      fontSize: "0.78rem", color: "rgba(255,255,255,0.7)",
                      outline: "none", fontFamily: "inherit",
                    }}
                  />
                  <button
                    type="button"
                    onClick={deleteAccount}
                    disabled={confirmText !== CONFIRM_DELETE_ACCOUNT || loading}
                    style={{
                      background: confirmText === CONFIRM_DELETE_ACCOUNT ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.35)",
                      color: confirmText === CONFIRM_DELETE_ACCOUNT ? "#f87171" : "rgba(255,255,255,0.2)",
                      padding: "7px 14px", borderRadius: 8,
                      fontSize: "0.78rem", fontWeight: 700,
                      cursor: confirmText === CONFIRM_DELETE_ACCOUNT ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {loading ? "..." : "Confirm delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setConfirmStep(null); setConfirmText(""); }}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", padding: "0 4px", fontSize: "1rem" }}
                  >✕</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
