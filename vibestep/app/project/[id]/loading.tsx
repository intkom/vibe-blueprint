export default function ProjectLoading() {
  const pulse: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    animation: "pulse 1.6s ease-in-out infinite",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#030014", color: "white" }}>
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

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px" }}>
        {/* Back link */}
        <div style={{ ...pulse, width: 130, height: 14, marginBottom: 28 }} />

        {/* Project header card */}
        <div style={{
          background: "rgba(10,6,30,0.6)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20, padding: "24px 26px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ ...pulse, width: 42, height: 42, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ ...pulse, width: 240, height: 24 }} />
                <div style={{ ...pulse, width: 70, height: 20, borderRadius: 9999 }} />
              </div>
              <div style={{ ...pulse, width: "80%", height: 14 }} />
              <div style={{ ...pulse, width: "60%", height: 14 }} />
            </div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ ...pulse, width: 60, height: 12 }} />
              <div style={{ ...pulse, width: 100, height: 12 }} />
            </div>
            <div style={{ ...pulse, width: "100%", height: 6, borderRadius: 9999 }} />
          </div>
        </div>

        {/* Stack blueprint skeleton */}
        <div style={{
          background: "rgba(10,6,30,0.6)", border: "1px solid rgba(139,92,246,0.1)",
          borderRadius: 20, overflow: "hidden", marginBottom: 16,
        }}>
          <div style={{
            padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ ...pulse, width: 30, height: 30, borderRadius: 8 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ ...pulse, width: 160, height: 16 }} />
              <div style={{ ...pulse, width: 220, height: 12 }} />
            </div>
          </div>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "14px 24px",
              borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.03)" : "none",
            }}>
              <div style={{ ...pulse, width: 60, height: 12 }} />
              <div style={{ ...pulse, width: `${140 + i * 30}px`, height: 14 }} />
            </div>
          ))}
        </div>

        {/* Steps header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ ...pulse, width: 80, height: 12 }} />
            <div style={{ ...pulse, width: 60, height: 22, borderRadius: 9999 }} />
          </div>
          <div style={{ ...pulse, width: 110, height: 28, borderRadius: 9 }} />
        </div>

        {/* Step card skeletons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              background: i === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
              border: `1px solid ${i === 0 ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)"}`,
              borderRadius: 16, padding: "18px 20px",
              opacity: i > 0 ? 0.5 : 1,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingLeft: 6 }}>
                <div style={{ ...pulse, width: 32, height: 32, borderRadius: "50%" }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ ...pulse, width: 60, height: 18, borderRadius: 9999 }} />
                    <div style={{ ...pulse, width: 50, height: 18 }} />
                  </div>
                  <div style={{ ...pulse, width: "75%", height: 16 }} />
                  {i === 0 && <div style={{ ...pulse, width: "90%", height: 12 }} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
