"use client";

import type { ControlValues } from "@/registry/types";
import { HalftoneFlow, PALETTES, type HalftoneFlowProps } from "./HalftoneFlow";

export default function Demo(values: ControlValues) {
  const props = values as unknown as HalftoneFlowProps;
  const ink = PALETTES[props.palette ?? "amber"]?.ink ?? "#ffffff";
  return (
    <div className="relative h-full w-full overflow-hidden">
      <HalftoneFlow {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: ink }}>
        <p className="mono-label mb-3" style={{ color: ink, opacity: 0.7 }}>
          backgrounds / halftone-flow
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Akan yarı ton dokusu.</h2>
      </div>
    </div>
  );
}
