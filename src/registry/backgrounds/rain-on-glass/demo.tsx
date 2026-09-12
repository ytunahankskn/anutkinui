"use client";

import type { ControlValues } from "@/registry/types";
import { RainOnGlass, type RainOnGlassProps } from "./RainOnGlass";

export default function Demo(values: ControlValues) {
  const props = values as unknown as RainOnGlassProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <RainOnGlass {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: "#eaf6ff" }}>
        <p className="mono-label mb-3" style={{ color: "rgba(234,246,255,.6)" }}>
          backgrounds / rain
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Camın ardında şehir ışıkları.</h2>
      </div>
    </div>
  );
}
