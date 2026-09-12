"use client";

import type { ControlValues } from "@/registry/types";
import { GradientMesh, PALETTES, type GradientMeshProps } from "./GradientMesh";

export default function Demo(values: ControlValues) {
  const props = values as unknown as GradientMeshProps;
  const ink = PALETTES[props.palette ?? "sunset"]?.ink ?? "#ffffff";
  return (
    <div className="relative h-full w-full overflow-hidden">
      <GradientMesh {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: ink }}>
        <p className="mono-label mb-3" style={{ color: ink, opacity: 0.6 }}>
          backgrounds / gradient-mesh
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Süzülen renk bulutları.</h2>
      </div>
    </div>
  );
}
