"use client";

import type { ControlValues } from "@/registry/types";
import { GradientText, PALETTES, type GradientTextProps } from "./GradientText";

export default function Demo(values: ControlValues) {
  const props = values as unknown as GradientTextProps;
  const p = PALETTES[props.palette ?? "aurora"] ?? PALETTES.aurora;
  return (
    <div
      className="flex h-full w-full items-center justify-center px-8"
      style={{ background: p.bg }}
    >
      <div className="flex flex-col items-center gap-4">
        <GradientText
          {...props}
          className="max-w-3xl text-center text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
        />
        <p className="mono-label" style={{ color: "rgba(255,255,255,0.4)" }}>
          otomatik oynatılıyor
        </p>
      </div>
    </div>
  );
}
