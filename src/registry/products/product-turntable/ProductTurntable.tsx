"use client";

import { Component, Suspense, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Html, MeshReflectorMaterial, OrbitControls, SpotLight, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface ProductTurntableProps {
  palette?: keyof typeof PALETTES;
  model?: keyof typeof MODELS;
  hdri?: keyof typeof HDRI;
  /** Döndürme hızı; 0 = durur */
  autoRotate?: number;
  /** Model ölçek çarpanı (kamera zoom hissi) */
  zoom?: number;
  className?: string;
}

const HDRI = {
  studio: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr",
  sunset: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr",
  hall: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr",
  night: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonless_golf_1k.hdr",
} as const;

const MODELS = {
  chair: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb",
  toycar: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb",
  helmet: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
} as const;

export const PALETTES = {
  studio: { bg: "#f4f4f2", backdrop: "#ffffff", floor: "#ececeb" },
  charcoal: { bg: "#17181a", backdrop: "#202226", floor: "#101113" },
  blush: { bg: "#f4e3df", backdrop: "#f9ece8", floor: "#e6cec8" },
  sage: { bg: "#e8ede4", backdrop: "#eff3eb", floor: "#cfd9c9" },
} as const;

const errorStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "rgba(0,0,0,.7)",
  color: "#fff",
  fontSize: 13,
  whiteSpace: "nowrap",
};

class TurntableErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function Loader() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 2;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.4, 0]} />
      <meshBasicMaterial color="#ffffff" wireframe />
    </mesh>
  );
}

function Model({ src, zoom }: { src: string; zoom: number }) {
  const { scene } = useGLTF(src);

  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const factor = (2.2 / maxAxis) * zoom;
    clone.position.set(-center.x * factor, -center.y * factor + (size.y * factor) / 2, -center.z * factor);
    clone.scale.setScalar(factor);
    return clone;
  }, [scene, zoom]);

  return <primitive object={normalized} />;
}

/** Yumuşak stüdyo arka planı: kavisli cyclorama duvar + yansıtıcı zemin. */
function Cyclorama({ backdrop, floor }: { backdrop: string; floor: string }) {
  return (
    <group>
      <mesh position={[0, 3, -2.6]}>
        <cylinderGeometry args={[6, 6, 6, 48, 1, true, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color={backdrop} roughness={0.95} metalness={0} side={THREE.BackSide} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
        <planeGeometry args={[14, 14]} />
        <MeshReflectorMaterial
          blur={[250, 90]}
          resolution={256}
          mixBlur={1}
          mixStrength={1.4}
          roughness={1}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color={floor}
          metalness={0.3}
          mirror={0.35}
        />
      </mesh>
    </group>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function ProductTurntable({
  palette = "studio",
  model = "chair",
  hdri = "studio",
  autoRotate = 1,
  zoom = 1,
  className,
}: ProductTurntableProps) {
  const pal = PALETTES[palette] ?? PALETTES.studio;
  const modelSrc = MODELS[model] ?? MODELS.chair;
  const hdriUrl = HDRI[hdri] ?? HDRI.studio;
  const [pointerDown, setPointerDown] = useState(false);
  const effectiveSpeed = pointerDown ? 0 : autoRotate;

  return (
    <section
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: pal.bg }}
      onPointerDown={() => setPointerDown(true)}
      onPointerUp={() => setPointerDown(false)}
      onPointerLeave={() => setPointerDown(false)}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [2.2, 1.4, 3.2], fov: 36 }} gl={{ antialias: true }}>
        <Environment files={hdriUrl} resolution={256} />
        <ambientLight intensity={0.25} />
        <SpotLight position={[2, 4.5, 2]} angle={0.35} penumbra={0.65} intensity={3} distance={14} color="#ffffff" />
        <TurntableErrorBoundary
          key={model}
          fallback={
            <Html center>
              <div style={errorStyle}>Model yüklenemedi</div>
            </Html>
          }
        >
          <Suspense fallback={<Loader />}>
            <Model src={modelSrc} zoom={zoom} />
          </Suspense>
        </TurntableErrorBoundary>
        <Cyclorama backdrop={pal.backdrop} floor={pal.floor} />
        <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={8} blur={2.4} far={3} />
        <OrbitControls
          enablePan={false}
          autoRotate={effectiveSpeed > 0}
          autoRotateSpeed={effectiveSpeed}
          minDistance={1.6}
          maxDistance={7}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </section>
  );
}
