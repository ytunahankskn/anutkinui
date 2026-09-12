"use client";

import type { ControlValues } from "@/registry/types";
import { VolumetricClouds, PALETTES, type VolumetricCloudsProps } from "./VolumetricClouds";

export default function Demo(values: ControlValues) {
  const props = values as unknown as VolumetricCloudsProps;
  const ink = PALETTES[props.palette ?? "day"]?.ink ?? "#ffffff";
  return (
    <div className="relative h-full w-full overflow-hidden">
      <VolumetricClouds {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: ink }}>
        <p className="mono-label mb-3" style={{ color: ink, opacity: 0.7 }}>
          backgrounds / volumetric-clouds
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Gökyüzünde süzülen ışık ve hacim.</h2>
      </div>
    </div>
  );
}
