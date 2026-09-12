import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "liquid-button",
  category: "buttons",
  name: "Liquid Button",
  componentName: "LiquidButton",
  description: "An outline button whose SVG-goo-merged circles rise from below on hover, filling it like liquid.",
  descriptionTr: "SVG goo filtresiyle birleşen dairelerin hover'da alttan yükselip butonu sıvı gibi doldurduğu outline buton.",
  tags: ["button", "liquid", "goo", "svg-filter", "motion"],
  runtime: ["motion 13", "SVG filter"],
  dependencies: ["motion"],
  controls: {
    palette: { type: "select", options: ["berry", "lime", "ocean", "lava"], default: "berry" },
    label: { type: "text", default: "Get access" },
    viscosity: { type: "number", min: 4, max: 16, step: 1, default: 9 },
    speed: { type: "number", min: 0.2, max: 2, step: 0.1, default: 1 },
    size: { type: "select", options: ["sm", "md", "lg"], default: "md" },
  },
  cover: ["#1c0716", "#ff4fc3"],
  createdAt: "2026-09-12",
  popularity: 700,
};
