"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

export interface TiltCardProps {
  palette?: keyof typeof PALETTES;
  /** Maksimum eğim açısı (derece) */
  maxTilt?: number;
  /** Hover büyütme oranı */
  scale?: number;
  /** Ters yönde kayan parlaklık katmanı */
  glare?: boolean;
  /** Katmanlar arası translateZ birimi (px) */
  depth?: number;
  title?: string;
  className?: string;
}

export const PALETTES = {
  aurora: { bg: "#0c1420", panel: "linear-gradient(155deg,#141f33,#0c1420)", accent: "#4f7cff", accent2: "#7ce0c9", ink: "#f2f6ff", muted: "rgba(242,246,255,.62)" },
  ember: { bg: "#1c1108", panel: "linear-gradient(155deg,#2a1a0d,#1c1108)", accent: "#ff8a3d", accent2: "#ffd166", ink: "#fff5ea", muted: "rgba(255,245,234,.62)" },
  ocean: { bg: "#061a1c", panel: "linear-gradient(155deg,#0d2b2e,#061a1c)", accent: "#22d3ee", accent2: "#0ea5e9", ink: "#eafdff", muted: "rgba(234,253,255,.62)" },
  slate: { bg: "#111318", panel: "linear-gradient(155deg,#1c1f28,#111318)", accent: "#94a3b8", accent2: "#e2e8f0", ink: "#f4f6f8", muted: "rgba(244,246,248,.6)" },
} as const;

export function TiltCard({
  palette = "aurora",
  maxTilt = 14,
  scale = 1.04,
  glare = true,
  depth = 40,
  title = "Tilt me",
  className,
}: TiltCardProps) {
  const p = PALETTES[palette] ?? PALETTES.aurora;
  const rootRef = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const cardScale = useMotionValue(1);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const spring = { stiffness: 240, damping: 20, mass: 0.6 };
  const srx = useSpring(rotateX, spring);
  const sry = useSpring(rotateY, spring);
  const ss = useSpring(cardScale, spring);
  const sgx = useSpring(glareX, spring);
  const sgy = useSpring(glareY, spring);

  const glareBackground = useMotionTemplate`radial-gradient(circle at ${sgx}% ${sgy}%, rgba(255,255,255,.35), transparent 55%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * maxTilt);
    rotateX.set(-py * maxTilt);
    cardScale.set(scale);
    // Glare kaydırma imlecin tersi yönde
    glareX.set(50 - px * 60);
    glareY.set(50 - py * 60);
  };

  const handlePointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    cardScale.set(1);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <div
      ref={rootRef}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ width: "min(340px, 100%)", perspective: 1000 }}
    >
      <motion.div
        style={{
          position: "relative",
          rotateX: srx,
          rotateY: sry,
          scale: ss,
          transformStyle: "preserve-3d",
          borderRadius: 22,
          background: p.panel,
          border: `1px solid rgba(255,255,255,.08)`,
          padding: 26,
          overflow: "hidden",
          boxShadow: "0 24px 60px -24px rgba(0,0,0,.6)",
        }}
      >
        {glare && (
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: glareBackground,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        )}

        <div
          style={{
            position: "relative",
            transform: `translateZ(${depth}px)`,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: p.bg,
            background: p.accent2,
          }}
        >
          new
        </div>

        <h3
          style={{
            position: "relative",
            transform: `translateZ(${depth * 1.5}px)`,
            margin: "16px 0 14px",
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: p.ink,
          }}
        >
          {title}
        </h3>

        <div
          style={{
            position: "relative",
            transform: `translateZ(${depth * 0.5}px)`,
            height: 110,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${p.accent}, ${p.accent2})`,
          }}
        />

        <p style={{ position: "relative", margin: "16px 0 0", fontSize: 13, lineHeight: 1.5, color: p.muted }}>
          Depth follows your cursor across three floating layers.
        </p>
      </motion.div>
    </div>
  );
}
