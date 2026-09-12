# anutkinui

A browse-and-copy library of animated UI components: Three.js scenes, GSAP scroll
animations, shader backgrounds and small interactive UI pieces for React.

Every component lives in its own folder as a single, dependency-light file. There's
no npm package to install — you copy the source into your project (the shadcn/ui
approach) and it's yours to change however you like.

The site itself ships in English and Turkish (English by default).

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000 — the registry is built automatically first
pnpm build
pnpm lint
pnpm typecheck
```

Open the app, browse a component, and use the **Code** tab on its page to copy the
source. The **Installation** page in the app walks through dependencies and usage.

## Stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4 |
| 3D | three r186, @react-three/fiber 9, @react-three/drei 10 |
| Animation | gsap 3.15 (ScrollTrigger, SplitText), motion 13 |
| Scroll | lenis |
| i18n | next-intl (English default, Turkish secondary) |
| Site | next-themes, shiki (syntax highlighting), cmdk (⌘K search), lucide-react |

## What's inside

59 base components plus 21 color/setting variant cards, across 10 categories: hero,
backgrounds, 3D objects, 3D products, scroll, text animation, buttons, cards,
cursors & effects, and UI elements. Every component exposes a `palette` control and
a typed `controls` object that drives the live props panel automatically.

Some of the more involved pieces: a scroll-assembled mechanical keyboard, a shoe
viewer that swaps materials live via `KHR_materials_variants`, a bone-rigged 3D
page-flip book, a raymarched volumetric cloud background, a Gerstner-wave ocean
shader, and a site preloader that flies its logo into the sidebar on first load.

Real assets are used throughout — photos from Unsplash, HDRI environment lighting
from Poly Haven, and GLB models from the Khronos glTF sample set — all fetched at
runtime from CORS-enabled, redistribution-friendly sources. For a production build
you'll likely want to mirror these into `public/assets/` and point the components'
default props at your own copies.

## Project layout

```
src/
  app/[locale]/            pages (browse, [category]/[slug], docs/installation)
  components/
    shell/                 sidebar, theme toggle, locale switcher, ⌘K menu
    browse/                the card grid, filters, search
    detail/                the playground, props panel
    ui/                    Badge, Button, Tabs, CopyButton
  registry/                ← THE COMPONENTS LIVE HERE
    types.ts               ComponentMeta / Control types
    index.ts                category list + every component's metadata
    demos.tsx               slug → live demo (client-only dynamic import)
    __generated__/          source-code JSON produced by scripts/build-registry.mjs
    <category>/<slug>/
      meta.ts               name, description (en + tr), tags, prop controls, cover
      <Component>.tsx        the copyable component itself — a single, self-contained file
      demo.tsx                how it's shown in the playground
  i18n/                    next-intl routing, navigation and request config
  providers/               ThemeProvider, SmoothScroll (Lenis + GSAP ticker)
  lib/                     syntax highlighting, usage-snippet generator, utils
messages/en.json, messages/tr.json   site chrome copy for each locale
scripts/build-registry.mjs           scans the registry and writes source code to JSON
```

## Adding a component

1. Create `src/registry/<category>/<slug>/`.
2. Write `meta.ts` — the `controls` field drives the props panel automatically:
   ```ts
   controls: {
     speed: { type: "number", min: 0, max: 3, step: 0.1, default: 1 },
     color: { type: "color", default: "#ffffff" },
     mode:  { type: "select", options: ["dark", "light"], default: "dark" },
     grain: { type: "boolean", default: true },
     title: { type: "text", default: "Hello" },
   }
   ```
   Give it a `description` (English) and, optionally, a `descriptionTr` (Turkish).
3. Write `<Component>.tsx` — starts with `"use client"`, and its props match the
   `controls` keys. Don't depend on the site's own CSS classes; use inline styles or
   self-contained CSS so the component still works once copied elsewhere.
4. Write `demo.tsx` — takes `ControlValues` and renders the component in context.
5. Register the component's meta in `index.ts` and its demo in `demos.tsx`.
6. `pnpm registry` (runs automatically in dev) refreshes the Code tab.

## Notes

- Demos load with `ssr: false` — they need WebGL or DOM measurement.
- A scroll component that runs inside a box (rather than the page) needs a
  `scroller` prop and `container-type: size` on its wrapper — see
  `scroll/paper-fold/demo.tsx` for an example.
- Moving to WebGPU is a matter of passing an async `WebGPURenderer` to R3F's
  `Canvas` via the `gl` prop.

## License

MIT — see [LICENSE](LICENSE).
