import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "particle-morph",
  category: "three",
  name: "Particle Morph",
  componentName: "ParticleMorph",
  description: "Thousands of particles that smoothly morph between a sphere, a cube, a torus and a heart.",
  descriptionTr: "Küre, küp, simit ve kalp arasında yumuşakça biçim değiştiren binlerce parçacık.",
  tags: ["three.js", "particles", "morph", "webgl", "gpu"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    palette: { type: "select", options: ["aurora", "fire", "ice", "candy"], default: "aurora" },
    count: { type: "number", min: 5000, max: 40000, step: 1000, default: 20000 },
    shape: { type: "select", options: ["auto", "sphere", "cube", "torus", "heart"], default: "auto" },
    size: { type: "number", min: 1, max: 6, step: 0.1, default: 2.5 },
    speed: { type: "number", min: 0, max: 3, step: 0.1, default: 1 },
  },
  cover: ["#040713", "#20e3b2"],
  createdAt: "2026-09-12",
  popularity: 980,
};
