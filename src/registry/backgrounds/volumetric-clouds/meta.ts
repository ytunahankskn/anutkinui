import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "volumetric-clouds",
  category: "backgrounds",
  name: "Volumetric Clouds",
  componentName: "VolumetricClouds",
  description: "Raymarched volumetric clouds using a Henyey-Greenstein phase function and Beer-Lambert light absorption.",
  descriptionTr: "Raymarch edilmiş hacimsel bulutlar; Henyey-Greenstein faz fonksiyonu ve Beer-Lambert ışık soğurumu ile.",
  tags: ["webgl", "glsl", "three.js", "background", "raymarching"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    palette: { type: "select", options: ["day", "sunset", "storm", "dusk"], default: "day" },
    coverage: { type: "number", min: 0.2, max: 0.9, step: 0.05, default: 0.55 },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    sunAngle: { type: "number", min: 0, max: 360, step: 1, default: 60 },
    density: { type: "number", min: 0.5, max: 3, step: 0.05, default: 1.4 },
  },
  cover: ["#1c78d1", "#bfe4ff"],
  createdAt: "2026-09-12",
  popularity: 870,
};
