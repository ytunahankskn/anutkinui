"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export interface MagneticButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style"> {
  label?: string;
  /** Çekim gücü (0–1) */
  strength?: number;
  /** Çekimin başladığı mesafe (px) */
  radius?: number;
  variant?: "solid" | "outline";
}

export function MagneticButton({
  label = "Get started",
  strength = 0.4,
  radius = 140,
  variant = "solid",
  className,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 220, damping: 16, mass: 0.25 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  // Yazı, gövdeden biraz daha fazla kayar (parallax hissi)
  const tx = useTransform(sx, (v) => v * 0.45);
  const ty = useTransform(sy, (v) => v * 0.45);

  const [hover, setHover] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        x.set(dx * strength);
        y.set(dy * strength);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [radius, strength, x, y]);

  const solid = variant === "solid";

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      className={className}
      onPointerEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        setHover(true);
      }}
      onPointerLeave={() => setHover(false)}
      whileTap={{ scale: 0.96 }}
      {...(rest as object)}
    >
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 48,
          padding: "0 26px",
          borderRadius: 999,
          overflow: "hidden",
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          background: solid ? "var(--fg)" : "transparent",
          color: solid ? "var(--bg)" : "var(--fg)",
          border: solid ? "1px solid transparent" : "1px solid var(--border-strong)",
          isolation: "isolate",
        }}
      >
        <motion.span
          aria-hidden
          initial={false}
          animate={{ scale: hover ? 1 : 0, opacity: hover ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          style={{
            position: "absolute",
            left: `${origin.x}%`,
            top: `${origin.y}%`,
            width: 320,
            height: 320,
            marginLeft: -160,
            marginTop: -160,
            borderRadius: "50%",
            background: solid ? "var(--accent)" : "var(--fg)",
            zIndex: -1,
          }}
        />
        <motion.span
          style={{ x: tx, y: ty, display: "inline-block" }}
          animate={{ color: hover ? (solid ? "var(--accent-fg)" : "var(--bg)") : solid ? "var(--bg)" : "var(--fg)" }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      </span>
    </motion.button>
  );
}
