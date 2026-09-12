"use client";

import { useState } from "react";
import type { ControlValues } from "@/registry/types";
import { ShoeVariants, type ShoeVariantsProps } from "./ShoeVariants";

const SWATCHES: { id: NonNullable<ShoeVariantsProps["variant"]>; label: string; color: string }[] = [
  { id: "midnight", label: "Midnight", color: "#1c2230" },
  { id: "beach", label: "Beach", color: "#e8caa4" },
  { id: "street", label: "Street", color: "#c23b3b" },
];

export default function Demo(values: ControlValues) {
  const props = values as unknown as ShoeVariantsProps;
  const controlVariant = props.variant ?? "midnight";

  // Kontrol panelinden gelen `variant` ile demo'nun kendi swatch butonlarını senkronlar.
  // Render sırasında state ayarlama deseni: useEffect + setState yerine.
  const [variant, setVariant] = useState(controlVariant);
  const [prevControlVariant, setPrevControlVariant] = useState(controlVariant);
  if (controlVariant !== prevControlVariant) {
    setPrevControlVariant(controlVariant);
    setVariant(controlVariant);
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <ShoeVariants {...props} variant={variant} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-5">
        <div className="pointer-events-auto flex gap-1.5 rounded-full p-1.5" style={{ background: "rgba(0,0,0,.35)", backdropFilter: "blur(8px)" }}>
          {SWATCHES.map((s) => (
            <button
              key={s.id}
              onClick={() => setVariant(s.id)}
              className="flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium transition-colors"
              style={{
                background: variant === s.id ? "rgba(255,255,255,.94)" : "transparent",
                color: variant === s.id ? "#111214" : "rgba(255,255,255,.75)",
              }}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: s.color, boxShadow: "0 0 0 1px rgba(255,255,255,.3) inset" }} />
              {s.label}
            </button>
          ))}
        </div>
        <p className="mono-label" style={{ color: "rgba(255,255,255,.55)" }}>
          sürükle · yakınlaştır · varyant seç
        </p>
      </div>
    </div>
  );
}
