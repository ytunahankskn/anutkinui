import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "pinned-text-sequence",
  category: "scroll",
  name: "Pinned Text Sequence",
  componentName: "PinnedTextSequence",
  description: "Apple-product-page style: four text blocks appearing in sequence over a pinned Ken Burns photo.",
  descriptionTr: "Apple ürün sayfası tarzı: pinlenmiş Ken Burns fotoğrafı üzerinde sırayla beliren dört metin bloğu.",
  tags: ["scroll", "gsap", "scrolltrigger", "pin", "ken-burns", "product"],
  runtime: ["gsap 3.15", "ScrollTrigger"],
  dependencies: ["gsap"],
  controls: {
    palette: { type: "select", options: ["noir", "warm", "cool", "mono"], default: "noir" },
    image: { type: "text", default: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&q=80" },
    zoom: { type: "number", min: 1, max: 1.5, step: 0.01, default: 1.2 },
    eyebrow: { type: "text", default: "Introducing" },
    title1: { type: "text", default: "Precision." },
    title2: { type: "text", default: "In every detail." },
    title3: { type: "text", default: "Built to last." },
  },
  cover: ["#0b0b0e", "#e8e3d8"],
  createdAt: "2026-09-12",
  popularity: 1010,
};
