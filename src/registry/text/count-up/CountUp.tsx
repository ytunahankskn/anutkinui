"use client";

import { useEffect, useRef, useState } from "react";

export interface CountUpProps {
  palette?: keyof typeof PALETTES;
  /** Başlangıç değeri */
  from?: number;
  to?: number;
  /** Saniye */
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  caption?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PALETTES = {
  violet: { colors: ["#8b5cf6", "#c4b5fd"], caption: "#a78bfa", bg: "#0d0b16" },
  emerald: { colors: ["#10b981", "#6ee7b7"], caption: "#34d399", bg: "#06120d" },
  amber: { colors: ["#f59e0b", "#fde68a"], caption: "#fbbf24", bg: "#170f04" },
} as const;

function expoOut(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function formatNumber(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function CountUp({
  palette = "violet",
  from = 0,
  to = 128400,
  duration = 2,
  prefix = "$",
  suffix = "",
  decimals = 0,
  caption = "monthly recurring revenue",
  className,
  style,
}: CountUpProps) {
  const p = PALETTES[palette] ?? PALETTES.violet;
  const rootRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let raf = 0;
    let cancelled = false;

    const run = () => {
      const start = performance.now();
      const durMs = Math.max(duration, 0.05) * 1000;

      const step = (now: number) => {
        if (cancelled) return;
        const t = Math.min((now - start) / durMs, 1);
        const eased = expoOut(t);
        setDisplay(from + (to - from) * eased);
        if (t < 1) {
          raf = requestAnimationFrame(step);
        }
      };

      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run();
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [from, to, duration]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8, ...style }}
    >
      <span
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 700,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          backgroundImage: `linear-gradient(90deg, ${p.colors.join(", ")})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          letterSpacing: "-0.02em",
        }}
      >
        {prefix}
        {formatNumber(display, decimals)}
        {suffix}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: p.caption,
        }}
      >
        {caption}
      </span>
    </div>
  );
}
