"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface PinnedTextSequenceProps {
  palette?: keyof typeof PALETTES;
  /** Arka plan fotoğrafı URL'i */
  image?: string;
  /** Ken Burns bitiş zoom oranı */
  zoom?: number;
  eyebrow?: string;
  title1?: string;
  title2?: string;
  title3?: string;
  /** Dördüncü blok başlığı (kontrol panelinde yok, kod içinde özelleştirilebilir) */
  title4?: string;
  className?: string;
  /**
   * Scroll eden eleman. Sayfa scroll'u için boş bırak; bir kutu içinde
   * kullanıyorsan o kutuyu ver (kutu `container-type: size` olmalı).
   */
  scroller?: HTMLElement | null;
}

export const PALETTES = {
  noir: { from: "8,8,10", to: "0,0,0", ink: "#ffffff", accent: "#ff5a5f" },
  warm: { from: "35,18,8", to: "10,4,2", ink: "#fff6ec", accent: "#ffb347" },
  cool: { from: "4,14,26", to: "0,4,10", ink: "#eafcff", accent: "#3fd0ff" },
  mono: { from: "10,10,10", to: "0,0,0", ink: "#f2f2f2", accent: "#cfcfcf" },
} as const;

const LINES = [
  "Every curve is measured, every surface intentional.",
  "Materials chosen for how they feel, not just how they look.",
  "Tested against years, not just days.",
  "Made for the person who notices the difference.",
];

export function PinnedTextSequence({
  palette = "noir",
  image = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&q=80",
  zoom = 1.2,
  eyebrow = "Introducing",
  title1 = "Precision.",
  title2 = "In every detail.",
  title3 = "Built to last.",
  title4 = "Yours, uniquely.",
  scroller,
  className,
}: PinnedTextSequenceProps) {
  const root = useRef<HTMLDivElement>(null);
  const p = PALETTES[palette] ?? PALETTES.noir;
  const z = Math.max(1, zoom);

  const blocks = [
    { eyebrow, title: title1, line: LINES[0] },
    { eyebrow: "02", title: title2, line: LINES[1] },
    { eyebrow: "03", title: title3, line: LINES[2] },
    { eyebrow: "04", title: title4, line: LINES[3] },
  ];

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const img = el.querySelector<HTMLElement>("[data-img]");
    const blockEls = Array.from(el.querySelectorAll<HTMLElement>("[data-block]"));
    const dotEls = Array.from(el.querySelectorAll<HTMLElement>("[data-dot]"));
    if (!img || blockEls.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(img, { scale: 1, xPercent: 0, yPercent: 0, transformOrigin: "50% 50%" });
      blockEls.forEach((b) => gsap.set(b, { opacity: 0, y: 24 }));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller: scroller ?? undefined,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            const idx = Math.min(blockEls.length - 1, Math.floor(self.progress * blockEls.length));
            dotEls.forEach((d, i) => {
              const active = i === idx;
              d.style.background = active ? p.accent : "rgba(255,255,255,.35)";
              d.style.transform = `scale(${active ? 1.4 : 1})`;
            });
          },
        },
      });

      tl.to(img, { scale: z, xPercent: -4, yPercent: 3, ease: "none", duration: 1 }, 0);

      const n = blockEls.length;
      blockEls.forEach((b, i) => {
        const start = i / n;
        const end = (i + 1) / n;
        const span = end - start;
        const fadeIn = span * 0.4;
        const fadeOut = span * 0.3;
        tl.to(b, { opacity: 1, y: 0, duration: fadeIn, ease: "none" }, start);
        tl.to(b, { opacity: 0, y: -24, duration: fadeOut, ease: "none" }, end - fadeOut);
      });
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [z, scroller, p.accent]);

  return (
    <div ref={root} className={className} style={{ position: "relative", height: "500cqh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100cqh",
          overflow: "hidden",
          background: "#000",
        }}
      >
        <img
          data-img
          src={image}
          alt=""
          crossOrigin="anonymous"
          loading="lazy"
          decoding="async"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", willChange: "transform" }}
        />

        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, rgba(${p.from},.35), rgba(${p.to},.75))`,
            pointerEvents: "none",
          }}
        />

        {blocks.map((b, i) => (
          <div
            key={i}
            data-block
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 8cqw",
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: p.accent,
              }}
            >
              {b.eyebrow}
            </p>
            <h2 style={{ margin: 0, fontSize: "clamp(30px, 6.5cqw, 68px)", fontWeight: 700, letterSpacing: "-0.02em", color: p.ink }}>
              {b.title}
            </h2>
            <p style={{ marginTop: 14, maxWidth: "42ch", fontSize: "clamp(13px, 1.7cqw, 17px)", lineHeight: 1.6, color: p.ink, opacity: 0.82 }}>
              {b.line}
            </p>
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            right: "4cqw",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {blocks.map((_, i) => (
            <span
              key={i}
              data-dot
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "rgba(255,255,255,.35)",
                transition: "background .15s linear",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
