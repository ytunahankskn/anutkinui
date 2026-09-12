"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface LightRaysProps {
  palette?: keyof typeof PALETTES;
  /** Işınların çıkış noktası */
  origin?: "top" | "top-left" | "top-right" | "center";
  /** Işın genişliği / erişimi */
  spread?: number;
  /** Animasyon hızı çarpanı */
  speed?: number;
  /** Parıltı yoğunluğu */
  glow?: number;
  className?: string;
}

export const PALETTES = {
  gold: { bg: "#0d0a03", ray: "#ffcf6b", ink: "#ffffff" },
  cyan: { bg: "#020a0d", ray: "#5be8ff", ink: "#ffffff" },
  violet: { bg: "#0a0714", ray: "#b98bff", ink: "#ffffff" },
  warm: { bg: "#120705", ray: "#ff9d5c", ink: "#ffffff" },
} as const;

const ORIGINS: Record<NonNullable<LightRaysProps["origin"]>, [number, number]> = {
  top: [0.5, 1.2],
  "top-left": [-0.05, 1.15],
  "top-right": [1.05, 1.15],
  center: [0.5, 0.5],
};

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
  uniform float uSpread;
  uniform float uGlow;
  uniform vec2 uOrigin;
  uniform vec3 uBg;
  uniform vec3 uRay;
  uniform vec2 uRes;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 3; i++) {
      v += a * snoise(p);
      p = r * p * 2.0 + 10.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float aspect = uRes.x / uRes.y;
    uv.x *= aspect;

    vec2 origin = uOrigin - 0.5;
    origin.x *= aspect;

    vec2 toPixel = uv - origin;
    float dist = length(toPixel);
    float angle = atan(toPixel.y, toPixel.x);

    float flicker = fbm(vec2(angle * 2.2, uTime * 0.15)) * 3.0;
    float raySeed = angle * (14.0 / uSpread) + flicker + uTime * 0.05;
    float rayPattern = pow(0.5 + 0.5 * sin(raySeed), 3.0);

    float falloff = exp(-dist * (1.3 / uSpread));
    float rays = rayPattern * falloff;

    float haze = exp(-dist * (3.0 / uSpread)) * 0.3;

    vec3 col = uBg;
    col += uRay * rays * uGlow;
    col += uRay * haze * uGlow;

    float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (d - 0.5) * 0.014;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function RaysPlane({
  speed,
  spread,
  glow,
  origin,
  bg,
  ray,
}: {
  speed: number;
  spread: number;
  glow: number;
  origin: [number, number];
  bg: string;
  ray: string;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpread: { value: 0.8 },
      uGlow: { value: 1 },
      uOrigin: { value: new THREE.Vector2(0.5, 1.2) },
      uBg: { value: new THREE.Color("#000000") },
      uRay: { value: new THREE.Color("#ffffff") },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta * speed;
    u.uSpread.value = spread;
    u.uGlow.value = glow;
    (u.uOrigin.value as THREE.Vector2).set(origin[0], origin[1]);
    (u.uBg.value as THREE.Color).set(bg);
    (u.uRay.value as THREE.Color).set(ray);
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
export function LightRays({
  palette = "gold",
  origin = "top",
  spread = 0.8,
  speed = 1,
  glow = 1,
  className,
}: LightRaysProps) {
  const p = PALETTES[palette] ?? PALETTES.gold;
  const originXY = ORIGINS[origin] ?? ORIGINS.top;

  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <RaysPlane speed={speed} spread={spread} glow={glow} origin={originXY} bg={p.bg} ray={p.ray} />
      </Canvas>
    </div>
  );
}
