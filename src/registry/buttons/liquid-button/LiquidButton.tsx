"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "motion/react";

export interface LiquidButtonProps {
  palette?: keyof typeof PALETTES;
  label?: string;
  /** feGaussianBlur stdDeviation — goo'nun yumuşaklığı */
  viscosity?: number;
  /** Dairelerin yükseliş hızı çarpanı */
  speed?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export const PALETTES = {
  berry: { outline: "#e14fce", fill: "#ff4fc3", ink: "#ffb3ec", inkFilled: "#2b0620", bg: "#1c0716" },
  lime: { outline: "#9be000", fill: "#c6ff33", ink: "#d7ff8f", inkFilled: "#173400", bg: "#0e1403" },
  ocean: { outline: "#2fb8ff", fill: "#3ad0ff", ink: "#a9e8ff", inkFilled: "#001b2e", bg: "#040e18" },
  lava: { outline: "#ff6a3d", fill: "#ff8a3d", ink: "#ffc7a6", inkFilled: "#2b0900", bg: "#180702" },
} as const;

const SIZES = {
  sm: { height: 40, paddingX: 22, fontSize: 13, circles: 6 },
  md: { height: 52, paddingX: 30, fontSize: 15, circles: 8 },
  lg: { height: 64, paddingX: 38, fontSize: 17, circles: 8 },
} as const;

export function LiquidButton({
  palette = "berry",
  label = "Get access",
  viscosity = 9,
  speed = 1,
  size = "md",
  className,
  onClick,
}: LiquidButtonProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = PALETTES[palette] ?? PALETTES.berry;
  const s = SIZES[size] ?? SIZES.md;
  const [hover, setHover] = useState(false);

  const circles = useMemo(() => {
    const count: number = s.circles;
    return Array.from({ length: count }, (_, i) => {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const circleSize = s.height * 0.6 + Math.sin(i * 1.9 + 1) * s.height * 0.14;
      return { left: `${6 + t * 88}%`, size: circleSize };
    });
  }, [s]);

  const rise = s.height * 1.6;
  const filterId = `lb-goo-${uid}`;

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={viscosity} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
        </defs>
      </svg>
      <motion.button
        type="button"
        onClick={onClick}
        className={className}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
        whileTap={{ scale: 0.97 }}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: s.height,
          padding: `0 ${s.paddingX}px`,
          borderRadius: 999,
          border: `2px solid ${p.outline}`,
          overflow: "hidden",
          background: "transparent",
          cursor: "pointer",
          isolation: "isolate",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -2,
            filter: `url(#${filterId})`,
            zIndex: 0,
          }}
        >
          {circles.map((c, i) => (
            <motion.span
              key={i}
              style={{
                position: "absolute",
                left: c.left,
                bottom: -c.size,
                width: c.size,
                height: c.size,
                marginLeft: -c.size / 2,
                borderRadius: "50%",
                background: p.fill,
              }}
              animate={{ y: hover ? -rise : 0 }}
              transition={{
                type: "spring",
                stiffness: 170 + speed * 60,
                damping: 18,
                mass: 0.6,
                delay: hover ? (i * 0.035) / speed : 0,
              }}
            />
          ))}
        </span>
        <motion.span
          style={{ position: "relative", zIndex: 1, fontSize: s.fontSize, fontWeight: 600, letterSpacing: "-0.01em" }}
          animate={{ color: hover ? p.inkFilled : p.ink }}
          transition={{ duration: 0.25 }}
        >
          {label}
        </motion.span>
      </motion.button>
    </span>
  );
}
