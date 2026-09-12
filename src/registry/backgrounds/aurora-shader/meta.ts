import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "aurora-shader",
  category: "backgrounds",
  name: "Aurora Shader",
  componentName: "AuroraShader",
  description: "Flowing northern lights: a full-screen GLSL shader background generated with fbm noise.",
  descriptionTr: "Akışkan kuzey ışıkları. fbm noise ile üretilen, tam ekran GLSL shader arka planı.",
  tags: ["webgl", "glsl", "three.js", "background"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    hue: { type: "number", min: 0, max: 360, step: 1, default: 190 },
    intensity: { type: "number", min: 0.2, max: 2, step: 0.05, default: 1 },
    mode: { type: "select", options: ["dark", "light"], default: "dark" },
  },
  cover: ["#071a2e", "#16c79a"],
  createdAt: "2026-09-12",
  popularity: 980,
};
