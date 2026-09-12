import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "ripple-distortion",
  category: "backgrounds",
  name: "Ripple Distortion",
  componentName: "RippleDistortion",
  description: "A full-screen shader where pointer movement spreads damped water rings across a real photo.",
  descriptionTr: "Fare hareketiyle gerçek bir fotoğrafın üzerinde yayılan, sönümlenen su halkaları oluşturan tam ekran shader.",
  tags: ["webgl", "glsl", "three.js", "background", "photo"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["natural", "cyan", "sunset", "mono"], default: "natural" },
    image: { type: "text", default: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&q=80" },
    strength: { type: "number", min: 0, max: 0.1, step: 0.005, default: 0.03 },
    decay: { type: "number", min: 0.5, max: 4, step: 0.1, default: 1.6 },
    chroma: { type: "number", min: 0, max: 2, step: 0.05, default: 0.8 },
  },
  cover: ["#04121a", "#22d3ee"],
  createdAt: "2026-09-12",
  popularity: 960,
};
