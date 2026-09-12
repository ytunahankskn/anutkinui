import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "gradient-mesh",
  category: "backgrounds",
  name: "Gradient Mesh",
  componentName: "GradientMesh",
  description: "A modern mesh-gradient background made of soft blobs gliding along Lissajous orbits.",
  descriptionTr: "Lissajous yörüngelerinde süzülen yumuşak blob'lardan oluşan modern mesh-gradient arka plan.",
  tags: ["canvas2d", "gradient", "background", "blobs"],
  runtime: ["Canvas 2D"],
  dependencies: [],
  controls: {
    palette: { type: "select", options: ["sunset", "ocean", "candy", "forest", "midnight"], default: "sunset" },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    blur: { type: "number", min: 20, max: 140, step: 1, default: 70 },
    blobs: { type: "number", min: 3, max: 7, step: 1, default: 5 },
    grain: { type: "boolean", default: true },
  },
  cover: ["#1a0f1f", "#ff8fab"],
  createdAt: "2026-09-12",
  popularity: 840,
};
