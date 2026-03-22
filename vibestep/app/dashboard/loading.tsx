export default function DashboardLoading() {
  const pulse: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    animation: "pulse 1.6s ease-in-out infinite",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--vs-bg)", color: "var(--vs-text)" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>

      {/* Header skeleton */}
      <div style={{
        height: 56, borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", padding: "0 24px", gap: 20,
        background: "rgba(3,0,20,0.85)",
      }}>
        <div style={{ ...pulse, width: 90, height: 20 }} />
        <div style={{ flex: 1 }} />
        <div style={{ ...pulse, width: 60, height: 16 }} />
        <div style={{ ...pulse, width: 70, height: 16 }} />
        <div style={{ ...pulse, width: 80, height: 32, borderRadius: 9 }} />
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        {/* Welcome banner skeleton */}
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, padding: "24px 28px", marginBottom: 32,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ ...pulse, width: 120, height: 12 }} />
            <div style={{ ...pulse, width: 200, height: 28 }} />
            <div style={{ ...pulse, width: 160, height: 14 }} />
          </div>
          <div style={{ ...pulse, width: 100, height: 38, borderRadius: 11 }} />
        </div>

        {/* Stats strip skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 32 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "16px 18px", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <div style={{ ...pulse, width: 48, height: 36 }} />
              <div style={{ ...pulse, width: 80, height: 12 }} />
            </div>
          ))}
        </div>

        {/* Project card skeletons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(380px,1fr))", gap: 14 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 18, padding: "20px 22px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ ...pulse, width: 7, height: 7, borderRadius: "50%" }} />
                <div style={{ ...pulse, width: 160, height: 16 }} />
                <div style={{ ...pulse, width: 54, height: 16, borderRadius: 9999 }} />
              </div>
              <div style={{ ...pulse, width: "90%", height: 12, marginBottom: 6, marginLeft: 15 }} />
              <div style={{ ...pulse, width: "70%", height: 12, marginBottom: 12, marginLeft: 15 }} />
              <div style={{ marginLeft: 15 }}>
                <div style={{ ...pulse, width: "100%", height: 5, borderRadius: 9999 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
