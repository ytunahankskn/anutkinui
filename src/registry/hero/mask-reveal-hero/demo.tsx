"use client";

import { useState } from "react";
import type { ControlValues } from "@/registry/types";
import { MaskRevealHero, type MaskRevealHeroProps } from "./MaskRevealHero";

export default function Demo(values: ControlValues) {
  const props = values as unknown as MaskRevealHeroProps;
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setScroller}
      data-lenis-prevent
      className="h-full w-full overflow-y-auto overflow-x-hidden"
      style={{ containerType: "size", background: "#000" }}
    >
      {scroller && <MaskRevealHero {...props} scroller={scroller} />}
      <div className="flex h-[30cqh] items-start justify-center pt-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.4)" }}>
          scroll to reveal
        </p>
      </div>
    </div>
  );
}
