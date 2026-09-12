"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface PlasmaProps {
  palette?: keyof typeof PALETTES;
  /** Animasyon hızı çarpanı */
  speed?: number;
  /** Desen ölçeği */
  scale?: number;
  /** Renk geçiş sertliği */
  contrast?: number;
  /** X eksenini ortadan aynalar */
  mirror?: boolean;
  className?: string;
}

export const PALETTES = {
  neon: { colors: ["#ff2bd6", "#7a2bff", "#00f0ff"], ink: "#ffffff" },
  sunset: { colors: ["#ff6b35", "#ff2e63", "#8a1e6b"], ink: "#ffffff" },
  ice: { colors: ["#0b1e3a", "#2f8fff", "#d6f3ff"], ink: "#ffffff" },
  toxic: { colors: ["#062b12", "#39ff14", "#c7ff5e"], ink: "#ffffff" },
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
  uniform float uScale;
  uniform float uContrast;
  uniform float uMirror;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec2 uRes;
  varying vec2 vUv;

  vec3 tricolor(vec3 a, vec3 b, vec3 c, float t) {
    t = fract(t);
    float seg = t * 3.0;
    if (seg < 1.0) return mix(a, b, seg);
    if (seg < 2.0) return mix(b, c, seg - 1.0);
    return mix(c, a, seg - 2.0);
  }

  float plasma(vec2 p, float t) {
    float v = 0.0;
    v += sin(p.x * 10.0 + t);
    v += sin(10.0 * (p.x * sin(t * 0.5) + p.y * cos(t * 0.3)) + t);
    float cx = p.x + 0.5 * sin(t * 0.4);
    float cy = p.y + 0.5 * cos(t * 0.3);
    v += sin(sqrt((cx * cx + cy * cy) * 40.0 + 1.0) + t);
    v += sin(p.y * 10.0 - t * 0.7);
    return v * 0.25;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float aspect = uRes.x / uRes.y;
    uv.x *= aspect;
    if (uMirror > 0.5) uv.x = abs(uv.x);
    vec2 p = uv * uScale;

    float v = plasma(p, uTime);
    float n = clamp(v * uContrast * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = tricolor(uColorA, uColorB, uColorC, n);

    float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (d - 0.5) * 0.016;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function PlasmaPlane({
  speed,
  scale,
  contrast,
  mirror,
  colors,
}: {
  speed: number;
  scale: number;
  contrast: number;
  mirror: boolean;
  colors: readonly [string, string, string];
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScale: { value: 1.2 },
      uContrast: { value: 1 },
      uMirror: { value: 0 },
      uColorA: { value: new THREE.Color("#000000") },
      uColorB: { value: new THREE.Color("#000000") },
      uColorC: { value: new THREE.Color("#000000") },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta * speed;
    u.uScale.value = scale;
    u.uContrast.value = contrast;
    u.uMirror.value = mirror ? 1 : 0;
    (u.uColorA.value as THREE.Color).set(colors[0]);
    (u.uColorB.value as THREE.Color).set(colors[1]);
    (u.uColorC.value as THREE.Color).set(colors[2]);
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
export function Plasma({ palette = "neon", speed = 1, scale = 1.2, contrast = 1, mirror = false, className }: PlasmaProps) {
  const p = PALETTES[palette] ?? PALETTES.neon;
  const colors = p.colors as unknown as [string, string, string];

  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <PlasmaPlane speed={speed} scale={scale} contrast={contrast} mirror={mirror} colors={colors} />
      </Canvas>
    </div>
  );
}
