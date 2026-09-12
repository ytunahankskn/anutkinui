"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface LiquidChromeProps {
  palette?: keyof typeof PALETTES;
  /** Animasyon hızı çarpanı */
  speed?: number;
  /** Domain-warp genliği */
  amplitude?: number;
  /** Bant sıklığı */
  frequency?: number;
  /** Fareyle yüzeyi itme gücü */
  mouseStrength?: number;
  className?: string;
}

export const PALETTES = {
  chrome: { colors: ["#1c2024", "#9aa7b4", "#eaf2ff"], hueShift: 0, ink: "#ffffff" },
  gold: { colors: ["#231604", "#c98d1e", "#fff2c2"], hueShift: 0, ink: "#ffffff" },
  copper: { colors: ["#2a120c", "#c9643a", "#ffd9c2"], hueShift: 0, ink: "#ffffff" },
  iridescent: { colors: ["#00e5ff", "#ff2bd6", "#caff00"], hueShift: 1.4, ink: "#ffffff" },
  obsidian: { colors: ["#0a0612", "#3b2a66", "#8f7bff"], hueShift: 0, ink: "#ffffff" },
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
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uMouseStrength;
  uniform float uHueShift;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec2 uPointer;
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
    for (int i = 0; i < 4; i++) {
      v += a * snoise(p);
      p = r * p * 2.0 + 10.0;
      a *= 0.5;
    }
    return v;
  }

  vec3 tricolor(vec3 a, vec3 b, vec3 c, float t) {
    t = fract(t);
    float seg = t * 3.0;
    if (seg < 1.0) return mix(a, b, seg);
    if (seg < 2.0) return mix(b, c, seg - 1.0);
    return mix(c, a, seg - 2.0);
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float aspect = uRes.x / uRes.y;
    uv.x *= aspect;
    vec2 p = uv * uFrequency;
    float t = uTime;

    vec2 mouse = uPointer * uMouseStrength;

    vec2 q = vec2(fbm(p + t * 0.12), fbm(p + vec2(5.2, 1.3) + t * 0.1));
    vec2 r = vec2(
      fbm(p + q * uAmplitude * 2.0 + mouse + t * 0.15),
      fbm(p + q * uAmplitude * 2.0 + vec2(8.3, 2.8) - t * 0.12)
    );
    float pattern = fbm(p + r * uAmplitude * 2.0);

    float highlightNoise = fbm(p * 2.0 + r * 1.5 - t * 0.3 + mouse * 0.6);
    float spec = pow(clamp(highlightNoise * 0.5 + 0.5, 0.0, 1.0), 6.0);

    float cyclic = pattern * 0.5 + 0.5 + uHueShift * 0.15 * sin(t * 0.2 + pattern);
    vec3 col = tricolor(uColorA, uColorB, uColorC, cyclic);
    col += uColorC * spec * 0.6;

    float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (d - 0.5) * 0.018;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function ChromePlane({
  speed,
  amplitude,
  frequency,
  mouseStrength,
  colors,
  hueShift,
}: {
  speed: number;
  amplitude: number;
  frequency: number;
  mouseStrength: number;
  colors: readonly [string, string, string];
  hueShift: number;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const target = useMemo(() => new THREE.Vector2(0, 0), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 0.4 },
      uFrequency: { value: 3 },
      uMouseStrength: { value: 0.35 },
      uHueShift: { value: 0 },
      uColorA: { value: new THREE.Color("#000000") },
      uColorB: { value: new THREE.Color("#000000") },
      uColorC: { value: new THREE.Color("#000000") },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta * speed;
    u.uAmplitude.value = amplitude;
    u.uFrequency.value = frequency;
    u.uMouseStrength.value = mouseStrength;
    u.uHueShift.value = hueShift;
    (u.uColorA.value as THREE.Color).set(colors[0]);
    (u.uColorB.value as THREE.Color).set(colors[1]);
    (u.uColorC.value as THREE.Color).set(colors[2]);
    (u.uRes.value as THREE.Vector2).set(state.size.width, state.size.height);

    target.set(state.pointer.x, state.pointer.y);
    const pointer = u.uPointer.value as THREE.Vector2;
    pointer.x = THREE.MathUtils.damp(pointer.x, target.x, 4, delta);
    pointer.y = THREE.MathUtils.damp(pointer.y, target.y, 4, delta);
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
export function LiquidChrome({
  palette = "chrome",
  speed = 1,
  amplitude = 0.4,
  frequency = 3,
  mouseStrength = 0.35,
  className,
}: LiquidChromeProps) {
  const p = PALETTES[palette] ?? PALETTES.chrome;
  const colors = p.colors as unknown as [string, string, string];

  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <ChromePlane
          speed={speed}
          amplitude={amplitude}
          frequency={frequency}
          mouseStrength={mouseStrength}
          colors={colors}
          hueShift={p.hueShift}
        />
      </Canvas>
    </div>
  );
}
