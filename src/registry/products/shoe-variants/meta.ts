import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "shoe-variants",
  category: "products",
  name: "Shoe Variants",
  componentName: "ShoeVariants",
  description: "A studio shoe showcase with a reflective floor that instantly swaps color and material via KHR_materials_variants.",
  descriptionTr: "KHR_materials_variants ile anlık renk/malzeme değiştiren, yansıtıcı zeminli stüdyo ayakkabı vitrini.",
  tags: ["three.js", "gltf", "variants", "product", "studio", "reflections"],
  runtime: ["three.js r186", "react-three-fiber", "drei"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["white", "charcoal", "blush", "sage"], default: "white" },
    variant: { type: "select", options: ["midnight", "beach", "street"], default: "midnight" },
    hdri: { type: "select", options: ["studio", "sunset", "hall"], default: "studio" },
    autoRotate: { type: "boolean", default: true },
    scale: { type: "number", min: 0.6, max: 1.6, step: 0.05, default: 1 },
  },
  cover: ["#f2f1ee", "#1c2230"],
  createdAt: "2026-09-12",
  popularity: 1050,
};
