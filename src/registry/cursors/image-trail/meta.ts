import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "image-trail",
  category: "cursors",
  name: "Image Trail",
  componentName: "ImageTrail",
  description: "As the pointer moves, real photos appear behind it, growing and fading into a trail.",
  descriptionTr: "Fare hareket ettikçe ardında gerçek fotoğraflardan oluşan, büyüyüp süzülerek kaybolan bir iz bırakır.",
  tags: ["cursor", "images", "trail", "motion"],
  runtime: ["motion 13", "DOM"],
  dependencies: ["motion"],
  controls: {
    palette: { type: "select", options: ["noir", "paper", "neon", "warm"], default: "noir" },
    threshold: { type: "number", min: 40, max: 160, step: 5, default: 80 },
    size: { type: "number", min: 120, max: 260, step: 5, default: 180 },
    lifetime: { type: "number", min: 500, max: 2000, step: 50, default: 900 },
    rotation: { type: "number", min: 0, max: 30, step: 1, default: 12 },
    maxImages: { type: "number", min: 4, max: 12, step: 1, default: 8 },
  },
  cover: ["#08060c", "#a855f7"],
  createdAt: "2026-09-12",
  popularity: 900,
};
