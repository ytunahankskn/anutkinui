"use client";

import type { ControlValues } from "@/registry/types";
import {
  MATERIAL_LABELS,
  MaterialStudio,
  OBJECT_LABELS,
  PALETTES,
  type MaterialStudioProps,
} from "./MaterialStudio";

/** #rrggbb → 0..1 arası algılanan parlaklık */
function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export default function Demo(values: ControlValues) {
  const props = values as unknown as MaterialStudioProps;
  const palette = props.palette ?? "crimson";
  const backdrop = (PALETTES[palette] ?? PALETTES.crimson).backdrop;
  const dark = luminance(backdrop) < 0.5;
  const ink = dark ? "rgba(255,255,255,.92)" : "rgba(10,10,12,.88)";
  const inkMuted = dark ? "rgba(255,255,255,.5)" : "rgba(10,10,12,.5)";

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MaterialStudio {...props} />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6">
        <p className="mono-label" style={{ color: inkMuted }}>
          three / pbr studio
        </p>
        <h3 className="mt-1 text-lg font-medium" style={{ color: ink }}>
          {OBJECT_LABELS[props.object ?? "sphere"]} · {MATERIAL_LABELS[props.material ?? "carPaint"]}
        </h3>
      </div>
    </div>
  );
}
