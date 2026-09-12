"use client";

import type { ControlValues } from "@/registry/types";
import { SplitFlap, PALETTES, type SplitFlapProps } from "./SplitFlap";

export default function Demo(values: ControlValues) {
  const props = values as unknown as SplitFlapProps;
  const p = PALETTES[props.palette ?? "classic"] ?? PALETTES.classic;
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-4 px-8"
      style={{ background: p.bg }}
    >
      <SplitFlap {...props} />
      <p className="mono-label" style={{ color: "rgba(255,255,255,0.35)" }}>
        harfler hedefe kilitleniyor
      </p>
    </div>
  );
}
