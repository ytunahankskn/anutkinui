"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface ImageTrailProps {
  palette?: keyof typeof PALETTES;
  /** Bu piksel mesafesi aşılınca yeni görsel doğar */
  threshold?: number;
  /** Görsel genişliği (px), yükseklik 1.2 oranında hesaplanır */
  size?: number;
  /** Bir görselin ekranda kalma süresi (ms) */
  lifetime?: number;
  /** Maksimum rastgele döndürme açısı (derece) */
  rotation?: number;
  /** Aynı anda ekranda kalabilecek maksimum görsel sayısı */
  maxImages?: number;
  className?: string;
}

export const PALETTES = {
  noir: { bg: "#050505", ink: "#f5f5f5", frame: "0 20px 60px rgba(0,0,0,.6)", border: "rgba(255,255,255,.1)" },
  paper: { bg: "#f3efe7", ink: "#1a1a1a", frame: "0 12px 30px rgba(0,0,0,.18)", border: "rgba(0,0,0,.1)" },
  neon: { bg: "#080014", ink: "#f5f2ff", frame: "0 0 40px rgba(168,85,247,.45)", border: "rgba(168,85,247,.5)" },
  warm: { bg: "#1a0f08", ink: "#fff3e6", frame: "0 16px 40px rgba(0,0,0,.4)", border: "rgba(255,180,120,.25)" },
} as const;

const IMAGE_IDS = [
  "1506905925346-21bda4d32df4",
  "1519681393784-d120267933ba",
  "1500530855697-b586d89ba3ee",
  "1470071459604-3b5ec3a7fe05",
  "1501785888041-af3ef285b470",
  "1490750967868-88aa4486c946",
  "1433086966358-54859d0ed716",
  "1518837695005-2083093ee35b",
];

interface TrailImage {
  id: number;
  x: number;
  y: number;
  rotate: number;
  src: string;
}

/** Deterministik PRNG (mulberry32) — dönüş açısı için "rastgele hissettiren" ama tekrarlanabilir sıra. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function ImageTrail({
  palette = "noir",
  threshold = 80,
  size = 180,
  lifetime = 900,
  rotation = 12,
  maxImages = 8,
  className,
}: ImageTrailProps) {
  const p = PALETTES[palette] ?? PALETTES.noir;
  const rootRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const counterRef = useRef(0);
  const rngRef = useRef(seeded(7));
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const [images, setImages] = useState<TrailImage[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const last = lastPos.current;
    if (last && Math.hypot(x - last.x, y - last.y) < threshold) return;
    lastPos.current = { x, y };

    const id = counterRef.current++;
    const rand = rngRef.current;
    const photoId = IMAGE_IDS[id % IMAGE_IDS.length];
    const rotate = (rand() - 0.5) * 2 * rotation;
    const src = `https://images.unsplash.com/photo-${photoId}?w=400&h=500&fit=crop&q=80`;

    setImages((prev) => {
      const next = [...prev, { id, x, y, rotate, src }];
      return next.length > maxImages ? next.slice(next.length - maxImages) : next;
    });

    const timer = setTimeout(() => {
      setImages((prev) => prev.filter((img) => img.id !== id));
      timersRef.current.delete(id);
    }, lifetime);
    timersRef.current.set(id, timer);
  };

  const height = size * 1.2;

  return (
    <div
      ref={rootRef}
      className={className}
      onPointerMove={handlePointerMove}
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: p.bg, touchAction: "none" }}
    >
      <AnimatePresence>
        {images.map((img) => (
          <motion.img
            key={img.id}
            src={img.src}
            crossOrigin="anonymous"
            loading="lazy"
            decoding="async"
            alt=""
            initial={{ opacity: 0, scale: 0.6, x: img.x - size / 2, y: img.y - height / 2, rotate: img.rotate }}
            animate={{ opacity: 1, scale: 1, x: img.x - size / 2, y: img.y - height / 2, rotate: img.rotate }}
            exit={{ opacity: 0, scale: 1.2, y: img.y - height / 2 - 40, transition: { duration: 0.5, ease: "easeOut" } }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size,
              height,
              objectFit: "cover",
              borderRadius: 14,
              boxShadow: p.frame,
              border: `1px solid ${p.border}`,
              pointerEvents: "none",
              willChange: "transform, opacity",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
