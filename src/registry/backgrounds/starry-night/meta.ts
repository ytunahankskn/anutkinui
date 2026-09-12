import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "starry-night",
  category: "backgrounds",
  name: "Starry Night",
  componentName: "StarryNight",
  description: "A night-sky scene with thousands of twinkling stars, a Milky Way band, shooting stars, and a mountain silhouette.",
  descriptionTr: "Titreyen binlerce yıldız, samanyolu bandı, kayan yıldızlar ve dağ silueti ile gece gökyüzü sahnesi.",
  tags: ["webgl", "glsl", "three.js", "background", "particles"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    palette: { type: "select", options: ["midnight", "aurora", "dusk", "mono"], default: "midnight" },
    starCount: { type: "number", min: 2000, max: 12000, step: 500, default: 6000 },
    twinkle: { type: "number", min: 0, max: 2, step: 0.05, default: 1 },
    shootingStars: { type: "boolean", default: true },
    milkyWay: { type: "boolean", default: true },
  },
  cover: ["#02040f", "#8fb8ff"],
  createdAt: "2026-09-12",
  popularity: 890,
};
