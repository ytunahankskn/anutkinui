"use client";

import { Component, Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, MeshReflectorMaterial, OrbitControls, RoundedBox } from "@react-three/drei";

export type MaterialStudioObject = "sphere" | "knot" | "ring" | "cube" | "capsule";
export type MaterialStudioMaterial =
  | "carPaint"
  | "brushedMetal"
  | "frostedGlass"
  | "ceramic"
  | "gold"
  | "rubber"
  | "iridescent";
export type MaterialStudioHdri = "studio" | "sunset" | "hall" | "night";

export interface MaterialStudioProps {
  palette?: keyof typeof PALETTES;
  material?: MaterialStudioMaterial;
  object?: MaterialStudioObject;
  hdri?: MaterialStudioHdri;
  autoRotate?: boolean;
  className?: string;
}

export const PALETTES = {
  crimson: { accent: "#c1121f", backdrop: "#141416", floor: "#1c1c1f" },
  midnight: { accent: "#1d3557", backdrop: "#0b0d12", floor: "#12151c" },
  pearl: { accent: "#f1f1f3", backdrop: "#e9e9ee", floor: "#d8d8de" },
  emerald: { accent: "#2a9d8f", backdrop: "#0d1512", floor: "#0f1a17" },
} as const;

const HDRI_URLS: Record<MaterialStudioHdri, string> = {
  studio: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr",
  sunset: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr",
  hall: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr",
  night: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonless_golf_1k.hdr",
};

/** name → görünen etiket (demo legend'ı için de kullanılabilir) */
export const MATERIAL_LABELS: Record<MaterialStudioMaterial, string> = {
  carPaint: "Car Paint",
  brushedMetal: "Brushed Metal",
  frostedGlass: "Frosted Glass",
  ceramic: "Ceramic",
  gold: "Gold",
  rubber: "Rubber",
  iridescent: "Iridescent",
};

export const OBJECT_LABELS: Record<MaterialStudioObject, string> = {
  sphere: "Sphere",
  knot: "Torus Knot",
  ring: "Ring",
  cube: "Cube",
  capsule: "Capsule",
};

type PhysicalProps = {
  color: string;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  anisotropy?: number;
  anisotropyRotation?: number;
  transmission?: number;
  thickness?: number;
  ior?: number;
  iridescence?: number;
  iridescenceIOR?: number;
  iridescenceThicknessRange?: [number, number];
};

function materialProps(material: MaterialStudioMaterial, accent: string): PhysicalProps {
  switch (material) {
    case "carPaint":
      return { color: accent, metalness: 0.9, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.03 };
    case "brushedMetal":
      return { color: "#c9cbd1", metalness: 1, roughness: 0.35, anisotropy: 1, anisotropyRotation: 0.8 };
    case "frostedGlass":
      return { color: "#f4f4f7", transmission: 1, roughness: 0.4, thickness: 1.5, ior: 1.45 };
    case "ceramic":
      return { color: "#efece3", roughness: 0.15, clearcoat: 0.6 };
    case "gold":
      return { color: "#ffd27a", metalness: 1, roughness: 0.18 };
    case "rubber":
      return { color: "#1f1f22", roughness: 0.95, metalness: 0 };
    case "iridescent":
      return {
        color: accent,
        iridescence: 1,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
        roughness: 0.2,
        metalness: 0.3,
      };
    default:
      return { color: accent };
  }
}

class HdriErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    // HDRI yüklenemezse sahne düz ışıklarla devam eder.
    return this.state.hasError ? <ambientLight intensity={0.7} /> : this.props.children;
  }
}

function StudioObject({ object, mat }: { object: MaterialStudioObject; mat: PhysicalProps }) {
  switch (object) {
    case "knot":
      return (
        <mesh castShadow rotation={[0.4, 0, 0]}>
          <torusKnotGeometry args={[0.62, 0.22, 200, 32]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
      );
    case "ring":
      return (
        <mesh castShadow rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.85, 0.32, 64, 128]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
      );
    case "cube":
      return (
        <RoundedBox castShadow args={[1.3, 1.3, 1.3]} radius={0.12} smoothness={4}>
          <meshPhysicalMaterial {...mat} />
        </RoundedBox>
      );
    case "capsule":
      return (
        <mesh castShadow>
          <capsuleGeometry args={[0.55, 0.9, 8, 24]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
      );
    case "sphere":
    default:
      return (
        <mesh castShadow>
          <sphereGeometry args={[0.9, 64, 64]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
      );
  }
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function MaterialStudio({
  palette = "crimson",
  material = "carPaint",
  object = "sphere",
  hdri = "studio",
  autoRotate = true,
  className,
}: MaterialStudioProps) {
  const p = PALETTES[palette] ?? PALETTES.crimson;
  const mat = materialProps(material, p.accent);
  const hdriUrl = HDRI_URLS[hdri] ?? HDRI_URLS.studio;

  return (
    <section
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: p.backdrop }}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.9, 4.6], fov: 38 }} gl={{ antialias: true }} shadows>
        <color attach="background" args={[p.backdrop]} />
        <ambientLight intensity={0.25} />
        <HdriErrorBoundary key={hdriUrl}>
          <Suspense fallback={null}>
            <Environment files={hdriUrl} />
          </Suspense>
        </HdriErrorBoundary>

        <group position={[0, 0.05, 0]} key={object}>
          <StudioObject object={object} mat={mat} />
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]}>
          <planeGeometry args={[14, 14]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={512}
            mixBlur={1}
            mirror={0.4}
            roughness={1}
            depthScale={1}
            color={p.floor}
          />
        </mesh>
        <ContactShadows position={[0, -1.24, 0]} opacity={0.55} scale={10} blur={2.4} far={3} />

        <OrbitControls
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={1.1}
          minDistance={2.6}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </section>
  );
}
