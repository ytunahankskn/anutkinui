"use client";

import type { ControlValues } from "@/registry/types";
import { LiquidButton, PALETTES, type LiquidButtonProps } from "./LiquidButton";

export default function Demo(values: ControlValues) {
  const props = values as unknown as LiquidButtonProps;
  const p = PALETTES[props.palette ?? "berry"] ?? PALETTES.berry;
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-5 px-8"
      style={{ background: p.bg }}
    >
      <LiquidButton {...props} />
      <p className="mono-label" style={{ color: "rgba(255,255,255,0.35)" }}>
        üstüne gel
      </p>
    </div>
  );
}
