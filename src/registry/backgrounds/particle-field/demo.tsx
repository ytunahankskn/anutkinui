"use client";

import type { ControlValues } from "@/registry/types";
import { ParticleField, type ParticleFieldProps } from "./ParticleField";

export default function Demo(values: ControlValues) {
  const props = values as unknown as ParticleFieldProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <ParticleField {...props} />
      <div className="pointer-events-none relative z-10 flex h-full items-center justify-center">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.45)" }}>
          fareyi hareket ettir
        </p>
      </div>
    </div>
  );
}
