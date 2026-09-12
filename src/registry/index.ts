import type { Category, CategorySlug, ComponentMeta, Control, ControlValue } from "./types";
import { meta as auroraShader } from "./backgrounds/aurora-shader/meta";
import { meta as particleField } from "./backgrounds/particle-field/meta";
import { meta as glassKnot } from "./hero/glass-knot/meta";
import { meta as splitReveal } from "./text/split-reveal/meta";
import { meta as paperFold } from "./scroll/paper-fold/meta";
import { meta as magneticButton } from "./buttons/magnetic-button/meta";
import { meta as silkWaves } from "./backgrounds/silk-waves/meta";
import { meta as liquidChrome } from "./backgrounds/liquid-chrome/meta";
import { meta as plasma } from "./backgrounds/plasma/meta";
import { meta as iridescence } from "./backgrounds/iridescence/meta";
import { meta as lightRays } from "./backgrounds/light-rays/meta";
import { meta as dotGrid } from "./backgrounds/dot-grid/meta";
import { meta as hyperspeed } from "./backgrounds/hyperspeed/meta";
import { meta as gradientMesh } from "./backgrounds/gradient-mesh/meta";
import { meta as halftoneFlow } from "./backgrounds/halftone-flow/meta";
import { meta as lightning } from "./backgrounds/lightning/meta";
import { meta as spotlightCard } from "./cards/spotlight-card/meta";
import { meta as tiltCard } from "./cards/tilt-card/meta";
import { meta as bentoGrid } from "./cards/bento-grid/meta";
import { meta as blobCursor } from "./cursors/blob-cursor/meta";
import { meta as pixelTrail } from "./cursors/pixel-trail/meta";
import { meta as dock } from "./ui/dock/meta";
import { meta as instancedCubes } from "./three/instanced-cubes/meta";
import { meta as particleMorph } from "./three/particle-morph/meta";
import { meta as floatingShapes } from "./three/floating-shapes/meta";
import { meta as blobOrb } from "./three/blob-orb/meta";
import { meta as modelViewer } from "./three/model-viewer/meta";
import { meta as scrollStack } from "./scroll/scroll-stack/meta";
import { meta as horizontalPanels } from "./scroll/horizontal-panels/meta";
import { meta as parallaxLayers } from "./scroll/parallax-layers/meta";
import { meta as scrollVelocity } from "./text/scroll-velocity/meta";
import { meta as decryptedText } from "./text/decrypted-text/meta";
import { meta as gradientText } from "./text/gradient-text/meta";
import { meta as countUp } from "./text/count-up/meta";
import { meta as splitFlap } from "./text/split-flap/meta";
import { meta as shimmerButton } from "./buttons/shimmer-button/meta";
import { meta as liquidButton } from "./buttons/liquid-button/meta";
import { meta as maskRevealHero } from "./hero/mask-reveal-hero/meta";
import { meta as scrollVideo } from "./scroll/scroll-video/meta";
import { meta as pinnedTextSequence } from "./scroll/pinned-text-sequence/meta";
import { meta as zoomParallax } from "./scroll/zoom-parallax/meta";
import { meta as rippleDistortion } from "./backgrounds/ripple-distortion/meta";
import { meta as rainOnGlass } from "./backgrounds/rain-on-glass/meta";
import { meta as imageTrail } from "./cursors/image-trail/meta";
import { meta as marquee3d } from "./ui/marquee-3d/meta";
import { meta as revealLoader } from "./ui/reveal-loader/meta";
import { meta as materialStudio } from "./three/material-studio/meta";
import { meta as earthGlobe } from "./three/earth-globe/meta";
import { meta as photoDomeGallery } from "./three/photo-dome-gallery/meta";
import { meta as cameraPathGallery } from "./three/camera-path-gallery/meta";
import { meta as oceanWaves } from "./backgrounds/ocean-waves/meta";
import { meta as volumetricClouds } from "./backgrounds/volumetric-clouds/meta";
import { meta as fluidCursor } from "./backgrounds/fluid-cursor/meta";
import { meta as starryNight } from "./backgrounds/starry-night/meta";
import { meta as keyboardAssembly } from "./products/keyboard-assembly/meta";
import { meta as shoeVariants } from "./products/shoe-variants/meta";
import { meta as productTurntable } from "./products/product-turntable/meta";
import { meta as explodedEarbuds } from "./products/exploded-earbuds/meta";
import { meta as pageFlipBook } from "./three/page-flip-book/meta";

