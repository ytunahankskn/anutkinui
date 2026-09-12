import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "exploded-earbuds",
  category: "products",
  name: "Exploded Earbuds",
  componentName: "ExplodedEarbuds",
  description: "A labeled exploded view where scrolling opens the charging case's lid and pulls the right earbud apart piece by piece.",
  descriptionTr: "Scroll ile kapağı açılan şarj kutusu ve sağ kulaklığın parça parça ayrıldığı etiketli patlamalı görünüm.",
  tags: ["three.js", "scroll", "gsap", "product", "exploded-view", "earbuds"],
  runtime: ["three.js r186", "react-three-fiber", "drei", "gsap 3.15", "ScrollTrigger"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei", "gsap"],
  controls: {
    palette: { type: "select", options: ["white", "black", "sage", "lilac"], default: "white" },
    explode: { type: "number", min: 0.5, max: 2, step: 0.1, default: 1 },
    labels: { type: "boolean", default: true },
    hdri: { type: "select", options: ["studio", "hall", "sunset"], default: "studio" },
  },
  cover: ["#ececf0", "#c7c7cc"],
  createdAt: "2026-09-12",
  popularity: 890,
};
