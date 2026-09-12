"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface LightningProps {
  palette?: keyof typeof PALETTES;
  speed?: number;
  /** Şeridin genel kalınlık/genişlik ölçeği */
  size?: number;
  intensity?: number;
  /** Yatay konum kaydırma (-1..1) */
  xOffset?: number;
  className?: string;
}

export const PALETTES = {
  electric: { bolt: "#eaffff", glow: "#4fd8ff", bg: "#030712", ink: "#eaffff" },
  violet: { bolt: "#f1e6ff", glow: "#a259ff", bg: "#0a0414", ink: "#f1e6ff" },
  crimson: { bolt: "#ffe9e9", glow: "#ff4d6d", bg: "#14040a", ink: "#ffe9e9" },
  teal: { bolt: "#e6fffa", glow: "#2dd4bf", bg: "#031414", ink: "#e6fffa" },
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
  uniform float uTime;
  uniform float uSize;
  uniform float uIntensity;
  uniform float uXOffset;
  uniform vec3 uBoltColor;
  uniform vec3 uGlowColor;
  uniform vec3 uBg;
  uniform vec2 uRes;
  varying vec2 vUv;

  float hash1(float n) { return fract(sin(n) * 43758.5453123); }

  float noise1(float x) {
    float i = floor(x);
    float f = fract(x);
    float a = hash1(i);
    float b = hash1(i + 1.0);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u);
  }

  float fbm1(float x) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise1(x);
      x *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = uTime;

    float drift = sin(t * 0.25) * 0.12 + (fbm1(t * 0.05) - 0.5) * 0.16;

    // Ana yıldırım şeridi: dikey eksende noise ile yatay sapan bir çizgi
    float pathY = uv.y * 5.0;
    float wiggle = (fbm1(pathY * 2.2 + t * 0.15) - 0.5) * 2.0;
    float centerXMain = (0.5 + uXOffset * 0.5) * aspect + wiggle * 0.4 * uSize + drift * aspect;
    float distMain = abs(p.x - centerXMain);

    // İnce yan dal, sadece alt yarıda belirir
    float wiggle2 = (fbm1(pathY * 3.1 + 40.0 + t * 0.2) - 0.5) * 2.0;
    float branchMask = smoothstep(0.5, 0.6, uv.y);
    float centerXBranch = centerXMain + 0.18 * uSize + wiggle2 * 0.25 * uSize;
    float distBranch = abs(p.x - centerXBranch);

    float flicker = 0.65 + 0.35 * fbm1(t * 9.0);

    float coreWidth = 0.006 * uSize;
    float glowWidth = 0.09 * uSize;

    float glowMain = exp(-(distMain * distMain) / (2.0 * glowWidth * glowWidth));
    float coreMain = smoothstep(coreWidth, 0.0, distMain);

    float glowBranch = exp(-(distBranch * distBranch) / (2.0 * glowWidth * glowWidth * 0.6)) * branchMask * 0.6;
    float coreBranch = smoothstep(coreWidth * 0.7, 0.0, distBranch) * branchMask * 0.7;

    float glow = (glowMain + glowBranch) * uIntensity * flicker;
    float core = (coreMain + coreBranch) * uIntensity * flicker;

    vec3 col = uBg;
    col += uGlowColor * glow * 0.9;
    col += uBoltColor * core * 1.6;
    col += vec3(1.0) * core * core * 0.4;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function LightningPlane({ speed, size, intensity, xOffset, palette }: Required<Omit<LightningProps, "className">>) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 1 },
      uIntensity: { value: 1 },
      uXOffset: { value: 0 },
      uBoltColor: { value: new THREE.Color("#ffffff") },
      uGlowColor: { value: new THREE.Color("#4fd8ff") },
      uBg: { value: new THREE.Color("#030712") },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const p = PALETTES[palette] ?? PALETTES.electric;
    u.uTime.value += delta * speed;
    u.uSize.value = size;
    u.uIntensity.value = intensity;
    u.uXOffset.value = xOffset;
    (u.uBoltColor.value as THREE.Color).set(p.bolt);
    (u.uGlowColor.value as THREE.Color).set(p.glow);
    (u.uBg.value as THREE.Color).set(p.bg);
    (u.uRes.value as THREE.Vector2).set(state.size.width, state.size.height);
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
export function Lightning({ palette = "electric", speed = 1, size = 1, intensity = 1, xOffset = 0, className }: LightningProps) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <LightningPlane speed={speed} size={size} intensity={intensity} xOffset={xOffset} palette={palette} />
      </Canvas>
    </div>
  );
}
