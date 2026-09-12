"use client";

import type { ControlValues } from "@/registry/types";
import { BentoGrid, type BentoGridProps } from "./BentoGrid";

export default function Demo(values: ControlValues) {
  const props = values as unknown as BentoGridProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <BentoGrid {...props} />
    </div>
  );
}
