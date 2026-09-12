"use client";

import type { ControlValues } from "@/registry/types";
import { GlassKnot, type GlassKnotProps } from "./GlassKnot";

export default function Demo(values: ControlValues) {
  return <GlassKnot {...(values as unknown as GlassKnotProps)} />;
}
