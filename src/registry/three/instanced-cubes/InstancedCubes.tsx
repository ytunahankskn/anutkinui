"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

export interface InstancedCubesProps {
  palette?: keyof typeof PALETTES;
  /** Izgaranın kenar uzunluğu (instance sayısı = grid * grid) */
  grid?: number;
  /** Dalga yüksekliği */
  amplitude?: number;
  speed?: number;
  /** Fare dokunuşunun etki yarıçapı */
  mouseRadius?: number;
  className?: string;
}

export const PALETTES = {
  neon: { background: "#05030c", colorA: "#ff2bd6", colorB: "#22e8ff", rim: "#7b5bff" },
  pastel: { background: "#f4f0ff", colorA: "#ffb5d8", colorB: "#a9c8ff", rim: "#ffffff" },
  sunset: { background: "#170a10", colorA: "#ff7a45", colorB: "#ffd166", rim: "#ff9f6b" },
  monoGlow: { background: "#08090c", colorA: "#7c8bff", colorB: "#e7ecff", rim: "#9fb0ff" },
} as const;

/** Grid boyutu değiştikçe kamerayı sahneye sığacak şekilde yeniden konumlar. */
function CameraRig({ grid }: { grid: number }) {
  const { camera } = useThree();
  useEffect(() => {
    const span = grid * 0.11 + 5;
    camera.position.set(0, span * 0.85, span);
    camera.lookAt(0, 0, 0);
  }, [camera, grid]);
  return null;
}

function CubesField({
  grid,
  amplitude,
  speed,
  mouseRadius,
  colorA,
  colorB,
}: {
  grid: number;
  amplitude: number;
  speed: number;
  mouseRadius: number;
  colorA: string;
  colorB: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = grid * grid;
  const spacing = 1;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const from = useMemo(() => new THREE.Color(), []);
  const to = useMemo(() => new THREE.Color(), []);
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hitPoint = useMemo(() => new THREE.Vector3(), []);
  const clockRef = useRef(0);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    clockRef.current += delta * speed;
    const t = clockRef.current;

    state.raycaster.setFromCamera(state.pointer, state.camera);
    const hit = state.raycaster.ray.intersectPlane(groundPlane, hitPoint);

    from.set(colorA);
    to.set(colorB);

    const half = (grid - 1) / 2;
    for (let i = 0; i < count; i++) {
      const ix = i % grid;
      const iz = Math.floor(i / grid);
      const x = (ix - half) * spacing;
      const z = (iz - half) * spacing;

      const wave =
        (Math.sin(x * 0.35 + t) * Math.cos(z * 0.3 + t * 0.7) +
          Math.sin((x + z) * 0.18 - t * 1.3) * 0.5) *
        amplitude *
        0.5;

      let ripple = 0;
      if (hit) {
        const dx = x - hitPoint.x;
        const dz = z - hitPoint.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const falloff = Math.max(0, 1 - dist / mouseRadius);
        ripple = falloff * falloff * Math.sin(dist * 2.2 - t * 4) * amplitude * 1.6;
      }

      const y = wave + ripple;
      dummy.position.set(x, y * 0.5, z);
      dummy.rotation.set(y * 0.2, (x - z) * 0.04 + t * 0.05, y * 0.1);
      dummy.scale.setScalar(0.86 + Math.abs(y) * 0.06);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const mixT = THREE.MathUtils.clamp(0.5 + y / (amplitude * 2.2 + 0.001), 0, 1);
      color.copy(from).lerp(to, mixT);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh key={grid} ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.82, 0.82, 0.82]} />
      <meshStandardMaterial roughness={0.35} metalness={0.15} />
    </instancedMesh>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function InstancedCubes({
  palette = "neon",
  grid = 100,
  amplitude = 1,
  speed = 1,
  mouseRadius = 4,
  className,
}: InstancedCubesProps) {
  const p = PALETTES[palette] ?? PALETTES.neon;

  return (
    <section
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: p.background }}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 12, 14], fov: 42 }} gl={{ antialias: false }}>
        <CameraRig grid={grid} />
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 3, 0, 1]}>
            <Lightformer form="circle" intensity={6} rotation-x={Math.PI / 2} position={[0, 6, -6]} scale={4} />
            <Lightformer form="rect" intensity={3} color={p.rim} position={[-6, 3, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
            <Lightformer form="rect" intensity={2.5} position={[6, 3, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
            <Lightformer form="rect" intensity={2} position={[0, -4, 4]} rotation-x={-Math.PI / 2} scale={[10, 4, 1]} />
          </group>
        </Environment>
        <ambientLight intensity={0.25} />
        <CubesField grid={grid} amplitude={amplitude} speed={speed} mouseRadius={mouseRadius} colorA={p.colorA} colorB={p.colorB} />
      </Canvas>
    </section>
  );
}
