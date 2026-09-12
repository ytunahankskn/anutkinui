import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "product-turntable",
  category: "products",
  name: "Product Turntable",
  componentName: "ProductTurntable",
  description: "An automatic turntable product showcase spinning in a curved cyclorama studio that pauses while you drag it.",
  descriptionTr: "Kavisli cyclorama stüdyoda dönen, sürüklerken duran otomatik turntable ürün vitrini.",
  tags: ["three.js", "gltf", "product", "studio", "turntable"],
  runtime: ["three.js r186", "react-three-fiber", "drei"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["studio", "charcoal", "blush", "sage"], default: "studio" },
    model: { type: "select", options: ["chair", "toycar", "helmet"], default: "chair" },
    hdri: { type: "select", options: ["studio", "sunset", "hall", "night"], default: "studio" },
    autoRotate: { type: "number", min: 0, max: 4, step: 0.1, default: 1 },
    zoom: { type: "number", min: 0.6, max: 1.6, step: 0.05, default: 1 },
  },
  cover: ["#f4f4f2", "#c7c3ba"],
  createdAt: "2026-09-12",
  popularity: 970,
};
