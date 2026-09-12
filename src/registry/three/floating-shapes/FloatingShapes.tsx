"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

/** Poly Haven CC0 stüdyo HDRI (1k). */
const HDRI = "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr";

export interface FloatingShapesProps {
  palette?: keyof typeof PALETTES;
  count?: number;
  speed?: number;
  size?: number;
  wireframe?: boolean;
  className?: string;
}

export const PALETTES = {
  pastel: {
    background: "#f6f2ff",
    colors: ["#ffb5d8", "#b5d8ff", "#c8ffcb", "#fff3b0"],
    rim: "#ffffff",
    metalness: 0.05,
    roughness: 0.85,
    emissive: false,
  },
  neon: {
    background: "#05050f",
    colors: ["#ff2bd6", "#22e8ff", "#7c5bff", "#39ff88"],
    rim: "#7b5bff",
    metalness: 0.3,
    roughness: 0.4,
    emissive: true,
  },
  metal: {
    background: "#0c0d10",
    colors: ["#d9d9df", "#c9a15a", "#8fa0b3", "#e3c16f"],
    rim: "#ffffff",
    metalness: 1,
    roughness: 0.2,
    emissive: false,
  },
  glass: {
    background: "#06070c",
    colors: ["#bfe8ff", "#ffd6f2", "#d8ffe9", "#fff0c2"],
    rim: "#a0c4ff",
    metalness: 0,
    roughness: 0.1,
    emissive: false,
  },
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

interface ShapeItem {
  shapeIndex: number;
  position: [number, number, number];
  scale: number;
  floatSpeed: number;
  rotationIntensity: number;
  floatIntensity: number;
  rotation: [number, number, number];
  colorIndex: number;
}

function buildItems(count: number): ShapeItem[] {
  const rand = seeded(count * 104729 + 11);
  const items: ShapeItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      shapeIndex: Math.floor(rand() * 7),
      position: [(rand() - 0.5) * 8, (rand() - 0.5) * 5, (rand() - 0.5) * 4],
      scale: 0.6 + rand() * 0.8,
      floatSpeed: 0.5 + rand() * 1.5,
      rotationIntensity: 0.4 + rand() * 1.2,
      floatIntensity: 0.6 + rand() * 1.4,
      rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
      colorIndex: Math.floor(rand() * 4),
    });
  }
  return items;
}

function ShapeGeometry({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <icosahedronGeometry args={[1, 0]} />;
    case 1:
      return <torusGeometry args={[0.7, 0.28, 24, 48]} />;
    case 2:
      return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    case 3:
      return <coneGeometry args={[0.8, 1.4, 32]} />;
    case 4:
      return <octahedronGeometry args={[1, 0]} />;
    case 5:
      return <torusKnotGeometry args={[0.6, 0.2, 128, 24]} />;
    default:
      return <capsuleGeometry args={[0.5, 0.8, 8, 16]} />;
  }
}

function ShapeMaterial({
  palette,
  color,
  wireframe,
}: {
  palette: keyof typeof PALETTES;
  color: string;
  wireframe: boolean;
}) {
  const p = PALETTES[palette];
  if (palette === "glass") {
    return <meshPhysicalMaterial color={color} transmission={1} thickness={1} roughness={0.1} ior={1.4} wireframe={wireframe} />;
  }
  return (
    <meshStandardMaterial
      color={color}
      metalness={p.metalness}
      roughness={p.roughness}
      emissive={p.emissive ? color : "#000000"}
      emissiveIntensity={p.emissive ? 1.4 : 0}
      wireframe={wireframe}
    />
  );
}

function Shapes({
  palette,
  count,
  speed,
  size,
  wireframe,
}: {
  palette: keyof typeof PALETTES;
  count: number;
  speed: number;
  size: number;
  wireframe: boolean;
}) {
  const p = PALETTES[palette] ?? PALETTES.pastel;
  const groupRef = useRef<THREE.Group>(null);
  const items = useMemo(() => buildItems(count), [count]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.4, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, state.pointer.y * -0.2, 3, delta);
  });

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <Float
          key={i}
          speed={item.floatSpeed * speed}
          rotationIntensity={item.rotationIntensity}
          floatIntensity={item.floatIntensity}
          position={item.position}
        >
          <mesh scale={item.scale * size} rotation={item.rotation}>
            <ShapeGeometry index={item.shapeIndex} />
            <ShapeMaterial palette={palette} color={p.colors[item.colorIndex % p.colors.length]} wireframe={wireframe} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function FloatingShapes({
  palette = "pastel",
  count = 28,
  speed = 1,
  size = 0.8,
  wireframe = false,
  className,
}: FloatingShapesProps) {
  const p = PALETTES[palette] ?? PALETTES.pastel;

  return (
    <section
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: p.background }}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 9], fov: 45 }} gl={{ antialias: false }}>
        {/* Gerçek HDRI ışığı (Poly Haven, CC0) */}
        <Suspense fallback={null}>
          <Environment files={HDRI} environmentIntensity={1.1} />
        </Suspense>
        <ambientLight intensity={0.35} />
        <Shapes key={count} palette={palette} count={count} speed={speed} size={size} wireframe={wireframe} />
      </Canvas>
    </section>
  );
}
