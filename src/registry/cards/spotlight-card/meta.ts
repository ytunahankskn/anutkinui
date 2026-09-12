import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "spotlight-card",
  category: "cards",
  name: "Spotlight Card",
  componentName: "SpotlightCard",
  description: "A card with a radial light beam that follows the pointer and a glowing border.",
  descriptionTr: "İmleci takip eden radyal ışık huzmesi ve parlayan kenarlığa sahip kart.",
  tags: ["card", "spotlight", "motion", "hover"],
  runtime: ["motion 13"],
  dependencies: ["motion"],
  controls: {
    palette: { type: "select", options: ["violet", "cyan", "gold", "rose"], default: "violet" },
    radius: { type: "number", min: 100, max: 500, step: 10, default: 260 },
    intensity: { type: "number", min: 0.2, max: 1, step: 0.05, default: 0.6 },
    borderGlow: { type: "boolean", default: true },
    title: { type: "text", default: "Spotlight" },
    description: { type: "text", default: "Hover to reveal a soft radial light that tracks your cursor." },
  },
  cover: ["#140f24", "#8b5cf6"],
  createdAt: "2026-09-12",
  popularity: 920,
};
