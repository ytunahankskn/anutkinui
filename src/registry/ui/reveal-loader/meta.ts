import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "reveal-loader",
  category: "ui",
  name: "Reveal Loader",
  componentName: "RevealLoader",
  description: "A site preloader that counts from 0 to 100; when it finishes, the logo flies to its real spot in the navbar and the overlay peels away.",
  descriptionTr: "0'dan 100'e sayan bir site preloader'ı; sayaç bitince logo navbar'daki gerçek yerine uçar ve overlay yukarı soyulur.",
  tags: ["loader", "preloader", "gsap", "transition", "logo"],
  runtime: ["gsap 3.15"],
  dependencies: ["gsap"],
  controls: {
    palette: { type: "select", options: ["noir", "paper", "violet", "sunset"], default: "noir" },
    logoText: { type: "text", default: "anutkinui" },
    duration: { type: "number", min: 0.8, max: 4, step: 0.1, default: 2 },
    hold: { type: "number", min: 0, max: 1.5, step: 0.1, default: 0.4 },
    style: { type: "select", options: ["counter", "bar", "both"], default: "both" },
  },
  cover: ["#0b0b0e", "#7c5cff"],
  createdAt: "2026-09-12",
  popularity: 780,
};
