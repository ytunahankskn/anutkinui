import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "blob-orb",
  category: "three",
  name: "Blob Orb",
  componentName: "BlobOrb",
  description: "A glowing, pointer-tracking sphere that morphs with simplex noise and reflects with fresnel and iridescent highlights.",
  descriptionTr: "Simplex gürültüsüyle biçim değiştiren, fresnel ve iridesan yansımalı, fareyi izleyen ışıltılı bir küre.",
  tags: ["three.js", "shader", "glsl", "noise", "webgl"],
  runtime: ["three.js r186", "react-three-fiber", "drei", "GLSL"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["holo", "lava", "ocean", "mint"], default: "holo" },
    distort: { type: "number", min: 0, max: 1.5, step: 0.05, default: 0.5 },
    speed: { type: "number", min: 0, max: 3, step: 0.1, default: 1 },
    fresnel: { type: "number", min: 0, max: 3, step: 0.1, default: 1.2 },
    size: { type: "number", min: 0.5, max: 2, step: 0.05, default: 1 },
  },
  cover: ["#05030a", "#7b5bff"],
  createdAt: "2026-09-12",
  popularity: 950,
};
