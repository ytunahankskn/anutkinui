"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface HyperspeedProps {
  palette?: keyof typeof PALETTES;
  speed?: number;
  count?: number;
  /** İz uzunluğu çarpanı */
  streak?: number;
  /** Tünelin yarıçapı (dünya birimi) */
  spread?: number;
  className?: string;
}

export const PALETTES = {
  blue: { bg: "#030712", near: "#9fd8ff", far: "#1c3fae", ink: "#eaf4ff" },
  magenta: { bg: "#120316", near: "#ffb3f0", far: "#7a1fae", ink: "#fdeeff" },
  amber: { bg: "#150c02", near: "#ffdca0", far: "#a85a12", ink: "#fff3df" },
  white: { bg: "#050505", near: "#ffffff", far: "#8a8a8a", ink: "#ffffff" },
} as const;

const TUBE_LENGTH = 44;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpread;
  uniform float uStreak;
  uniform float uTubeLength;
  attribute float aPhase;
  attribute float aEnd;
  attribute float aRandom;
  varying float vAlpha;
  varying float vPhase;

  void main() {
    float streakFrac = uStreak * 0.035;
    float p = fract(aPhase + uTime);
    float pAdj = aEnd > 0.5 ? max(p - streakFrac, 0.0) : p;
    float z = mix(-uTubeLength, 2.0, pAdj);

    vec3 pos = vec3(position.xy * uSpread, z);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    vAlpha = smoothstep(0.0, 0.12, p) * smoothstep(1.0, 0.75, p) * (0.55 + aRandom * 0.45);
    vPhase = p;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uNear;
  uniform vec3 uFar;
  varying float vAlpha;
  varying float vPhase;

  void main() {
    vec3 col = mix(uFar, uNear, vPhase);
    gl_FragColor = vec4(col, vAlpha);
  }
`;

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

function buildStreaks(count: number) {
  const rand = seeded(count * 104729);
  const positions = new Float32Array(count * 2 * 3);
  const phases = new Float32Array(count * 2);
  const ends = new Float32Array(count * 2);
  const randoms = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = Math.sqrt(rand());
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const phase = rand();
    const rnd = rand();

    for (let end = 0; end < 2; end++) {
      const j = i * 2 + end;
      positions[j * 3] = x;
      positions[j * 3 + 1] = y;
      positions[j * 3 + 2] = 0;
      phases[j] = phase;
      ends[j] = end;
      randoms[j] = rnd;
    }
  }

  return { positions, phases, ends, randoms };
}

function Streaks({ count, speed, streak, spread, palette }: Required<Omit<HyperspeedProps, "className">>) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { positions, phases, ends, randoms } = useMemo(() => buildStreaks(count), [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpread: { value: 4 },
      uStreak: { value: 1 },
      uTubeLength: { value: TUBE_LENGTH },
      uNear: { value: new THREE.Color("#ffffff") },
      uFar: { value: new THREE.Color("#888888") },
    }),
    [],
  );

  useFrame((_state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const p = PALETTES[palette] ?? PALETTES.blue;
    u.uTime.value += delta * speed * 0.06;
    u.uSpread.value = spread;
    u.uStreak.value = streak;
    (u.uNear.value as THREE.Color).set(p.near);
    (u.uFar.value as THREE.Color).set(p.far);
  });

  return (
    <lineSegments key={count} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aEnd" args={[ends, 1]} />
        <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
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
    </lineSegments>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function Hyperspeed({ palette = "blue", speed = 1.5, count = 2500, streak = 1, spread = 4, className }: HyperspeedProps) {
  const p = PALETTES[palette] ?? PALETTES.blue;
  return (
    <div className={className} style={{ position: "absolute", inset: 0, background: p.bg }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3.4], fov: 60 }} gl={{ antialias: false, alpha: true }}>
        <Streaks count={count} speed={speed} streak={streak} spread={spread} palette={palette} />
      </Canvas>
    </div>
  );
}