export const categories: Category[] = [
  { slug: "hero", label: "Hero", description: "Animated hero sections with 3D scenes.", descriptionTr: "3D sahneli, hareketli açılış bölümleri." },
  { slug: "backgrounds", label: "Backgrounds", description: "Live backgrounds built with shaders, canvas and particles.", descriptionTr: "Shader, canvas ve partikül tabanlı canlı arka planlar." },
  { slug: "three", label: "3D Objects", description: "Thousands of instanced objects, morphing particles, blobs and a GLB model viewer.", descriptionTr: "Binlerce instanced obje, morph partiküller, blob'lar ve GLB model viewer." },
  { slug: "products", label: "3D Products", description: "Products that assemble piece by piece on scroll, real HDRI lighting, and color-variant models.", descriptionTr: "Scroll ile parça parça birleşen ürünler, gerçek HDRI ışığı, renk varyantlı modeller." },
  { slug: "scroll", label: "Scroll", description: "Scroll-driven sequences: folding paper, pinned scenes, parallax.", descriptionTr: "Scroll'a bağlı sekanslar: katlanan kağıtlar, pin'li sahneler, parallax." },
  { slug: "text", label: "Text Animation", description: "Character, word and line-based text animations.", descriptionTr: "Harf, kelime ve satır bazlı metin animasyonları." },
  { slug: "buttons", label: "Buttons", description: "Magnetic, shimmer and liquid buttons.", descriptionTr: "Manyetik, shimmer ve liquid butonlar." },
  { slug: "cards", label: "Cards", description: "Spotlight, tilt and bento cards.", descriptionTr: "Spotlight, tilt ve bento kartlar." },
  { slug: "cursors", label: "Cursors & Effects", description: "Cursor followers and trail effects.", descriptionTr: "İmleç takipçileri ve iz efektleri." },
  { slug: "ui", label: "UI Elements", description: "Dock and other micro-interaction controls.", descriptionTr: "Dock ve diğer mikro etkileşimli kontroller." },
];

export const registry: ComponentMeta[] = [
  keyboardAssembly,
  maskRevealHero,
  shoeVariants,
  explodedEarbuds,
  productTurntable,
  glassKnot,
  pageFlipBook,
  materialStudio,
  earthGlobe,
  photoDomeGallery,
  cameraPathGallery,
  instancedCubes,
  particleMorph,
  blobOrb,
  floatingShapes,
  modelViewer,
  scrollVideo,
  pinnedTextSequence,
  zoomParallax,
  paperFold,
  scrollStack,
  horizontalPanels,
  parallaxLayers,
  splitReveal,
  scrollVelocity,
  decryptedText,
  gradientText,
  splitFlap,
  countUp,
  oceanWaves,
  volumetricClouds,
  starryNight,
  fluidCursor,
  rainOnGlass,
  rippleDistortion,
  auroraShader,
  silkWaves,
  liquidChrome,
  iridescence,
  plasma,
  lightRays,
  gradientMesh,
  lightning,
  hyperspeed,
  dotGrid,
  halftoneFlow,
  particleField,
  magneticButton,
  shimmerButton,
  liquidButton,
  spotlightCard,
  tiltCard,
  bentoGrid,
  imageTrail,
  blobCursor,
  pixelTrail,
  revealLoader,
  marquee3d,
  dock,
];

