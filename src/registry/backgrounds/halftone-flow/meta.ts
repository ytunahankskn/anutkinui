import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "halftone-flow",
  category: "backgrounds",
  name: "Halftone Flow",
  componentName: "HalftoneFlow",
  description: "A halftone dot grid that flows with noise; dot size is driven by animated noise.",
  descriptionTr: "Gürültüyle akan yarı ton (halftone) nokta ızgarası; nokta boyutu animasyonlu noise ile belirlenir.",
  tags: ["canvas2d", "noise", "background", "halftone"],
  runtime: ["Canvas 2D"],
  dependencies: [],
  controls: {
    palette: { type: "select", options: ["amber", "violet", "cyan", "mono"], default: "amber" },
    cell: { type: "number", min: 6, max: 20, step: 1, default: 10 },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    contrast: { type: "number", min: 0.5, max: 2, step: 0.05, default: 1.2 },
    angle: { type: "number", min: 0, max: 90, step: 1, default: 15 },
  },
  cover: ["#1a1206", "#ffb84d"],
  createdAt: "2026-09-12",
  popularity: 760,
};
