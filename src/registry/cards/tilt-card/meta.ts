import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "tilt-card",
  category: "cards",
  name: "Tilt Card",
  componentName: "TiltCard",
  description: "A glossy card that tilts in 3D with the mouse, its layers separating with a sense of depth.",
  descriptionTr: "Fareyle 3B eğilen, katmanları derinlik hissiyle ayrılan parlak kart.",
  tags: ["card", "tilt", "3d", "motion"],
  runtime: ["motion 13"],
  dependencies: ["motion"],
  controls: {
    palette: { type: "select", options: ["aurora", "ember", "ocean", "slate"], default: "aurora" },
    maxTilt: { type: "number", min: 5, max: 30, step: 1, default: 14 },
    scale: { type: "number", min: 1, max: 1.15, step: 0.01, default: 1.04 },
    glare: { type: "boolean", default: true },
    depth: { type: "number", min: 0, max: 80, step: 5, default: 40 },
    title: { type: "text", default: "Tilt me" },
  },
  cover: ["#0c1420", "#4f7cff"],
  createdAt: "2026-09-12",
  popularity: 880,
};