/** Color variants: the same component with different defaults, listed as a separate card ("family" model). */
const variants: ComponentMeta[] = [
  variantOf(glassKnot, { slug: "glass-knot-midnight-torus", name: "Midnight Torus", defaults: { shape: "torus", background: "#0b1220", color: "#9ec5ff" }, cover: ["#0b1220", "#5b8def"] }),
  variantOf(glassKnot, { slug: "glass-knot-ivory", name: "Ivory Icosahedron", defaults: { shape: "icosahedron", background: "#f3efe6", color: "#ffffff", ior: 1.5 }, cover: ["#f3efe6", "#c9c2b3"] }),
  variantOf(auroraShader, { slug: "aurora-magenta", name: "Magenta", defaults: { hue: 320 }, cover: ["#2a0a2e", "#ff4fd8"] }),
  variantOf(auroraShader, { slug: "aurora-ember", name: "Ember", defaults: { hue: 20, intensity: 1.2 }, cover: ["#2a0e05", "#ff8a3d"] }),
  variantOf(silkWaves, { slug: "silk-rose", name: "Rose", defaults: { palette: "rose" }, cover: ["#2a0a1a", "#ffc2d4"] }),
  variantOf(silkWaves, { slug: "silk-gold", name: "Gold", defaults: { palette: "gold" }, cover: ["#1f1604", "#ffe6a3"] }),
  variantOf(silkWaves, { slug: "silk-emerald", name: "Emerald", defaults: { palette: "emerald" }, cover: ["#04231c", "#a3f7dd"] }),
  variantOf(plasma, { slug: "plasma-sunset", name: "Sunset", defaults: { palette: "sunset" }, cover: ["#8a1e6b", "#ff6b35"] }),
  variantOf(plasma, { slug: "plasma-ice", name: "Ice", defaults: { palette: "ice" }, cover: ["#0b1e3a", "#d6f3ff"] }),
  variantOf(liquidChrome, { slug: "liquid-chrome-gold", name: "Gold", defaults: { palette: "gold" }, cover: ["#3a2a08", "#f5d67a"] }),
  variantOf(liquidChrome, { slug: "liquid-chrome-iridescent", name: "Iridescent", defaults: { palette: "iridescent" }, cover: ["#0b2a3a", "#ff5ad6"] }),
  variantOf(gradientMesh, { slug: "gradient-mesh-ocean", name: "Ocean", defaults: { palette: "ocean" }, cover: ["#05203a", "#3fd0ff"] }),
  variantOf(gradientMesh, { slug: "gradient-mesh-midnight", name: "Midnight", defaults: { palette: "midnight" }, cover: ["#0a0a2a", "#5b4bff"] }),
  variantOf(instancedCubes, { slug: "instanced-cubes-sunset", name: "Sunset", defaults: { palette: "sunset" }, cover: ["#2a0a1a", "#ff8a3d"] }),
  variantOf(instancedCubes, { slug: "instanced-cubes-pastel", name: "Pastel", defaults: { palette: "pastel" }, cover: ["#f5eefc", "#a8d8ff"] }),
  variantOf(blobOrb, { slug: "blob-orb-lava", name: "Lava", defaults: { palette: "lava" }, cover: ["#2a0800", "#ff5a1f"] }),
  variantOf(blobOrb, { slug: "blob-orb-ocean", name: "Ocean", defaults: { palette: "ocean" }, cover: ["#031a2e", "#37d3ff"] }),
  variantOf(particleMorph, { slug: "particle-morph-fire", name: "Fire", defaults: { palette: "fire", shape: "heart" }, cover: ["#2a0a00", "#ffb347"] }),
  variantOf(scrollStack, { slug: "scroll-stack-ocean", name: "Ocean", defaults: { palette: "ocean" }, cover: ["#04263a", "#3fd0ff"] }),
  variantOf(gradientText, { slug: "gradient-text-sunset", name: "Sunset", defaults: { palette: "sunset", text: "Golden hour, every hour" }, cover: ["#ff2e63", "#ff6b35"] }),
  variantOf(spotlightCard, { slug: "spotlight-card-cyan", name: "Cyan", defaults: { palette: "cyan" }, cover: ["#041c24", "#22d3ee"] }),
];

registry.push(...variants);

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getEntry(category: string, slug: string): ComponentMeta | undefined {
  return registry.find((e) => e.category === category && e.slug === slug);
}

export function getByCategory(category: CategorySlug): ComponentMeta[] {
  return registry.filter((e) => e.category === category);
}

export function getNeighbors(entry: ComponentMeta) {
  const i = registry.indexOf(entry);
  const len = registry.length;
  return { prev: registry[(i - 1 + len) % len], next: registry[(i + 1) % len] };
}

export function entryKey(entry: Pick<ComponentMeta, "category" | "slug">) {
  return `${entry.category}/${entry.slug}`;
}

/** Demo ve kaynak kodun alınacağı anahtar (varyantlarda asıl bileşene gider). */
export function sourceKey(entry: Pick<ComponentMeta, "category" | "slug" | "sourceOf">) {
  const s = entry.sourceOf ?? entry;
  return `${s.category}/${s.slug}`;
}

/**
 * Produces a color/setting variant of a component as its own card (e.g. "Aurora Shader — Magenta").
 * The Demo and Code tabs come from the base component; only the default props change.
 */
export function variantOf(
  base: ComponentMeta,
  v: { slug: string; name: string; defaults: Record<string, ControlValue>; cover: readonly [string, string]; description?: string; popularity?: number },
): ComponentMeta {
  const controls = Object.fromEntries(
    Object.entries(base.controls).map(([k, c]) => [k, k in v.defaults ? ({ ...c, default: v.defaults[k] } as Control) : c]),
  ) as ComponentMeta["controls"];
  return {
    ...base,
    slug: v.slug,
    name: `${base.name} — ${v.name}`,
    description: v.description ?? base.description,
    controls,
    cover: v.cover,
    popularity: v.popularity ?? Math.max(400, base.popularity - 120),
    family: base.name,
    sourceOf: base.sourceOf ?? { category: base.category, slug: base.slug },
  };
}
