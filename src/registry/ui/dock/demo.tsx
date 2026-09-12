"use client";

import type { ControlValues } from "@/registry/types";
import { Dock, type DockProps } from "./Dock";

export default function Demo(values: ControlValues) {
  const props = values as unknown as DockProps;
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(120% 100% at 50% 30%, #1c2338 0%, #0a0c14 70%)" }}
    >
      <Dock {...props} />
      <p className="mono-label pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2" style={{ color: "rgba(255,255,255,.4)" }}>
        ikonların üzerinde gezin
      </p>
    </div>
  );
}
