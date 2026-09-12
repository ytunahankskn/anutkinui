"use client";

import type { ControlValues } from "@/registry/types";
import { TiltCard, type TiltCardProps } from "./TiltCard";

export default function Demo(values: ControlValues) {
  const props = values as unknown as TiltCardProps;
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(120% 100% at 50% 100%, #16202f 0%, #090c11 70%)" }}
    >
      <TiltCard {...props} />
      <p className="mono-label pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2" style={{ color: "rgba(255,255,255,.4)" }}>
        fareyi kart üzerinde gezdir
      </p>
    </div>
  );
}
