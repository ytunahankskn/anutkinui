import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "photo-dome-gallery",
  category: "three",
  name: "Photo Dome Gallery",
  componentName: "PhotoDomeGallery",
  description: "A drag-to-rotate gallery with the camera fixed at the center, where real photos line the inside of a sphere.",
  descriptionTr: "Kameranın merkezde durduğu, gerçek fotoğrafların bir kürenin iç yüzeyine dizildiği sürükle-döndür galeri.",
  tags: ["three.js", "gallery", "photos", "drag", "webgl"],
  runtime: ["three.js r186", "react-three-fiber", "drei"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["noir", "warm", "cool", "mono"], default: "noir" },
    radius: { type: "number", min: 4, max: 9, step: 0.5, default: 6 },
    rows: { type: "number", min: 2, max: 4, step: 1, default: 3 },
    perRow: { type: "number", min: 6, max: 10, step: 1, default: 8 },
    hoverScale: { type: "number", min: 1, max: 1.3, step: 0.02, default: 1.12 },
  },
  cover: ["#0a0a0c", "#e8b06a"],
  createdAt: "2026-09-12",
  popularity: 990,
};
