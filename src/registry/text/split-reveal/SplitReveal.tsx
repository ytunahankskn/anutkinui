"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export interface SplitRevealProps {
  text?: string;
  /** Bölme birimi */
  by?: "chars" | "words" | "lines";
  stagger?: number;
  duration?: number;
  ease?: string;
  /** Başlangıç dönme açısı (derece) */
  rotate?: number;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  style?: React.CSSProperties;
}

export function SplitReveal({
  text = "Motion is the new typography.",
  by = "chars",
  stagger = 0.03,
  duration = 1,
  ease = "power4.out",
  rotate = 6,
  delay = 0,
  as = "h1",
  className,
  style,
}: SplitRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let split: SplitText | undefined;
    let tween: gsap.core.Tween | undefined;
    let cancelled = false;

    // Fontlar yüklenmeden bölersek satır kırılımları kayar.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      split = SplitText.create(el, { type: "lines,words,chars", mask: by, linesClass: "split-line" });
      tween = gsap.from(split[by], {
        yPercent: 110,
        rotate: by === "lines" ? 0 : rotate,
        opacity: by === "lines" ? 1 : 0,
        duration,
        ease,
        delay,
        stagger: { each: stagger, from: "start" },
      });
    });

    return () => {
      cancelled = true;
      tween?.kill();
      split?.revert();
    };
  }, [text, by, stagger, duration, ease, rotate, delay]);

  const Tag = as;
  return (
    <Tag ref={ref} className={className} style={{ willChange: "transform", ...style }}>
      {text}
    </Tag>
  );
}
