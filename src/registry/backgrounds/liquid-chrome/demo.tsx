"use client";

import type { ControlValues } from "@/registry/types";
import { LiquidChrome, PALETTES, type LiquidChromeProps } from "./LiquidChrome";

export default function Demo(values: ControlValues) {
  const props = values as unknown as LiquidChromeProps;
  const palette = PALETTES[props.palette ?? "chrome"] ?? PALETTES.chrome;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <LiquidChrome {...props} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end p-8" style={{ color: palette.ink }}>
        <p className="mono-label mb-3" style={{ color: "rgba(255,255,255,.6)" }}>
          backgrounds / chrome
        </p>
        <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">Sıvı metal, fareyle şekillenir.</h2>
      </div>
    </div>
  );
}
