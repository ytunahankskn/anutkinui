"use client";

import type { ControlValues } from "@/registry/types";
import { PhotoDomeGallery, type PhotoDomeGalleryProps } from "./PhotoDomeGallery";

export default function Demo(values: ControlValues) {
  const props = values as unknown as PhotoDomeGalleryProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <PhotoDomeGallery {...props} />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.5)" }}>
          three / gallery
        </p>
        <h3 className="mt-1 text-lg font-medium" style={{ color: "rgba(255,255,255,.92)" }}>
          sürükle · fotoğraf kubbesi
        </h3>
      </div>
    </div>
  );
}
