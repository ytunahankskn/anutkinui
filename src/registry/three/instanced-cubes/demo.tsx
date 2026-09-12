"use client";

import type { ControlValues } from "@/registry/types";
import { InstancedCubes, type InstancedCubesProps } from "./InstancedCubes";

export default function Demo(values: ControlValues) {
  const props = values as unknown as InstancedCubesProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <InstancedCubes {...props} />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.5)" }}>
          three / instancing
        </p>
        <h3 className="mt-1 text-lg font-medium" style={{ color: "rgba(255,255,255,.92)" }}>
          10,000 küp, tek çizim çağrısı
        </h3>
      </div>
    </div>
  );
}
