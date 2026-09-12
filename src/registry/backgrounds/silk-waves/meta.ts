import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "silk-waves",
  category: "backgrounds",
  name: "Silk Waves",
  componentName: "SilkWaves",
  description: "A flowing silk fabric surface: bands of sheen drifting through fbm noise and layered sine waves.",
  descriptionTr: "Akan ipek kumaş yüzeyi. fbm noise ve katmanlı sinüs dalgalarıyla süzülen parıltı bantları.",
  tags: ["webgl", "glsl", "three.js", "background"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    palette: { type: "select", options: ["royal", "rose", "gold", "emerald", "ink"], default: "royal" },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    scale: { type: "number", min: 0.5, max: 4, step: 0.05, default: 1.5 },
    rotation: { type: "number", min: 0, max: 360, step: 1, default: 25 },
    noiseIntensity: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5 },
    grain: { type: "boolean", default: true },
  },
  cover: ["#12083a", "#a68cff"],
  createdAt: "2026-09-12",
  popularity: 910,
};
