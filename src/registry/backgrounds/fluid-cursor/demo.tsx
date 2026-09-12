"use client";

import type { ControlValues } from "@/registry/types";
import { FluidCursor, PALETTES, type FluidCursorProps } from "./FluidCursor";

export default function Demo(values: ControlValues) {
  const props = values as unknown as FluidCursorProps;
  const ink = PALETTES[props.palette ?? "aurora"]?.ink ?? "#ffffff";
  return (
    <div className="relative h-full w-full overflow-hidden">
      <FluidCursor {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: ink }}>
        <p className="mono-label mb-3" style={{ color: ink, opacity: 0.7 }}>
          backgrounds / fluid-cursor
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Fareni sürükle, akışkanı boya.</h2>
      </div>
    </div>
  );
}
