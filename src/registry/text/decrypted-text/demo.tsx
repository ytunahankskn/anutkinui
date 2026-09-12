"use client";

import type { ControlValues } from "@/registry/types";
import { DecryptedText, PALETTES, type DecryptedTextProps } from "./DecryptedText";

export default function Demo(values: ControlValues) {
  const props = values as unknown as DecryptedTextProps;
  const palette = PALETTES[props.palette ?? "matrix"] ?? PALETTES.matrix;

  return (
    <div className="flex h-full w-full items-center justify-center px-8 text-center" style={{ background: palette.bg }}>
      <DecryptedText {...props} className="text-lg md:text-2xl" style={{ maxWidth: "44ch" }} />
    </div>
  );
}
