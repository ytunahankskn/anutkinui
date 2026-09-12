"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface StarryNightProps {
  palette?: keyof typeof PALETTES;
  /** Yıldız sayısı */
  starCount?: number;
  /** Titreşim hızı/şiddeti */
  twinkle?: number;
  shootingStars?: boolean;
  milkyWay?: boolean;
  className?: string;
}

export const PALETTES = {
  midnight: {
    skyTop: "#02040f",
    skyHorizon: "#0a1533",
    star: "#dfe8ff",
    bandA: "#8fb8ff",
    bandB: "#c9a6ff",
    mountain: "#01030a",
    fog: "#0a1533",
    shooting: "#ffffff",
    ink: "#e7f0ff",
  },
  aurora: {
    skyTop: "#020a0c",
    skyHorizon: "#0a2a24",
    star: "#eafff6",
    bandA: "#5fffc7",
    bandB: "#7dd3ff",
    mountain: "#010806",
    fog: "#0a2a24",
    shooting: "#c7fff0",
    ink: "#eafff6",
  },
  dusk: {
    skyTop: "#170a2e",
    skyHorizon: "#5c2a3a",
    star: "#ffe9d9",
    bandA: "#ffb37a",
    bandB: "#a06bd6",
    mountain: "#0d0510",
    fog: "#3a1c2c",
    shooting: "#ffd9b0",
    ink: "#ffe9d9",
  },
  mono: {
    skyTop: "#050505",
    skyHorizon: "#2a2a2e",
    star: "#ffffff",
    bandA: "#cfcfcf",
    bandB: "#888888",
    mountain: "#020202",
    fog: "#1a1a1c",
    shooting: "#ffffff",
    ink: "#ffffff",
  },
} as const;

