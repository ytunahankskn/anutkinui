"use client";

import { useState } from "react";
import type { ControlValues } from "@/registry/types";
import { ScrollStack, type ScrollStackProps } from "./ScrollStack";

export default function Demo(values: ControlValues) {
  const props = values as unknown as ScrollStackProps;
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setScroller}
      data-lenis-prevent
      className="h-full w-full overflow-y-auto overflow-x-hidden"
      style={{ containerType: "size", background: "linear-gradient(180deg, #0b0b10 0%, #17141c 100%)" }}
    >
      {scroller && <ScrollStack {...props} scroller={scroller} />}
      <div className="flex h-[30cqh] items-start justify-center pt-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.4)" }}>
          scroll to stack
        </p>
      </div>
    </div>
  );
}
