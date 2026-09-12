import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "rain-on-glass",
  category: "backgrounds",
  name: "Rain On Glass",
  componentName: "RainOnGlass",
  description: "A cinematic background where raindrops sliding down a pane of glass refract a real photo behind it.",
  descriptionTr: "Bir cam yüzeyde kayan yağmur damlalarının arkasındaki gerçek fotoğrafı kırdığı, sinematik bir arka plan.",
  tags: ["webgl", "glsl", "three.js", "background", "rain", "photo"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["cold", "warm", "city", "mono"], default: "cold" },
    image: { type: "text", default: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600&q=80" },
    intensity: { type: "number", min: 0.2, max: 2, step: 0.05, default: 1 },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    blur: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5 },
    fog: { type: "boolean", default: true },
  },
  cover: ["#050608", "#3f8dff"],
  createdAt: "2026-09-12",
  popularity: 940,
};
