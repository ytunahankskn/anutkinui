"use client";

import type { ControlValues } from "@/registry/types";
import { Iridescence, PALETTES, type IridescenceProps } from "./Iridescence";

export default function Demo(values: ControlValues) {
  const props = values as unknown as IridescenceProps;
  const palette = PALETTES[props.palette ?? "holo"] ?? PALETTES.holo;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Iridescence {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: palette.ink }}>
        <p className="mono-label mb-3" style={{ color: "rgba(128,128,128,.6)" }}>
          backgrounds / iridescence
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Işık kırılan yüzeyler.</h2>
      </div>
    </div>
  );
}
