"use client";

import { useEffect, useState } from "react";

const COLORS = ["#a78bfa", "#ec4899", "#34d399", "#60a5fa", "#fbbf24", "#f87171", "#c4b5fd"];
const PARTICLE_COUNT = 56;

type Particle = {
  id: number;
  x: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  spin: number;
  shape: "rect" | "circle";
};

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,       // % from left
    color: COLORS[i % COLORS.length],
    size: 5 + Math.random() * 7,
    angle: -80 + Math.random() * 160,  // spread angle deg
    speed: 0.6 + Math.random() * 0.8,  // animation-duration multiplier
    spin: Math.random() * 720 - 360,   // rotation deg
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));
}

export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (trigger && !fired) {
      setParticles(makeParticles());
      setFired(true);
      // Remove particles after animation
      const t = setTimeout(() => setParticles([]), 3500);
      return () => clearTimeout(t);
    }
  }, [trigger, fired]);

  if (particles.length === 0) return null;

  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 8000, overflow: "hidden",
    }}>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(var(--spin)); opacity: 0; }
        }
        @keyframes confettiSway {
          0%, 100% { margin-left: 0; }
          50%       { margin-left: var(--sway); }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: "-10px",
            left: `${p.x}%`,
            width: p.shape === "circle" ? p.size : p.size * 0.6,
            height: p.size,
            borderRadius: p.shape === "circle" ? "50%" : 2,
            background: p.color,
            opacity: 0.92,
            // @ts-expect-error CSS custom props
            "--spin": `${p.spin}deg`,
            "--sway": `${(Math.random() - 0.5) * 80}px`,
            animation: [
              `confettiFall ${1.4 + p.speed * 1.2}s ease-in ${Math.random() * 0.6}s forwards`,
              `confettiSway ${0.8 + Math.random() * 0.4}s ease-in-out infinite`,
            ].join(", "),
          }}
        />
      ))}
    </div>
  );
}
