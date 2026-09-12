"use client";

import { useEffect, useRef } from "react";

export interface DotGridProps {
  palette?: keyof typeof PALETTES;
  /** Noktalar arası mesafe (px) */
  gap?: number;
  /** Boştaki nokta yarıçapı (px) */
  dotSize?: number;
  /** İmleç etkisinin ulaştığı mesafe (px) */
  proximity?: number;
  speed?: number;
  className?: string;
}

export const PALETTES = {
  mint: { bg: "#06201a", dot: "#1f8f74", accent: "#7dffd8", ink: "#eafff6" },
  coral: { bg: "#2a0f0f", dot: "#b34a3f", accent: "#ff9a7a", ink: "#fff3ee" },
  electric: { bg: "#070b2a", dot: "#3a4bd6", accent: "#7ef0ff", ink: "#eef4ff" },
  mono: { bg: "#0b0b0f", dot: "#3a3a44", accent: "#ffffff", ink: "#ffffff" },
} as const;

interface Config {
  palette: keyof typeof PALETTES;
  gap: number;
  dotSize: number;
  proximity: number;
  speed: number;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function DotGrid({ palette = "mint", gap = 24, dotSize = 2.5, proximity = 120, speed = 1, className }: DotGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef<Config>({ palette, gap, dotSize, proximity, speed });
  const pointerRef = useRef({ x: -9999, y: -9999 });

  // En güncel prop değerlerini rAF döngüsünün okuyabileceği bir ref'e yaz.
  useEffect(() => {
    configRef.current = { palette, gap, dotSize, proximity, speed };
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handlePointerLeave = () => {
      pointerRef.current = { x: -9999, y: -9999 };
    };
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    let raf = 0;
    let time = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const cfg = configRef.current;
      time += dt * cfg.speed;

      const p = PALETTES[cfg.palette] ?? PALETTES.mint;
      const dotRgb = hexToRgb(p.dot);
      const accentRgb = hexToRgb(p.accent);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = p.bg;
      ctx.fillRect(0, 0, width, height);

      const cellGap = Math.max(cfg.gap, 4);
      const cols = Math.ceil(width / cellGap) + 1;
      const rows = Math.ceil(height / cellGap) + 1;
      const pointer = pointerRef.current;
      const proximityRange = Math.max(cfg.proximity, 1);

      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const baseX = ix * cellGap;
          const baseY = iy * cellGap;

          const breathe = Math.sin(time * 0.6 + ix * 0.4 + iy * 0.3) * 0.5 + 0.5;

          const dx = baseX - pointer.x;
          const dy = baseY - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = Math.max(0, 1 - dist / proximityRange);

          const pushDist = t * cellGap * 0.35;
          const angle = Math.atan2(dy, dx);
          const x = baseX + Math.cos(angle) * pushDist;
          const y = baseY + Math.sin(angle) * pushDist;

          const radius = cfg.dotSize * (0.7 + breathe * 0.15 + t * 1.6);
          const r = mixChannel(dotRgb.r, accentRgb.r, t);
          const g = mixChannel(dotRgb.g, accentRgb.g, t);
          const b = mixChannel(dotRgb.b, accentRgb.b, t);
          const alpha = Math.min(0.55 + breathe * 0.15 + t * 0.3, 1);

          ctx.beginPath();
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.arc(x, y, Math.max(radius, 0.1), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
