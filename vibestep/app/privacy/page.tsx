import Link from "next/link";

export const metadata = { title: "Privacy Policy – VibeStep" };

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--vs-bg)", color: "var(--vs-text)" }}>
      {/* Ambient */}
      <div aria-hidden="true" style={{ position: "fixed", top: "-15%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, padding: "0 2rem", background: "rgba(3,0,20,0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em", color: "rgba(255,255,255,0.95)" }}>VibeStep</span>
        </Link>
        <Link href="/" style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back to home</Link>
      </nav>

      <main style={{ position: "relative", zIndex: 10, maxWidth: 720, margin: "0 auto", padding: "64px 24px 100px" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(167,139,250,0.6)", marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 8, color: "rgba(255,255,255,0.95)" }}>Privacy Policy</h1>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.25)", marginBottom: 52 }}>Last updated: March 2026</p>

        {[
          {
            title: "1. Information We Collect",
            body: "We collect information you provide directly to us, including your email address and password when you create an account, and the startup idea descriptions you submit to generate blueprints. We also collect standard usage data such as pages visited, features used, and time spent on the platform.",
          },
          {
            title: "2. How We Use Your Information",
            body: "We use the information we collect to provide, maintain, and improve our services; process your blueprint generation requests; send you service-related emails; and respond to your questions and support requests. We do not sell your personal information to third parties.",
          },
          {
            title: "3. AI Processing",
            body: "Your idea descriptions are sent to Anthropic's Claude API to generate blueprint output. Anthropic processes this data according to their own privacy policy and API terms of service. We recommend you do not include sensitive personal data or confidential trade secrets in your submissions.",
          },
          {
            title: "4. Data Storage",
            body: "Your account data and generated blueprints are stored in Supabase, a cloud database provider. Data is stored in secure, encrypted databases. We retain your project data for as long as your account is active. You may request deletion of your data at any time by contacting us.",
          },
          {
            title: "5. Cookies",
            body: "We use cookies and similar tracking technologies to maintain your session and remember your preferences. Session cookies are essential for the application to function. You can configure your browser to refuse cookies, though this may prevent certain features from working.",
          },
          {
            title: "6. Third-Party Services",
            body: "We use the following third-party services: Supabase (database and authentication), Anthropic Claude (AI processing), and Vercel (hosting and deployment). Each of these services has its own privacy policy governing their use of your data.",
          },
          {
            title: "7. Your Rights",
            body: "You have the right to access, correct, or delete your personal information at any time. You may also request a copy of the data we hold about you. To exercise these rights, please contact us at the email address below.",
          },
          {
            title: "8. Contact Us",
            body: "If you have questions about this Privacy Policy or how we handle your data, please contact us at privacy@vibestep.com. We will respond to all requests within 30 days.",
          },
        ].map(section => (
          <section key={section.title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 10 }}>{section.title}</h2>
            <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.8, margin: 0 }}>{section.body}</p>
          </section>
        ))}

        <div style={{ marginTop: 52, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/terms" style={{ fontSize: "0.82rem", color: "rgba(167,139,250,0.6)", textDecoration: "none" }}>Terms of Service →</Link>
          <Link href="/" style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Back to home</Link>
        </div>
      </main>
    </div>
  );
}
