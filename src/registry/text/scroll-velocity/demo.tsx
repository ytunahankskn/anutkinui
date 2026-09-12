"use client";

import { useState } from "react";
import type { ControlValues } from "@/registry/types";
import { ScrollVelocity, type ScrollVelocityProps } from "./ScrollVelocity";

export default function Demo(values: ControlValues) {
  const props = values as unknown as ScrollVelocityProps;
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setScroller}
      data-lenis-prevent
      className="h-full w-full overflow-y-auto overflow-x-hidden bg-bg"
      style={{ containerType: "size" }}
    >
      <div className="h-[40cqh]" />
      <div className="sticky top-1/2 -translate-y-1/2">
        {scroller && <ScrollVelocity {...props} scroller={scroller} />}
      </div>
      <div className="h-[80cqh]" />
    </div>
  );
}
