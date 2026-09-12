import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "liquid-chrome",
  category: "backgrounds",
  name: "Liquid Chrome",
  componentName: "LiquidChrome",
  description: "A liquid-metal surface generated with domain-warped noise; the pointer reshapes it on touch.",
  descriptionTr: "Domain-warp noise ile üretilen sıvı metal yüzey; fare dokunuşuyla yüzeyi biçimlendirir.",
  tags: ["webgl", "glsl", "three.js", "background", "interactive"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    palette: { type: "select", options: ["chrome", "gold", "copper", "iridescent", "obsidian"], default: "chrome" },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    amplitude: { type: "number", min: 0, max: 1, step: 0.02, default: 0.4 },
    frequency: { type: "number", min: 1, max: 8, step: 0.1, default: 3 },
    mouseStrength: { type: "number", min: 0, max: 1, step: 0.02, default: 0.35 },
  },
  cover: ["#1c2024", "#eaf2ff"],
  createdAt: "2026-09-12",
  popularity: 870,
};
