"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export interface RevealLoaderProps {
  palette?: keyof typeof PALETTES;
  /** Ortadaki kelime markası */
  logoText?: string;
  /** Logonun uçacağı gerçek elemanı bulmak için seçici */
  targetSelector?: string;
  /**
   * "document": gerçek site kullanımı, `document.querySelector` ile arar.
   * "container": demo/playground kullanımı, bileşenin ebeveyn kutusu içinde arar.
   */
  scope?: "container" | "document";
  /** Sayaç 0→100 kaç saniyede tamamlanır */
  duration?: number;
  /** 100'de kaç saniye beklenip uçuşun başlayacağı */
  hold?: number;
  /** Sayaç mı, ilerleme çubuğu mu, ikisi mi gösterilsin */
  style?: "counter" | "bar" | "both";
  onComplete?: () => void;
  className?: string;
}

export const PALETTES = {
  noir: { bg: "#0b0b0e", ink: "#f2f2f4", accent: "#7c5cff" },
  paper: { bg: "#f4f1ea", ink: "#141414", accent: "#ff5a1f" },
  violet: { bg: "#140c2e", ink: "#efe9ff", accent: "#b69cff" },
  sunset: { bg: "#1a0a12", ink: "#ffe9d6", accent: "#ff7a45" },
} as const;

/** Basit bir kill() sözleşmesi — hem Tween hem Timeline için geçerli. */
interface Killable {
  kill: () => void;
}

function resolveTarget(root: HTMLElement, selector: string, scope: "container" | "document") {
  if (scope === "document") return document.querySelector<HTMLElement>(selector);
  const container = root.parentElement ?? root;
  return container.querySelector<HTMLElement>(selector);
}

/**
 * RevealLoader — tam ekran (veya kapsayıcı-dolduran) bir preloader.
 * Logo ortada 0→100 sayarken durur, sonra gerçek konumuna (navbar logo slotu) uçar;
 * bu sırada overlay yukarı doğru soyulur (clip-path). Gerçek siteye eklendiğinde
 * `scope="document"` ve hedef elemana `data-loader-target` koyup içine sitenin
 * gerçek logosunu yerleştir — bu bileşen mount olunca onu gizler, bitince gösterir.
 */
export function RevealLoader({
  palette = "noir",
  logoText = "anutkinui",
  targetSelector = "[data-loader-target]",
  scope = "container",
  duration = 2,
  hold = 0.4,
  style: displayStyle = "both",
  onComplete,
  className,
}: RevealLoaderProps) {
  const p = PALETTES[palette] ?? PALETTES.noir;

  const rootRef = useRef<HTMLDivElement>(null);
  const logoBlockRef = useRef<HTMLDivElement>(null);
  const counterWrapRef = useRef<HTMLDivElement>(null);
  const counterNumRef = useRef<HTMLSpanElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const [done, setDone] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targetEl = resolveTarget(root, targetSelector, scope);
    if (targetEl) targetEl.style.visibility = "hidden";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    let activeTween: Killable | null = null;

    const finish = () => {
      if (cancelled) return;
      if (targetEl) targetEl.style.visibility = "";
      onCompleteRef.current?.();
      setDone(true);
    };

    const ctx = gsap.context(() => {
      const counter = { v: 0 };

      const tl = gsap.timeline();
      activeTween = tl;

      tl.to(counter, {
        v: 100,
        duration: Math.max(duration, 0.1),
        ease: "power2.inOut",
        onUpdate: () => {
          if (cancelled) return;
          const val = Math.round(counter.v);
          if (counterNumRef.current) counterNumRef.current.textContent = String(val);
          if (barFillRef.current) barFillRef.current.style.width = `${counter.v}%`;
        },
      });

      tl.call(
        () => {
          if (cancelled) return;
          const fromEl = logoBlockRef.current;

          // Hedef yok, uçuş için kaynak yok ya da reduced-motion: sadece anında sön.
          if (reduceMotion || !targetEl || !fromEl) {
            if (targetEl) targetEl.style.visibility = "";
            const fade = gsap.to(root, {
              opacity: 0,
              duration: reduceMotion ? 0.25 : 0.6,
              ease: "power2.out",
              onComplete: finish,
            });
            activeTween = fade;
            return;
          }

          // Uçuştan hemen önce ölç — bayat rect'lere karşı (resize'a dayanıklı).
          const from = fromEl.getBoundingClientRect();
          const to = targetEl.getBoundingClientRect();
          const dx = to.left + to.width / 2 - (from.left + from.width / 2);
          const dy = to.top + to.height / 2 - (from.top + from.height / 2);
          const scale = from.height > 0 ? to.height / from.height : 1;

          const flightTl = gsap.timeline({ onComplete: finish });
          activeTween = flightTl;
          flightTl.to(counterWrapRef.current, { opacity: 0, y: -16, duration: 0.4, ease: "power2.out" }, 0);
          flightTl.to(fromEl, { x: dx, y: dy, scale, duration: 0.9, ease: "power3.inOut" }, 0);
          flightTl.to(root, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "power2.inOut" }, 0.35);
        },
        undefined,
        `+=${Math.max(hold, 0)}`,
      );
    }, root);

    return () => {
      cancelled = true;
      activeTween?.kill();
      ctx.revert();
      if (targetEl) targetEl.style.visibility = "";
    };
  }, [targetSelector, scope, duration, hold]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        background: p.bg,
        clipPath: "inset(0 0 0% 0)",
        willChange: "clip-path, opacity",
      }}
    >
      <div ref={logoBlockRef} style={{ display: "flex", alignItems: "center", gap: 12, willChange: "transform" }}>
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" style={{ flexShrink: 0 }}>
          <rect x="2" y="2" width="36" height="36" rx="10" fill={p.accent} />
          <rect x="13" y="13" width="14" height="14" rx="3" fill={p.bg} transform="rotate(45 20 20)" />
        </svg>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: p.ink, whiteSpace: "nowrap" }}>
          {logoText}
        </span>
      </div>

      <div ref={counterWrapRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {(displayStyle === "counter" || displayStyle === "both") && (
          <span
            ref={counterNumRef}
            style={{
              fontSize: "clamp(2.2rem, 6vw, 3.6rem)",
              fontWeight: 700,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              color: p.ink,
            }}
          >
            0
          </span>
        )}
        {(displayStyle === "bar" || displayStyle === "both") && (
          <div
            style={{
              width: 180,
              height: 3,
              borderRadius: 2,
              overflow: "hidden",
              background: `color-mix(in oklab, ${p.ink} 18%, transparent)`,
            }}
          >
            <div ref={barFillRef} style={{ height: "100%", width: "0%", background: p.accent, borderRadius: 2 }} />
          </div>
        )}
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: p.accent,
            opacity: 0.85,
          }}
        >
          loading assets
        </span>
      </div>
    </div>
  );
}
