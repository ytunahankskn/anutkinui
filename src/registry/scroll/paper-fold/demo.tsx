"use client";

import { useState } from "react";
import type { ControlValues } from "@/registry/types";
import { PaperFold, type PaperFoldProps } from "./PaperFold";

export default function Demo(values: ControlValues) {
  const props = values as unknown as PaperFoldProps;
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setScroller}
      data-lenis-prevent
      className="h-full w-full overflow-y-auto overflow-x-hidden"
      style={{ containerType: "size", background: "linear-gradient(180deg, #e7e1d5 0%, #d8d0c1 100%)" }}
    >
      {scroller && <PaperFold {...props} scroller={scroller} />}
      <div className="flex h-[40cqh] items-start justify-center pt-6">
        <p className="mono-label" style={{ color: "rgba(0,0,0,.45)" }}>
          yukarı scroll et
        </p>
      </div>
    </div>
  );
}
