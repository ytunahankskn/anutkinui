"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export interface RainOnGlassProps {
  palette?: keyof typeof PALETTES;
  /** Camın arkasındaki fotoğrafın URL'i */
  image?: string;
  /** Damla yoğunluğu (ızgara sıklığı) */
  intensity?: number;
  /** Damlaların kayma hızı */
  speed?: number;
  /** Damla olmayan bölgelerdeki bulanıklık miktarı */
  blur?: number;
  /** Camda buğu/sis katmanı */
  fog?: boolean;
  className?: string;
}

export const PALETTES = {
  cold: { tintA: "#3f8dff", tintB: "#cfe9ff", amount: 0.22, fogColor: "#bfe3ff", grayscale: 0 },
  warm: { tintA: "#ff8a3d", tintB: "#ffe3bd", amount: 0.22, fogColor: "#ffe1bd", grayscale: 0 },
  city: { tintA: "#ff2fd1", tintB: "#22e6ff", amount: 0.32, fogColor: "#8fe9ff", grayscale: 0 },
  mono: { tintA: "#ffffff", tintB: "#ffffff", amount: 0, fogColor: "#ffffff", grayscale: 1 },
} as const;

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
  uniform float uIntensity;
  uniform float uSpeed;
  uniform float uBlur;
  uniform float uFog;
  uniform vec3 uTintA;
  uniform vec3 uTintB;
  uniform float uTintAmount;
  uniform float uGrayscale;
  uniform vec3 uFogColor;
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

  vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(41.3, 289.1)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
  }

  vec3 sampleBlur(vec2 uv, float amount) {
    if (amount <= 0.001) return texture2D(uImage, coverUv(uv, uImageAspect, uCanvasAspect)).rgb;
    vec3 sum = vec3(0.0);
    for (int i = 0; i < 8; i++) {
      float a = float(i) / 8.0 * 6.28318;
      vec2 off = vec2(cos(a), sin(a)) * amount * 0.03;
      sum += texture2D(uImage, coverUv(uv + off, uImageAspect, uCanvasAspect)).rgb;
    }
    return sum / 8.0;
  }

  void main() {
    vec2 uv = vUv;
    float gridCount = mix(6.0, 16.0, clamp(uIntensity / 2.0, 0.0, 1.0));
    vec2 grid = uv * vec2(gridCount * uCanvasAspect, gridCount);
    vec2 cell = floor(grid);
    vec2 cellUv = fract(grid);

    vec2 h = hash2(cell);
    float speedRand = 0.6 + h.x * 0.8;
    float dropY = fract(uTime * uSpeed * 0.12 * speedRand + h.y);
    float cx = 0.3 + h.x * 0.4;
    float dropRadius = 0.1 + h.y * 0.06;

    vec2 d = (cellUv - vec2(cx, dropY));
    float dist = length(d * vec2(1.0, 1.4));
    float dropMask = smoothstep(dropRadius, dropRadius * 0.4, dist);

    float trail = exp(-abs(cellUv.x - cx) * 30.0) * smoothstep(dropY, 1.0, cellUv.y) * 0.3;
    float mask = clamp(max(dropMask, trail), 0.0, 1.0);

    vec2 normal = dist > 0.0001 ? normalize(d) * dropMask : vec2(0.0);
    vec2 refractedUv = uv + normal * 0.05;

    vec3 blurred = sampleBlur(uv, uBlur * (1.0 - mask));
    vec3 refracted = texture2D(uImage, coverUv(refractedUv, uImageAspect, uCanvasAspect)).rgb;
    vec3 color = mix(blurred, refracted, mask);

    color = mix(color, uFogColor, uFog * (1.0 - mask) * 0.22);

    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    vec3 duo = mix(uTintA, uTintB, lum);
    color = mix(color, duo, uTintAmount);
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, vec3(gray), uGrayscale);

    float vig = smoothstep(1.05, 0.3, length(uv - 0.5) * 1.3);
    color *= mix(0.85, 1.0, vig);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface PlaneProps {
  image: string;
  intensity: number;
  speed: number;
  blur: number;
  fog: boolean;
  tintA: string;
  tintB: string;
  tintAmount: number;
  grayscale: number;
  fogColor: string;
}

function RainPlane({ image, intensity, speed, blur, fog, tintA, tintB, tintAmount, grayscale, fogColor }: PlaneProps) {
  const texture = useTexture(image, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
  });
  const material = useRef<THREE.ShaderMaterial>(null);

  const imageAspect = useMemo(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    return img?.width && img.height ? img.width / img.height : 1;
  }, [texture]);

  const uniforms = useMemo(
    () => ({
      uImage: { value: texture },
      uImageAspect: { value: imageAspect },
      uCanvasAspect: { value: 1 },
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uSpeed: { value: speed },
      uBlur: { value: blur },
      uFog: { value: fog ? 1 : 0 },
      uTintA: { value: new THREE.Color(tintA) },
      uTintB: { value: new THREE.Color(tintB) },
      uTintAmount: { value: tintAmount },
      uGrayscale: { value: grayscale },
      uFogColor: { value: new THREE.Color(fogColor) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texture, imageAspect],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    u.uImage.value = texture;
    u.uImageAspect.value = imageAspect;
    u.uCanvasAspect.value = state.size.width / state.size.height;
    u.uIntensity.value = intensity;
    u.uSpeed.value = speed;
    u.uBlur.value = blur;
    u.uFog.value = fog ? 1 : 0;
    (u.uTintA.value as THREE.Color).set(tintA);
    (u.uTintB.value as THREE.Color).set(tintB);
    u.uTintAmount.value = tintAmount;
    u.uGrayscale.value = grayscale;
    (u.uFogColor.value as THREE.Color).set(fogColor);
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
export function RainOnGlass({
  palette = "cold",
  image = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600&q=80",
  intensity = 1,
  speed = 1,
  blur = 0.5,
  fog = true,
  className,
}: RainOnGlassProps) {
  const p = PALETTES[palette] ?? PALETTES.cold;
  const src = image || "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600&q=80";

  return (
    <div className={className} style={{ position: "absolute", inset: 0, background: "#050608" }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Suspense fallback={null}>
          <RainPlane
            key={src}
            image={src}
            intensity={intensity}
            speed={speed}
            blur={blur}
            fog={fog}
            tintA={p.tintA}
            tintB={p.tintB}
            tintAmount={p.amount}
            grayscale={p.grayscale}
            fogColor={p.fogColor}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
