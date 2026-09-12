"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Box, Layers, Sparkles, Star, TrendingUp, Zap, type LucideIcon } from "lucide-react";

export interface BentoGridProps {
  palette?: keyof typeof PALETTES;
  /** Sütun sayısı */
  columns?: number;
  /** Karolar arası boşluk (px) */
  gap?: number;
  /** Giriş animasyonundaki gecikme adımı (saniye) */
  stagger?: number;
  /** Karo köşe yuvarlaklığı (px) */
  rounded?: number;
  className?: string;
}

export const PALETTES = {
  aurora: { bg: "#0d0f1a", panel: "#141828", ink: "#f3f5ff", muted: "rgba(243,245,255,.6)", colors: ["#7c5cff", "#4f7cff", "#22d3ee", "#7ce0c9"] },
  sunset: { bg: "#1a0f0d", panel: "#241612", ink: "#fff4ec", muted: "rgba(255,244,236,.6)", colors: ["#ff7a59", "#ffb84d", "#ff5c8a", "#ffd166"] },
  ocean: { bg: "#061620", panel: "#0d2233", ink: "#eaf7ff", muted: "rgba(234,247,255,.6)", colors: ["#22d3ee", "#0ea5e9", "#38bdf8", "#67e8f9"] },
  mono: { bg: "#111113", panel: "#1a1a1d", ink: "#f5f5f5", muted: "rgba(245,245,245,.55)", colors: ["#9ca3af", "#d1d5db", "#e5e7eb", "#6b7280"] },
} as const;

interface Tile {
  icon: LucideIcon;
  title: string;
  line: string;
  colSpan: number;
  rowSpan: number;
}

const tiles: Tile[] = [
  { icon: Sparkles, title: "Craft", line: "Hand-tuned motion on every element.", colSpan: 2, rowSpan: 1 },
  { icon: Layers, title: "Layers", line: "Depth that responds to your input.", colSpan: 1, rowSpan: 2 },
  { icon: Zap, title: "Fast", line: "60fps, GPU-friendly by default.", colSpan: 1, rowSpan: 1 },
  { icon: Box, title: "Modular", line: "Copy one file, ship a component.", colSpan: 1, rowSpan: 1 },
  { icon: TrendingUp, title: "Scales", line: "From a single card to a full page.", colSpan: 2, rowSpan: 1 },
  { icon: Star, title: "Polished", line: "Details that make it feel premium.", colSpan: 1, rowSpan: 1 },
];

export function BentoGrid({
  palette = "aurora",
  columns = 4,
  gap = 12,
  stagger = 0.06,
  rounded = 20,
  className,
}: BentoGridProps) {
  const p = PALETTES[palette] ?? PALETTES.aurora;
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        background: p.bg,
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridAutoRows: 100,
          gridAutoFlow: "dense",
          gap,
          width: "100%",
          height: "100%",
        }}
      >
        {tiles.map((tile, i) => {
          const color = p.colors[i % p.colors.length];
          const Icon = tile.icon;
          const isHovered = hovered === i;
          return (
            <motion.div
              key={tile.title}
              variants={{ hidden: { opacity: 0, y: 16, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
              style={{
                position: "relative",
                gridColumn: `span ${tile.colSpan}`,
                gridRow: `span ${tile.rowSpan}`,
                borderRadius: rounded,
                background: p.panel,
                border: "1px solid rgba(255,255,255,.06)",
                padding: 18,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <motion.div
                aria-hidden
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, ${color}33, transparent 65%)`,
                  pointerEvents: "none",
                }}
              />

              <motion.div
                animate={{ scale: isHovered ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  position: "relative",
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${color}26`,
                  color,
                }}
              >
                <Icon size={17} strokeWidth={2} />
              </motion.div>

              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: p.ink, marginBottom: 4 }}>{tile.title}</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.4, color: p.muted }}>{tile.line}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
