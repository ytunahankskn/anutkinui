"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface SilkWavesProps {
  palette?: keyof typeof PALETTES;
  /** Animasyon hızı çarpanı */
  speed?: number;
  /** Desen ölçeği (büyük = daha ince kıvrımlar) */
  scale?: number;
  /** Akış yönü (derece) */
  rotation?: number;
  /** fbm noise'un görünürlüğü */
  noiseIntensity?: number;
  /** İnce film grain */
  grain?: boolean;
  className?: string;
}

export const PALETTES = {
  royal: { colors: ["#12083a", "#4b2fd6", "#a68cff"], ink: "#ffffff" },
  rose: { colors: ["#2a0a1a", "#d63c74", "#ffc2d4"], ink: "#ffffff" },
  gold: { colors: ["#1f1604", "#c98d1e", "#ffe6a3"], ink: "#ffffff" },
  emerald: { colors: ["#04231c", "#0f9d7a", "#a3f7dd"], ink: "#ffffff" },
  ink: { colors: ["#0b0b0f", "#2a2a36", "#8a8aa0"], ink: "#ffffff" },
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
  uniform float uRotation;
  uniform float uNoiseIntensity;
  uniform float uGrain;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
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
    for (int i = 0; i < 5; i++) {
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

    float c = cos(uRotation);
    float s = sin(uRotation);
    mat2 rot = mat2(c, -s, s, c);
    vec2 p = rot * uv * uScale;

    float t = uTime;
    vec2 flow = vec2(t * 0.16, t * 0.1);
    float n = fbm(p * 1.4 + flow);
    float n2 = fbm(p * 2.8 - flow * 1.3 + 4.0);

    float foldA = sin(p.x * 2.4 + n * 3.2 + t * 0.6) * 0.5 + 0.5;
    float foldB = sin(p.y * 1.6 - n2 * 2.4 + t * 0.45) * 0.5 + 0.5;
    float sheen = pow(foldA * foldB, 2.2);

    float mixAmt = clamp(0.5 + n * 0.5 + uNoiseIntensity * n2 * 0.35, 0.0, 1.0);
    vec3 col = mix(uColorA, uColorB, mixAmt);
    col = mix(col, uColorC, clamp(sheen * (0.55 + uNoiseIntensity * 0.5), 0.0, 1.0));
    col += uColorC * sheen * 0.18;

    float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (d - 0.5) * (0.012 + uGrain * 0.028);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function SilkPlane({
  speed,
  scale,
  rotation,
  noiseIntensity,
  grain,
  colors,
}: {
  speed: number;
  scale: number;
  rotation: number;
  noiseIntensity: number;
  grain: boolean;
  colors: readonly [string, string, string];
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScale: { value: 1.5 },
      uRotation: { value: 0 },
      uNoiseIntensity: { value: 0.5 },
      uGrain: { value: 1 },
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
    u.uRotation.value = (rotation * Math.PI) / 180;
    u.uNoiseIntensity.value = noiseIntensity;
    u.uGrain.value = grain ? 1 : 0;
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
export function SilkWaves({
  palette = "royal",
  speed = 1,
  scale = 1.5,
  rotation = 25,
  noiseIntensity = 0.5,
  grain = true,
  className,
}: SilkWavesProps) {
  const p = PALETTES[palette] ?? PALETTES.royal;
  const colors = p.colors as unknown as [string, string, string];

  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <SilkPlane speed={speed} scale={scale} rotation={rotation} noiseIntensity={noiseIntensity} grain={grain} colors={colors} />
      </Canvas>
    </div>
  );
}
