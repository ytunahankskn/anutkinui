"use client";

import { useEffect, useId, useState } from "react";

export interface SplitFlapProps {
  palette?: keyof typeof PALETTES;
  text?: string;
  /** Karakterler arası başlangıç gecikmesi (ms) */
  stagger?: number;
  /** Her adımın süresi (ms) */
  speed?: number;
  /** 1 = tek satır, 2 = ikinci satırda `secondaryText` gösterilir */
  rows?: 1 | 2;
  secondaryText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PALETTES = {
  classic: { tile: "#141414", flap: "#1c1c1c", text: "#f5c542", bg: "#050505" },
  midnight: { tile: "#101526", flap: "#161d33", text: "#7fd4ff", bg: "#040611" },
  mint: { tile: "#0e1a16", flap: "#12241e", text: "#7cf5c9", bg: "#03100a" },
} as const;

const GLYPHS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:/-";
const STEPS = 10;

function glyphIndex(ch: string) {
  const idx = GLYPHS.indexOf(ch);
  return idx === -1 ? 0 : idx;
}

interface TileState {
  char: string;
  prevChar: string;
  token: number;
}

function FlapTile({
  target,
  delay,
  speed,
  cls,
}: {
  target: string;
  delay: number;
  speed: number;
  cls: string;
}) {
  const [s, setS] = useState<TileState>({ char: " ", prevChar: " ", token: 0 });

  useEffect(() => {
    const targetIdx = glyphIndex(target);
    let curIdx = (targetIdx - STEPS + GLYPHS.length * 3) % GLYPHS.length;
    let count = 0;
    let iv: ReturnType<typeof setInterval> | undefined;

    const to = setTimeout(() => {
      iv = setInterval(() => {
        const prevIdx = curIdx;
        curIdx = (curIdx + 1) % GLYPHS.length;
        count += 1;
        setS((prev) => ({ char: GLYPHS[curIdx], prevChar: GLYPHS[prevIdx], token: prev.token + 1 }));
        if (count >= STEPS && iv) clearInterval(iv);
      }, speed);
    }, delay);

    return () => {
      clearTimeout(to);
      if (iv) clearInterval(iv);
    };
  }, [target, speed, delay]);

  return (
    <span className={`${cls}-tile`}>
      <span className={`${cls}-half ${cls}-top`}>{s.char}</span>
      <span className={`${cls}-half ${cls}-bottom`}>{s.char}</span>
      <span key={s.token} className={`${cls}-flap`} aria-hidden="true">
        {s.prevChar}
      </span>
      <span className={`${cls}-hinge`} aria-hidden="true" />
    </span>
  );
}

function FlapLine({ text, stagger, speed, cls }: { text: string; stagger: number; speed: number; cls: string }) {
  const chars = text.toUpperCase().split("");
  return (
    <div className={`${cls}-line`}>
      {chars.map((c, i) => (
        <FlapTile key={i} target={c} delay={i * stagger} speed={speed} cls={cls} />
      ))}
    </div>
  );
}

export function SplitFlap({
  palette = "classic",
  text = "DEPARTURE 21:45",
  stagger = 40,
  speed = 70,
  rows = 1,
  secondaryText = "GATE 07 · ON TIME",
  className,
  style,
}: SplitFlapProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = PALETTES[palette] ?? PALETTES.classic;
  const cls = `sf-${uid}`;

  return (
    <div className={className} style={{ display: "inline-flex", flexDirection: "column", gap: 10, ...style }}>
      <style>{`
        .${cls}-line { display: flex; }
        .${cls}-tile {
          position: relative;
          display: inline-block;
          width: 0.85em;
          height: 1.3em;
          margin: 0 2px;
          border-radius: 4px;
          font-size: clamp(1.4rem, 4vw, 2.5rem);
          font-weight: 700;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          color: ${p.text};
          background: ${p.tile};
          perspective: 240px;
          box-shadow: 0 1px 0 rgba(0,0,0,0.5) inset, 0 3px 6px rgba(0,0,0,0.4);
        }
        .${cls}-half {
          position: absolute;
          left: 0;
          right: 0;
          height: 50%;
          display: flex;
          justify-content: center;
          overflow: hidden;
          line-height: 1;
          background: ${p.tile};
        }
        .${cls}-top { top: 0; align-items: flex-start; padding-top: 0.18em; border-radius: 4px 4px 0 0; }
        .${cls}-bottom { bottom: 0; align-items: flex-end; padding-bottom: 0.18em; border-radius: 0 0 4px 4px; }
        .${cls}-flap {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 50%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 0.18em;
          overflow: hidden;
          line-height: 1;
          background: ${p.flap};
          border-radius: 4px 4px 0 0;
          transform-origin: bottom center;
          animation: ${cls}-fall ${speed}ms cubic-bezier(0.4, 0, 0.2, 1) both;
          will-change: transform;
        }
        .${cls}-hinge {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: rgba(0,0,0,0.55);
          transform: translateY(-0.5px);
          pointer-events: none;
        }
        @keyframes ${cls}-fall {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(-100deg); }
        }
      `}</style>
      <FlapLine text={text} stagger={stagger} speed={speed} cls={cls} />
      {rows === 2 && <FlapLine text={secondaryText} stagger={stagger} speed={speed} cls={cls} />}
    </div>
  );
}
