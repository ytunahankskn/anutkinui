"use client";

import type { ControlValues } from "@/registry/types";
import { RippleDistortion, type RippleDistortionProps } from "./RippleDistortion";

export default function Demo(values: ControlValues) {
  const props = values as unknown as RippleDistortionProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <RippleDistortion {...props} />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.6)" }}>
          fareyi gezdir
        </p>
      </div>
    </div>
  );
}
