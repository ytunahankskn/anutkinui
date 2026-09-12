"use client";

import { useEffect, useMemo, useState } from "react";

export interface DecryptedTextProps {
  palette?: keyof typeof PALETTES;
  text?: string;
  /** ms cinsinden tick süresi (20-120) */
  speed?: number;
  direction?: "start" | "end" | "center";
  /** Karakterler sırayla mı yoksa hepsi birden mi çözülür */
  sequential?: boolean;
  /** Karışırken kullanılacak glyph havuzu */
  characters?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PALETTES = {
  matrix: { ink: "#c9ffb0", accent: "#2bff6b", bg: "#05140a" },
  amber: { ink: "#ffdca8", accent: "#ff9d1f", bg: "#150d02" },
  cyan: { ink: "#c9f6ff", accent: "#26e0ff", bg: "#031015" },
  mono: { ink: "#f4f4f5", accent: "#8b8b93", bg: "#0a0a0b" },
} as const;

function computeOrder(len: number, direction: "start" | "end" | "center"): number[] {
  const idx = Array.from({ length: len }, (_, i) => i);
  if (direction === "end") return idx.slice().reverse();
  if (direction === "center") {
    const mid = Math.floor((len - 1) / 2);
    const order: number[] = len > 0 ? [mid] : [];
    for (let d = 1; d <= len; d++) {
      if (mid - d >= 0) order.push(mid - d);
      if (mid + d < len) order.push(mid + d);
    }
    return order;
  }
  return idx;
}

export function DecryptedText({
  palette = "matrix",
  text = "Access granted. Welcome back, operator.",
  speed = 45,
  direction = "start",
  sequential = true,
  characters = "ABCDEF0123456789!<>-_\\/[]{}—=+*^?#",
  className,
  style,
}: DecryptedTextProps) {
  const p = PALETTES[palette] ?? PALETTES.matrix;
  const chars = useMemo(() => text.split(""), [text]);
  const order = useMemo(() => computeOrder(chars.length, direction), [chars.length, direction]);
  const pool = characters.length > 0 ? characters : "*";

  const [revealed, setRevealed] = useState<boolean[]>(() => chars.map((c) => c === " "));
  const [display, setDisplay] = useState<string[]>(() => chars.slice());
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let step = 0;

    const randomGlyph = () => pool[Math.floor(Math.random() * pool.length)];
    const buildFrame = (revealSet: Set<number>) =>
      chars.map((c, i) => (c === " " ? " " : revealSet.has(i) ? c : randomGlyph()));

    const tick = () => {
      if (cancelled) return;
      step += 1;
      if (sequential) {
        const revealSet = new Set(order.slice(0, step));
        setDisplay(buildFrame(revealSet));
        setRevealed(chars.map((c, i) => c === " " || revealSet.has(i)));
        if (step >= order.length && intervalId) clearInterval(intervalId);
      } else {
        const burstTicks = 10;
        if (step >= burstTicks) {
          setDisplay(chars.slice());
          setRevealed(chars.map(() => true));
          if (intervalId) clearInterval(intervalId);
        } else {
          setDisplay(buildFrame(new Set()));
        }
      }
    };

    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;
      tick();
      intervalId = setInterval(tick, speed);
    });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [chars, order, sequential, speed, pool, trigger]);

  return (
    <span
      aria-label={text}
      role="text"
      className={className}
      style={{ fontFamily: "var(--font-mono, monospace)", whiteSpace: "pre-wrap", ...style }}
      onMouseEnter={() => setTrigger((t) => t + 1)}
    >
      <span aria-hidden>
        {display.map((c, i) => (
          <span key={i} style={{ color: revealed[i] ? p.ink : p.accent }}>
            {c}
          </span>
        ))}
      </span>
    </span>
  );
}
