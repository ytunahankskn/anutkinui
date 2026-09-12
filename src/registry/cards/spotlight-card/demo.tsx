"use client";

import type { ControlValues } from "@/registry/types";
import { SpotlightCard, type SpotlightCardProps } from "./SpotlightCard";

export default function Demo(values: ControlValues) {
  const props = values as unknown as SpotlightCardProps;
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(120% 100% at 50% 0%, #1a1230 0%, #0a0712 70%)" }}
    >
      <SpotlightCard {...props} />
      <p className="mono-label pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2" style={{ color: "rgba(255,255,255,.4)" }}>
        imleci kart üzerinde gezdir
      </p>
    </div>
  );
}
