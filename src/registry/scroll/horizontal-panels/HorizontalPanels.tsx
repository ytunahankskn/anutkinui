"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface HorizontalPanelsProps {
  palette?: keyof typeof PALETTES;
  /** Panel adedi (3-6) */
  panels?: number;
  ease?: "none" | "power1.inOut";
  /** Paneller arası boşluk (px) */
  gap?: number;
  /** Alt kenarda scrub edilen ilerleme çubuğu */
  progressBar?: boolean;
  /**
   * Scroll eden eleman. Sayfa scroll'u için boş bırak; bir kutu içinde
   * kullanıyorsan o kutuyu ver (kutu `container-type: size` olmalı).
   */
  scroller?: HTMLElement | null;
  className?: string;
}

export const PALETTES = {
  citrus: {
    colors: ["#ffb703", "#fb8500", "#ff6b35", "#f72585"],
    ink: "#241300",
  },
  ocean: {
    colors: ["#003049", "#0077b6", "#00b4d8", "#90e0ef"],
    ink: "#eafcff",
  },
  night: {
    colors: ["#10002b", "#3c096c", "#5a189a", "#9d4edd"],
    ink: "#f6ecff",
  },
} as const;

const TITLES = ["Explore", "Craft", "Connect", "Deploy", "Iterate", "Grow"];

export function HorizontalPanels({
  palette = "citrus",
  panels = 4,
  ease = "none",
  gap = 0,
  progressBar = true,
  scroller,
  className,
}: HorizontalPanelsProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const n = Math.max(3, Math.min(6, Math.round(panels)));
  const p = PALETTES[palette] ?? PALETTES.citrus;

  useEffect(() => {
    const el = root.current;
    const trackEl = track.current;
    if (!el || !trackEl) return;

    const ctx = gsap.context(() => {
      const distance = trackEl.scrollWidth - el.clientWidth;
      gsap.to(trackEl, {
        x: -distance,
        ease,
        scrollTrigger: {
          trigger: el,
          scroller: scroller ?? undefined,
          start: "top top",
          end: `+=${distance}`,
          scrub: true,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [n, gap, ease, scroller]);

  return (
    <div ref={root} className={className} style={{ position: "relative", height: "100cqh", overflow: "hidden" }}>
      <div ref={track} style={{ display: "flex", height: "100%", width: "max-content", gap, willChange: "transform" }}>
        {Array.from({ length: n }, (_, i) => {
          const c = p.colors[i % p.colors.length];
          return (
            <div
              key={i}
              style={{
                width: "100cqw",
                height: "100%",
                flex: "0 0 auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "clamp(28px, 6cqw, 72px)",
                background: `linear-gradient(150deg, ${c}, color-mix(in oklab, ${c} 55%, black))`,
                color: p.ink,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(48px, 10cqw, 120px)",
                  fontWeight: 700,
                  lineHeight: 1,
                  opacity: 0.35,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 style={{ fontSize: "clamp(28px, 5cqw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", margin: "8px 0 0" }}>
                {TITLES[i % TITLES.length]}
              </h3>
              <div style={{ marginTop: 24, width: 64, height: 6, borderRadius: 999, background: p.ink, opacity: 0.5 }} />
            </div>
          );
        })}
      </div>
      {progressBar && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "rgba(255,255,255,.15)" }}>
          <div
            ref={bar}
            style={{ height: "100%", width: "100%", transformOrigin: "left center", transform: "scaleX(0)", background: p.ink }}
          />
        </div>
      )}
    </div>
  );
}
