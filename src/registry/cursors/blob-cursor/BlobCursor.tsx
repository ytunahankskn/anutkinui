"use client";

import { useId, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export interface BlobCursorProps {
  palette?: keyof typeof PALETTES;
  /** Ana blob çapı (px) */
  size?: number;
  /** Kaç blob'un iz bırakacağı (1–4) */
  trailCount?: number;
  /** Gecikme miktarı: büyük değer = daha yavaş takip */
  lag?: number;
  /** Blob katmanının karışım modu */
  blend?: "normal" | "difference" | "screen" | "multiply";
  className?: string;
}

export const PALETTES = {
  violet: { colors: ["#b088ff", "#7c5cff", "#5b3bd6", "#3a2489"] },
  lime: { colors: ["#c6ff5c", "#9fe62f", "#6fb814", "#3f7a08"] },
  coral: { colors: ["#ff8a7a", "#ff5c5c", "#e63946", "#a3202e"] },
  ice: { colors: ["#bdf2ff", "#7fd8f7", "#3fb6e0", "#1f7ea3"] },
} as const;

export function BlobCursor({
  palette = "violet",
  size = 48,
  trailCount = 3,
  lag = 0.25,
  blend = "difference",
  className,
}: BlobCursorProps) {
  const p = PALETTES[palette] ?? PALETTES.violet;
  const filterId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  // lag küçükse yüksek stiffness (hızlı takip), büyükse düşük stiffness (yavaş, sıvı his)
  const baseStiffness = 340 - lag * 480; // lag 0.05 -> ~316, lag 0.6 -> ~52
  const count = Math.max(1, Math.min(4, trailCount));

  const springConfig = (i: number) => ({
    stiffness: Math.max(24, baseStiffness / (1 + i * 0.9)),
    damping: 18 + i * 3,
    mass: 0.6 + i * 0.3,
  });

  // Sabit 4 blob'luk hook seti: her zaman aynı sırada çağrılır (rules-of-hooks güvenli),
  // fazla olanlar render'da basitçe kullanılmaz.
  const x0 = useSpring(targetX, springConfig(0));
  const x1 = useSpring(targetX, springConfig(1));
  const x2 = useSpring(targetX, springConfig(2));
  const x3 = useSpring(targetX, springConfig(3));
  const y0 = useSpring(targetY, springConfig(0));
  const y1 = useSpring(targetY, springConfig(1));
  const y2 = useSpring(targetY, springConfig(2));
  const y3 = useSpring(targetY, springConfig(3));
  const springs = [x0, x1, x2, x3];
  const springsY = [y0, y1, y2, y3];

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    targetX.set(e.clientX - rect.left);
    targetY.set(e.clientY - rect.top);
  };

  const handlePointerLeave = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    targetX.set(rect.width / 2);
    targetY.set(rect.height / 2);
  };

  return (
    <div
      ref={rootRef}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    >
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `url(#${filterId})`,
          mixBlendMode: blend,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: count }).map((_, i) => {
          const blobSize = size * (1 - i * 0.16);
          const color = p.colors[i % p.colors.length];
          return (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: blobSize,
                height: blobSize,
                marginLeft: -blobSize / 2,
                marginTop: -blobSize / 2,
                borderRadius: "50%",
                background: color,
                x: springs[i],
                y: springsY[i],
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
