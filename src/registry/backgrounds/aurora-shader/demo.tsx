"use client";

import type { ControlValues } from "@/registry/types";
import { AuroraShader, type AuroraShaderProps } from "./AuroraShader";

export default function Demo(values: ControlValues) {
  const props = values as unknown as AuroraShaderProps;
  const dark = props.mode !== "light";
  return (
    <div className="relative h-full w-full overflow-hidden">
      <AuroraShader {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: dark ? "#fff" : "#0b0b0d" }}>
        <p className="mono-label mb-3" style={{ color: dark ? "rgba(255,255,255,.6)" : "rgba(0,0,0,.5)" }}>
          backgrounds / aurora
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Işık perdeleri, tek bir shader.</h2>
      </div>
    </div>
  );
}
