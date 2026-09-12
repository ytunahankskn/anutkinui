"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export interface RippleDistortionProps {
  palette?: keyof typeof PALETTES;
  /** Doku olarak kullanılacak fotoğraf URL'i */
  image?: string;
  /** Halka deformasyonunun görsel üzerindeki gücü */
  strength?: number;
  /** Halkanın zaman içinde sönümlenme hızı */
  decay?: number;
  /** Kromatik kayma miktarı (r/g/b ayrı örnekleme) */
  chroma?: number;
  className?: string;
}

export const PALETTES = {
  natural: { tint: "#ffffff", amount: 0, grayscale: 0 },
  cyan: { tint: "#22d3ee", amount: 0.32, grayscale: 0 },
  sunset: { tint: "#fb923c", amount: 0.36, grayscale: 0 },
  mono: { tint: "#ffffff", amount: 0, grayscale: 1 },
} as const;

const MAX_RIPPLES = 12;
const RIPPLE_THRESHOLD = 0.02;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uImage;
  uniform float uImageAspect;
  uniform float uCanvasAspect;
  uniform float uTime;
  uniform vec3 uRipples[${MAX_RIPPLES}];
  uniform int uRippleCount;
  uniform float uStrength;
  uniform float uDecay;
  uniform float uChroma;
  uniform vec3 uTint;
  uniform float uTintAmount;
  uniform float uGrayscale;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv, float imageAspect, float canvasAspect) {
    vec2 ratio = vec2(
      min(canvasAspect / imageAspect, 1.0),
      min(imageAspect / canvasAspect, 1.0)
    );
    return vec2(
      uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
  }

  void main() {
    vec2 uv = vUv;
    vec2 disp = vec2(0.0);
    float speed = 0.6;
    float frequency = 28.0;
    float radius = 0.4;

    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      if (i >= uRippleCount) break;
      vec3 rp = uRipples[i];
      vec2 center = rp.xy;
      float t0 = rp.z;
      float age = max(uTime - t0, 0.0);
      vec2 delta = uv - center;
      float d = length(delta);
      float travel = d - age * speed;
      float ring = sin(travel * frequency) * exp(-age * uDecay) * smoothstep(radius, 0.0, abs(travel));
      vec2 dir = d > 0.0001 ? delta / d : vec2(0.0);
      disp += (-dir) * ring;
    }

    vec2 idle = vec2(0.0, sin(uv.y * 20.0 + uTime) * 0.002);
    vec2 baseUv = uv + disp * uStrength + idle;
    vec2 chromaOff = disp * uChroma * 0.01;

    float r = texture2D(uImage, coverUv(baseUv + chromaOff, uImageAspect, uCanvasAspect)).r;
    float g = texture2D(uImage, coverUv(baseUv, uImageAspect, uCanvasAspect)).g;
    float b = texture2D(uImage, coverUv(baseUv - chromaOff, uImageAspect, uCanvasAspect)).b;
    vec3 color = vec3(r, g, b);

    vec3 tinted = mix(color, uTint, uTintAmount);
    float gray = dot(tinted, vec3(0.299, 0.587, 0.114));
    tinted = mix(tinted, vec3(gray), uGrayscale);

    gl_FragColor = vec4(tinted, 1.0);
  }
`;

interface PlaneProps {
  image: string;
  strength: number;
  decay: number;
  chroma: number;
  tint: string;
  tintAmount: number;
  grayscale: number;
}

function RipplePlane({ image, strength, decay, chroma, tint, tintAmount, grayscale }: PlaneProps) {
  const texture = useTexture(image, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
  });
  const material = useRef<THREE.ShaderMaterial>(null);

  const imageAspect = useMemo(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    return img?.width && img.height ? img.width / img.height : 1;
  }, [texture]);

  // Halka geçmişini tutan sabit boyutlu ring buffer (mulakat: her zaman aynı Vector3 örnekleri mutasyona uğrar)
  const ripples = useMemo(() => new Array(MAX_RIPPLES).fill(0).map(() => new THREE.Vector3(0, 0, -1000)), []);
  const rippleCount = useRef(0);
  const rippleIndex = useRef(0);
  const lastUv = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uImage: { value: texture },
      uImageAspect: { value: imageAspect },
      uCanvasAspect: { value: 1 },
      uTime: { value: 0 },
      uRipples: { value: ripples },
      uRippleCount: { value: 0 },
      uStrength: { value: strength },
      uDecay: { value: decay },
      uChroma: { value: chroma },
      uTint: { value: new THREE.Color(tint) },
      uTintAmount: { value: tintAmount },
      uGrayscale: { value: grayscale },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texture, imageAspect, ripples],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    u.uImage.value = texture;
    u.uImageAspect.value = imageAspect;
    u.uCanvasAspect.value = state.size.width / state.size.height;
    u.uStrength.value = strength;
    u.uDecay.value = decay;
    u.uChroma.value = chroma;
    (u.uTint.value as THREE.Color).set(tint);
    u.uTintAmount.value = tintAmount;
    u.uGrayscale.value = grayscale;

    const ux = (state.pointer.x + 1) / 2;
    const uy = (state.pointer.y + 1) / 2;
    const dx = ux - lastUv.current.x;
    const dy = uy - lastUv.current.y;
    if (Math.hypot(dx, dy) >= RIPPLE_THRESHOLD) {
      lastUv.current.set(ux, uy);
      const idx = rippleIndex.current;
      ripples[idx].set(ux, uy, u.uTime.value);
      rippleIndex.current = (idx + 1) % MAX_RIPPLES;
      rippleCount.current = Math.min(MAX_RIPPLES, rippleCount.current + 1);
      u.uRippleCount.value = rippleCount.current;
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function RippleDistortion({
  palette = "natural",
  image = "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&q=80",
  strength = 0.03,
  decay = 1.6,
  chroma = 0.8,
  className,
}: RippleDistortionProps) {
  const p = PALETTES[palette] ?? PALETTES.natural;
  const src = image || "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&q=80";

  return (
    <div className={className} style={{ position: "absolute", inset: 0, background: "#04121a" }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Suspense fallback={null}>
          <RipplePlane
            key={src}
            image={src}
            strength={strength}
            decay={decay}
            chroma={chroma}
            tint={p.tint}
            tintAmount={p.amount}
            grayscale={p.grayscale}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
