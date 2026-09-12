"use client";

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, PerspectiveCamera, useTexture } from "@react-three/drei";
import * as THREE from "three";

export interface PhotoDomeGalleryProps {
  palette?: keyof typeof PALETTES;
  /** Küre yarıçapı */
  radius?: number;
  /** Enlem sırası sayısı */
  rows?: number;
  /** Sıra başına fotoğraf sayısı */
  perRow?: number;
  hoverScale?: number;
  className?: string;
}

export const PALETTES = {
  noir: { bg: "#050505", vignette: "rgba(0,0,0,.6)", tint: "#ffffff" },
  warm: { bg: "#150e08", vignette: "rgba(40,20,6,.5)", tint: "#ffd9ab" },
  cool: { bg: "#050910", vignette: "rgba(5,16,32,.55)", tint: "#bfe3ff" },
  mono: { bg: "#0a0a0a", vignette: "rgba(0,0,0,.55)", tint: "#cfcfcf" },
} as const;

function photoUrl(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=800&h=600&fit=crop&q=70`;
}

const PHOTO_IDS = [
  "1506905925346-21bda4d32df4",
  "1519681393784-d120267933ba",
  "1469474968028-56623f02e42e",
  "1500530855697-b586d89ba3ee",
  "1507525428034-b723cf961d3e",
  "1470071459604-3b5ec3a7fe05",
  "1441974231531-c6227db76b6e",
  "1472214103451-9374bd1c798e",
  "1447752875215-b2761acb3c5d",
  "1501785888041-af3ef285b470",
  "1490750967868-88aa4486c946",
  "1433086966358-54859d0ed716",
  "1518837695005-2083093ee35b",
  "1534796636912-3b95b3ab5986",
  "1449824913935-59a10b8d2000",
  "1502136969935-8d8eef54d77b",
  "1508614589041-895b88991e3e",
  "1530103862676-de8c9debad1d",
  "1492724441997-5dc865305da7",
  "1495567720989-cebdbdd97913",
  "1516035069371-29a1b244cc32",
  "1523275335684-37898b6baf30",
  "1542291026-7eec264c27ff",
  "1505740420928-5e560c06d30e",
];

const PHOTO_URLS: string[] = PHOTO_IDS.map(photoUrl);

const errorStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "rgba(0,0,0,.7)",
  color: "#fff",
  fontSize: 13,
  whiteSpace: "nowrap",
};

class GalleryErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
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
    if (ref.current) ref.current.rotation.z += delta * 2.4;
  });
  return (
    <mesh ref={ref} position={[0, 0, -3]}>
      <ringGeometry args={[0.28, 0.34, 32]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.55} side={THREE.DoubleSide} />
    </mesh>
  );
}

interface Slot {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

function useDomeSlots(radius: number, rows: number, perRow: number): Slot[] {
  return useMemo(() => {
    const slots: Slot[] = [];
    const maxLat = THREE.MathUtils.degToRad(38);
    const dummy = new THREE.Object3D();
    for (let r = 0; r < rows; r++) {
      const phi = rows === 1 ? 0 : THREE.MathUtils.lerp(-maxLat, maxLat, r / (rows - 1));
      const rowOffset = r % 2 === 1 ? Math.PI / perRow : 0;
      for (let c = 0; c < perRow; c++) {
        const theta = (c / perRow) * Math.PI * 2 + rowOffset;
        const x = radius * Math.cos(phi) * Math.sin(theta);
        const y = radius * Math.sin(phi);
        const z = radius * Math.cos(phi) * Math.cos(theta);
        const position = new THREE.Vector3(x, y, z);
        dummy.position.copy(position);
        // Paneller kürenin İÇİNE, yani merkezdeki kameraya baksın
        dummy.lookAt(0, 0, 0);
        slots.push({ position, quaternion: dummy.quaternion.clone() });
      }
    }
    return slots;
  }, [radius, rows, perRow]);
}

function PhotoPlane({
  texture,
  position,
  quaternion,
  width,
  height,
  hoverScale,
}: {
  texture: THREE.Texture;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  width: number;
  height: number;
  hoverScale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;
    const targetScale = hovered.current ? hoverScale : 1;
    const scale = THREE.MathUtils.damp(mesh.scale.x, targetScale, 8, delta);
    mesh.scale.setScalar(scale);
    const targetBright = hovered.current ? 1.25 : 1;
    const bright = THREE.MathUtils.damp(mat.color.r, targetBright, 8, delta);
    mat.color.setScalar(bright);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      quaternion={quaternion}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovered.current = true;
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        hovered.current = false;
      }}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={matRef} map={texture} toneMapped />
    </mesh>
  );
}

function Dome({ radius, rows, perRow, hoverScale }: { radius: number; rows: number; perRow: number; hoverScale: number }) {
  const textures = useTexture(PHOTO_URLS, (loaded) => {
    loaded.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
    });
  });
  const slots = useDomeSlots(radius, rows, perRow);
  const planeWidth = radius * 0.42;
  const planeHeight = planeWidth * 0.75;

  return (
    <>
      {slots.map((slot, i) => (
        <PhotoPlane
          key={i}
          texture={textures[i % textures.length]}
          position={slot.position}
          quaternion={slot.quaternion}
          width={planeWidth}
          height={planeHeight}
          hoverScale={hoverScale}
        />
      ))}
    </>
  );
}

/**
 * Kamera, sürükleme/inertia ve tekerlek zoom mantığının tamamı burada, tek bileşende yaşar
 * (refler bu bileşene özel useRef ile üretilir) — böylece Compiler'ın "prop/hook değeri
 * mutasyonu" kuralına takılmadan native pointer/wheel event'lerine bağlanabiliriz.
 */
function GalleryRig({
  radius,
  rows,
  perRow,
  hoverScale,
}: {
  radius: number;
  rows: number;
  perRow: number;
  hoverScale: number;
}) {
  const gl = useThree((state) => state.gl);
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const groupRef = useRef<THREE.Group>(null);
  const velocity = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      const vx = dx * 0.0032;
      const vy = dy * 0.0032;
      velocity.current = { x: vx, y: vy };
      const g = groupRef.current;
      if (g) {
        g.rotation.y += vx;
        g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + vy, -1.1, 1.1);
      }
    };
    const onPointerUp = () => {
      dragging.current = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = camRef.current;
      if (!cam) return;
      cam.fov = THREE.MathUtils.clamp(cam.fov + e.deltaY * 0.05, 55, 85);
      cam.updateProjectionMatrix();
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (g && !dragging.current) {
      g.rotation.y += velocity.current.x;
      g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + velocity.current.y, -1.1, 1.1);
      const decay = Math.exp(-4 * delta);
      velocity.current.x *= decay;
      velocity.current.y *= decay;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault ref={camRef} position={[0, 0, 0]} fov={70} near={0.05} far={100} />
      <group ref={groupRef}>
        <GalleryErrorBoundary
          fallback={
            <Html center>
              <div style={errorStyle}>Fotoğraflar yüklenemedi</div>
            </Html>
          }
        >
          <Suspense fallback={<Loader />}>
            <Dome key={`${rows}-${perRow}-${radius}`} radius={radius} rows={rows} perRow={perRow} hoverScale={hoverScale} />
          </Suspense>
        </GalleryErrorBoundary>
      </group>
    </>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function PhotoDomeGallery({
  palette = "noir",
  radius = 6,
  rows = 3,
  perRow = 8,
  hoverScale = 1.12,
  className,
}: PhotoDomeGalleryProps) {
  const p = PALETTES[palette] ?? PALETTES.noir;

  return (
    <section
      className={className}
      data-pdg-scene
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: p.bg }}
    >
      <style>{"[data-pdg-scene] canvas { touch-action: none; cursor: grab; }"}</style>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true }}>
        <color attach="background" args={[p.bg]} />
        <GalleryRig radius={radius} rows={rows} perRow={perRow} hoverScale={hoverScale} />
      </Canvas>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(120% 100% at 50% 50%, transparent 40%, ${p.vignette} 100%)`,
        }}
      />
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, pointerEvents: "none", background: p.tint, opacity: 0.05, mixBlendMode: "soft-light" }}
      />
    </section>
  );
}
