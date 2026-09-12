import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "glass-knot",
  category: "hero",
  name: "Glass Knot Hero",
  componentName: "GlassKnot",
  description: "A light-refracting glass 3D object in a scene that parallaxes with the pointer, with hero text over it.",
  descriptionTr: "Işık kırılmalı cam bir 3D obje, fareye göre parallax yapan sahne ve üstünde hero metni.",
  tags: ["hero", "3d", "glass", "three.js", "landing"],
  runtime: ["three.js r186", "react-three-fiber", "drei"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
  controls: {
    shape: { type: "select", options: ["knot", "torus", "icosahedron"], default: "knot" },
    color: { type: "color", default: "#ffffff" },
    ior: { type: "number", min: 1, max: 2.4, step: 0.02, default: 1.3 },
    thickness: { type: "number", min: 0, max: 3, step: 0.05, default: 1.2 },
    speed: { type: "number", min: 0, max: 4, step: 0.1, default: 1.4 },
    background: { type: "color", default: "#0b0b10" },
    title: { type: "text", default: "Build interfaces that move." },
  },
  cover: ["#0e0e12", "#6c5ce7"],
  createdAt: "2026-09-12",
  popularity: 1240,
};
