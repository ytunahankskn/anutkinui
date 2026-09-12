import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "horizontal-panels",
  category: "scroll",
  name: "Horizontal Panels",
  componentName: "HorizontalPanels",
  description: "A GSAP ScrollTrigger layout that converts vertical scroll into horizontal panel transitions inside a pinned section.",
  descriptionTr: "Pinlenmiş bir bölüm içinde dikey scroll'u yatay panel geçişine çeviren GSAP ScrollTrigger düzeni.",
  tags: ["scroll", "horizontal", "panels", "gsap", "scrolltrigger", "pin"],
  runtime: ["gsap 3.15", "ScrollTrigger"],
  dependencies: ["gsap"],
  controls: {
    palette: { type: "select", options: ["citrus", "ocean", "night"], default: "citrus" },
    panels: { type: "number", min: 3, max: 6, step: 1, default: 4 },
    ease: { type: "select", options: ["none", "power1.inOut"], default: "none" },
    gap: { type: "number", min: 0, max: 48, step: 2, default: 0 },
    progressBar: { type: "boolean", default: true },
  },
  cover: ["#ffb703", "#fb8500"],
  createdAt: "2026-09-12",
  popularity: 890,
};
