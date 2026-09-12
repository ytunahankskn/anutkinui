import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "dot-grid",
  category: "backgrounds",
  name: "Dot Grid",
  componentName: "DotGrid",
  description: "A pointer-reactive dot grid — nearby dots grow and glow, spring back like a bow, and drift lazily when idle.",
  descriptionTr: "Fareye tepki veren nokta ızgarası; yakın noktalar büyüyüp parlar, yay gibi geri iter, boşta yavaşça nefes alır.",
  tags: ["canvas2d", "interactive", "background", "grid"],
  runtime: ["Canvas 2D"],
  dependencies: [],
  controls: {
    palette: { type: "select", options: ["mint", "coral", "electric", "mono"], default: "mint" },
    gap: { type: "number", min: 14, max: 48, step: 1, default: 24 },
    dotSize: { type: "number", min: 1, max: 6, step: 0.1, default: 2.5 },
    proximity: { type: "number", min: 40, max: 300, step: 5, default: 120 },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
  },
  cover: ["#06201a", "#7dffd8"],
  createdAt: "2026-09-12",
  popularity: 720,
};
