import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "iridescence",
  category: "backgrounds",
  name: "Iridescence",
  componentName: "Iridescence",
  description: "Colors sliding like a holographic oil slick: a thin-film-inspired cosine palette with fbm warp.",
  descriptionTr: "Holografik yağ lekesi gibi kayan renkler; ince film optiğinden esinlenen kosinüs paleti ve fbm warp.",
  tags: ["webgl", "glsl", "three.js", "background", "interactive"],
  runtime: ["three.js r186", "react-three-fiber", "GLSL"],
  dependencies: ["three", "@react-three/fiber"],
  controls: {
    palette: { type: "select", options: ["holo", "pearl", "oil", "candy"], default: "holo" },
    speed: { type: "number", min: 0, max: 3, step: 0.05, default: 1 },
    amplitude: { type: "number", min: 0, max: 1, step: 0.02, default: 0.5 },
    mouseReact: { type: "boolean", default: true },
    zoom: { type: "number", min: 0.5, max: 3, step: 0.05, default: 1 },
  },
  cover: ["#7a6dff", "#ff9ecf"],
  createdAt: "2026-09-12",
  popularity: 830,
};
