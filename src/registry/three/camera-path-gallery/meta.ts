import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "camera-path-gallery",
  category: "three",
  name: "Camera Path Gallery",
  componentName: "CameraPathGallery",
  description: "A camera that travels along a Catmull-Rom curve on scroll, visiting real photos placed along the path.",
  descriptionTr: "Scroll ile bir Catmull-Rom eğrisi boyunca ilerleyen kamera, yol kenarına dizilmiş gerçek fotoğrafları ziyaret eder.",
  tags: ["scroll", "three.js", "camera", "gallery", "gsap", "scrolltrigger"],
  runtime: ["three.js r186", "react-three-fiber", "drei", "gsap 3.15", "ScrollTrigger"],
  dependencies: ["three", "@react-three/fiber", "@react-three/drei", "gsap"],
  controls: {
    palette: { type: "select", options: ["dusk", "noir", "ocean", "mono"], default: "dusk" },
    count: { type: "number", min: 6, max: 12, step: 1, default: 10 },
    spacing: { type: "number", min: 2, max: 6, step: 0.5, default: 3.5 },
    fog: { type: "number", min: 0, max: 0.2, step: 0.01, default: 0.05 },
    tilt: { type: "number", min: 0, max: 30, step: 1, default: 12 },
  },
  cover: ["#120e18", "#ff8f6b"],
  createdAt: "2026-09-12",
  popularity: 1050,
};
