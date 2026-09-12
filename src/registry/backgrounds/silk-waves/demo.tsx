"use client";

import type { ControlValues } from "@/registry/types";
import { PALETTES, SilkWaves, type SilkWavesProps } from "./SilkWaves";

export default function Demo(values: ControlValues) {
  const props = values as unknown as SilkWavesProps;
  const palette = PALETTES[props.palette ?? "royal"] ?? PALETTES.royal;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <SilkWaves {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: palette.ink }}>
        <p className="mono-label mb-3" style={{ color: "rgba(255,255,255,.6)" }}>
          backgrounds / silk
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Kumaş gibi akan ışık.</h2>
      </div>
    </div>
  );
}
