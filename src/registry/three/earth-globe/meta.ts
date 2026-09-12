import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "earth-globe",
  category: "three",
  name: "Earth Globe",
  componentName: "EarthGlobe",
  description: "A real-texture-mapped Earth globe with city lights on its night side, clouds, and an atmosphere.",
  descriptionTr: "Gece tarafında şehir ışıkları yanan, bulutları ve atmosferi olan, gerçek doku haritalı bir Dünya küresi.",
  tags: ["three.js", "globe", "earth", "shader", "webgl"],
  runtime: ["three.js r186", "react-three-fiber", "drei", "GLSL"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["natural", "holo", "dusk", "mono"], default: "natural" },
    sunAngle: { type: "number", min: 0, max: 360, step: 1, default: 200 },
    clouds: { type: "boolean", default: true },
    cityLights: { type: "boolean", default: true },
    speed: { type: "number", min: 0, max: 3, step: 0.1, default: 1 },
  },
  cover: ["#03050c", "#4f9dff"],
  createdAt: "2026-09-12",
  popularity: 1180,
};
