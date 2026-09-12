import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "count-up",
  category: "text",
  name: "Count Up",
  componentName: "CountUp",
  description: "Gradient-filled digits that count up to a target number with expo.out easing as they enter the viewport.",
  descriptionTr: "Görünüme girince expo.out easing ile bir sayıyı hedefe kadar sayan, gradyan dolgulu rakamlar.",
  tags: ["text", "counter", "number", "intersection-observer"],
  runtime: ["requestAnimationFrame", "IntersectionObserver"],
  dependencies: [],
  controls: {
    palette: { type: "select", options: ["violet", "emerald", "amber"], default: "violet" },
    to: { type: "number", min: 0, max: 1000000, step: 1000, default: 128400 },
    duration: { type: "number", min: 0.5, max: 5, step: 0.1, default: 2 },
    prefix: { type: "text", default: "$" },
    suffix: { type: "text", default: "" },
    decimals: { type: "number", min: 0, max: 2, step: 1, default: 0 },
    caption: { type: "text", default: "monthly recurring revenue" },
  },
  cover: ["#0d0b16", "#8b5cf6"],
  createdAt: "2026-09-12",
  popularity: 860,
};
