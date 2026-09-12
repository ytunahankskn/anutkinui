import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "shimmer-button",
  category: "buttons",
  name: "Shimmer Button",
  componentName: "ShimmerButton",
  description: "A pill button with a spinning conic-gradient border and a diagonal shimmer that sweeps across it on hover.",
  descriptionTr: "Dönen conic-gradient kenarlıklı, hover'da yüzeyinden çapraz bir parıltı geçen hap buton.",
  tags: ["button", "shimmer", "gradient-border", "motion"],
  runtime: ["motion 13", "CSS mask"],
  dependencies: ["motion"],
  controls: {
    palette: { type: "select", options: ["violet", "cyan", "gold", "rose"], default: "violet" },
    label: { type: "text", default: "Start building" },
    speed: { type: "number", min: 0.5, max: 6, step: 0.1, default: 3 },
    radius: { type: "number", min: 8, max: 40, step: 1, default: 32 },
    glow: { type: "boolean", default: true },
  },
  cover: ["#15122a", "#7c5cff"],
  createdAt: "2026-09-12",
  popularity: 950,
};
