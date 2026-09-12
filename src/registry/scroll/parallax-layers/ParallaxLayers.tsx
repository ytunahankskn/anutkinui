"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface ParallaxLayersProps {
  palette?: keyof typeof PALETTES;
  /** Parallax kayma yoğunluğu (0.2-2) */
  depth?: number;
  /** Görünecek katman sayısı (3-6) */
  layers?: number;
  title?: string;
  /** Sis/haze katmanı */
  fog?: boolean;
  /**
   * Scroll eden eleman. Sayfa scroll'u için boş bırak; bir kutu içinde
   * kullanıyorsan o kutuyu ver (kutu `container-type: size` olmalı).
   */
  scroller?: HTMLElement | null;
  className?: string;
}

export const PALETTES = {
  dusk: {
    sky: "linear-gradient(180deg, #2b1055 0%, #7b2d6b 45%, #ff7a5c 75%, #ffd08a 100%)",
    sun: "#ffb35c",
    mountains: "#3a2151",
    hills: "#5c2e55",
    foreground: "#1b0f2e",
    mist: "rgba(255,190,150,0.35)",
    ink: "#fff3e6",
  },
  day: {
    sky: "linear-gradient(180deg, #4fa8e0 0%, #a9dcf0 55%, #e9f7ff 100%)",
    sun: "#fff3b0",
    mountains: "#7893a8",
    hills: "#4f7a5c",
    foreground: "#22331f",
    mist: "rgba(255,255,255,0.55)",
    ink: "#0b1a2a",
  },
  night: {
    sky: "linear-gradient(180deg, #01030f 0%, #071233 55%, #101c44 100%)",
    sun: "#dfe6ff",
    mountains: "#0d1730",
    hills: "#141f3d",
    foreground: "#05080f",
    mist: "rgba(150,180,255,0.18)",
    ink: "#eaf0ff",
  },
} as const;

type PaletteEntry = (typeof PALETTES)[keyof typeof PALETTES];
type LayerKind = "sky" | "sun" | "mountains" | "hills" | "foreground" | "mist";

const LAYER_ORDER: { kind: LayerKind; rate: number }[] = [
  { kind: "sky", rate: 0.03 },
  { kind: "sun", rate: 0 },
  { kind: "mountains", rate: 0.12 },
  { kind: "hills", rate: 0.28 },
  { kind: "foreground", rate: 0.5 },
  { kind: "mist", rate: 0.2 },
];

function layerStyle(kind: LayerKind): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute", left: 0, right: 0, willChange: "transform" };
  switch (kind) {
    case "sky":
      return { ...base, top: 0, bottom: 0 };
    case "sun":
      return { ...base, top: "8cqh", left: "50%", right: "auto", width: "16cqh", height: "16cqh", marginLeft: "-8cqh" };
    case "mountains":
      return { ...base, bottom: 0, height: "44cqh" };
    case "hills":
      return { ...base, bottom: 0, height: "32cqh" };
    case "foreground":
      return { ...base, bottom: 0, height: "24cqh" };
    case "mist":
      return { ...base, bottom: "20cqh", height: "14cqh" };
  }
}

function renderLayer(kind: LayerKind, p: PaletteEntry) {
  switch (kind) {
    case "sky":
      return <div style={{ position: "absolute", inset: 0, background: p.sky }} />;
    case "sun":
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${p.sun} 0%, ${p.sun} 35%, transparent 72%)`,
            boxShadow: `0 0 60px 10px ${p.sun}55`,
          }}
        />
      );
    case "mountains":
      return (
        <svg viewBox="0 0 100 44" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <polygon points="0,44 0,24 12,11 22,27 34,7 46,25 58,5 70,21 82,9 92,23 100,15 100,44" fill={p.mountains} />
        </svg>
      );
    case "hills":
      return (
        <svg viewBox="0 0 100 32" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <polygon points="0,32 0,17 15,11 30,19 45,9 60,17 75,7 90,15 100,11 100,32" fill={p.hills} />
        </svg>
      );
    case "foreground":
      return (
        <svg viewBox="0 0 100 24" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <polygon
            points="0,24 0,11 8,11 8,5 10,5 10,11 20,11 20,3 22,3 22,11 34,11 34,15 46,7 58,15 70,5 82,13 92,7 100,11 100,24"
            fill={p.foreground}
          />
        </svg>
      );
    case "mist":
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, transparent, ${p.mist}, transparent)`,
            filter: "blur(4px)",
          }}
        />
      );
  }
}

export function ParallaxLayers({
  palette = "dusk",
  depth = 1,
  layers = 6,
  title = "Layers of light",
  fog = true,
  scroller,
  className,
}: ParallaxLayersProps) {
  const root = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const n = Math.max(3, Math.min(6, Math.round(layers)));
  const p = PALETTES[palette] ?? PALETTES.dusk;
  const active = useMemo(() => LAYER_ORDER.slice(0, n), [n]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        scroller: scroller ?? undefined,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        onUpdate: (self) => {
          const t = self.progress;
          active.forEach((layer, i) => {
            const node = layerRefs.current[i];
            if (!node) return;
            if (layer.kind === "sun") {
              const arc = Math.sin(t * Math.PI);
              node.style.transform = `translate(${(t - 0.5) * 30 * depth}%, ${(1 - arc) * 70}%)`;
              node.style.opacity = String(0.4 + arc * 0.6);
            } else {
              node.style.transform = `translateY(${(t - 0.5) * -layer.rate * 120 * depth}%)`;
            }
          });
          if (titleRef.current) {
            titleRef.current.style.opacity = String(Math.max(0, 1 - t / 0.4));
            titleRef.current.style.transform = `translateY(${-t * 30}%)`;
          }
        },
      });
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [active, depth, scroller]);

  return (
    <div ref={root} className={className} style={{ position: "relative", height: "250cqh" }}>
      <div style={{ position: "sticky", top: 0, height: "100cqh", overflow: "hidden" }}>
        {active.map((layer, i) => (
          <div
            key={layer.kind}
            ref={(node) => {
              layerRefs.current[i] = node;
            }}
            style={layerStyle(layer.kind)}
          >
            {renderLayer(layer.kind, p)}
          </div>
        ))}
        {fog && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "18cqh",
              height: "22cqh",
              background: `linear-gradient(180deg, transparent, ${p.mist})`,
              filter: "blur(6px)",
              pointerEvents: "none",
            }}
          />
        )}
        <h2
          ref={titleRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "14cqh",
            transform: "translateX(-50%)",
            margin: 0,
            fontSize: "clamp(28px, 6cqw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: p.ink,
            textShadow: "0 4px 24px rgba(0,0,0,.35)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}
