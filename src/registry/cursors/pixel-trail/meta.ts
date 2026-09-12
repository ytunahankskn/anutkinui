import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "pixel-trail",
  category: "cursors",
  name: "Pixel Trail",
  componentName: "PixelTrail",
  description: "A damped trail of square pixels that lights up the path the pointer has taken.",
  descriptionTr: "İmlecin geçtiği yolu ışıklandıran, karesel piksellerden oluşan sönümlü bir iz bırakır.",
  tags: ["cursor", "canvas", "pixel", "trail"],
  runtime: ["canvas2d"],
  dependencies: [],
  controls: {
    palette: { type: "select", options: ["candy", "matrix", "ember", "ocean"], default: "candy" },
    pixelSize: { type: "number", min: 8, max: 40, step: 1, default: 18 },
    fade: { type: "number", min: 0.85, max: 0.99, step: 0.01, default: 0.94 },
    glow: { type: "boolean", default: true },
    density: { type: "number", min: 1, max: 4, step: 1, default: 2 },
  },
  cover: ["#08060c", "#ff5cb8"],
  createdAt: "2026-09-12",
  popularity: 850,
};
