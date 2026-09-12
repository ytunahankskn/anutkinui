"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface ScrollStackProps {
  palette?: keyof typeof PALETTES;
  /** Kart adedi (3-6) */
  cards?: number;
  /** Önceki kartın küçüleceği ölçek */
  scale?: number;
  /** Kartların sticky üst ofseti arasındaki fark (px) */
  gap?: number;
  rounded?: number;
  /**
   * Scroll eden eleman. Sayfa scroll'u için boş bırak; bir kutu içinde
   * kullanıyorsan o kutuyu ver (kutu `container-type: size` olmalı).
   */
  scroller?: HTMLElement | null;
  className?: string;
}

export const PALETTES = {
  sunset: {
    gradients: [
      "linear-gradient(135deg, #ff9a56, #ff5f6d)",
      "linear-gradient(135deg, #ff5f6d, #c73866)",
      "linear-gradient(135deg, #ffb56b, #ff7a45)",
      "linear-gradient(135deg, #7a2e5f, #ff5f6d)",
      "linear-gradient(135deg, #ffcf7a, #ff8a5c)",
      "linear-gradient(135deg, #c73866, #4a1942)",
    ],
    ink: "#fff7f0",
  },
  ocean: {
    gradients: [
      "linear-gradient(135deg, #0f6f9e, #14b8a6)",
      "linear-gradient(135deg, #023859, #0f6f9e)",
      "linear-gradient(135deg, #14b8a6, #7ee6d8)",
      "linear-gradient(135deg, #012a3d, #14b8a6)",
      "linear-gradient(135deg, #1c8cb5, #023859)",
      "linear-gradient(135deg, #7ee6d8, #0f6f9e)",
    ],
    ink: "#eafcff",
  },
  berry: {
    gradients: [
      "linear-gradient(135deg, #6a1b9a, #d63384)",
      "linear-gradient(135deg, #2f0a3d, #6a1b9a)",
      "linear-gradient(135deg, #d63384, #ff8fb1)",
      "linear-gradient(135deg, #45125c, #d63384)",
      "linear-gradient(135deg, #ff8fb1, #6a1b9a)",
      "linear-gradient(135deg, #2f0a3d, #d63384)",
    ],
    ink: "#fdf1ff",
  },
  slate: {
    gradients: [
      "linear-gradient(135deg, #334155, #64748b)",
      "linear-gradient(135deg, #0f172a, #334155)",
      "linear-gradient(135deg, #475569, #94a3b8)",
      "linear-gradient(135deg, #1e293b, #475569)",
      "linear-gradient(135deg, #64748b, #0f172a)",
      "linear-gradient(135deg, #94a3b8, #334155)",
    ],
    ink: "#f1f5f9",
  },
} as const;

const TITLES = ["Discover", "Design", "Build", "Refine", "Launch", "Scale"];
const LINES = [
  "The first step in shaping an idea.",
  "Details complete the whole.",
  "From idea to working product.",
  "Small improvements, big difference.",
  "The moment it opens to the world.",
  "Growth has no limit.",
];

export function ScrollStack({
  palette = "sunset",
  cards = 4,
  scale = 0.92,
  gap = 16,
  rounded = 24,
  scroller,
  className,
}: ScrollStackProps) {
  const root = useRef<HTMLDivElement>(null);
  const n = Math.max(3, Math.min(6, Math.round(cards)));
  const p = PALETTES[palette] ?? PALETTES.sunset;

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const sections = Array.from(el.querySelectorAll<HTMLElement>("[data-section]"));
    const cardEls = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));

    const ctx = gsap.context(() => {
      for (let i = 0; i < cardEls.length - 1; i++) {
        gsap.to(cardEls[i], {
          scale,
          filter: "brightness(0.82)",
          ease: "none",
          scrollTrigger: {
            trigger: sections[i + 1],
            scroller: scroller ?? undefined,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      }
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [n, scale, gap, scroller]);

  return (
    <div ref={root} className={className} style={{ position: "relative", height: `${n * 80}cqh` }}>
      {Array.from({ length: n }, (_, i) => {
        const g = p.gradients[i % p.gradients.length];
        return (
          <div key={i} data-section style={{ position: "relative", height: "80cqh" }}>
            <div
              data-card
              style={{
                position: "sticky",
                top: `calc(6cqh + ${i * gap}px)`,
                zIndex: i + 1,
                height: "62cqh",
                margin: "0 auto",
                width: "min(760px, 88cqw)",
                borderRadius: rounded,
                background: g,
                boxShadow: "0 24px 60px -24px rgba(0,0,0,.5)",
                transformOrigin: "center top",
                willChange: "transform, filter",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "clamp(20px, 4cqw, 40px)",
                color: p.ink,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.08em", opacity: 0.75 }}>
                  {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  style={{ width: 10, height: 10, borderRadius: "50%", background: p.ink, opacity: 0.55 }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: "clamp(24px, 4.5cqw, 42px)", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
                  {TITLES[i % TITLES.length]}
                </h3>
                <p style={{ fontSize: "clamp(13px, 1.8cqw, 16px)", lineHeight: 1.6, margin: 0, maxWidth: "42ch", opacity: 0.88 }}>
                  {LINES[i % LINES.length]}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
