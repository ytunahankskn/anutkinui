import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "bento-grid",
  category: "cards",
  name: "Bento Grid",
  componentName: "BentoGrid",
  description: "A bento layout of variously sized tiles with an entrance animation and a glow on hover.",
  descriptionTr: "Farklı boyutlarda karolardan oluşan, giriş animasyonlu ve hover'da parlayan bento düzeni.",
  tags: ["grid", "bento", "layout", "motion"],
  runtime: ["motion 13"],
  dependencies: ["motion"],
  controls: {
    palette: { type: "select", options: ["aurora", "sunset", "ocean", "mono"], default: "aurora" },
    columns: { type: "number", min: 3, max: 4, step: 1, default: 4 },
    gap: { type: "number", min: 6, max: 24, step: 1, default: 12 },
    stagger: { type: "number", min: 0, max: 0.15, step: 0.01, default: 0.06 },
    rounded: { type: "number", min: 8, max: 32, step: 1, default: 20 },
  },
  cover: ["#0d0f1a", "#7c5cff"],
  createdAt: "2026-09-12",
  popularity: 900,
};
