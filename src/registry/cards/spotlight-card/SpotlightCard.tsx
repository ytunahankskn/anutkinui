"use client";

import { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

export interface SpotlightCardProps {
  palette?: keyof typeof PALETTES;
  /** Işığın yarıçapı (px) */
  radius?: number;
  /** Işık yoğunluğu (0.2–1) */
  intensity?: number;
  /** Kenarlığı da imleci takip eden parıltıyla çiz */
  borderGlow?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export const PALETTES = {
  violet: { bg: "#140f24", panel: "#1c1533", border: "rgba(139,92,246,.35)", spot: "139,92,246", accent: "#a78bfa", ink: "#f4f2ff", muted: "rgba(244,242,255,.6)" },
  cyan: { bg: "#0a1a1f", panel: "#0f232a", border: "rgba(34,211,238,.35)", spot: "34,211,238", accent: "#67e8f9", ink: "#eefdff", muted: "rgba(238,253,255,.6)" },
  gold: { bg: "#1c1608", panel: "#261d0c", border: "rgba(234,179,8,.35)", spot: "234,179,8", accent: "#facc15", ink: "#fff8e6", muted: "rgba(255,248,230,.6)" },
  rose: { bg: "#1c0a13", panel: "#28101b", border: "rgba(244,63,94,.35)", spot: "244,63,94", accent: "#fb7185", ink: "#fff0f3", muted: "rgba(255,240,243,.6)" },
} as const;

const stats = [
  { label: "Uptime", value: "99.98%" },
  { label: "Latency", value: "42ms" },
  { label: "Score", value: "A+" },
];

export function SpotlightCard({
  palette = "violet",
  radius = 260,
  intensity = 0.6,
  borderGlow = true,
  title = "Spotlight",
  description = "Hover to reveal a soft radial light that tracks your cursor.",
  className,
}: SpotlightCardProps) {
  const p = PALETTES[palette] ?? PALETTES.violet;
  const rootRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 260, damping: 28, mass: 0.4 };
  const sx = useSpring(mx, spring);
  const sy = useSpring(my, spring);

  const liftSpring = { stiffness: 300, damping: 22 };
  const scale = useSpring(1, liftSpring);
  const lift = useSpring(0, liftSpring);

  const spotlight = useMotionTemplate`radial-gradient(${radius}px circle at ${sx}px ${sy}px, rgba(${p.spot}, ${intensity}), transparent 70%)`;
  const borderSpotlight = useMotionTemplate`radial-gradient(${radius * 0.8}px circle at ${sx}px ${sy}px, ${p.accent}, transparent 70%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  const handleEnter = () => {
    setHover(true);
    scale.set(1.02);
    lift.set(-6);
  };

  const handleLeave = () => {
    setHover(false);
    scale.set(1);
    lift.set(0);
  };

  return (
    <div
      ref={rootRef}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      style={{
        position: "relative",
        width: "min(380px, 100%)",
        borderRadius: 20,
        background: p.bg,
        isolation: "isolate",
      }}
    >
      <motion.div
        style={{
          position: "relative",
          y: lift,
          scale,
          borderRadius: 20,
          padding: 1,
          overflow: "hidden",
          background: borderGlow ? borderSpotlight : p.border,
        }}
      >
        {/* Solid fallback border so edges read even without glow */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 20, border: `1px solid ${p.border}`, pointerEvents: "none" }} />

        <div
          style={{
            position: "relative",
            borderRadius: 19,
            background: p.panel,
            padding: 28,
            overflow: "hidden",
          }}
        >
          {/* Spotlight wash */}
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: spotlight,
              opacity: hover ? 1 : 0,
              transition: "opacity 220ms ease",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: p.accent }}>
            cards / spotlight
          </div>
          <h3 style={{ position: "relative", margin: "12px 0 8px", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: p.ink }}>
            {title}
          </h3>
          <p style={{ position: "relative", margin: 0, fontSize: 14, lineHeight: 1.55, color: p.muted, maxWidth: 300 }}>
            {description}
          </p>

          <div style={{ position: "relative", display: "flex", gap: 20, marginTop: 22, paddingTop: 18, borderTop: `1px solid ${p.border}` }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 15, fontWeight: 600, color: p.ink }}>{s.value}</div>
                <div style={{ fontSize: 11, color: p.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
