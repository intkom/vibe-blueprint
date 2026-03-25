"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/actions/auth";
import { NotificationsBell } from "@/components/notifications-bell";
import { useTranslations } from "next-intl";
import { useLocale, LANGUAGES, type Locale } from "@/lib/i18n-provider";

/* ── Avatar helpers ─────────────────────────────────────── */
const AVATAR_COLORS = ["#7c3aed","#2563eb","#059669","#d97706","#dc2626","#0891b2","#db2777","#4f46e5"];

function hashColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(email: string) {
  const local = email.split("@")[0];
  const parts = local.split(/[._\-+]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.substring(0, 2).toUpperCase();
}

const AVATAR_MENU_ITEMS = [
  { href: "/settings", labelKey: "settings" as const, icon: "⚙" },
];

export function AppHeader() {
  const pathname                   = usePathname();
  const t                          = useTranslations("nav");
  const { locale, setLocale }      = useLocale();
  const [email,    setEmail]       = useState<string | null>(null);
  const [dropOpen, setDropOpen]    = useState(false);
  const [menuOpen, setMenuOpen]    = useState(false);
  const [langOpen, setLangOpen]    = useState(false);
  const [hovered,  setHovered]     = useState<string | null>(null);
  const dropRef  = useRef<HTMLDivElement>(null);
  const langRef  = useRef<HTMLDivElement>(null);

  const CENTER_NAV = [
    { href: "/dashboard", label: t("dashboard") },
    { href: "/tools",     label: t("analysis")   },
    { href: "/templates", label: t("templates")  },
    { href: "/validate",  label: t("validate")   },
  ];

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const initials = email ? getInitials(email) : "··";
  const color    = email ? hashColor(email) : "#7c3aed";

  return (
    <>
      <style>{`
        @keyframes vsDropIn {
          from { opacity:0; transform:scale(0.95) translateY(-8px); }
          to   { opacity:1; transform:scale(1)    translateY(0);    }
        }
        @keyframes vsFadeIn { from{opacity:0} to{opacity:1} }
        .vs-nav-center { display:flex; }
        @media(max-width:680px){
          .vs-nav-center{ display:none; }
          .vs-burger{ display:flex !important; }
        }
      `}</style>

      <header style={{
        position:"sticky", top:0, zIndex:100,
        background:"rgba(5,2,20,0.92)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          maxWidth:1200, margin:"0 auto",
          display:"flex", alignItems:"center",
          height:60, padding:"0 28px",
        }}>

          {/* ── LEFT: Logo ── */}
          <Link href="/" style={{
            display:"flex", alignItems:"center", gap:9,
            textDecoration:"none", flexShrink:0,
            marginRight:32,
          }}>
            <div style={{
              width:33, height:33, borderRadius:10, flexShrink:0,
              background:"linear-gradient(135deg,#7c3aed,#5b21b6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:15, fontWeight:800, color:"white",
              boxShadow:"0 0 18px rgba(139,92,246,0.5)",
            }}>A</div>
            <span style={{
              fontSize:"1.05rem", fontWeight:800, lineHeight:1,
              color:"rgba(255,255,255,0.9)", letterSpacing:"-0.02em",
            }}>Axiom</span>
          </Link>

          {/* ── CENTER: Nav links ── */}
          <nav className="vs-nav-center" style={{ alignItems:"center", gap:2, flex:1 }}>
            {CENTER_NAV.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} style={{
                  padding:"6px 13px", borderRadius:8,
                  fontSize:"0.845rem", fontWeight:active ? 600 : 400,
                  color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)",
                  background: active ? "rgba(139,92,246,0.12)" : "transparent",
                  textDecoration:"none", whiteSpace:"nowrap",
                  transition:"color 0.14s, background 0.14s",
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.78)";
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)";
                }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── RIGHT: New idea + Avatar ── */}
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, marginLeft:"auto" }}>

            {/* + New idea */}
            <Link href="/create" style={{
              display:"inline-flex", alignItems:"center", gap:6,
              background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
              border:"1px solid rgba(139,92,246,0.5)",
              color:"white", padding:"7px 17px", borderRadius:9,
              fontSize:"0.84rem", fontWeight:600, textDecoration:"none",
              whiteSpace:"nowrap",
              boxShadow:"0 0 22px rgba(139,92,246,0.28)",
              transition:"transform 0.18s, box-shadow 0.18s",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.transform="translateY(-1px)";
              el.style.boxShadow="0 0 30px rgba(139,92,246,0.5)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.transform="translateY(0)";
              el.style.boxShadow="0 0 22px rgba(139,92,246,0.28)";
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              {t("newIdea")}
            </Link>

            {/* Notifications */}
            <NotificationsBell />

            {/* Globe language switcher */}
            <div ref={langRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setLangOpen(o => !o)}
                aria-label="Switch language"
                title="Switch language"
                style={{
                  background: "none", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, cursor: "pointer", padding: "6px 8px",
                  color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1,
                  display: "flex", alignItems: "center", gap: 4,
                  transition: "all 0.14s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.4)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                🌐
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{locale}</span>
              </button>

              {langOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  width: 192,
                  background: "rgba(6,3,22,0.98)",
                  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
                  zIndex: 200, padding: 6,
                  animation: "vsDropIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
                  transformOrigin: "top right",
                }}>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => { setLocale(lang.code as Locale); setLangOpen(false); }}
                      style={{
                        width: "100%", textAlign: "left",
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 8, border: "none",
                        background: locale === lang.code ? "rgba(139,92,246,0.12)" : "transparent",
                        cursor: "pointer", transition: "background 0.14s",
                      }}
                      onMouseEnter={e => { if (locale !== lang.code) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={e => { if (locale !== lang.code) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{lang.flag}</span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "block", fontSize: "0.83rem", fontWeight: locale === lang.code ? 600 : 400, color: locale === lang.code ? "#a78bfa" : "rgba(255,255,255,0.7)" }}>{lang.native}</span>
                        <span style={{ display: "block", fontSize: "0.7rem", color: "rgba(255,255,255,0.28)" }}>{lang.label}</span>
                      </span>
                      {locale === lang.code && <span style={{ color: "#a78bfa", fontSize: "0.8rem" }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div ref={dropRef} style={{ position:"relative" }}>
              <button
                onClick={() => setDropOpen(o => !o)}
                aria-label="User menu"
                style={{
                  width:36, height:36, borderRadius:"50%", flexShrink:0,
                  background:`linear-gradient(135deg,${color},${color}bb)`,
                  border: dropOpen ? `2px solid ${color}` : "2px solid rgba(255,255,255,0.18)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer",
                  fontSize:"0.62rem", fontWeight:800, color:"white", letterSpacing:"0.04em",
                  boxShadow: dropOpen ? `0 0 0 3px ${color}35` : "none",
                  transition:"all 0.18s ease",
                }}
              >{initials}</button>

              {dropOpen && (
                <div style={{
                  position:"absolute", top:"calc(100% + 10px)", right:0,
                  width:220,
                  background:"rgba(6,3,22,0.98)",
                  backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:14, overflow:"hidden",
                  boxShadow:"0 24px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(139,92,246,0.1)",
                  zIndex:200,
                  animation:"vsDropIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
                  transformOrigin:"top right",
                }}>
                  {/* Email header */}
                  <div style={{
                    padding:"14px 16px",
                    borderBottom:"1px solid rgba(255,255,255,0.07)",
                    display:"flex", alignItems:"center", gap:11,
                  }}>
                    <div style={{
                      width:34, height:34, borderRadius:"50%", flexShrink:0,
                      background:`linear-gradient(135deg,${color},${color}bb)`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.6rem", fontWeight:800, color:"white",
                      boxShadow:`0 0 14px ${color}55`,
                    }}>{initials}</div>
                    <div style={{ minWidth:0 }}>
                      <p style={{
                        fontSize:"0.78rem", fontWeight:600, color:"rgba(255,255,255,0.88)",
                        margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      }}>{email ?? "Loading…"}</p>
                      <p style={{ fontSize:"0.64rem", color:"rgba(255,255,255,0.28)", margin:"2px 0 0" }}>Starter plan</p>
                    </div>
                  </div>

                  {/* Settings link */}
                  <div style={{ padding:"6px" }}>
                    {AVATAR_MENU_ITEMS.map(item => (
                      <Link key={item.href} href={item.href}
                        onClick={() => setDropOpen(false)}
                        style={{
                          display:"flex", alignItems:"center", gap:10,
                          padding:"9px 12px", borderRadius:9,
                          fontSize:"0.84rem",
                          color: hovered === item.href ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.52)",
                          background: hovered === item.href ? "rgba(255,255,255,0.06)" : "transparent",
                          textDecoration:"none", transition:"all 0.14s ease",
                        }}
                        onMouseEnter={() => setHovered(item.href)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <span style={{
                          width:18, height:18, borderRadius:5, flexShrink:0,
                          background: hovered === item.href ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:"0.65rem", transition:"background 0.14s",
                        }}>{item.icon}</span>
                        {t(item.labelKey)}
                      </Link>
                    ))}

                    <div style={{ height:1, background:"rgba(255,255,255,0.07)", margin:"4px 0" }} />

                    {/* Sign out */}
                    <form action={signOut}>
                      <button type="submit" style={{
                        width:"100%", textAlign:"left",
                        display:"flex", alignItems:"center", gap:10,
                        padding:"9px 12px", borderRadius:9,
                        fontSize:"0.84rem",
                        color: hovered === "out" ? "#fca5a5" : "rgba(248,113,113,0.62)",
                        background: hovered === "out" ? "rgba(239,68,68,0.1)" : "transparent",
                        border:"none", cursor:"pointer", transition:"all 0.14s ease",
                      }}
                      onMouseEnter={() => setHovered("out")}
                      onMouseLeave={() => setHovered(null)}
                      >
                        <span style={{
                          width:18, height:18, borderRadius:5, flexShrink:0,
                          background: hovered === "out" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:"0.7rem", transition:"background 0.14s",
                        }}>↗</span>
                        {t("signOut")}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile burger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
              style={{
                display:"none", background:"none", border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:8, cursor:"pointer", padding:"7px 8px",
                flexDirection:"column", gap:4, alignItems:"center", flexShrink:0,
              }}
              className="vs-burger"
            >
              {[0,1,2].map(i => (
                <span key={i} style={{ display:"block", width:18, height:2, background:"rgba(255,255,255,0.7)", borderRadius:2 }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav style={{
            borderTop:"1px solid rgba(255,255,255,0.07)",
            padding:"10px 16px 16px",
            background:"rgba(5,2,20,0.98)",
            display:"flex", flexDirection:"column", gap:2,
            animation:"vsFadeIn 0.15s ease",
          }}>
            {CENTER_NAV.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
                padding:"11px 14px", borderRadius:10, textDecoration:"none",
                color:"rgba(255,255,255,0.6)", fontSize:"0.92rem",
              }}>{l.label}</Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
