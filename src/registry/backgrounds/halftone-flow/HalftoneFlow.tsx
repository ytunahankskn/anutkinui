"use client";

import { useEffect, useRef } from "react";

export interface HalftoneFlowProps {
  palette?: keyof typeof PALETTES;
  /** Izgara hücre boyutu (px) */
  cell?: number;
  speed?: number;
  /** Nokta boyutu kontrastı (0.5 düz, 2 sert) */
  contrast?: number;
  /** Izgaranın döndürülme açısı (derece) */
  angle?: number;
  className?: string;
}

export const PALETTES = {
  amber: { bg: "#1a1206", ink: "#ffb84d" },
  violet: { bg: "#140a1f", ink: "#b388ff" },
  cyan: { bg: "#04181c", ink: "#4dd9ec" },
  mono: { bg: "#0c0c0c", ink: "#f2f2f2" },
} as const;

interface Config {
  palette: keyof typeof PALETTES;
  cell: number;
  speed: number;
  contrast: number;
  angle: number;
}

/** Tam sayı koordinatlardan deterministik 0..1 hash (Math.random kullanılmıyor). */
function hash(x: number, y: number) {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return h - Math.floor(h);
}

/** Küçük bir 2D değer-noise (value noise) uygulaması. */
function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);

  const top = a + (b - a) * u;
  const bottom = c + (d - c) * u;
  return top + (bottom - top) * v;
}

function fbm(x: number, y: number) {
  let value = 0;
  let amplitude = 0.6;
  let freq = 1;
  for (let i = 0; i < 3; i++) {
    value += amplitude * valueNoise(x * freq, y * freq);
    freq *= 2;
    amplitude *= 0.5;
  }
  return value;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function HalftoneFlow({ palette = "amber", cell = 10, speed = 1, contrast = 1.2, angle = 15, className }: HalftoneFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef<Config>({ palette, cell, speed, contrast, angle });

  useEffect(() => {
    configRef.current = { palette, cell, speed, contrast, angle };
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

    let raf = 0;
    let time = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const cfg = configRef.current;
      time += dt * cfg.speed;

      const p = PALETTES[cfg.palette] ?? PALETTES.amber;
      const ink = hexToRgb(p.ink);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = p.bg;
      ctx.fillRect(0, 0, width, height);

      const cellSize = Math.max(cfg.cell, 2);
      const diag = Math.ceil(Math.sqrt(width * width + height * height) / 2 / cellSize) + 2;
      const rad = (cfg.angle * Math.PI) / 180;
      const flowX = Math.cos(rad * 0.6);
      const flowY = Math.sin(rad * 0.6) + 0.4;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(rad);

      for (let iy = -diag; iy <= diag; iy++) {
        for (let ix = -diag; ix <= diag; ix++) {
          const x = ix * cellSize;
          const y = iy * cellSize;

          const n = fbm(ix * 0.18 + time * flowX * 0.6, iy * 0.18 + time * flowY * 0.6);
          const centered = (n - 0.5) * cfg.contrast;
          const tone = Math.min(Math.max(centered + 0.5, 0), 1);
          const radius = tone * cellSize * 0.5;

          if (radius <= 0.15) continue;

          ctx.beginPath();
          ctx.fillStyle = `rgb(${ink.r}, ${ink.g}, ${ink.b})`;
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
