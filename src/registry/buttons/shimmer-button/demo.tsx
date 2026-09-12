"use client";

import type { ControlValues } from "@/registry/types";
import { ShimmerButton, PALETTES, type ShimmerButtonProps } from "./ShimmerButton";

export default function Demo(values: ControlValues) {
  const props = values as unknown as ShimmerButtonProps;
  const p = PALETTES[props.palette ?? "violet"] ?? PALETTES.violet;
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-5 px-8"
      style={{ background: `radial-gradient(60% 50% at 50% 55%, ${p.glow} 0%, transparent 70%), #08080f` }}
    >
      <ShimmerButton {...props} />
      <p className="mono-label" style={{ color: "rgba(255,255,255,0.35)" }}>
        üstüne gel
      </p>
    </div>
  );
}
