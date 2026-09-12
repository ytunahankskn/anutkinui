import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "dock",
  category: "ui",
  name: "Dock",
  componentName: "Dock",
  description: "A macOS-style glass dock whose icons grow as the pointer approaches.",
  descriptionTr: "macOS tarzı, fareye yaklaştıkça büyüyen ikonlara sahip cam görünümlü dock.",
  tags: ["dock", "macos", "glass", "motion"],
  runtime: ["motion 13"],
  dependencies: ["motion", "lucide-react"],
  controls: {
    palette: { type: "select", options: ["glassDark", "glassLight", "neon", "warm"], default: "glassDark" },
    magnification: { type: "number", min: 1.2, max: 2.5, step: 0.05, default: 1.8 },
    distance: { type: "number", min: 60, max: 240, step: 10, default: 140 },
    size: { type: "number", min: 36, max: 64, step: 2, default: 44 },
    tooltips: { type: "boolean", default: true },
  },
  cover: ["#0e0e12", "#8ea2ff"],
  createdAt: "2026-09-12",
  popularity: 910,
};
