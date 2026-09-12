"use client";

import type { ControlValues } from "@/registry/types";
import { StarryNight, PALETTES, type StarryNightProps } from "./StarryNight";

export default function Demo(values: ControlValues) {
  const props = values as unknown as StarryNightProps;
  const ink = PALETTES[props.palette ?? "midnight"]?.ink ?? "#ffffff";
  return (
    <div className="relative h-full w-full overflow-hidden">
      <StarryNight {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: ink }}>
        <p className="mono-label mb-3" style={{ color: ink, opacity: 0.7 }}>
          backgrounds / starry-night
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Yıldızların altında sonsuz gece.</h2>
      </div>
    </div>
  );
}
