"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface ZoomParallaxProps {
  palette?: keyof typeof PALETTES;
  /** Büyüme hızı çarpanı */
  intensity?: number;
  /** Uçuşan kartlara kenar bulanıklığı ekle */
  blur?: boolean;
  /** Gösterilecek kart sayısı (5-7) */
  images?: number;
  /**
   * Scroll eden eleman. Sayfa scroll'u için boş bırak; bir kutu içinde
   * kullanıyorsan o kutuyu ver (kutu `container-type: size` olmalı).
   */
  scroller?: HTMLElement | null;
  className?: string;
}

export const PALETTES = {
  dark: { bg: "#05060a", vignette: "0,0,0" },
  warm: { bg: "#231208", vignette: "40,16,4" },
  cool: { bg: "#04141f", vignette: "0,20,35" },
  mono: { bg: "#111111", vignette: "0,0,0" },
} as const;

/** [center, topLeft, topRight, left, right, bottomLeft, top] — merkezdeki en yavaş, dıştakiler daha hızlı büyür. */
const RATES = [4, 5, 6, 5, 6, 8, 9];

const LAYOUT: { top: string; left: string; width: string; height: string }[] = [
  { top: "30%", left: "32%", width: "36%", height: "40%" }, // 0 center
  { top: "6%", left: "4%", width: "22%", height: "28%" }, // 1 top-left
  { top: "8%", left: "72%", width: "22%", height: "26%" }, // 2 top-right
  { top: "62%", left: "6%", width: "18%", height: "26%" }, // 3 left
  { top: "58%", left: "76%", width: "20%", height: "28%" }, // 4 right
  { top: "72%", left: "34%", width: "18%", height: "22%" }, // 5 bottom
  { top: "4%", left: "40%", width: "18%", height: "18%" }, // 6 top-center
];

const PHOTOS = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=1200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=1200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=1200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=1200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=1200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=1200&fit=crop&q=80",
];

export function ZoomParallax({
  palette = "dark",
  intensity = 1,
  blur = false,
  images = 7,
  scroller,
  className,
}: ZoomParallaxProps) {
  const root = useRef<HTMLDivElement>(null);
  const p = PALETTES[palette] ?? PALETTES.dark;
  const count = Math.max(5, Math.min(7, Math.round(images)));
  const cards = LAYOUT.slice(0, count);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const wrapperEls = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
    if (wrapperEls.length === 0) return;

    const ctx = gsap.context(() => {
      wrapperEls.forEach((wrap, i) => {
        gsap.set(wrap, { scale: 1, transformOrigin: "50% 50%", filter: "blur(0px)" });
        const rate = RATES[i % RATES.length];
        const targetScale = 1 + rate * intensity;

        const tween: gsap.TweenVars = { scale: targetScale, ease: "none", duration: 1 };
        if (blur) tween.filter = `blur(${Math.min(14, rate * 1.6 * intensity)}px)`;

        gsap.to(wrap, {
          ...tween,
          scrollTrigger: {
            trigger: el,
            scroller: scroller ?? undefined,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
        });
      });
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [intensity, blur, count, scroller]);

  return (
    <div ref={root} className={className} style={{ position: "relative", height: "400cqh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100cqh",
          overflow: "hidden",
          background: p.bg,
        }}
      >
        {cards.map((c, i) => (
          <div
            key={i}
            data-card
            style={{
              position: "absolute",
              top: c.top,
              left: c.left,
              width: c.width,
              height: c.height,
              zIndex: i === 0 ? 1 : i + 1,
              borderRadius: 6,
              overflow: "hidden",
              boxShadow: "0 20px 50px -20px rgba(0,0,0,.6)",
              willChange: "transform, filter",
            }}
          >
            <img
              src={PHOTOS[i % PHOTOS.length]}
              alt=""
              crossOrigin="anonymous"
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ))}

        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            pointerEvents: "none",
            background: `radial-gradient(120% 100% at 50% 50%, rgba(${p.vignette},0) 45%, rgba(${p.vignette},.55) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
