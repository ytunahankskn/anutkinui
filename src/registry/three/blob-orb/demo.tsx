"use client";

import type { ControlValues } from "@/registry/types";
import { BlobOrb, type BlobOrbProps } from "./BlobOrb";

export default function Demo(values: ControlValues) {
  const props = values as unknown as BlobOrbProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <BlobOrb {...props} />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6">
        <p className="mono-label" style={{ color: "rgba(255,255,255,.5)" }}>
          three / shader
        </p>
        <h3 className="mt-1 text-lg font-medium" style={{ color: "rgba(255,255,255,.92)" }}>
          Işıltılı, biçim değiştiren küre
        </h3>
      </div>
    </div>
  );
}
