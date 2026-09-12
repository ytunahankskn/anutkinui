"use client";

import type { ControlValues } from "@/registry/types";
import { Marquee3D, type Marquee3DProps } from "./Marquee3D";

export default function Demo(values: ControlValues) {
  const props = values as unknown as Marquee3DProps;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <Marquee3D {...props} />
    </div>
  );
}
