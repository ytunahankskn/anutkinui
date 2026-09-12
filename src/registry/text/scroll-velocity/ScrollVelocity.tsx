"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export interface ScrollVelocityProps {
  palette?: keyof typeof PALETTES;
  text?: string;
  /** Sabit temel hız (0-5) */
  baseSpeed?: number;
  /** Scroll hızının skewX'e katkı çarpanı (0-2) */
  skewFactor?: number;
  /** Satır sayısı (1-4) */
  rows?: number;
  /** Tek satırları outline (text-stroke) yap */
  outline?: boolean;
  /**
   * Scroll eden eleman. Sayfa scroll'u için boş bırak; bir kutu içinde
   * kullanıyorsan o kutuyu ver (kutu `container-type: size` olmalı).
   */
  scroller?: HTMLElement | null;
  className?: string;
}

export const PALETTES = {
  electric: { bg: "#050014", colors: ["#7dd3fc", "#c084fc", "#f472b6", "#facc15"], ink: "#eef2ff" },
  sunset: { bg: "#1a0b08", colors: ["#ff8a5c", "#ff5e7e", "#ffd166", "#ff3d81"], ink: "#fff3e9" },
  mono: { bg: "#0a0a0a", colors: ["#ffffff", "#d4d4d8", "#a1a1aa", "#71717a"], ink: "#ffffff" },
} as const;

const PX_PER_SEC = 40;

export function ScrollVelocity({
  palette = "electric",
  text = "ANUTKINUI ✦ MOTION ✦ ",
  baseSpeed = 1.5,
  skewFactor = 0.6,
  rows = 2,
  outline = false,
  scroller,
  className,
}: ScrollVelocityProps) {
  const root = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offsets = useRef<number[]>([]);
  const n = Math.max(1, Math.min(4, Math.round(rows)));
  const p = PALETTES[palette] ?? PALETTES.electric;

  useEffect(() => {
    const rawVelocity = { current: 0 };
    const velocity = { current: 0 };
    const target: EventTarget = scroller ?? window;
    let lastY = scroller ? scroller.scrollTop : window.scrollY;

    const onScroll = () => {
      const y = scroller ? scroller.scrollTop : window.scrollY;
      rawVelocity.current += y - lastY;
      lastY = y;
    };
    target.addEventListener("scroll", onScroll, { passive: true });

    if (offsets.current.length !== n) offsets.current = new Array(n).fill(0);

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000;
      velocity.current += (rawVelocity.current - velocity.current) * 0.18;
      rawVelocity.current *= 0.82;

      const boost = Math.min(Math.abs(velocity.current) * 1.4, 60);
      const skew = Math.max(-24, Math.min(24, velocity.current * skewFactor * 0.6));

      for (let i = 0; i < n; i++) {
        const trackEl = trackRefs.current[i];
        if (!trackEl) continue;
        const dir = i % 2 === 0 ? -1 : 1;
        const unit = trackEl.scrollWidth / 2 || 1;
        offsets.current[i] += dir * (baseSpeed * PX_PER_SEC + boost) * dt;
        const wrapped = ((offsets.current[i] % unit) + unit) % unit;
        gsap.set(trackEl, { x: -wrapped, skewX: skew * dir * -1 });
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      target.removeEventListener("scroll", onScroll);
    };
  }, [n, baseSpeed, skewFactor, scroller]);

  const unit = text.repeat(8);

  return (
    <div
      ref={root}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        background: p.bg,
        padding: "clamp(16px, 4cqh, 32px) 0",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(6px, 1.4cqh, 18px)",
      }}
    >
      {Array.from({ length: n }, (_, i) => {
        const color = p.colors[i % p.colors.length];
        const useOutline = outline && i % 2 === 1;
        return (
          <div key={i} style={{ overflow: "hidden", width: "100%" }}>
            <div
              ref={(node) => {
                trackRefs.current[i] = node;
              }}
              style={{ display: "flex", width: "max-content", willChange: "transform" }}
            >
              {[0, 1].map((half) => (
                <span
                  key={half}
                  style={{
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(28px, 7cqw, 84px)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                    color: useOutline ? "transparent" : color,
                    WebkitTextStroke: useOutline ? `1.5px ${color}` : undefined,
                  }}
                >
                  {unit}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
