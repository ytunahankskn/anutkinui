import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "fluid-cursor",
  category: "backgrounds",
  name: "Fluid Cursor",
  componentName: "FluidCursor",
  description: "A real-time fluid simulation that follows the cursor, running a raw WebGL2 Navier-Stokes pressure/vorticity solve.",
  descriptionTr: "İmleci takip eden gerçek zamanlı akışkan simülasyonu; raw WebGL2, Navier-Stokes tabanlı basınç/vorticity çözümü.",
  tags: ["webgl2", "fluid-simulation", "interactive", "background", "canvas"],
  runtime: ["WebGL2", "GLSL ES 300"],
  dependencies: [],
  controls: {
    palette: { type: "select", options: ["aurora", "candy", "ember", "ocean"], default: "aurora" },
    splatRadius: { type: "number", min: 0.1, max: 1, step: 0.05, default: 0.35 },
    curl: { type: "number", min: 0, max: 50, step: 1, default: 25 },
    dissipation: { type: "number", min: 0.9, max: 1, step: 0.001, default: 0.985 },
    autoSplats: { type: "boolean", default: true },
  },
  cover: ["#050912", "#2dd4bf"],
  createdAt: "2026-09-12",
  popularity: 940,
};
