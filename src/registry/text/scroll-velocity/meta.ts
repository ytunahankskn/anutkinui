import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "scroll-velocity",
  category: "text",
  name: "Scroll Velocity",
  componentName: "ScrollVelocity",
  description: "Repeating marquee text rows that speed up and tilt with scroll velocity, flowing in opposite directions.",
  descriptionTr: "Scroll hızına göre hızlanan ve eğilen, zıt yönlerde akan tekrarlı metin marquee satırları.",
  tags: ["text", "marquee", "scroll", "velocity", "gsap"],
  runtime: ["gsap 3.15 ticker"],
  dependencies: ["gsap"],
  controls: {
    palette: { type: "select", options: ["electric", "sunset", "mono"], default: "electric" },
    text: { type: "text", default: "ANUTKINUI ✦ MOTION ✦ " },
    baseSpeed: { type: "number", min: 0, max: 5, step: 0.1, default: 1.5 },
    skewFactor: { type: "number", min: 0, max: 2, step: 0.05, default: 0.6 },
    rows: { type: "number", min: 1, max: 4, step: 1, default: 2 },
    outline: { type: "boolean", default: false },
  },
  cover: ["#050014", "#c084fc"],
  createdAt: "2026-09-12",
  popularity: 1210,
};
