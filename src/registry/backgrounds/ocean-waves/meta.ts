import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "ocean-waves",
  category: "backgrounds",
  name: "Ocean Waves",
  componentName: "OceanWaves",
  description: "A realistic ocean surface built from the sum of five Gerstner waves, with fresnel reflection, sun glitter and foam.",
  descriptionTr: "5 Gerstner dalgasının toplamıyla üretilen gerçekçi okyanus yüzeyi; fresnel yansıma, güneş parıltısı ve köpük.",
  tags: ["webgl", "glsl", "three.js", "background", "water"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["tropical", "northSea", "sunset", "night"], default: "tropical" },
    amplitude: { type: "number", min: 0.2, max: 2, step: 0.05, default: 1 },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    sunAngle: { type: "number", min: 0, max: 360, step: 1, default: 35 },
    choppiness: { type: "number", min: 0.2, max: 1.5, step: 0.05, default: 0.8 },
  },
  cover: ["#014a52", "#3fd8c9"],
  createdAt: "2026-09-12",
  popularity: 910,
};
