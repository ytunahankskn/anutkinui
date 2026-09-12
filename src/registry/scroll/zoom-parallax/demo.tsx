"use client";

import { useState } from "react";
import type { ControlValues } from "@/registry/types";
import { ZoomParallax, PALETTES, type ZoomParallaxProps } from "./ZoomParallax";

export default function Demo(values: ControlValues) {
  const props = values as unknown as ZoomParallaxProps;
  const p = PALETTES[props.palette ?? "dark"] ?? PALETTES.dark;
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setScroller}
      data-lenis-prevent
      className="h-full w-full overflow-y-auto overflow-x-hidden"
      style={{ containerType: "size", background: p.bg }}
    >
      {scroller && <ZoomParallax {...props} scroller={scroller} />}
      <div className="flex h-[30cqh] items-start justify-center pt-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.4)" }}>
          scroll to zoom
        </p>
      </div>
    </div>
  );
}
