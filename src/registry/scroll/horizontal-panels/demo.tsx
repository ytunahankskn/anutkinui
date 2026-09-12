"use client";

import { useState } from "react";
import type { ControlValues } from "@/registry/types";
import { HorizontalPanels, type HorizontalPanelsProps } from "./HorizontalPanels";

export default function Demo(values: ControlValues) {
  const props = values as unknown as HorizontalPanelsProps;
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setScroller}
      data-lenis-prevent
      className="h-full w-full overflow-y-auto overflow-x-hidden"
      style={{ containerType: "size", background: "#0b0b10" }}
    >
      <div className="flex h-[20cqh] items-end justify-center pb-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.4)" }}>
          scroll down
        </p>
      </div>
      {scroller && <HorizontalPanels {...props} scroller={scroller} />}
      <div className="flex h-[20cqh] items-start justify-center pt-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.4)" }}>
          end
        </p>
      </div>
    </div>
  );
}
