import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "blob-cursor",
  category: "cursors",
  name: "Blob Cursor",
  componentName: "BlobCursor",
  description: "Liquid blobs, merged with an SVG goo filter, that trail the pointer with increasing lag.",
  descriptionTr: "Fareyi giderek artan gecikmeyle takip eden, SVG goo filtresiyle birleşen sıvı blob'lar.",
  tags: ["cursor", "blob", "goo", "motion"],
  runtime: ["motion 13", "SVG filter"],
  dependencies: ["motion"],
  controls: {
    palette: { type: "select", options: ["violet", "lime", "coral", "ice"], default: "violet" },
    size: { type: "number", min: 20, max: 120, step: 2, default: 48 },
    trailCount: { type: "number", min: 1, max: 4, step: 1, default: 3 },
    lag: { type: "number", min: 0.05, max: 0.6, step: 0.01, default: 0.25 },
    blend: { type: "select", options: ["normal", "difference", "screen", "multiply"], default: "difference" },
  },
  cover: ["#140a24", "#b088ff"],
  createdAt: "2026-09-12",
  popularity: 830,
};
