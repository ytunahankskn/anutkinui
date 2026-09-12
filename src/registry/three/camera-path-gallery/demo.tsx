"use client";

import { useState } from "react";
import type { ControlValues } from "@/registry/types";
import { CameraPathGallery, type CameraPathGalleryProps } from "./CameraPathGallery";

export default function Demo(values: ControlValues) {
  const props = values as unknown as CameraPathGalleryProps;
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setScroller}
      data-lenis-prevent
      className="h-full w-full overflow-y-auto overflow-x-hidden"
      style={{ containerType: "size", background: "#0a0a0c" }}
    >
      <section style={{ position: "relative", height: "500cqh" }}>
        {scroller && <CameraPathGallery {...props} scroller={scroller} />}
      </section>
      <div className="flex h-[30cqh] items-start justify-center pt-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.45)" }}>
          aşağı scroll et
        </p>
      </div>
    </div>
  );
}
