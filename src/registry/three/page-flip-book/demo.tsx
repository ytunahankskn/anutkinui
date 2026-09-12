"use client";

import type { ControlValues } from "@/registry/types";
import { PageFlipBook, type PageFlipBookProps } from "./PageFlipBook";

export default function Demo(values: ControlValues) {
  const props = values as unknown as PageFlipBookProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <PageFlipBook {...props} />
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.4)" }}>
          sayfaya tıkla · ← →
        </p>
      </div>
    </div>
  );
}
