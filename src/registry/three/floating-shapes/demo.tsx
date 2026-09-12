"use client";

import type { ControlValues } from "@/registry/types";
import { FloatingShapes, type FloatingShapesProps } from "./FloatingShapes";

export default function Demo(values: ControlValues) {
  const props = values as unknown as FloatingShapesProps;
  const light = props.palette === "pastel";
  const ink = light ? "rgba(0,0,0,.85)" : "rgba(255,255,255,.92)";
  const inkMuted = light ? "rgba(0,0,0,.45)" : "rgba(255,255,255,.5)";
  return (
    <div className="relative h-full w-full overflow-hidden">
      <FloatingShapes {...props} />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6">
        <p className="mono-label" style={{ color: inkMuted }}>
          three / composition
        </p>
        <h3 className="mt-1 text-lg font-medium" style={{ color: ink }}>
          Süzülen geometrik şekiller
        </h3>
      </div>
    </div>
  );
}
