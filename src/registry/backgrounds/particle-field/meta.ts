import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "particle-field",
  category: "backgrounds",
  name: "Particle Field",
  componentName: "ParticleField",
  description: "Thousands of particles fleeing the pointer, moved entirely on the GPU by a point shader in a single draw call.",
  descriptionTr: "Fareden kaçan binlerce parçacık. Tek draw call, GPU tarafında hareket eden point shader.",
  tags: ["webgl", "particles", "three.js", "interactive"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    count: { type: "number", min: 500, max: 20000, step: 500, default: 6000 },
    size: { type: "number", min: 0.5, max: 6, step: 0.1, default: 2.2 },
    force: { type: "number", min: 0, max: 3, step: 0.05, default: 1.2 },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    color: { type: "color", default: "#9fb4ff" },
    background: { type: "color", default: "#05060a" },
  },
  cover: ["#05060a", "#3b4ea8"],
  createdAt: "2026-09-12",
  popularity: 860,
};
