"use client";

import type { ControlValues } from "@/registry/types";
import { Lightning, PALETTES, type LightningProps } from "./Lightning";

export default function Demo(values: ControlValues) {
  const props = values as unknown as LightningProps;
  const ink = PALETTES[props.palette ?? "electric"]?.ink ?? "#ffffff";
  return (
    <div className="relative h-full w-full overflow-hidden">
      <Lightning {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: ink }}>
        <p className="mono-label mb-3" style={{ color: ink, opacity: 0.6 }}>
          backgrounds / lightning
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Gökyüzünü yaran ışık.</h2>
      </div>
    </div>
  );
}
