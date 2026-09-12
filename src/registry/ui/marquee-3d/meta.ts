import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "marquee-3d",
  category: "ui",
  name: "Marquee 3D",
  componentName: "Marquee3D",
  description: "A 3D gallery wall of infinitely scrolling columns of real photos, tilted in perspective.",
  descriptionTr: "Perspektifle eğilmiş, sonsuz kayan gerçek fotoğraf sütunlarından oluşan 3B galeri duvarı.",
  tags: ["ui", "marquee", "3d", "gallery", "css"],
  runtime: ["CSS 3D", "DOM"],
  dependencies: [],
  controls: {
    palette: { type: "select", options: ["noir", "ocean", "sunset", "mono"], default: "noir" },
    speed: { type: "number", min: 10, max: 60, step: 1, default: 30 },
    tilt: { type: "number", min: 35, max: 70, step: 1, default: 55 },
    columns: { type: "number", min: 3, max: 5, step: 1, default: 4 },
    title: { type: "text", default: "Real photos, in motion" },
  },
  cover: ["#050505", "#38bdf8"],
  createdAt: "2026-09-12",
  popularity: 1050,
};
