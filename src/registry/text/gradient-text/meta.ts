import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "gradient-text",
  category: "text",
  name: "Gradient Text",
  componentName: "GradientText",
  description: "Text painted with a flowing background gradient, with optional glow and a gradient border.",
  descriptionTr: "Arka planı akan bir gradyanla boyanan, isteğe bağlı parıltılı ve gradyan çerçeveli metin.",
  tags: ["text", "gradient", "css", "animation"],
  runtime: ["CSS animations", "background-clip: text"],
  dependencies: [],
  controls: {
    palette: { type: "select", options: ["aurora", "sunset", "ocean", "candy"], default: "aurora" },
    text: { type: "text", default: "Gradient in motion" },
    speed: { type: "number", min: 0, max: 5, step: 0.1, default: 2 },
    glow: { type: "boolean", default: true },
    direction: { type: "select", options: ["horizontal", "diagonal", "vertical"], default: "horizontal" },
    pill: { type: "boolean", default: false },
  },
  cover: ["#0d0e1a", "#7c5cff"],
  createdAt: "2026-09-12",
  popularity: 910,
};
