"use client";

import { useId, useMemo } from "react";

export interface Marquee3DProps {
  palette?: keyof typeof PALETTES;
  /** Bir sütunun bir döngüsünün kaç saniye süreceği */
  speed?: number;
  /** Izgaranın X ekseni eğim açısı (derece) */
  tilt?: number;
  /** Sütun sayısı (3–5) */
  columns?: number;
  title?: string;
  className?: string;
}

export const PALETTES = {
  noir: {
    overlay: "linear-gradient(180deg, rgba(0,0,0,.1) 0%, rgba(0,0,0,.55) 55%, rgba(0,0,0,.92) 100%)",
    ink: "#f5f5f5",
    accent: "#f5f5f5",
    sub: "rgba(245,245,245,.72)",
  },
  ocean: {
    overlay: "linear-gradient(180deg, rgba(4,20,40,.15) 0%, rgba(3,16,32,.6) 55%, rgba(2,10,24,.92) 100%)",
    ink: "#eaf6ff",
    accent: "#38bdf8",
    sub: "rgba(190,230,255,.75)",
  },
  sunset: {
    overlay: "linear-gradient(180deg, rgba(40,10,10,.15) 0%, rgba(35,8,18,.6) 55%, rgba(26,6,16,.92) 100%)",
    ink: "#fff3ea",
    accent: "#fb923c",
    sub: "rgba(255,220,200,.75)",
  },
  mono: {
    overlay: "linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(0,0,0,.5) 55%, rgba(0,0,0,.9) 100%)",
    ink: "#ffffff",
    accent: "#d4d4d8",
    sub: "rgba(255,255,255,.65)",
  },
} as const;

const PHOTO_IDS = [
  "1506905925346-21bda4d32df4",
  "1519681393784-d120267933ba",
  "1500530855697-b586d89ba3ee",
  "1507525428034-b723cf961d3e",
  "1470071459604-3b5ec3a7fe05",
  "1441974231531-c6227db76b6e",
  "1501785888041-af3ef285b470",
  "1490750967868-88aa4486c946",
];

export function Marquee3D({
  palette = "noir",
  speed = 30,
  tilt = 55,
  columns = 4,
  title = "Real photos, in motion",
  className,
}: Marquee3DProps) {
  const p = PALETTES[palette] ?? PALETTES.noir;
  const uid = useId().replace(/:/g, "");
  const cols = Math.max(3, Math.min(5, Math.round(columns)));
  const duration = Math.max(10, Math.min(60, speed));
  const tiltDeg = Math.max(35, Math.min(70, tilt));

  const columnData = useMemo(() => {
    return Array.from({ length: cols }, (_, c) => {
      const urls = Array.from({ length: 8 }, (_, i) => {
        const id = PHOTO_IDS[(c * 3 + i) % PHOTO_IDS.length];
        return `https://images.unsplash.com/photo-${id}?w=500&h=700&fit=crop&q=75`;
      });
      return { urls: [...urls, ...urls], reverse: c % 2 === 1 };
    });
  }, [cols]);

  const scene = `m3d-${uid}-scene`;
  const grid = `m3d-${uid}-grid`;
  const col = `m3d-${uid}-col`;
  const trackUp = `m3d-${uid}-up`;
  const trackDown = `m3d-${uid}-down`;
  const tile = `m3d-${uid}-tile`;
  const keyUp = `m3d-${uid}-key-up`;
  const keyDown = `m3d-${uid}-key-down`;

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#050505" }}>
      <style>{`
        .${scene} { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; perspective: 1200px; }
        .${grid} { display: grid; gap: 16px; width: 150%; height: 170%; transform: rotateX(${tiltDeg}deg) rotateZ(-45deg); transform-style: preserve-3d; }
        .${col} { overflow: hidden; height: 100%; transform-style: preserve-3d; }
        .${trackUp}, .${trackDown} { display: flex; flex-direction: column; gap: 16px; animation-duration: ${duration}s; animation-timing-function: linear; animation-iteration-count: infinite; }
        .${trackUp} { animation-name: ${keyUp}; }
        .${trackDown} { animation-name: ${keyDown}; }
        @keyframes ${keyUp} { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes ${keyDown} { from { transform: translateY(-50%); } to { transform: translateY(0); } }
        .${tile} { transition: transform .35s ease, filter .35s ease; transform-style: preserve-3d; display: block; }
        .${tile}:hover { transform: translateZ(28px); filter: brightness(1.15); }
      `}</style>

      <div className={scene}>
        <div className={grid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {columnData.map((column, i) => (
            <div key={i} className={col}>
              <div className={column.reverse ? trackDown : trackUp}>
                {column.urls.map((src, j) => (
                  <img
                    key={j}
                    src={src}
                    crossOrigin="anonymous"
                    loading="lazy"
                    decoding="async"
                    alt=""
                    className={tile}
                    style={{
                      width: "100%",
                      aspectRatio: "3 / 4",
                      objectFit: "cover",
                      borderRadius: 12,
                      boxShadow: "0 10px 30px rgba(0,0,0,.5)",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, background: p.overlay, pointerEvents: "none" }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px",
          pointerEvents: "none",
          gap: 14,
        }}
      >
        <h2 style={{ margin: 0, fontSize: "clamp(28px, 5cqw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", color: p.ink }}>
          {title}
        </h2>
        <p style={{ margin: 0, fontSize: "clamp(13px, 1.6cqw, 16px)", color: p.sub, maxWidth: 440 }}>
          Galeriler, ürün vitrinleri ve portfolyolar için gerçek fotoğraflarla 3B duvar.
        </p>
        <button
          type="button"
          style={{
            pointerEvents: "auto",
            marginTop: 6,
            padding: "10px 22px",
            borderRadius: 999,
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            background: p.accent,
            color: "#050505",
          }}
        >
          Keşfet
        </button>
      </div>
    </div>
  );
}