/** Deterministik PRNG (mulberry32) — particle-field/ParticleField.tsx'ten aynen alınmıştır. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Yıldız alanı: uzak yarım kürede, per-star boyut/parlaklık/twinkle-fazı ---
const starVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aBrightness;
  attribute float aPhase;
  attribute float aRand;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    float twinkle = 0.6 + 0.4 * sin(uTime * uSpeed * (1.5 + aRand) + aPhase);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * twinkle;
    gl_Position = projectionMatrix * mv;
    vAlpha = aBrightness * twinkle;
  }
`;
const starFragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * vAlpha);
  }
`;

function buildStars(count: number) {
  const rand = seeded(count * 9973 + 17);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const brightness = new Float32Array(count);
  const phases = new Float32Array(count);
  const rands = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(1 - rand() * 0.92);
    const r = 420 + rand() * 60;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.max(r * Math.cos(phi), 6);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    sizes[i] = 1 + rand() * 2.4;
    brightness[i] = 0.35 + rand() * 0.65;
    phases[i] = rand() * Math.PI * 2;
    rands[i] = rand();
  }
  return { positions, sizes, brightness, phases, rands };
}

function StarField({ count, twinkle, palette }: { count: number; twinkle: number; palette: keyof typeof PALETTES }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { positions, sizes, brightness, phases, rands } = useMemo(() => buildStars(count), [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 1 },
      uColor: { value: new THREE.Color("#dfe8ff") },
      uPixelRatio: { value: 1 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    u.uSpeed.value = twinkle;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    (u.uColor.value as THREE.Color).set((PALETTES[palette] ?? PALETTES.midnight).star);
  });

  return (
    <points key={count} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aBrightness" args={[brightness, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aRand" args={[rands, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// --- Samanyolu bandı: fbm noise ile yumuşak, sıcak/soğuk renk karışımlı, additive şerit ---
const bandVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const bandFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.05;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float n = fbm(vec2(vUv.x * 3.2 + uTime * 0.015, vUv.y * 2.4));
    float n2 = fbm(vec2(vUv.x * 5.0 - uTime * 0.01, vUv.y * 3.0 + 5.0));
    float band = smoothstep(0.0, 0.45, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
    float density = band * (0.35 + 0.65 * n);
    vec3 col = mix(uColorA, uColorB, clamp(n2, 0.0, 1.0));
    col = col / (col + 1.0);
    gl_FragColor = vec4(col, density * 0.55);
  }
`;

function MilkyWayBand({ palette }: { palette: keyof typeof PALETTES }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#8fb8ff") },
      uColorB: { value: new THREE.Color("#c9a6ff") },
    }),
    [],
  );

  useFrame((_state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const p = PALETTES[palette] ?? PALETTES.midnight;
    u.uTime.value += delta;
    (u.uColorA.value as THREE.Color).set(p.bandA);
    (u.uColorB.value as THREE.Color).set(p.bandB);
  });

  return (
    <mesh rotation={[0.5, 0.6, 0.9]} position={[0, 40, -80]} frustumCulled={false}>
      <planeGeometry args={[700, 220]} />
      <shaderMaterial
        ref={material}
        vertexShader={bandVertexShader}
        fragmentShader={bandFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// --- Kayan yıldızlar: 2-4 sn'de bir useFrame içindeki zaman biriktiricisinden doğar ---
interface ShootingSlot {
  active: boolean;
  t: number;
  duration: number;
  start: THREE.Vector3;
  dir: THREE.Vector3;
  len: number;
}

function ShootingStars({ enabled, palette }: { enabled: boolean; palette: keyof typeof PALETTES }) {
  const lineRefs = useRef<(THREE.LineSegments | null)[]>([null, null]);
  const slots = useRef<ShootingSlot[]>([0, 1].map(() => ({ active: false, t: 0, duration: 1, start: new THREE.Vector3(), dir: new THREE.Vector3(1, -0.4, 0), len: 10 })));
  const timer = useRef({ elapsed: 0, next: 2.5 });

  useFrame((_state, delta) => {
    if (enabled) {
      timer.current.elapsed += delta;
      if (timer.current.elapsed > timer.current.next) {
        timer.current.elapsed = 0;
        timer.current.next = 2 + Math.random() * 2;
        const free = slots.current.find((s) => !s.active);
        if (free) {
          const az = Math.random() * Math.PI * 2;
          const r = 380;
          free.start.set(Math.cos(az) * r, 120 + Math.random() * 120, Math.sin(az) * r);
          free.dir.set(-Math.cos(az + 0.4), -0.45 - Math.random() * 0.2, -Math.sin(az + 0.4)).normalize();
          free.len = 18 + Math.random() * 22;
          free.duration = 0.7 + Math.random() * 0.6;
          free.t = 0;
          free.active = true;
        }
      }
    }
    lineRefs.current.forEach((line, i) => {
      const slot = slots.current[i];
      if (!line) return;
      const mat = line.material as THREE.LineBasicMaterial;
      if (!slot.active) {
        mat.opacity = 0;
        return;
      }
      slot.t += delta / slot.duration;
      if (slot.t >= 1) {
        slot.active = false;
        mat.opacity = 0;
        return;
      }
      const head = slot.start.clone().addScaledVector(slot.dir, slot.t * 90);
      const tail = head.clone().addScaledVector(slot.dir, -slot.len);
      const pos = line.geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, tail.x, tail.y, tail.z);
      pos.setXYZ(1, head.x, head.y, head.z);
      pos.needsUpdate = true;
      mat.opacity = Math.sin(Math.PI * slot.t) * 0.9;
    });
  });

  const color = (PALETTES[palette] ?? PALETTES.midnight).shooting;

  return (
    <>
      {[0, 1].map((i) => (
        <lineSegments
          key={i}
          ref={(el) => {
            lineRefs.current[i] = el;
          }}
          frustumCulled={false}
        >
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[new Float32Array(6), 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={0} />
        </lineSegments>
      ))}
    </>
  );
}

// --- Ufuk: seeded ridge line'dan üretilen, hafifçe extrude edilmiş dağ silueti ---
function buildMountainGeometry(seed: number) {
  const rand = seeded(seed);
  const width = 160;
  const segments = 36;
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -8);
  let h = rand() * 3;
  shape.lineTo(-width / 2, h);
  for (let i = 1; i <= segments; i++) {
    const x = -width / 2 + (width * i) / segments;
    h = THREE.MathUtils.clamp(h + (rand() - 0.5) * 3.4, 0, 7.5);
    shape.lineTo(x, h);
  }
  shape.lineTo(width / 2, -8);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 1.4, bevelEnabled: false, curveSegments: 1 });
}

function Mountains({ palette }: { palette: keyof typeof PALETTES }) {
  const geometry = useMemo(() => buildMountainGeometry(4242), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const color = (PALETTES[palette] ?? PALETTES.midnight).mountain;
  return (
    <mesh geometry={geometry} position={[0, -3.6, -20]}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// --- Atmosfer gradyanı: BackSide gökyüzü küresi ---
const skyVertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(uHorizon, uTop, pow(h, 0.6));
    col = col / (col + 1.0);
    col = pow(col, vec3(1.0 / 2.2));
    float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
    gl_FragColor = vec4(col + dither, 1.0);
  }
`;

function SkyDome({ palette }: { palette: keyof typeof PALETTES }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTop: { value: new THREE.Color("#02040f") }, uHorizon: { value: new THREE.Color("#0a1533") } }),
    [],
  );
  useFrame(() => {
    const u = material.current?.uniforms;
    if (!u) return;
    const p = PALETTES[palette] ?? PALETTES.midnight;
    (u.uTop.value as THREE.Color).set(p.skyTop);
    (u.uHorizon.value as THREE.Color).set(p.skyHorizon);
  });
  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[480, 32, 24]} />
      <shaderMaterial
        ref={material}
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

interface SceneProps {
  palette: keyof typeof PALETTES;
  starCount: number;
  twinkle: number;
  shootingStars: boolean;
  milkyWay: boolean;
}

function Scene({ palette, starCount, twinkle, shootingStars, milkyWay }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const fogColor = (PALETTES[palette] ?? PALETTES.midnight).fog;

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.08, 4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.05, 4, delta);
  });

  return (
    <>
      <fog attach="fog" args={[fogColor, 40, 240]} />
      <SkyDome palette={palette} />
      <group ref={groupRef}>
        <StarField count={starCount} twinkle={twinkle} palette={palette} />
        {milkyWay && <MilkyWayBand palette={palette} />}
        <ShootingStars enabled={shootingStars} palette={palette} />
      </group>
      <Mountains palette={palette} />
    </>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function StarryNight({
  palette = "midnight",
  starCount = 6000,
  twinkle = 1,
  shootingStars = true,
  milkyWay = true,
  className,
}: StarryNightProps) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 1.4, 9], fov: 60 }} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Scene palette={palette} starCount={starCount} twinkle={twinkle} shootingStars={shootingStars} milkyWay={milkyWay} />
      </Canvas>
    </div>
  );
}
