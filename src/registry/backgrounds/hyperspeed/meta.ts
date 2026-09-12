import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "hyperspeed",
  category: "backgrounds",
  name: "Hyperspeed",
  componentName: "Hyperspeed",
  description: "Light-speed streaks stretching toward the camera — thousands of star trails in a single draw call.",
  descriptionTr: "Kameraya doğru uzayan ışık hızı çizgileri; tek çizim çağrısıyla binlerce yıldız izi.",
  tags: ["webgl", "three.js", "particles", "background"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    palette: { type: "select", options: ["blue", "magenta", "amber", "white"], default: "blue" },
    speed: { type: "number", min: 0, max: 4, step: 0.05, default: 1.5 },
    count: { type: "number", min: 500, max: 6000, step: 100, default: 2500 },
    streak: { type: "number", min: 0.2, max: 3, step: 0.05, default: 1 },
    spread: { type: "number", min: 1, max: 8, step: 0.1, default: 4 },
  },
  cover: ["#030712", "#1c3fae"],
  createdAt: "2026-09-12",
  popularity: 900,
};
