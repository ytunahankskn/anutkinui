"use client";

import { useEffect, useRef } from "react";

export interface PixelTrailProps {
  palette?: keyof typeof PALETTES;
  /** Sanal piksel hücre boyutu (px) */
  pixelSize?: number;
  /** Her karede yoğunluğun çarpıldığı sönümleme katsayısı */
  fade?: number;
  /** Aydınlık pikseller için gölge parlaması */
  glow?: boolean;
  /** Her fare hareketinde yakılan piksel sayısı */
  density?: number;
  className?: string;
}

export const PALETTES = {
  candy: { hue: 328, sat: 88, light: 66 },
  matrix: { hue: 132, sat: 78, light: 52 },
  ember: { hue: 24, sat: 92, light: 58 },
  ocean: { hue: 196, sat: 82, light: 58 },
} as const;

interface Grid {
  cols: number;
  rows: number;
  intensities: Float32Array;
  hues: Float32Array;
  cssWidth: number;
  cssHeight: number;
}

/** Deterministik PRNG (mulberry32) — hue varyasyonu için */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function PixelTrail({
  palette = "candy",
  pixelSize = 18,
  fade = 0.94,
  glow = true,
  density = 2,
  className,
}: PixelTrailProps) {
  const p = PALETTES[palette] ?? PALETTES.candy;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Grid | null>(null);
  const rngRef = useRef(seeded(1));

  // En son prop değerlerini rAF döngüsüne sızdırmadan taşıyan referanslar
  const drawParamsRef = useRef({ fade, glow, hue: p.hue, sat: p.sat, light: p.light });
  useEffect(() => {
    drawParamsRef.current = { fade, glow, hue: p.hue, sat: p.sat, light: p.light };
  }, [fade, glow, p.hue, p.sat, p.light]);

  const densityRef = useRef(density);
  useEffect(() => {
    densityRef.current = density;
  }, [density]);

  // Kanvas boyutu + piksel ızgarası: pixelSize değişince (geometri) yeniden kurulur.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rebuild = (cssWidth: number, cssHeight: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.max(1, Math.ceil(cssWidth / pixelSize));
      const rows = Math.max(1, Math.ceil(cssHeight / pixelSize));
      gridRef.current = {
        cols,
        rows,
        intensities: new Float32Array(cols * rows),
        hues: new Float32Array(cols * rows),
        cssWidth,
        cssHeight,
      };
    };

    const rect = root.getBoundingClientRect();
    rebuild(rect.width, rect.height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      rebuild(width, height);
    });
    observer.observe(root);

    let raf = 0;
    const tick = () => {
      const grid = gridRef.current;
      if (grid) {
        const { fade: f, glow: g, hue, sat, light } = drawParamsRef.current;
        ctx.clearRect(0, 0, grid.cssWidth, grid.cssHeight);
        for (let row = 0; row < grid.rows; row++) {
          for (let col = 0; col < grid.cols; col++) {
            const idx = row * grid.cols + col;
            let v = grid.intensities[idx];
            if (v <= 0.003) continue;
            v *= f;
            grid.intensities[idx] = v < 0.003 ? 0 : v;
            const alpha = Math.min(1, v);
            const color = `hsla(${hue + grid.hues[idx]}, ${sat}%, ${light}%, ${alpha})`;
            ctx.fillStyle = color;
            ctx.shadowBlur = g ? pixelSize * 0.9 : 0;
            ctx.shadowColor = g ? color : "transparent";
            ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize - 1, pixelSize - 1);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [pixelSize]);

  const lightAt = (clientX: number, clientY: number) => {
    const root = rootRef.current;
    const grid = gridRef.current;
    if (!root || !grid) return;
    const rect = root.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const baseCol = Math.floor(x / pixelSize);
    const baseRow = Math.floor(y / pixelSize);
    const rand = rngRef.current;
    const count = Math.max(1, Math.min(4, densityRef.current));

    for (let i = 0; i < count; i++) {
      const spread = i === 0 ? 0 : 1;
      const col = Math.min(grid.cols - 1, Math.max(0, baseCol + Math.round((rand() - 0.5) * 2 * spread)));
      const row = Math.min(grid.rows - 1, Math.max(0, baseRow + Math.round((rand() - 0.5) * 2 * spread)));
      const idx = row * grid.cols + col;
      grid.intensities[idx] = 1;
      grid.hues[idx] = (rand() - 0.5) * 40;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    lightAt(e.clientX, e.clientY);
  };

  return (
    <div
      ref={rootRef}
      className={className}
      onPointerMove={handlePointerMove}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
