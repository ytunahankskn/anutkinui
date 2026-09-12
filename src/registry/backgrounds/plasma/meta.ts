import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "plasma",
  category: "backgrounds",
  name: "Plasma",
  componentName: "Plasma",
  description: "A classic sum-of-sines plasma pattern mapped onto a soft three-color gradient.",
  descriptionTr: "Klasik sinüs-toplamı plazma deseni, yumuşak 3 renkli bir gradyana eşlenir.",
  tags: ["webgl", "glsl", "three.js", "background"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    palette: { type: "select", options: ["neon", "sunset", "ice", "toxic"], default: "neon" },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    scale: { type: "number", min: 0.5, max: 4, step: 0.05, default: 1.2 },
    contrast: { type: "number", min: 0.5, max: 2, step: 0.05, default: 1 },
    mirror: { type: "boolean", default: false },
  },
  cover: ["#ff2bd6", "#00f0ff"],
  createdAt: "2026-09-12",
  popularity: 790,
};
