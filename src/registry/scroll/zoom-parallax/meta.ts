import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "zoom-parallax",
  category: "scroll",
  name: "Zoom Parallax",
  componentName: "ZoomParallax",
  description: "Awwwards-style zoom parallax: seven photos grow at different speeds and fly off screen as you scroll, until the center one fills it.",
  descriptionTr: "Awwwards tarzı zoom parallax: yedi fotoğrafın scroll ile farklı hızlarda büyüyüp ekrandan uçarak ortadakinin ekranı doldurması.",
  tags: ["scroll", "gsap", "scrolltrigger", "pin", "parallax", "zoom"],
  runtime: ["gsap 3.15", "ScrollTrigger"],
  dependencies: ["gsap"],
  controls: {
    palette: { type: "select", options: ["dark", "warm", "cool", "mono"], default: "dark" },
    intensity: { type: "number", min: 0.5, max: 1.5, step: 0.05, default: 1 },
    blur: { type: "boolean", default: false },
    images: { type: "number", min: 5, max: 7, step: 1, default: 7 },
  },
  cover: ["#05060a", "#3fd0ff"],
  createdAt: "2026-09-12",
  popularity: 1230,
};
