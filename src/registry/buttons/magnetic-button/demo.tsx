"use client";

import type { ControlValues } from "@/registry/types";
import { MagneticButton, type MagneticButtonProps } from "./MagneticButton";

export default function Demo(values: ControlValues) {
  const props = values as unknown as MagneticButtonProps;
  return (
    <div className="bg-grid flex h-full w-full flex-col items-center justify-center gap-6 bg-bg">
      <MagneticButton {...props} />
      <p className="mono-label">imleci yaklaştır</p>
    </div>
  );
}
