"use client";

import { useRef, useState } from "react";
import type { ControlValues } from "@/registry/types";
import { ExplodedEarbuds, type ExplodedEarbudsProps, PALETTES } from "./ExplodedEarbuds";

const PHASES = [
  { at: 0, title: "Lid", body: "The lid of the charging case opens from the hinge at the back." },
  { at: 0.2, title: "Earbuds", body: "Both earbuds rise out of the case and turn to face the camera." },
  { at: 0.45, title: "Exploded view", body: "The right earbud's parts separate along an axis and get labeled." },
  { at: 0.85, title: "Reassembly", body: "As the camera pulls back, the parts reassemble halfway." },
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
  const props = values as unknown as ExplodedEarbudsProps;
  const pal = PALETTES[props.palette ?? "white"] ?? PALETTES.white;
  const dark = luminance(pal.bg) < 0.5;
  const ink = dark ? "rgba(255,255,255,.94)" : "rgba(0,0,0,.88)";
  const inkMuted = dark ? "rgba(255,255,255,.62)" : "rgba(0,0,0,.6)";
  const inkFaint = dark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.45)";
  const trackColor = dark ? "rgba(255,255,255,.15)" : "rgba(0,0,0,.12)";
  const accent = dark ? "#ffffff" : "#111214";

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
      <div style={{ position: "relative", height: "420cqh" }}>
        {scroller && <ExplodedEarbuds {...props} scroller={scroller} onProgress={handleProgress} />}
        <div className="pointer-events-none absolute inset-0">
          <div className="sticky top-0 flex h-[100cqh] flex-col justify-end p-6">
            <p className="mono-label" style={{ color: inkFaint }}>
              products / earbuds
            </p>
            <h3 ref={titleRef} className="mt-1 text-lg font-medium" style={{ color: ink }}>
              Lid
            </h3>
            <p ref={bodyRef} className="mt-1 max-w-[36ch] text-sm" style={{ color: inkMuted }}>
              The lid of the charging case opens from the hinge at the back.
            </p>
            <div className="mt-4 h-[2px] w-full max-w-64 overflow-hidden rounded-full" style={{ background: trackColor }}>
              <div ref={barRef} className="h-full rounded-full" style={{ width: "0%", background: accent }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
