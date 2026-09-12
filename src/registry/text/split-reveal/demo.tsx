"use client";

import type { ControlValues } from "@/registry/types";
import { SplitReveal, type SplitRevealProps } from "./SplitReveal";

export default function Demo(values: ControlValues) {
  const props = values as unknown as SplitRevealProps;
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg px-8">
      <SplitReveal
        {...props}
        className="max-w-3xl text-center text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
      />
    </div>
  );
}
