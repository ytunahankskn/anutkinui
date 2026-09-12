import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "keyboard-assembly",
  category: "products",
  name: "Keyboard Assembly",
  componentName: "KeyboardAssembly",
  description: "A procedural 65% mechanical keyboard whose case, PCB, plate, switches and keycaps assemble in sequence as you scroll.",
  descriptionTr: "Scroll ettikçe kasa, PCB, plaka, switch ve keycap'lerin sırayla birleştiği prosedürel 65% mekanik klavye.",
  tags: ["three.js", "instancing", "scroll", "gsap", "product", "keyboard"],
  runtime: ["three.js r186", "react-three-fiber", "drei", "gsap 3.15", "ScrollTrigger"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei", "gsap"],
  controls: {
    palette: { type: "select", options: ["graphite", "cream", "navy", "mint"], default: "graphite" },
    underglow: { type: "boolean", default: true },
    rgb: { type: "boolean", default: true },
    tilt: { type: "number", min: 0, max: 10, step: 0.5, default: 4 },
  },
  cover: ["#0d0d10", "#ff6b35"],
  createdAt: "2026-09-12",
  popularity: 1380,
};
