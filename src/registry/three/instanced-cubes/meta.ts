import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "instanced-cubes",
  category: "three",
  name: "Instanced Cubes",
  componentName: "InstancedCubes",
  description: "A ground made of thousands of cubes, rendered in a single draw call, rippling with a wave and the pointer's touch.",
  descriptionTr: "Tek çizim çağrısıyla render edilen, dalga ve fare dokunuşuyla dalgalanan binlerce küpten oluşan zemin.",
  tags: ["three.js", "instancing", "grid", "interactive", "webgl"],
  runtime: ["three.js r186", "react-three-fiber", "drei"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["neon", "pastel", "sunset", "monoGlow"], default: "neon" },
    grid: { type: "number", min: 40, max: 120, step: 10, default: 100 },
    amplitude: { type: "number", min: 0.2, max: 3, step: 0.1, default: 1 },
    speed: { type: "number", min: 0, max: 3, step: 0.1, default: 1 },
    mouseRadius: { type: "number", min: 1, max: 10, step: 0.5, default: 4 },
  },
  cover: ["#05030c", "#ff2bd6"],
  createdAt: "2026-09-12",
  popularity: 910,
};
