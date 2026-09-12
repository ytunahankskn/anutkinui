"use client";

import type { ControlValues } from "@/registry/types";
import { BlobCursor, type BlobCursorProps } from "./BlobCursor";

export default function Demo(values: ControlValues) {
  const props = values as unknown as BlobCursorProps;
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "#0a0710" }}>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
        <p style={{ fontSize: "clamp(28px, 6vw, 56px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#f5f2ff" }}>
          GOOEY
        </p>
        <p className="mono-label" style={{ color: "rgba(245,242,255,.4)" }}>
          fareyi hareket ettir
        </p>
      </div>
      <BlobCursor {...props} />
    </div>
  );
}
