"use client";

import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface MaskRevealHeroProps {
  palette?: keyof typeof PALETTES;
  /** Maskeden görünecek büyük metin (delik) */
  text?: string;
  /** Arka plan fotoğrafı URL'i */
  image?: string;
  headline?: string;
  subline?: string;
  cta?: string;
  /** Metnin scroll sonunda ulaşacağı büyütme katsayısı */
  maxScale?: number;
  /**
   * Scroll eden eleman. Sayfa scroll'u için boş bırak; bir kutu içinde
   * kullanıyorsan o kutuyu ver (kutu `container-type: size` olmalı).
   */
  scroller?: HTMLElement | null;
  className?: string;
}

export const PALETTES = {
  noir: { overlay: "#0b0b0e", ink: "#ffffff", accent: "#ff5a5f" },
  sunset: { overlay: "#2a0f1f", ink: "#ffffff", accent: "#ffb347" },
  ocean: { overlay: "#05203a", ink: "#ffffff", accent: "#3fd0ff" },
  ember: { overlay: "#1a0b05", ink: "#ffffff", accent: "#ff7a1a" },
} as const;

export function MaskRevealHero({
  palette = "noir",
  text = "VI",
  image = "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80",
  headline = "Coming 2026",
  subline = "A new era begins.",
  cta = "Notify me",
  maxScale = 40,
  scroller,
  className,
}: MaskRevealHeroProps) {
  const root = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const uid = `mrh${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const p = PALETTES[palette] ?? PALETTES.noir;
  const ms = Math.max(1, maxScale);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const pinEl = el.querySelector<HTMLElement>("[data-pin]");
    const bg = el.querySelector<HTMLElement>("[data-bg]");
    const maskGroup = el.querySelector<SVGGElement>("[data-mask-group]");
    const overlay = el.querySelector<SVGRectElement>("[data-overlay]");
    const logo = el.querySelector<HTMLElement>("[data-logo]");
    const copy = el.querySelector<HTMLElement>("[data-copy]");
    if (!pinEl || !bg || !maskGroup || !overlay || !logo || !copy) return;

    // Boyutları setup sırasında bir kez oku (layout thrash yok).
    const w = pinEl.clientWidth;
    const h = pinEl.clientHeight;
    const logoTargetX = -(w * 0.32);
    const logoTargetY = -(h * 0.34);

    const ctx = gsap.context(() => {
      gsap.set(bg, { scale: 1.15, transformOrigin: "50% 50%" });
      gsap.set(maskGroup, { scale: 1, transformOrigin: "50% 50%" });
      gsap.set(logo, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1, transformOrigin: "50% 50%" });
      gsap.set(overlay, { opacity: 1 });
      gsap.set(copy, { opacity: 0, y: 28 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller: scroller ?? undefined,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      tl.to(bg, { scale: 1, ease: "none", duration: 1 }, 0);
      tl.to(maskGroup, { scale: ms, ease: "none", duration: 1 }, 0);
      tl.to(logo, { x: logoTargetX, y: logoTargetY, scale: 0.3, ease: "none", duration: 1 }, 0);
      tl.to(overlay, { opacity: 0, ease: "none", duration: 0.25 }, 0.75);
      tl.to(copy, { opacity: 1, y: 0, ease: "none", duration: 0.2 }, 0.8);
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [ms, scroller]);

  return (
    <div ref={root} className={className} style={{ position: "relative", height: "500cqh" }}>
      <div
        data-pin
        style={{
          position: "sticky",
          top: 0,
          height: "100cqh",
          overflow: "hidden",
          background: "#000",
        }}
      >
        <img
          data-bg
          src={image}
          alt=""
          crossOrigin="anonymous"
          loading="lazy"
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            willChange: "transform",
          }}
        />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <mask id={`${uid}-mask`}>
              <rect width={100} height={100} fill="white" />
              <g data-mask-group>
                <text
                  x={50}
                  y={50}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontWeight={900}
                  fontSize={34}
                  fill="black"
                  fontFamily="Arial, Helvetica, sans-serif"
                >
                  {text}
                </text>
              </g>
            </mask>
          </defs>
          <rect data-overlay width={100} height={100} fill={p.overlay} mask={`url(#${uid}-mask)`} />
        </svg>

        <div
          data-logo
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 900,
            fontSize: "10cqh",
            color: p.ink,
            letterSpacing: "-0.02em",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>

        <div
          data-copy
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "10cqh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            textAlign: "center",
            padding: "0 6cqw",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(26px, 6cqw, 54px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: p.ink,
            }}
          >
            {headline}
          </h2>
          <p style={{ margin: 0, fontSize: "clamp(13px, 1.6cqw, 16px)", color: p.ink, opacity: 0.8, maxWidth: "46ch" }}>
            {subline}
          </p>
          <button
            type="button"
            style={{
              marginTop: 6,
              height: 42,
              padding: "0 22px",
              borderRadius: 999,
              border: "none",
              background: p.accent,
              color: "#0b0b0e",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
