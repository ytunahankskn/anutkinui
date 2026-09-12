"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface ParticleFieldProps {
  count?: number;
  /** Parçacık boyutu (px cinsinden taban) */
  size?: number;
  /** Fare itme gücü */
  force?: number;
  speed?: number;
  color?: string;
  background?: string;
  className?: string;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform vec2 uPointer;
  uniform float uForce;
  uniform float uPixelRatio;
  attribute float aRandom;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    float ph = aRandom * 6.28318;
    pos.x += sin(uTime * 0.4 + ph) * 0.25;
    pos.y += cos(uTime * 0.3 + ph * 1.3) * 0.25;

    vec2 d = pos.xy - uPointer;
    float dist = length(d);
    float push = smoothstep(2.2, 0.0, dist) * uForce;
    pos.xy += (d / max(dist, 0.001)) * push;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uPixelRatio * (0.6 + aRandom * 0.8) * (8.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vAlpha = 0.35 + 0.65 * aRandom;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(uColor, a * vAlpha);
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

function buildParticles(count: number) {
  const rand = seeded(count * 7919);
  const positions = new Float32Array(count * 3);
  const randoms = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * 16;
    positions[i * 3 + 1] = (rand() - 0.5) * 10;
    positions[i * 3 + 2] = (rand() - 0.5) * 2;
    randoms[i] = rand();
  }
  return { positions, randoms };
}

function Particles({ count, size, force, speed, color }: Required<Omit<ParticleFieldProps, "className" | "background">>) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const target = useMemo(() => new THREE.Vector2(99, 99), []);

  const { positions, randoms } = useMemo(() => buildParticles(count), [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 2 },
      uPointer: { value: new THREE.Vector2(99, 99) },
      uForce: { value: 1 },
      uColor: { value: new THREE.Color("#ffffff") },
      uPixelRatio: { value: 1 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta * speed;
    u.uSize.value = size;
    u.uForce.value = force;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    (u.uColor.value as THREE.Color).set(color);
    const { width, height } = state.viewport;
    target.set((state.pointer.x * width) / 2, (state.pointer.y * height) / 2);
    (u.uPointer.value as THREE.Vector2).lerp(target, 0.12);
  });

  return (
    <points key={count} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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
    </points>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function ParticleField({
  count = 6000,
  size = 2.2,
  force = 1.2,
  speed = 1,
  color = "#9fb4ff",
  background = "#05060a",
  className,
}: ParticleFieldProps) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0, background }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: false, alpha: true }}>
        <Particles count={count} size={size} force={force} speed={speed} color={color} />
      </Canvas>
    </div>
  );
}
