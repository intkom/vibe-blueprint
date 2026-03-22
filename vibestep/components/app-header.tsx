import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/actions/auth";

export async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(3,0,20,0.88)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, padding: '0 2rem', gap: 16,
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: 'white',
            boxShadow: '0 0 16px rgba(139,92,246,0.5)',
          }}>V</div>
          <span style={{
            fontSize: '1.1rem', fontWeight: 800,
            background: 'linear-gradient(135deg,#c4b5fd,#a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>VibeStep</span>
        </Link>

        {/* Right nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <HeaderLink href="/dashboard">Dashboard</HeaderLink>

          {user ? (
            <>
              <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
              <Link href="/create" style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                border: '1px solid rgba(139,92,246,0.45)',
                color: 'white', padding: '7px 16px', borderRadius: 9,
                fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 0 18px rgba(139,92,246,0.25)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.01em',
              }}>
                + New idea
              </Link>
              <form action={signOut} style={{ margin: 0 }}>
                <button type="submit" style={{
                  fontSize: '0.82rem', color: 'rgba(255,255,255,0.38)',
                  padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
                  background: 'none', border: 'none',
                  transition: 'color 0.18s ease',
                }}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" style={{
              fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)',
              padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
            }}>
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)',
      padding: '7px 12px', borderRadius: 8, textDecoration: 'none',
      transition: 'color 0.18s ease',
    }}>
      {children}
    </Link>
  );
}
