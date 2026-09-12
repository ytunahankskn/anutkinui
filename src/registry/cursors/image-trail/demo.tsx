"use client";

import type { ControlValues } from "@/registry/types";
import { ImageTrail, PALETTES, type ImageTrailProps } from "./ImageTrail";

export default function Demo(values: ControlValues) {
  const props = values as unknown as ImageTrailProps;
  const p = PALETTES[props.palette ?? "noir"] ?? PALETTES.noir;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p
          style={{
            fontSize: "clamp(36px, 8vw, 88px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: p.ink,
            opacity: 0.14,
          }}
        >
          Move me
        </p>
      </div>
      <ImageTrail {...props} />
    </div>
  );
}
