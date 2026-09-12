"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";

export interface BlobOrbProps {
  palette?: keyof typeof PALETTES;
  /** Yüzey deformasyon miktarı */
  distort?: number;
  speed?: number;
  /** Kenar (fresnel) parlaklığı */
  fresnel?: number;
  size?: number;
  className?: string;
}

export const PALETTES = {
  holo: { background: "#05030a", colorA: "#7b5bff", colorB: "#22e8ff" },
  lava: { background: "#0d0402", colorA: "#ff4d2e", colorB: "#ffb703" },
  ocean: { background: "#02080d", colorA: "#0596ff", colorB: "#00e6c3" },
  mint: { background: "#03100c", colorA: "#2effa3", colorB: "#a8fff0" },
} as const;

// Ashima Arts / Ian McEwan simplex noise (webgl-noise, MIT) — 3B gürültü fonksiyonu.
const noiseGLSL = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uDistort;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vNoise;

  ${noiseGLSL}

  void main() {
    float n = snoise(position * 1.6 + uTime * 0.35);
    vec3 displaced = position + normal * n * uDistort;
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    vNoise = n;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uFresnelPower;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vNoise;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), uFresnelPower);

    vec3 base = mix(uColorA, uColorB, 0.5 + 0.5 * vNoise);
    vec3 iri = 0.5 + 0.5 * cos(6.28318 * (vNoise * 1.5 + uTime * 0.1) + vec3(0.0, 2.0, 4.0));
    vec3 color = base + iri * 0.25 * fresnel;

    vec3 lightDir = normalize(vec3(0.4, 0.6, 0.8));
    vec3 halfV = normalize(lightDir + v);
    float spec = pow(max(dot(n, halfV), 0.0), 48.0);

    color += fresnel * 0.6 + spec * 0.8;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function Orb({
  distort,
  speed,
  fresnel,
  colorA,
  colorB,
}: {
  distort: number;
  speed: number;
  fresnel: number;
  colorA: string;
  colorB: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDistort: { value: 0.5 },
      uFresnelPower: { value: 1.2 },
      uColorA: { value: new THREE.Color() },
      uColorB: { value: new THREE.Color() },
    }),
    [],
  );

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (g) {
      g.position.x = THREE.MathUtils.damp(g.position.x, state.pointer.x * 0.6, 3, delta);
      g.position.y = THREE.MathUtils.damp(g.position.y, state.pointer.y * 0.4, 3, delta);
      g.rotation.y += delta * speed * 0.15;
    }

    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta * speed;
    u.uDistort.value = distort;
    u.uFresnelPower.value = fresnel;
    (u.uColorA.value as THREE.Color).set(colorA);
    (u.uColorB.value as THREE.Color).set(colorB);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 128, 128]} />
        <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
      </mesh>
    </group>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function BlobOrb({
  palette = "holo",
  distort = 0.5,
  speed = 1,
  fresnel = 1.2,
  size = 1,
  className,
}: BlobOrbProps) {
  const p = PALETTES[palette] ?? PALETTES.holo;

  return (
    <section
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: p.background }}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.2], fov: 42 }} gl={{ antialias: false }}>
        <group scale={size}>
          <Orb distort={distort} speed={speed} fresnel={fresnel} colorA={p.colorA} colorB={p.colorB} />
        </group>
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={8} blur={2.4} far={3} />
      </Canvas>
    </section>
  );
}
