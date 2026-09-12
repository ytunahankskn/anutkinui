"use client";

import type { ControlValues } from "@/registry/types";
import { EarthGlobe, type EarthGlobeProps } from "./EarthGlobe";

export default function Demo(values: ControlValues) {
  const props = values as unknown as EarthGlobeProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <EarthGlobe {...props} />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.5)" }}>
          three / globe
        </p>
        <h3 className="mt-1 text-lg font-medium" style={{ color: "rgba(255,255,255,.92)" }}>
          sürükle · gece tarafında şehir ışıkları
        </h3>
      </div>
    </div>
  );
}
