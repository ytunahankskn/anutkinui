import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "paper-fold",
  category: "scroll",
  name: "Paper Fold",
  componentName: "PaperFold",
  description: "An accordion-folded sheet of paper that unfolds piece by piece as you scroll. CSS 3D plus a GSAP ScrollTrigger scrub.",
  descriptionTr: "Akordeon gibi katlanmış bir kağıdın scroll ile parça parça açılması. CSS 3D + GSAP ScrollTrigger scrub.",
  tags: ["scroll", "paper", "fold", "gsap", "scrolltrigger", "3d-css"],
  runtime: ["gsap 3.15", "ScrollTrigger", "CSS 3D"],
  dependencies: ["gsap"],
  controls: {
    segments: { type: "number", min: 2, max: 8, step: 1, default: 5 },
    angle: { type: "number", min: 30, max: 170, step: 5, default: 115 },
    perspective: { type: "number", min: 400, max: 2500, step: 50, default: 1100 },
    paper: { type: "color", default: "#f4efe4" },
    ink: { type: "color", default: "#1c1a16" },
    title: { type: "text", default: "A letter, unfolding." },
  },
  cover: ["#d9d2c3", "#8a7f6a"],
  createdAt: "2026-09-12",
  popularity: 1310,
};
