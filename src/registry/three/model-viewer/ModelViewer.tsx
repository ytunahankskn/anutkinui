"use client";

import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";

const HDRI_BASE = "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/";
import * as THREE from "three";

export interface ModelViewerProps {
  palette?: keyof typeof PALETTES;
  /** Yüklenecek .glb dosyasının URL'i */
  src?: string;
  autoRotate?: boolean;
  speed?: number;
  scale?: number;
  className?: string;
}

export const PALETTES = {
  studio: { background: "#101014", light: "#ffffff", shadowOpacity: 0.45, hdri: `${HDRI_BASE}studio_small_09_1k.hdr` },
  sunset: { background: "#1a0e10", light: "#ff9d6c", shadowOpacity: 0.4, hdri: `${HDRI_BASE}venice_sunset_1k.hdr` },
  dawn: { background: "#12131f", light: "#8fb3ff", shadowOpacity: 0.35, hdri: `${HDRI_BASE}kloppenheim_06_puresky_1k.hdr` },
  night: { background: "#05060a", light: "#5c6bff", shadowOpacity: 0.55, hdri: `${HDRI_BASE}moonless_golf_1k.hdr` },
} as const;

const DEFAULT_SRC =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb";

const errorStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "rgba(0,0,0,.7)",
  color: "#fff",
  fontSize: 13,
  whiteSpace: "nowrap",
};

class ModelErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
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
      <icosahedronGeometry args={[0.5, 0]} />
      <meshBasicMaterial color="#ffffff" wireframe />
    </mesh>
  );
}

function Model({ src, autoRotate, speed, scale }: { src: string; autoRotate: boolean; speed: number; scale: number }) {
  const { scene } = useGLTF(src);
  const groupRef = useRef<THREE.Group>(null);

  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const factor = 2.4 / maxAxis;
    clone.position.set(-center.x * factor, -center.y * factor, -center.z * factor);
    clone.scale.setScalar(factor);
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * speed * 0.4;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={normalized} />
    </group>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function ModelViewer({
  palette = "studio",
  src = DEFAULT_SRC,
  autoRotate = true,
  speed = 1,
  scale = 1,
  className,
}: ModelViewerProps) {
  const p = PALETTES[palette] ?? PALETTES.studio;
  const modelSrc = src || DEFAULT_SRC;

  return (
    <section
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: p.background }}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.6, 4.2], fov: 40 }} gl={{ antialias: true }}>
        {/* Palete göre gerçek HDRI (Poly Haven, CC0) */}
        <Suspense fallback={null}>
          <Environment files={p.hdri} environmentIntensity={1.1} />
        </Suspense>
        <ambientLight intensity={0.4} />
        <ModelErrorBoundary
          key={modelSrc}
          fallback={
            <Html center>
              <div style={errorStyle}>Model yüklenemedi</div>
            </Html>
          }
        >
          <Suspense fallback={<Loader />}>
            <Model src={modelSrc} autoRotate={autoRotate} speed={speed} scale={scale} />
          </Suspense>
        </ModelErrorBoundary>
        <ContactShadows position={[0, -1.2, 0]} opacity={p.shadowOpacity} scale={10} blur={2.4} far={3} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={9} />
      </Canvas>
    </section>
  );
}
