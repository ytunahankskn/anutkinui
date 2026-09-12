import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "split-flap",
  category: "text",
  name: "Split Flap",
  componentName: "SplitFlap",
  description: "An airport-departure-board-style split-flap display that locks onto its target by cycling each character through the alphabet.",
  descriptionTr: "Havalimanı tabelası gibi, her karakteri harf dizisinde tek tek çevirerek hedefe kilitlenen split-flap ekran.",
  tags: ["text", "split-flap", "airport", "flip"],
  runtime: ["CSS 3D transforms", "setInterval"],
  dependencies: [],
  controls: {
    palette: { type: "select", options: ["classic", "midnight", "mint"], default: "classic" },
    text: { type: "text", default: "DEPARTURE 21:45" },
    stagger: { type: "number", min: 0, max: 120, step: 5, default: 40 },
    speed: { type: "number", min: 30, max: 150, step: 5, default: 70 },
    rows: { type: "number", min: 1, max: 2, step: 1, default: 1 },
  },
  cover: ["#050505", "#f5c542"],
  createdAt: "2026-09-12",
  popularity: 780,
};
