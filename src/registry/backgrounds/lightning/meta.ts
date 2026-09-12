import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "lightning",
  category: "backgrounds",
  name: "Lightning",
  componentName: "Lightning",
  description: "A flickering lightning bolt drifting sideways, built from layered noise. A full-screen GLSL shader.",
  descriptionTr: "Katmanlı noise ile üretilen, titreşen ve yatayda sürüklenen yıldırım şeridi. Tam ekran GLSL shader.",
  tags: ["webgl", "glsl", "three.js", "background"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    palette: { type: "select", options: ["electric", "violet", "crimson", "teal"], default: "electric" },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    size: { type: "number", min: 0.5, max: 3, step: 0.05, default: 1 },
    intensity: { type: "number", min: 0.2, max: 2, step: 0.05, default: 1 },
    xOffset: { type: "number", min: -1, max: 1, step: 0.05, default: 0 },
  },
  cover: ["#030712", "#4fd8ff"],
  createdAt: "2026-09-12",
  popularity: 880,
};
