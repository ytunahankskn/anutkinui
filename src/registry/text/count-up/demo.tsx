"use client";

import type { ControlValues } from "@/registry/types";
import { CountUp, PALETTES, type CountUpProps } from "./CountUp";

export default function Demo(values: ControlValues) {
  const props = values as unknown as CountUpProps;
  const p = PALETTES[props.palette ?? "violet"] ?? PALETTES.violet;
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-4 px-8"
      style={{ background: p.bg }}
    >
      <CountUp {...props} />
      <p className="mono-label" style={{ color: "rgba(255,255,255,0.35)" }}>
        görünüme girince başlar
      </p>
    </div>
  );
}
