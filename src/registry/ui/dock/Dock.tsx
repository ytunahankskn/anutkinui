"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { Code2, Home, Image, Mail, Music, Search, Settings, type LucideIcon } from "lucide-react";

export interface DockProps {
  palette?: keyof typeof PALETTES;
  /** Fare tam üstündeyken ikonun kaç kat büyüyeceği */
  magnification?: number;
  /** Büyümenin etkili olduğu mesafe (px) */
  distance?: number;
  /** Taban ikon boyutu (px) */
  size?: number;
  /** İkon üstü etiketleri göster */
  tooltips?: boolean;
  className?: string;
}

export const PALETTES = {
  glassDark: { bg: "rgba(24,24,30,.55)", border: "rgba(255,255,255,.12)", icon: "#e8e8ef", iconBg: "rgba(255,255,255,.08)", tooltipBg: "#1c1c22", tooltipInk: "#f2f2f5" },
  glassLight: { bg: "rgba(255,255,255,.55)", border: "rgba(20,20,25,.1)", icon: "#1c1c22", iconBg: "rgba(20,20,25,.06)", tooltipBg: "#1c1c22", tooltipInk: "#f7f7fa" },
  neon: { bg: "rgba(10,14,28,.55)", border: "rgba(124,255,214,.35)", icon: "#c8fff0", iconBg: "rgba(124,255,214,.14)", tooltipBg: "#0d3b30", tooltipInk: "#c8fff0" },
  warm: { bg: "rgba(38,22,14,.55)", border: "rgba(255,183,120,.3)", icon: "#ffe7cf", iconBg: "rgba(255,183,120,.16)", tooltipBg: "#3a2314", tooltipInk: "#ffe7cf" },
} as const;

interface DockItem {
  icon: LucideIcon;
  label: string;
}

// Not: lucide-react bu sürümde marka ikonlarını (Github) içermiyor; görsel olarak yakın
// duran Code2 ikonuyla değiştirildi.
const items: DockItem[] = [
  { icon: Home, label: "Home" },
  { icon: Search, label: "Search" },
  { icon: Mail, label: "Mail" },
  { icon: Image, label: "Gallery" },
  { icon: Music, label: "Music" },
  { icon: Settings, label: "Settings" },
  { icon: Code2, label: "GitHub" },
];

function DockIcon({
  mouseX,
  item,
  size,
  magnification,
  distance,
  tooltips,
  palette,
}: {
  mouseX: MotionValue<number>;
  item: DockItem;
  size: number;
  magnification: number;
  distance: number;
  tooltips: boolean;
  palette: (typeof PALETTES)[keyof typeof PALETTES];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const dist = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return distance;
    return val - (bounds.left + bounds.width / 2);
  });

  const targetSize = useTransform(dist, [-distance, 0, distance], [size, size * magnification, size]);
  const boxSize = useSpring(targetSize, { mass: 0.15, stiffness: 220, damping: 16 });
  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      style={{
        position: "relative",
        width: boxSize,
        height: boxSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        background: palette.iconBg,
        color: palette.icon,
        flexShrink: 0,
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={1.8} style={{ width: "50%", height: "50%" }} />
      {tooltips && (
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                bottom: "calc(100% + 12px)",
                left: "50%",
                translateX: "-50%",
                whiteSpace: "nowrap",
                padding: "5px 10px",
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 500,
                background: palette.tooltipBg,
                color: palette.tooltipInk,
                pointerEvents: "none",
              }}
            >
              {item.label}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export function Dock({
  palette = "glassDark",
  magnification = 1.8,
  distance = 140,
  size = 44,
  tooltips = true,
  className,
}: DockProps) {
  const p = PALETTES[palette] ?? PALETTES.glassDark;
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      className={className}
      onPointerMove={(e) => mouseX.set(e.clientX)}
      onPointerLeave={() => mouseX.set(Infinity)}
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        padding: 10,
        borderRadius: 20,
        background: p.bg,
        border: `1px solid ${p.border}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 20px 50px -20px rgba(0,0,0,.5)",
      }}
    >
      {items.map((item) => (
        <DockIcon
          key={item.label}
          mouseX={mouseX}
          item={item}
          size={size}
          magnification={magnification}
          distance={distance}
          tooltips={tooltips}
          palette={p}
        />
      ))}
    </motion.div>
  );
}
