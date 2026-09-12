import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "scroll-stack",
  category: "scroll",
  name: "Scroll Stack",
  componentName: "ScrollStack",
  description: "A GSAP-scrubbed stack of sticky cards, where each card shrinks and fades as the next one arrives.",
  descriptionTr: "Sticky kartların üst üste yığılıp bir sonraki gelirken öncekinin küçülüp soluklaştığı GSAP scrub kart yığını.",
  tags: ["scroll", "cards", "stack", "gsap", "scrolltrigger"],
  runtime: ["gsap 3.15", "ScrollTrigger"],
  dependencies: ["gsap"],
  controls: {
    palette: { type: "select", options: ["sunset", "ocean", "berry", "slate"], default: "sunset" },
    cards: { type: "number", min: 3, max: 6, step: 1, default: 4 },
    scale: { type: "number", min: 0.8, max: 0.98, step: 0.01, default: 0.92 },
    gap: { type: "number", min: 8, max: 40, step: 1, default: 16 },
    rounded: { type: "number", min: 8, max: 40, step: 1, default: 24 },
  },
  cover: ["#ff9a56", "#c73866"],
  createdAt: "2026-09-12",
  popularity: 960,
};
