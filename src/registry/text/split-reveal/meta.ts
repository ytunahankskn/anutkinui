import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "split-reveal",
  category: "text",
  name: "Split Reveal",
  componentName: "SplitReveal",
  description: "A GSAP SplitText animation that splits text into characters, words or lines and reveals it by sliding up out of a mask.",
  descriptionTr: "Metni harf, kelime veya satırlara bölüp maskeli olarak yukarı kaydırarak açan GSAP SplitText animasyonu.",
  tags: ["text", "gsap", "splittext", "reveal"],
  runtime: ["gsap 3.15", "SplitText"],
  dependencies: ["gsap"],
  controls: {
    text: { type: "text", default: "Motion is the new typography." },
    by: { type: "select", options: ["chars", "words", "lines"], default: "chars" },
    stagger: { type: "number", min: 0, max: 0.15, step: 0.005, default: 0.03 },
    duration: { type: "number", min: 0.2, max: 2.5, step: 0.05, default: 1 },
    ease: { type: "select", options: ["power4.out", "expo.out", "back.out(1.4)", "elastic.out(1, 0.6)", "power2.inOut"], default: "power4.out" },
    rotate: { type: "number", min: 0, max: 30, step: 1, default: 6 },
  },
  cover: ["#1a1a1f", "#f5c542"],
  createdAt: "2026-09-12",
  popularity: 1120,
};
