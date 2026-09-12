"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface IridescenceProps {
  palette?: keyof typeof PALETTES;
  /** Animasyon hızı çarpanı */
  speed?: number;
  /** Renk salınımının genliği */
  amplitude?: number;
  /** Fareye göre hafif paralaks */
  mouseReact?: boolean;
  /** Desen yakınlaştırma */
  zoom?: number;
  className?: string;
}

/**
 * Her palet, ince film (thin-film) rengini ürettmek için kullanılan
 * IQ kosinüs paleti parametreleridir: color = a + b * cos(2π * (c*t + d)).
 */
export const PALETTES = {
  holo: {
    a: [0.55, 0.55, 0.6],
    b: [0.42, 0.42, 0.38],
    c: [1.0, 1.0, 1.0],
    d: [0.0, 0.33, 0.67],
    ink: "#ffffff",
  },
  pearl: {
    a: [0.78, 0.75, 0.78],
    b: [0.2, 0.16, 0.18],
    c: [1.0, 1.0, 1.0],
    d: [0.0, 0.5, 0.33],
    ink: "#1a1420",
  },
  oil: {
    a: [0.22, 0.24, 0.28],
    b: [0.3, 0.32, 0.34],
    c: [1.0, 1.2, 0.8],
    d: [0.3, 0.6, 0.9],
    ink: "#ffffff",
  },
  candy: {
    a: [0.62, 0.52, 0.58],
    b: [0.38, 0.34, 0.36],
    c: [1.0, 1.0, 1.0],
    d: [0.0, 0.08, 0.85],
    ink: "#ffffff",
  },
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
  uniform float uZoom;
  uniform float uMouseReact;
  uniform vec2 uPointer;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  uniform vec3 uD;
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

  void main() {
    vec2 uv = vUv - 0.5;
    float aspect = uRes.x / uRes.y;
    uv.x *= aspect;
    vec2 p = uv * (2.0 / uZoom);
    p += uPointer * 0.08 * uMouseReact;

    vec2 warp = vec2(fbm(p + uTime * 0.05), fbm(p + vec2(3.1, 1.7) - uTime * 0.04)) * uAmplitude;
    float n = fbm(p * 1.6 + warp * 1.5);
    float tt = n * 0.5 + uTime * 0.06;

    vec3 col = uA + (uB * uAmplitude) * cos(6.28318 * (uC * tt + uD));

    float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (d - 0.5) * 0.014;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function IridescencePlane({
  speed,
  amplitude,
  mouseReact,
  zoom,
  params,
}: {
  speed: number;
  amplitude: number;
  mouseReact: boolean;
  zoom: number;
  params: { a: readonly number[]; b: readonly number[]; c: readonly number[]; d: readonly number[] };
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const target = useMemo(() => new THREE.Vector2(0, 0), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 0.5 },
      uZoom: { value: 1 },
      uMouseReact: { value: 1 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uA: { value: new THREE.Vector3() },
      uB: { value: new THREE.Vector3() },
      uC: { value: new THREE.Vector3() },
      uD: { value: new THREE.Vector3() },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta * speed;
    u.uAmplitude.value = amplitude;
    u.uZoom.value = zoom;
    u.uMouseReact.value = mouseReact ? 1 : 0;
    (u.uA.value as THREE.Vector3).fromArray(params.a);
    (u.uB.value as THREE.Vector3).fromArray(params.b);
    (u.uC.value as THREE.Vector3).fromArray(params.c);
    (u.uD.value as THREE.Vector3).fromArray(params.d);
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
export function Iridescence({
  palette = "holo",
  speed = 1,
  amplitude = 0.5,
  mouseReact = true,
  zoom = 1,
  className,
}: IridescenceProps) {
  const p = PALETTES[palette] ?? PALETTES.holo;

  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <IridescencePlane speed={speed} amplitude={amplitude} mouseReact={mouseReact} zoom={zoom} params={p} />
      </Canvas>
    </div>
  );
}
