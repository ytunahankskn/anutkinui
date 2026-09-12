"use client";

import type { ControlValues } from "@/registry/types";
import { PixelTrail, type PixelTrailProps } from "./PixelTrail";

export default function Demo(values: ControlValues) {
  const props = values as unknown as PixelTrailProps;
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "#08060c" }}>
      <PixelTrail {...props} />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.4)" }}>
          fareyi kutunun içinde gezdir
        </p>
      </div>
    </div>
  );
}
