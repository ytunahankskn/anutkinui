"use client";

import { useId } from "react";
import { motion } from "motion/react";

export interface ShimmerButtonProps {
  palette?: keyof typeof PALETTES;
  label?: string;
  /** Bir tam dönüşün süresi (saniye) */
  speed?: number;
  radius?: number;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PALETTES = {
  violet: { stops: ["#7c5cff", "#33e0c2", "#ff6ec7", "#7c5cff"], surface: "#17132e", ink: "#f3f0ff", glow: "rgba(124,92,255,0.6)" },
  cyan: { stops: ["#2fd0ff", "#7c5cff", "#2fd0ff"], surface: "#0a1b2c", ink: "#eafcff", glow: "rgba(47,208,255,0.55)" },
  gold: { stops: ["#f5c542", "#ff8a3d", "#fff1b8", "#f5c542"], surface: "#2a1d08", ink: "#fff6df", glow: "rgba(245,197,66,0.55)" },
  rose: { stops: ["#ff6ec7", "#ff9a7a", "#ff6ec7"], surface: "#2a0f1f", ink: "#ffeef8", glow: "rgba(255,110,199,0.55)" },
} as const;

/**
 * Dönen konik "border beam" + hover'da çapraz shimmer süpürmesi.
 * Kenarlık: butonu 1.5px padding'li bir kapsayıcıya koyup arkasında büyük bir KARE konik
 * gradient döndürüyoruz (kare olmayan bir elemanı döndürmek çapraz çizgi artefaktı yaratır).
 */
export function ShimmerButton({
  palette = "violet",
  label = "Start building",
  speed = 3,
  radius = 32,
  glow = true,
  className,
  onClick,
}: ShimmerButtonProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = PALETTES[palette] ?? PALETTES.violet;
  const cls = `sh-${uid}`;
  const conic = `conic-gradient(from 0deg, ${p.stops.join(", ")})`;
  const border = 1.5;

  return (
    <span className={`${cls}-root`} style={{ position: "relative", display: "inline-block", isolation: "isolate" }}>
      <style>{`
        @keyframes ${cls}-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes ${cls}-sweep {
          0% { transform: translateX(-130%) skewX(-18deg); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translateX(130%) skewX(-18deg); opacity: 0; }
        }
        .${cls}-frame {
          position: relative;
          display: inline-block;
          padding: ${border}px;
          border-radius: ${radius}px;
          overflow: hidden;
          background: rgba(255,255,255,0.08);
        }
        .${cls}-frame::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 260%;
          aspect-ratio: 1 / 1;
          transform: translate(-50%, -50%);
          background-image: ${conic};
          animation: ${cls}-spin ${speed}s linear infinite;
          pointer-events: none;
        }
        .${cls}-shimmer {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          background: linear-gradient(75deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%);
        }
        .${cls}-root:hover .${cls}-shimmer { animation: ${cls}-sweep 1.1s ease; }
        @media (prefers-reduced-motion: reduce) { .${cls}-frame::before { animation: none; } }
      `}</style>

      {glow && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: radius + 12,
            background: p.glow,
            filter: "blur(22px)",
            opacity: 0.75,
            zIndex: -1,
          }}
        />
      )}

      <span className={`${cls}-frame`}>
        <motion.button
          type="button"
          onClick={onClick}
          className={className}
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -1 }}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 50,
            padding: "0 30px",
            borderRadius: Math.max(0, radius - border),
            border: "none",
            overflow: "hidden",
            background: p.surface,
            color: p.ink,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            cursor: "pointer",
            isolation: "isolate",
          }}
        >
          <span aria-hidden="true" className={`${cls}-shimmer`} />
          <span style={{ position: "relative" }}>{label}</span>
        </motion.button>
      </span>
    </span>
  );
}
