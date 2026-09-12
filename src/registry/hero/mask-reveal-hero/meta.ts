import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "mask-reveal-hero",
  category: "hero",
  name: "Mask Reveal Hero",
  componentName: "MaskRevealHero",
  description: "GTA VI style: a pinned hero where a photo emerges from behind an SVG text mask that grows as you scroll.",
  descriptionTr: "GTA VI tarzı: scroll ile büyüyen bir SVG metin maskesinin arkasından fotoğrafın ortaya çıktığı pinlenmiş hero.",
  tags: ["hero", "scroll", "svg-mask", "gsap", "scrolltrigger", "pin"],
  runtime: ["gsap 3.15", "ScrollTrigger", "SVG mask"],
  dependencies: ["gsap"],
  controls: {
    palette: { type: "select", options: ["noir", "sunset", "ocean", "ember"], default: "noir" },
    text: { type: "text", default: "VI" },
    image: { type: "text", default: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80" },
    headline: { type: "text", default: "Coming 2026" },
    maxScale: { type: "number", min: 20, max: 80, step: 1, default: 40 },
  },
  cover: ["#0b0b0e", "#ff5a5f"],
  createdAt: "2026-09-12",
  popularity: 1120,
};
