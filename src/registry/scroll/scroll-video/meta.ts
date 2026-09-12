import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "scroll-video",
  category: "scroll",
  name: "Scroll Video",
  componentName: "ScrollVideo",
  description: "A pinned, non-autoplaying video sequence scrubbed frame-by-frame by scroll position.",
  descriptionTr: "Scroll ile kare kare oynatılan (scrubbed), otomatik oynatmasız pinlenmiş video sekansı.",
  tags: ["scroll", "video", "gsap", "scrolltrigger", "pin", "scrub"],
  runtime: ["gsap 3.15", "ScrollTrigger", "HTMLVideoElement"],
  dependencies: ["gsap"],
  controls: {
    palette: { type: "select", options: ["cinema", "ocean", "ember", "mono"], default: "cinema" },
    src: { type: "text", default: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
    caption1: { type: "text", default: "Frame by frame" },
    caption2: { type: "text", default: "Driven by scroll" },
    caption3: { type: "text", default: "No autoplay, no timers" },
    vignette: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6 },
  },
  cover: ["#0b0b10", "#ffd166"],
  createdAt: "2026-09-12",
  popularity: 940,
};
