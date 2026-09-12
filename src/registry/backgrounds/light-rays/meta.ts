import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "light-rays",
  category: "backgrounds",
  name: "Light Rays",
  componentName: "LightRays",
  description: "Volumetric light beams radiating from a point, flickering with noise and fading with distance.",
  descriptionTr: "Bir noktadan yayılan, noise ile titreşen ve mesafeyle sönümlenen hacimsel ışın demetleri.",
  tags: ["webgl", "glsl", "three.js", "background"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    palette: { type: "select", options: ["gold", "cyan", "violet", "warm"], default: "gold" },
    origin: { type: "select", options: ["top", "top-left", "top-right", "center"], default: "top" },
    spread: { type: "number", min: 0.2, max: 2, step: 0.02, default: 0.8 },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    glow: { type: "number", min: 0, max: 2, step: 0.05, default: 1 },
  },
  cover: ["#0d0a03", "#ffcf6b"],
  createdAt: "2026-09-12",
  popularity: 950,
};
