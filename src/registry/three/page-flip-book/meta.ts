import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "page-flip-book",
  category: "three",
  name: "Page Flip Book",
  componentName: "PageFlipBook",
  description: "A realistic 3D book with bone-rigged, leather-like bending pages, turned by clicking or with the arrow buttons.",
  descriptionTr: "Kemik zinciriyle deri gibi eğilip kıvrılan, gerçekçi bir 3D kitap; sayfalar tıklanarak veya oklarla çevrilir.",
  tags: ["three.js", "skinning", "bones", "book", "page-curl", "webgl"],
  runtime: ["three.js r186", "react-three-fiber", "drei"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["leather", "linen", "noir", "rose"], default: "leather" },
    pages: { type: "number", min: 4, max: 12, step: 2, default: 8 },
    autoFlip: { type: "boolean", default: false },
    curl: { type: "number", min: 0.5, max: 2, step: 0.1, default: 1 },
    title: { type: "text", default: "Anutkinui — Field Notes" },
  },
  cover: ["#3b2a1f", "#f3ecdc"],
  createdAt: "2026-09-12",
  popularity: 980,
};
