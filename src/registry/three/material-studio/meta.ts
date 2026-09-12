import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "material-studio",
  category: "three",
  name: "Material Studio",
  componentName: "MaterialStudio",
  description: "A studio turntable scene lit with real HDRI light, showcasing physically based materials.",
  descriptionTr: "Gerçek HDRI ışığıyla aydınlatılmış, fizik tabanlı malzeme ön izlemesi sunan bir stüdyo döner sahnesi.",
  tags: ["three.js", "pbr", "hdri", "materials", "studio"],
  runtime: ["three.js r186", "react-three-fiber", "drei"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["crimson", "midnight", "pearl", "emerald"], default: "crimson" },
    material: {
      type: "select",
      options: ["carPaint", "brushedMetal", "frostedGlass", "ceramic", "gold", "rubber", "iridescent"],
      default: "carPaint",
    },
    object: { type: "select", options: ["sphere", "knot", "ring", "cube", "capsule"], default: "sphere" },
    hdri: { type: "select", options: ["studio", "sunset", "hall", "night"], default: "studio" },
    autoRotate: { type: "boolean", default: true },
  },
  cover: ["#141416", "#c1121f"],
  createdAt: "2026-09-12",
  popularity: 860,
};
