"use client";

import { useEffect, useMemo, useRef } from "react";

export interface GradientMeshProps {
  palette?: keyof typeof PALETTES;
  speed?: number;
  /** Blob bulanıklığı (px) */
  blur?: number;
  /** Blob sayısı */
  blobs?: number;
  /** İnce film grain katmanı */
  grain?: boolean;
  className?: string;
}

export const PALETTES = {
  sunset: { bg: "#1a0f1f", colors: ["#ff6b6b", "#ffa94d", "#ff8fab", "#845ec2"], ink: "#fff6f0" },
  ocean: { bg: "#04141f", colors: ["#0ea5c4", "#1d4ed8", "#22d3ee", "#0f766e"], ink: "#eafcff" },
  candy: { bg: "#1a0f2e", colors: ["#ff6ec7", "#7c4dff", "#ffd166", "#4dd8ff"], ink: "#fef6ff" },
  forest: { bg: "#071a12", colors: ["#2f9e44", "#66bb6a", "#a3d977", "#0f5132"], ink: "#f1fff2" },
  midnight: { bg: "#05070f", colors: ["#3b82f6", "#8b5cf6", "#06b6d4", "#1e293b"], ink: "#eef2ff" },
} as const;

interface Config {
  palette: keyof typeof PALETTES;
  speed: number;
  blur: number;
  grain: boolean;
}

interface Blob {
  nx: number;
  ny: number;
  ampX: number;
  ampY: number;
  freqX: number;
  freqY: number;
  phase: number;
  radiusFactor: number;
  colorIndex: number;
}

/** Deterministik PRNG (mulberry32): aynı blob sayısı her zaman aynı düzeni verir. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBlobs(count: number): Blob[] {
  const rand = seeded(count * 48611);
  const out: Blob[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      nx: 0.2 + rand() * 0.6,
      ny: 0.2 + rand() * 0.6,
      ampX: 0.18 + rand() * 0.22,
      ampY: 0.18 + rand() * 0.22,
      freqX: 0.15 + rand() * 0.25,
      freqY: 0.15 + rand() * 0.25,
      phase: rand() * Math.PI * 2,
      radiusFactor: 0.32 + rand() * 0.22,
      colorIndex: i,
    });
  }
  return out;
}

const GRAIN_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>` +
    `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/>` +
    `<feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0'/></filter>` +
    `<rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}`;

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function GradientMesh({ palette = "sunset", speed = 1, blur = 70, blobs = 5, grain = true, className }: GradientMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef<Config>({ palette, speed, blur, grain });
  const blobsData = useMemo(() => buildBlobs(blobs), [blobs]);
  const blobsRef = useRef<Blob[]>(blobsData);

  useEffect(() => {
    configRef.current = { palette, speed, blur, grain };
    blobsRef.current = blobsData;
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

      const p = PALETTES[cfg.palette] ?? PALETTES.sunset;
      const diag = Math.sqrt(width * width + height * height);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = p.bg;
      ctx.fillRect(0, 0, width, height);

      ctx.filter = `blur(${cfg.blur}px)`;
      ctx.globalCompositeOperation = "lighter";

      for (const blob of blobsRef.current) {
        const cx = blob.nx * width + Math.sin(time * blob.freqX + blob.phase) * blob.ampX * width;
        const cy = blob.ny * height + Math.cos(time * blob.freqY + blob.phase) * blob.ampY * height;
        const radius = blob.radiusFactor * diag * 0.5;
        const color = p.colors[blob.colorIndex % p.colors.length];

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(radius, 1));
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(radius, 1), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";

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
      {grain ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${GRAIN_SVG}")`,
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
}
