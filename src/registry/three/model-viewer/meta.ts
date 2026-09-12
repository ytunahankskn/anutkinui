import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "model-viewer",
  category: "three",
  name: "Model Viewer",
  componentName: "ModelViewer",
  description: "A 3D showcase that loads and centers any GLB file, auto-rotates it, and lets you drag the camera around.",
  descriptionTr: "Herhangi bir GLB dosyasını yükleyip ortalayan, otomatik döndüren ve sürüklenebilir kamerayla gösteren 3D vitrin.",
  tags: ["three.js", "gltf", "drei", "orbit-controls", "webgl"],
  runtime: ["three.js r186", "react-three-fiber", "drei"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    palette: { type: "select", options: ["studio", "sunset", "dawn", "night"], default: "studio" },
    src: {
      type: "text",
      default: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    },
    autoRotate: { type: "boolean", default: true },
    speed: { type: "number", min: 0, max: 3, step: 0.1, default: 1 },
    scale: { type: "number", min: 0.5, max: 2, step: 0.05, default: 1 },
  },
  cover: ["#101014", "#8fb3ff"],
  createdAt: "2026-09-12",
  popularity: 890,
};
