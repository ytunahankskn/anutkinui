"use client";

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Html, MeshReflectorMaterial, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// three-stdlib pnpm altında doğrudan import edilemiyor (drei'nin transitive bağımlılığı);
// tipleri useGLTF'in kendi imzasından türetiyoruz.
type ExtendLoaderFn = NonNullable<Parameters<typeof useGLTF>[3]>;
type GltfLoaderArg = Parameters<ExtendLoaderFn>[0];

export interface ShoeVariantsProps {
  palette?: keyof typeof PALETTES;
  variant?: "midnight" | "beach" | "street";
  hdri?: keyof typeof HDRI;
  autoRotate?: boolean;
  scale?: number;
  className?: string;
}

const HDRI = {
  studio: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr",
  sunset: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr",
  hall: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr",
} as const;

export const PALETTES = {
  white: { bg: "#f2f1ee", floor: "#e7e5df" },
  charcoal: { bg: "#1c1c1e", floor: "#141416" },
  blush: { bg: "#f3e3e0", floor: "#e6cfca" },
  sage: { bg: "#e5ebe3", floor: "#cdd8c9" },
} as const;

const GLB_URL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb";

const VARIANTS_EXT = "KHR_materials_variants";

interface VariantMapping {
  material: number;
  variants: number[];
}

interface GltfVariantsJson {
  extensions?: { [VARIANTS_EXT]?: { variants?: { name: string }[] } };
  meshes?: { primitives: { extensions?: { [VARIANTS_EXT]?: { mappings?: VariantMapping[] } } }[] }[];
}

interface MeshVariantUserData {
  variantMappings?: VariantMapping[];
  originalMaterial?: THREE.Material;
}

export interface GLTFWithVariants {
  scene: THREE.Object3D;
  userData: Record<string, unknown> & { variants?: string[] };
  functions?: { selectVariant?: (scene: THREE.Object3D, name: string) => Promise<void> };
}

/**
 * KHR_materials_variants desteğini three'nin GLTFLoader'ına ekleyen parser eklentisi.
 * Eşleme verisini `afterRoot`'ta (associations map hâlâ orijinal mesh'leri gösterirken)
 * her mesh'in `userData`'sına yazar; böylece `.clone(true)` sonrasında da (JSON kopyalanan
 * userData sayesinde) `selectVariant` doğru çalışmaya devam eder.
 */
function extendLoader(loader: GltfLoaderArg) {
  loader.register((parser) => ({
    name: VARIANTS_EXT,
    afterRoot(result) {
      const json = parser.json as GltfVariantsJson;
      const ext = json.extensions?.[VARIANTS_EXT];
      if (!ext) return null;
      const names = (ext.variants ?? []).map((v) => v.name);

      result.scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh & { userData: MeshVariantUserData };
        if (!mesh.isMesh) return;
        const association = parser.associations.get(mesh) as { meshes?: number; primitives?: number } | undefined;
        if (association?.meshes === undefined || association.primitives === undefined) return;
        const mappings = json.meshes?.[association.meshes]?.primitives?.[association.primitives]?.extensions?.[VARIANTS_EXT]?.mappings;
        if (mappings) mesh.userData.variantMappings = mappings;
      });

      const out = result as unknown as GLTFWithVariants;
      out.userData.variants = names;
      out.functions = {
        selectVariant: (scene, variantName) => {
          const variantIndex = names.indexOf(variantName);
          if (variantIndex === -1) return Promise.resolve();
          const pending: Promise<unknown>[] = [];
          scene.traverse((obj) => {
            const mesh = obj as THREE.Mesh & { userData: MeshVariantUserData };
            if (!mesh.isMesh) return;
            const mappings = mesh.userData.variantMappings;
            if (!mappings) return;
            if (!mesh.userData.originalMaterial) mesh.userData.originalMaterial = mesh.material as THREE.Material;
            const mapping = mappings.find((m) => m.variants.includes(variantIndex));
            if (mapping) {
              pending.push(
                parser.getDependency("material", mapping.material).then((mat) => {
                  mesh.material = mat as THREE.Material;
                })
              );
            } else if (mesh.userData.originalMaterial) {
              mesh.material = mesh.userData.originalMaterial;
            }
          });
          return Promise.all(pending).then(() => undefined);
        },
      };
      return null;
    },
  }));
}

const errorStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "rgba(0,0,0,.7)",
  color: "#fff",
  fontSize: 13,
  whiteSpace: "nowrap",
};

class ShoeErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
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

function Shoe({ variant, autoRotate, scale }: { variant: string; autoRotate: boolean; scale: number }) {
  const gltf = useGLTF(GLB_URL, true, true, extendLoader) as unknown as GLTFWithVariants;
  const groupRef = useRef<THREE.Group>(null);

  const normalized = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const factor = 1.8 / maxAxis;
    clone.position.set(-center.x * factor, -center.y * factor, -center.z * factor);
    clone.scale.setScalar(factor);
    return clone;
  }, [gltf]);

  useEffect(() => {
    gltf.functions?.selectVariant?.(normalized, variant);
  }, [gltf, normalized, variant]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={groupRef} scale={scale} position={[0, 0.05, 0]}>
      <primitive object={normalized} />
    </group>
  );
}

function Floor({ color }: { color: string }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
      <planeGeometry args={[14, 14]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={256}
        mixBlur={1}
        mixStrength={1.6}
        roughness={1}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.2}
        color={color}
        metalness={0.4}
        mirror={0.5}
      />
    </mesh>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function ShoeVariants({
  palette = "white",
  variant = "midnight",
  hdri = "studio",
  autoRotate = true,
  scale = 1,
  className,
}: ShoeVariantsProps) {
  const pal = PALETTES[palette] ?? PALETTES.white;
  const hdriUrl = HDRI[hdri] ?? HDRI.studio;

  return (
    <section
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: pal.bg }}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [1.6, 1.1, 2.4], fov: 38 }} gl={{ antialias: true }}>
        <Environment files={hdriUrl} resolution={256} />
        <ambientLight intensity={0.3} />
        <ShoeErrorBoundary
          key={variant + hdri}
          fallback={
            <Html center>
              <div style={errorStyle}>Model yüklenemedi</div>
            </Html>
          }
        >
          <Suspense fallback={<Loader />}>
            <Shoe variant={variant} autoRotate={autoRotate} scale={scale} />
            <Floor color={pal.floor} />
          </Suspense>
        </ShoeErrorBoundary>
        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={6} blur={2.2} far={2} />
        <OrbitControls enablePan={false} minDistance={1.4} maxDistance={6} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </section>
  );
}
