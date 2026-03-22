export default function StepDetailLoading() {
  const shimmer = {
    background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmerSlide 1.6s infinite",
    borderRadius: 8,
  } as const;

  return (
    <div style={{ minHeight: "100vh", background: "var(--vs-bg)", color: "var(--vs-text)" }}>
      <style>{`
        @keyframes shimmerSlide {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header skeleton */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50, height: 64,
        background: "rgba(3,0,20,0.88)", borderBottom: "1px solid rgba(255,255,255,0.07)",
      }} />

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Back link */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ ...shimmer, width: 140, height: 18 }} />
          <div style={{ ...shimmer, width: 80, height: 18 }} />
        </div>

        {/* Step header card */}
        <div style={{
          background: "rgba(10,6,30,0.7)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20, padding: "24px 28px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ ...shimmer, width: 70, height: 22, borderRadius: 9999 }} />
            <div style={{ ...shimmer, width: 60, height: 22, borderRadius: 9999 }} />
            <div style={{ ...shimmer, width: 55, height: 22, borderRadius: 9999 }} />
          </div>
          <div style={{ ...shimmer, width: "65%", height: 32, marginBottom: 10 }} />
          <div style={{ ...shimmer, width: "90%", height: 18, marginBottom: 6 }} />
          <div style={{ ...shimmer, width: "75%", height: 18 }} />
        </div>

        {/* Content sections */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "20px 22px", marginBottom: 16,
          }}>
            <div style={{ ...shimmer, width: 100, height: 12, marginBottom: 16, borderRadius: 6 }} />
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              <div style={{ ...shimmer, width: "100%", height: 18 }} />
              <div style={{ ...shimmer, width: "85%", height: 18 }} />
              <div style={{ ...shimmer, width: "70%", height: 18 }} />
            </div>
          </div>
        ))}

        {/* "Claude is generating enrichment…" hint */}
        <div style={{
          textAlign: "center", marginTop: 20,
          fontSize: "0.78rem", color: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <div style={{
            width: 12, height: 12, borderRadius: "50%",
            border: "2px solid rgba(139,92,246,0.4)",
            borderTopColor: "#a78bfa",
            animation: "spin 0.9s linear infinite",
          }} />
          Generating AI insights for this step…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
}
