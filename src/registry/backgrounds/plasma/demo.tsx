"use client";

import type { ControlValues } from "@/registry/types";
import { PALETTES, Plasma, type PlasmaProps } from "./Plasma";

export default function Demo(values: ControlValues) {
  const props = values as unknown as PlasmaProps;
  const palette = PALETTES[props.palette ?? "neon"] ?? PALETTES.neon;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Plasma {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: palette.ink }}>
        <p className="mono-label mb-3" style={{ color: "rgba(255,255,255,.6)" }}>
          backgrounds / plasma
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Eski okul plazma, yeni his.</h2>
      </div>
    </div>
  );
}
