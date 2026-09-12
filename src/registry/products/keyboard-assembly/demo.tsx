"use client";

import { useRef, useState } from "react";
import type { ControlValues } from "@/registry/types";
import { KeyboardAssembly, type KeyboardAssemblyProps, PALETTES } from "./KeyboardAssembly";

const PHASES = [
  { at: 0, title: "Case", body: "The aluminum case glides down from above and settles into place with an ease-out-back." },
  { at: 0.22, title: "PCB & plate", body: "The circuit board and switch plate settle into the case." },
  { at: 0.5, title: "Switches", body: "The switches lock into the plate in a wave from left to right." },
  { at: 0.82, title: "Keycaps", body: "The keycaps drop into place from the center outward, then the lights turn on." },
];

/** #rrggbb → perceived luminance in 0..1 */
function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export default function Demo(values: ControlValues) {
  const props = values as unknown as KeyboardAssemblyProps;
  const pal = PALETTES[props.palette ?? "graphite"] ?? PALETTES.graphite;
  const dark = luminance(pal.bg) < 0.5;
  const ink = dark ? "rgba(255,255,255,.94)" : "rgba(0,0,0,.88)";
  const inkMuted = dark ? "rgba(255,255,255,.62)" : "rgba(0,0,0,.6)";
  const inkFaint = dark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.45)";
  const trackColor = dark ? "rgba(255,255,255,.15)" : "rgba(0,0,0,.12)";
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const phaseIndexRef = useRef(-1);

  // Driven by GSAP's onUpdate; no setState, the DOM is updated directly.
  const handleProgress = (p: number) => {
    if (barRef.current) barRef.current.style.width = `${Math.round(p * 100)}%`;
    let idx = 0;
    for (let i = 0; i < PHASES.length; i++) {
      if (p >= PHASES[i].at) idx = i;
    }
    if (idx !== phaseIndexRef.current) {
      phaseIndexRef.current = idx;
      if (titleRef.current) titleRef.current.textContent = PHASES[idx].title;
      if (bodyRef.current) bodyRef.current.textContent = PHASES[idx].body;
    }
  };

  return (
    <div
      ref={setScroller}
      data-lenis-prevent
      className="h-full w-full overflow-y-auto overflow-x-hidden"
      style={{ containerType: "size", background: pal.bg }}
    >
      <div style={{ position: "relative", height: "450cqh" }}>
        {scroller && <KeyboardAssembly {...props} scroller={scroller} onProgress={handleProgress} />}
        <div className="pointer-events-none absolute inset-0">
          <div className="sticky top-0 flex h-[100cqh] flex-col justify-end p-6">
            <p className="mono-label" style={{ color: inkFaint }}>
              products / keyboard
            </p>
            <h3 ref={titleRef} className="mt-1 text-lg font-medium" style={{ color: ink }}>
              Case
            </h3>
            <p ref={bodyRef} className="mt-1 max-w-[36ch] text-sm" style={{ color: inkMuted }}>
              The aluminum case glides down from above and settles into place with an ease-out-back.
            </p>
            <div className="mt-4 h-[2px] w-full max-w-64 overflow-hidden rounded-full" style={{ background: trackColor }}>
              <div ref={barRef} className="h-full rounded-full" style={{ width: "0%", background: pal.accent }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
