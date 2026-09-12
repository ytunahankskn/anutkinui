import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "floating-shapes",
  category: "three",
  name: "Floating Shapes",
  componentName: "FloatingShapes",
  description: "A 3D composition of geometric shapes drifting at different speeds, following the pointer.",
  descriptionTr: "Farklı hızlarda süzülen geometrik şekillerden oluşan, fareyi takip eden 3D kompozisyon.",
  tags: ["three.js", "drei", "float", "webgl", "shapes"],
  runtime: ["three.js r186", "react-three-fiber", "drei"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["pastel", "neon", "metal", "glass"], default: "pastel" },
    count: { type: "number", min: 8, max: 60, step: 1, default: 28 },
    speed: { type: "number", min: 0, max: 3, step: 0.1, default: 1 },
    size: { type: "number", min: 0.3, max: 1.5, step: 0.05, default: 0.8 },
    wireframe: { type: "boolean", default: false },
  },
  cover: ["#f6f2ff", "#b5d8ff"],
  createdAt: "2026-09-12",
  popularity: 870,
};
