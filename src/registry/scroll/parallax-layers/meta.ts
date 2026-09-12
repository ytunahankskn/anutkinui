import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "parallax-layers",
  category: "scroll",
  name: "Parallax Layers",
  componentName: "ParallaxLayers",
  description: "A landscape of layered SVG silhouettes where each layer drifts at a different speed on scroll as the sun rises and sets.",
  descriptionTr: "Katmanlı SVG siluetlerden oluşan bir manzara; scroll'da her katman farklı hızda kayar, güneş doğup batar.",
  tags: ["scroll", "parallax", "landscape", "gsap", "scrolltrigger", "svg"],
  runtime: ["gsap 3.15", "ScrollTrigger", "SVG"],
  dependencies: ["gsap"],
  controls: {
    palette: { type: "select", options: ["dusk", "day", "night"], default: "dusk" },
    depth: { type: "number", min: 0.2, max: 2, step: 0.1, default: 1 },
    layers: { type: "number", min: 3, max: 6, step: 1, default: 6 },
    title: { type: "text", default: "Layers of light" },
    fog: { type: "boolean", default: true },
  },
  cover: ["#2b1055", "#ff7a5c"],
  createdAt: "2026-09-12",
  popularity: 1040,
};
