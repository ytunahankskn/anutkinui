"use client";

import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface ScrollVideoProps {
  palette?: keyof typeof PALETTES;
  /** Video kaynağı (CORS'a izin veren, range-request destekleyen bir mp4) */
  src?: string;
  caption1?: string;
  caption2?: string;
  caption3?: string;
  /** Vinyet koyuluğu 0-1 */
  vignette?: number;
  /**
   * Scroll eden eleman. Sayfa scroll'u için boş bırak; bir kutu içinde
   * kullanıyorsan o kutuyu ver (kutu `container-type: size` olmalı).
   */
  scroller?: HTMLElement | null;
  className?: string;
}

export const PALETTES = {
  cinema: { ink: "#ffffff", accent: "#ffd166", tint: "0,0,0" },
  ocean: { ink: "#eafcff", accent: "#3fd0ff", tint: "2,14,24" },
  ember: { ink: "#fff1e6", accent: "#ff7a1a", tint: "22,8,2" },
  mono: { ink: "#f2f2f2", accent: "#d4d4d4", tint: "0,0,0" },
} as const;

export function ScrollVideo({
  palette = "cinema",
  src = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  caption1 = "Frame by frame",
  caption2 = "Driven by scroll",
  caption3 = "No autoplay, no timers",
  vignette = 0.6,
  scroller,
  className,
}: ScrollVideoProps) {
  const root = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const uid = `sv${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const p = PALETTES[palette] ?? PALETTES.cinema;
  const v = Math.min(1, Math.max(0, vignette));

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const video = el.querySelector<HTMLVideoElement>("[data-video]");
    const bar = el.querySelector<HTMLElement>("[data-bar]");
    const shimmer = el.querySelector<HTMLElement>("[data-shimmer]");
    const captionEls = Array.from(el.querySelectorAll<HTMLElement>("[data-caption]"));
    if (!video || !bar || !shimmer) return;

    let metaLoaded = false;
    let rafId = 0;

    const onLoadedMetadata = () => {
      metaLoaded = true;
    };
    const onCanPlay = () => {
      gsap.to(shimmer, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          shimmer.style.display = "none";
        },
      });
    };
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("canplay", onCanPlay);
    // Video zaten cache'ten yüklenmiş olabilir (readyState >= 1 = HAVE_METADATA).
    if (video.readyState >= 1) onLoadedMetadata();
    if (video.readyState >= 3) onCanPlay();

    const ctx = gsap.context(() => {
      gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
      captionEls.forEach((c) => gsap.set(c, { opacity: 0, y: 16 }));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller: scroller ?? undefined,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            const dur = video.duration;
            if (!metaLoaded || !dur || Number.isNaN(dur)) return;
            const target = self.progress * dur;
            if (Math.abs(target - video.currentTime) < 1 / 60) return;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              video.currentTime = target;
            });
          },
        },
      });

      tl.to(bar, { scaleX: 1, ease: "none", duration: 1 }, 0);

      const n = captionEls.length || 1;
      captionEls.forEach((c, i) => {
        const start = i / n;
        const end = (i + 1) / n;
        const fade = (end - start) * 0.2;
        tl.to(c, { opacity: 1, y: 0, duration: fade, ease: "none" }, start);
        tl.to(c, { opacity: 0, y: -16, duration: fade, ease: "none" }, end - fade);
      });
    }, el);

    ScrollTrigger.refresh();
    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("canplay", onCanPlay);
      ctx.revert();
    };
  }, [scroller]);

  return (
    <div ref={root} className={className} style={{ position: "relative", height: "500cqh" }}>
      <style>{`
        @keyframes ${uid}shimmer {
          0% { background-position: -150% 0; }
          100% { background-position: 150% 0; }
        }
      `}</style>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100cqh",
          overflow: "hidden",
          background: "#000",
        }}
      >
        <video
          data-video
          src={src}
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />

        <div
          data-shimmer
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, rgba(255,255,255,.05) 25%, rgba(255,255,255,.15) 37%, rgba(255,255,255,.05) 63%)`,
            backgroundSize: "400% 100%",
            animation: `${uid}shimmer 1.4s ease-in-out infinite`,
          }}
        />

        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(120% 100% at 50% 45%, rgba(${p.tint},0) 35%, rgba(${p.tint},${v}) 100%), linear-gradient(to top, rgba(${p.tint},.8), rgba(${p.tint},0) 42%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "0 8cqw 14cqh",
            pointerEvents: "none",
          }}
        >
          {[caption1, caption2, caption3].map((text, i) => (
            <p
              key={i}
              data-caption
              style={{
                position: "absolute",
                margin: 0,
                textAlign: "center",
                fontSize: "clamp(20px, 4.4cqw, 40px)",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: p.ink,
                maxWidth: "24ch",
              }}
            >
              {text}
            </p>
          ))}
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "rgba(255,255,255,.15)" }}>
          <div data-bar style={{ height: "100%", width: "100%", background: p.accent }} />
        </div>
      </div>
    </div>
  );
}
