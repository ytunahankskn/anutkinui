"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ControlValues } from "./types";

const Loading = () => (
  <div className="absolute inset-0 grid place-items-center">
    <span className="mono-label animate-pulse">loading scene…</span>
  </div>
);

// Not: next/dynamic seçenekleri satır içi obje olmak zorunda (derleyici statik analiz eder).
/** slug → canlı demo. Tümü client-only (WebGL / DOM ölçümü gerektirir). */
export const demos: Record<string, ComponentType<ControlValues>> = {
  "backgrounds/aurora-shader": dynamic(() => import("./backgrounds/aurora-shader/demo"), { ssr: false, loading: Loading }),
  "backgrounds/particle-field": dynamic(() => import("./backgrounds/particle-field/demo"), { ssr: false, loading: Loading }),
  "hero/glass-knot": dynamic(() => import("./hero/glass-knot/demo"), { ssr: false, loading: Loading }),
  "text/split-reveal": dynamic(() => import("./text/split-reveal/demo"), { ssr: false, loading: Loading }),
  "scroll/paper-fold": dynamic(() => import("./scroll/paper-fold/demo"), { ssr: false, loading: Loading }),
  "buttons/magnetic-button": dynamic(() => import("./buttons/magnetic-button/demo"), { ssr: false, loading: Loading }),
  "backgrounds/silk-waves": dynamic(() => import("./backgrounds/silk-waves/demo"), { ssr: false, loading: Loading }),
  "backgrounds/liquid-chrome": dynamic(() => import("./backgrounds/liquid-chrome/demo"), { ssr: false, loading: Loading }),
  "backgrounds/plasma": dynamic(() => import("./backgrounds/plasma/demo"), { ssr: false, loading: Loading }),
  "backgrounds/iridescence": dynamic(() => import("./backgrounds/iridescence/demo"), { ssr: false, loading: Loading }),
  "backgrounds/light-rays": dynamic(() => import("./backgrounds/light-rays/demo"), { ssr: false, loading: Loading }),
  "backgrounds/dot-grid": dynamic(() => import("./backgrounds/dot-grid/demo"), { ssr: false, loading: Loading }),
  "backgrounds/hyperspeed": dynamic(() => import("./backgrounds/hyperspeed/demo"), { ssr: false, loading: Loading }),
  "backgrounds/gradient-mesh": dynamic(() => import("./backgrounds/gradient-mesh/demo"), { ssr: false, loading: Loading }),
  "backgrounds/halftone-flow": dynamic(() => import("./backgrounds/halftone-flow/demo"), { ssr: false, loading: Loading }),
  "backgrounds/lightning": dynamic(() => import("./backgrounds/lightning/demo"), { ssr: false, loading: Loading }),
  "cards/spotlight-card": dynamic(() => import("./cards/spotlight-card/demo"), { ssr: false, loading: Loading }),
  "cards/tilt-card": dynamic(() => import("./cards/tilt-card/demo"), { ssr: false, loading: Loading }),
  "cards/bento-grid": dynamic(() => import("./cards/bento-grid/demo"), { ssr: false, loading: Loading }),
  "cursors/blob-cursor": dynamic(() => import("./cursors/blob-cursor/demo"), { ssr: false, loading: Loading }),
  "cursors/pixel-trail": dynamic(() => import("./cursors/pixel-trail/demo"), { ssr: false, loading: Loading }),
  "ui/dock": dynamic(() => import("./ui/dock/demo"), { ssr: false, loading: Loading }),
  "three/instanced-cubes": dynamic(() => import("./three/instanced-cubes/demo"), { ssr: false, loading: Loading }),
  "three/particle-morph": dynamic(() => import("./three/particle-morph/demo"), { ssr: false, loading: Loading }),
  "three/floating-shapes": dynamic(() => import("./three/floating-shapes/demo"), { ssr: false, loading: Loading }),
  "three/blob-orb": dynamic(() => import("./three/blob-orb/demo"), { ssr: false, loading: Loading }),
  "three/model-viewer": dynamic(() => import("./three/model-viewer/demo"), { ssr: false, loading: Loading }),
  "scroll/scroll-stack": dynamic(() => import("./scroll/scroll-stack/demo"), { ssr: false, loading: Loading }),
  "scroll/horizontal-panels": dynamic(() => import("./scroll/horizontal-panels/demo"), { ssr: false, loading: Loading }),
  "scroll/parallax-layers": dynamic(() => import("./scroll/parallax-layers/demo"), { ssr: false, loading: Loading }),
  "text/scroll-velocity": dynamic(() => import("./text/scroll-velocity/demo"), { ssr: false, loading: Loading }),
  "text/decrypted-text": dynamic(() => import("./text/decrypted-text/demo"), { ssr: false, loading: Loading }),
  "text/gradient-text": dynamic(() => import("./text/gradient-text/demo"), { ssr: false, loading: Loading }),
  "text/count-up": dynamic(() => import("./text/count-up/demo"), { ssr: false, loading: Loading }),
  "text/split-flap": dynamic(() => import("./text/split-flap/demo"), { ssr: false, loading: Loading }),
  "buttons/shimmer-button": dynamic(() => import("./buttons/shimmer-button/demo"), { ssr: false, loading: Loading }),
  "buttons/liquid-button": dynamic(() => import("./buttons/liquid-button/demo"), { ssr: false, loading: Loading }),
  "hero/mask-reveal-hero": dynamic(() => import("./hero/mask-reveal-hero/demo"), { ssr: false, loading: Loading }),
  "scroll/scroll-video": dynamic(() => import("./scroll/scroll-video/demo"), { ssr: false, loading: Loading }),
  "scroll/pinned-text-sequence": dynamic(() => import("./scroll/pinned-text-sequence/demo"), { ssr: false, loading: Loading }),
  "scroll/zoom-parallax": dynamic(() => import("./scroll/zoom-parallax/demo"), { ssr: false, loading: Loading }),
  "backgrounds/ripple-distortion": dynamic(() => import("./backgrounds/ripple-distortion/demo"), { ssr: false, loading: Loading }),
  "backgrounds/rain-on-glass": dynamic(() => import("./backgrounds/rain-on-glass/demo"), { ssr: false, loading: Loading }),
  "cursors/image-trail": dynamic(() => import("./cursors/image-trail/demo"), { ssr: false, loading: Loading }),
  "ui/marquee-3d": dynamic(() => import("./ui/marquee-3d/demo"), { ssr: false, loading: Loading }),
  "ui/reveal-loader": dynamic(() => import("./ui/reveal-loader/demo"), { ssr: false, loading: Loading }),
  "three/material-studio": dynamic(() => import("./three/material-studio/demo"), { ssr: false, loading: Loading }),
  "three/earth-globe": dynamic(() => import("./three/earth-globe/demo"), { ssr: false, loading: Loading }),
  "three/photo-dome-gallery": dynamic(() => import("./three/photo-dome-gallery/demo"), { ssr: false, loading: Loading }),
  "three/camera-path-gallery": dynamic(() => import("./three/camera-path-gallery/demo"), { ssr: false, loading: Loading }),
  "backgrounds/ocean-waves": dynamic(() => import("./backgrounds/ocean-waves/demo"), { ssr: false, loading: Loading }),
  "backgrounds/volumetric-clouds": dynamic(() => import("./backgrounds/volumetric-clouds/demo"), { ssr: false, loading: Loading }),
  "backgrounds/fluid-cursor": dynamic(() => import("./backgrounds/fluid-cursor/demo"), { ssr: false, loading: Loading }),
  "backgrounds/starry-night": dynamic(() => import("./backgrounds/starry-night/demo"), { ssr: false, loading: Loading }),
  "products/keyboard-assembly": dynamic(() => import("./products/keyboard-assembly/demo"), { ssr: false, loading: Loading }),
  "products/shoe-variants": dynamic(() => import("./products/shoe-variants/demo"), { ssr: false, loading: Loading }),
  "products/product-turntable": dynamic(() => import("./products/product-turntable/demo"), { ssr: false, loading: Loading }),
  "products/exploded-earbuds": dynamic(() => import("./products/exploded-earbuds/demo"), { ssr: false, loading: Loading }),
  "three/page-flip-book": dynamic(() => import("./three/page-flip-book/demo"), { ssr: false, loading: Loading }),
};
