"use client";

import type { ControlValues } from "@/registry/types";
import { LightRays, PALETTES, type LightRaysProps } from "./LightRays";

export default function Demo(values: ControlValues) {
  const props = values as unknown as LightRaysProps;
  const palette = PALETTES[props.palette ?? "gold"] ?? PALETTES.gold;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <LightRays {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: palette.ink }}>
        <p className="mono-label mb-3" style={{ color: "rgba(255,255,255,.6)" }}>
          backgrounds / rays
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Gökten süzülen ışık demetleri.</h2>
      </div>
    </div>
  );
}
