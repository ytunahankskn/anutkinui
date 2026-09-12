import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "magnetic-button",
  category: "buttons",
  name: "Magnetic Button",
  componentName: "MagneticButton",
  description: "A spring-physics button pulled toward the cursor as it approaches, with a fill that spreads from the entry point on hover.",
  descriptionTr: "İmleç yaklaşınca ona doğru çekilen, spring fizikli buton. Hover'da giriş noktasından yayılan dolgu.",
  tags: ["button", "magnetic", "motion", "micro-interaction"],
  runtime: ["motion 13"],
  dependencies: ["motion"],
  controls: {
    label: { type: "text", default: "Get started" },
    strength: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4 },
    radius: { type: "number", min: 40, max: 300, step: 10, default: 140 },
    variant: { type: "select", options: ["solid", "outline"], default: "solid" },
  },
  cover: ["#14141a", "#ff7a59"],
  createdAt: "2026-09-12",
  popularity: 740,
};
