"use client";

import type { ControlValues } from "@/registry/types";
import { PALETTES, ProductTurntable, type ProductTurntableProps } from "./ProductTurntable";

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
  const props = values as unknown as ProductTurntableProps;
  const pal = PALETTES[props.palette ?? "studio"] ?? PALETTES.studio;
  const dark = luminance(pal.bg) < 0.5;
  const ink = dark ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.4)";

  return (
    <div className="relative h-full w-full overflow-hidden">
      <ProductTurntable {...props} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-5">
        <p className="mono-label" style={{ color: ink }}>
          sürükle · yakınlaştır
        </p>
      </div>
    </div>
  );
}
