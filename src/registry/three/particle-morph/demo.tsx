"use client";

import type { ControlValues } from "@/registry/types";
import { ParticleMorph, type ParticleMorphProps } from "./ParticleMorph";

export default function Demo(values: ControlValues) {
  const props = values as unknown as ParticleMorphProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <ParticleMorph {...props} />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.5)" }}>
          three / particles
        </p>
        <h3 className="mt-1 text-lg font-medium" style={{ color: "rgba(255,255,255,.92)" }}>
          Küre → küp → simit → kalp
        </h3>
      </div>
    </div>
  );
}
