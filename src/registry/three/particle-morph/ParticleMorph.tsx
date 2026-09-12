"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type ParticleMorphShape = "auto" | "sphere" | "cube" | "torus" | "heart";

export interface ParticleMorphProps {
  palette?: keyof typeof PALETTES;
  count?: number;
  shape?: ParticleMorphShape;
  size?: number;
  speed?: number;
  className?: string;
}

export const PALETTES = {
  aurora: { background: "#040713", colorA: "#20e3b2", colorB: "#7b5bff", colorC: "#20c9ff" },
  fire: { background: "#0d0503", colorA: "#ff5f2e", colorB: "#ffd166", colorC: "#ff2e63" },
  ice: { background: "#040a12", colorA: "#8ad7ff", colorB: "#e8fbff", colorC: "#4c8dff" },
  candy: { background: "#0b0512", colorA: "#ff6fd8", colorB: "#c86bff", colorC: "#6fe3ff" },
} as const;

/** Deterministik PRNG (mulberry32): aynı count her zaman aynı dağılımı verir. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHAPE_ORDER = ["sphere", "cube", "torus", "heart"] as const;
type SolidShape = (typeof SHAPE_ORDER)[number];

function heartXY(rand: () => number): [number, number] {
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = (rand() * 2 - 1) * 1.3;
    const y = (rand() * 2 - 1) * 1.3 + 0.15;
    const f = (x * x + y * y - 1) ** 3 - x * x * y * y * y;
    if (f <= 0) return [x, y];
  }
  return [0, 0];
}

function buildMorphSets(count: number) {
  const rand = seeded(count * 7919 + 17);
  const sphere = new Float32Array(count * 3);
  const cube = new Float32Array(count * 3);
  const torus = new Float32Array(count * 3);
  const heart = new Float32Array(count * 3);
  const randoms = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // sphere: uniform on surface
    const u = rand();
    const v = rand();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    sphere[i3] = 1.25 * Math.sin(phi) * Math.cos(theta);
    sphere[i3 + 1] = 1.25 * Math.sin(phi) * Math.sin(theta);
    sphere[i3 + 2] = 1.25 * Math.cos(phi);

    // cube: uniform on one of six faces
    const face = Math.floor(rand() * 6);
    const a = (rand() * 2 - 1) * 1.05;
    const b = (rand() * 2 - 1) * 1.05;
    if (face === 0) cube.set([1.05, a, b], i3);
    else if (face === 1) cube.set([-1.05, a, b], i3);
    else if (face === 2) cube.set([a, 1.05, b], i3);
    else if (face === 3) cube.set([a, -1.05, b], i3);
    else if (face === 4) cube.set([a, b, 1.05], i3);
    else cube.set([a, b, -1.05], i3);

    // torus
    const bigT = rand() * Math.PI * 2;
    const tubeT = rand() * Math.PI * 2;
    const R = 1.1;
    const r = 0.42;
    torus[i3] = (R + r * Math.cos(tubeT)) * Math.cos(bigT);
    torus[i3 + 1] = (R + r * Math.cos(tubeT)) * Math.sin(bigT);
    torus[i3 + 2] = r * Math.sin(tubeT);

    // heart: rejection-sampled implicit curve, extruded on z
    const [hx, hy] = heartXY(rand);
    heart[i3] = hx * 1.15;
    heart[i3 + 1] = hy * 1.15;
    heart[i3 + 2] = (rand() - 0.5) * 0.3;

    randoms[i] = rand();
  }

  return { sphere, cube, torus, heart, randoms };
}

const vertexShader = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec4 uMorph;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  attribute vec3 aSphere;
  attribute vec3 aCube;
  attribute vec3 aTorus;
  attribute vec3 aHeart;
  attribute float aRandom;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = aSphere * uMorph.x + aCube * uMorph.y + aTorus * uMorph.z + aHeart * uMorph.w;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uPixelRatio * (0.5 + aRandom * 0.8) * (40.0 / -mv.z);
    gl_Position = projectionMatrix * mv;

    float t1 = clamp(pos.y * 0.5 + 0.5, 0.0, 1.0);
    float t2 = clamp(length(pos.xz) * 0.6, 0.0, 1.0);
    vColor = mix(mix(uColorA, uColorB, t1), uColorC, t2 * 0.35);
    vAlpha = 0.35 + aRandom * 0.65;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

function MorphPoints({
  count,
  shape,
  size,
  speed,
  colorA,
  colorB,
  colorC,
}: {
  count: number;
  shape: ParticleMorphShape;
  size: number;
  speed: number;
  colorA: string;
  colorB: string;
  colorC: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const morphRef = useRef({ from: 0, to: 0, blend: 1, timer: 0 });

  const data = useMemo(() => buildMorphSets(count), [count]);

  const uniforms = useMemo(
    () => ({
      uSize: { value: 2.5 },
      uPixelRatio: { value: 1 },
      uMorph: { value: new THREE.Vector4(1, 0, 0, 0) },
      uColorA: { value: new THREE.Color() },
      uColorB: { value: new THREE.Color() },
      uColorC: { value: new THREE.Color() },
    }),
    [],
  );

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (g) g.rotation.y += delta * speed * 0.15;

    const m = morphRef.current;
    if (shape === "auto") {
      m.timer += delta;
      if (m.timer >= 3 && m.blend >= 1) {
        m.timer = 0;
        m.from = m.to;
        m.to = (m.to + 1) % SHAPE_ORDER.length;
        m.blend = 0;
      }
    } else {
      const idx = SHAPE_ORDER.indexOf(shape as SolidShape);
      if (idx !== m.to) {
        m.from = m.to;
        m.to = idx;
        m.blend = 0;
      }
    }
    m.blend = Math.min(1, m.blend + delta * (speed * 0.6 + 0.4));
    const eased = m.blend * m.blend * (3 - 2 * m.blend);

    const u = material.current?.uniforms;
    if (!u) return;
    const weights = u.uMorph.value as THREE.Vector4;
    const w = [0, 0, 0, 0];
    w[m.from] += 1 - eased;
    w[m.to] += eased;
    weights.set(w[0], w[1], w[2], w[3]);

    u.uSize.value = size;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    (u.uColorA.value as THREE.Color).set(colorA);
    (u.uColorB.value as THREE.Color).set(colorB);
    (u.uColorC.value as THREE.Color).set(colorC);
  });

  return (
    <group ref={groupRef}>
      <points key={count} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.sphere, 3]} />
          <bufferAttribute attach="attributes-aSphere" args={[data.sphere, 3]} />
          <bufferAttribute attach="attributes-aCube" args={[data.cube, 3]} />
          <bufferAttribute attach="attributes-aTorus" args={[data.torus, 3]} />
          <bufferAttribute attach="attributes-aHeart" args={[data.heart, 3]} />
          <bufferAttribute attach="attributes-aRandom" args={[data.randoms, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function ParticleMorph({
  palette = "aurora",
  count = 20000,
  shape = "auto",
  size = 2.5,
  speed = 1,
  className,
}: ParticleMorphProps) {
  const p = PALETTES[palette] ?? PALETTES.aurora;

  return (
    <div className={className} style={{ position: "absolute", inset: 0, background: p.background }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5.4], fov: 48 }} gl={{ antialias: false, alpha: true }}>
        <MorphPoints count={count} shape={shape} size={size} speed={speed} colorA={p.colorA} colorB={p.colorB} colorC={p.colorC} />
      </Canvas>
    </div>
  );
}
