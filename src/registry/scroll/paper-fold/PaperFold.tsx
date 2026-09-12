"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface PaperFoldProps {
  /** Kaç parçaya katlanmış */
  segments?: number;
  /** Katlanma açısı (derece) */
  angle?: number;
  perspective?: number;
  /** Kağıt rengi */
  paper?: string;
  /** Mürekkep rengi */
  ink?: string;
  title?: string;
  body?: string;
  /**
   * Scroll eden eleman. Sayfa scroll'u için boş bırak; bir kutu içinde
   * kullanıyorsan o kutuyu ver (kutu `container-type: size` olmalı).
   */
  scroller?: HTMLElement | null;
  className?: string;
}

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

const DEFAULT_BODY =
  "Paper holds light where it folds. Every crease is a shadow, every unfolding a sentence. As you scroll, the letter reads itself: line by line, fold by fold.";

export function PaperFold({
  segments = 5,
  angle = 115,
  perspective = 1100,
  paper = "#f4efe4",
  ink = "#1c1a16",
  title = "A letter, unfolding.",
  body = DEFAULT_BODY,
  scroller,
  className,
}: PaperFoldProps) {
  const root = useRef<HTMLDivElement>(null);
  const n = Math.max(2, Math.round(segments));

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const segs = Array.from(el.querySelectorAll<HTMLElement>("[data-seg]"));
    const shades = Array.from(el.querySelectorAll<HTMLElement>("[data-shade]"));

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller: scroller ?? undefined,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      segs.forEach((seg, i) => {
        if (i === 0) return;
        const dir = i % 2 === 1 ? -1 : 1;
        gsap.set(seg, { rotateX: dir * angle });
        gsap.set(shades[i], { opacity: 1 });
        const at = (i - 1) * 0.8;
        tl.to(seg, { rotateX: 0, duration: 1, ease: "none" }, at);
        tl.to(shades[i], { opacity: 0, duration: 0.9, ease: "none" }, at + 0.1);
      });
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [n, angle, scroller]);

  // Segmentler iç içe: her biri bir öncekinin altına asılır, kendi üst kenarı etrafında döner.
  const renderSegment = (i: number): React.ReactNode => {
    const isLast = i === n - 1;
    const odd = i % 2 === 1;
    return (
      <div
        data-seg
        key={i}
        style={{
          position: i === 0 ? "relative" : "absolute",
          top: i === 0 ? undefined : "100%",
          left: 0,
          width: "100%",
          height: "var(--segH)",
          transformOrigin: "top center",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ön yüz: içerik dilimi */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            background: paper,
            backfaceVisibility: "hidden",
            borderTop: i === 0 ? "none" : `1px solid color-mix(in oklab, ${ink} 12%, transparent)`,
            boxShadow: isLast ? "0 18px 30px -18px rgba(0,0,0,.45)" : undefined,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: NOISE,
              opacity: 0.35,
              mixBlendMode: "multiply",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `calc(${-i} * var(--segH))`,
              height: "calc(var(--segH) * var(--n))",
              padding: "clamp(20px, 6cqw, 40px)",
              color: ink,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.55, margin: 0 }}>
              № 01 — scroll / paper
            </p>
            <h2 style={{ fontSize: "clamp(22px, 4.2cqw, 34px)", lineHeight: 1.05, letterSpacing: "-0.02em", fontWeight: 600, margin: "12px 0 14px" }}>
              {title}
            </h2>
            <p style={{ fontSize: "clamp(13px, 1.8cqw, 15px)", lineHeight: 1.6, opacity: 0.85, margin: 0, maxWidth: "36ch" }}>{body}</p>
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ display: "grid", gap: 6 }}>
                {[64, 48, 80].map((w) => (
                  <span key={w} style={{ display: "block", width: w, height: 3, background: ink, opacity: 0.25, borderRadius: 2 }} />
                ))}
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.5 }}>{String(n).padStart(2, "0")} folds</span>
            </div>
          </div>
          {/* Kat gölgesi: açıldıkça kaybolur */}
          <div
            data-shade
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: odd
                ? "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,.04))"
                : "linear-gradient(to top, rgba(0,0,0,.34), rgba(0,0,0,.02))",
              opacity: i === 0 ? 0 : 1,
            }}
          />
        </div>
        {/* Arka yüz: boş kağıt */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `color-mix(in oklab, ${paper} 92%, ${ink})`,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        />
        {!isLast && renderSegment(i + 1)}
      </div>
    );
  };

  return (
    <div
      ref={root}
      className={className}
      style={
        {
          position: "relative",
          height: `calc(100cqh + ${(n - 1) * 60}cqh)`,
          "--n": n,
          "--segH": "calc(74cqh / var(--n))",
        } as React.CSSProperties
      }
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100cqh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "12cqh",
          perspective: `${perspective}px`,
          perspectiveOrigin: "50% 30%",
        }}
      >
        <div style={{ width: "min(420px, 78cqw)", transformStyle: "preserve-3d" }}>{renderSegment(0)}</div>
      </div>
    </div>
  );
}
