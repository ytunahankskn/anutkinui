"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface ExplodedEarbudsProps {
  palette?: keyof typeof PALETTES;
  /** Parçalar arası açılma çarpanı */
  explode?: number;
  labels?: boolean;
  hdri?: keyof typeof HDRI;
  scroller?: HTMLElement | null;
  onProgress?: (p: number) => void;
  className?: string;
}

const HDRI = {
  studio: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr",
  hall: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr",
  sunset: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr",
} as const;

export const PALETTES = {
  white: { shell: "#f4f4f6", matte: "#d9d9de", bg: "#ececf0" },
  black: { shell: "#151518", matte: "#2a2a30", bg: "#0b0b0e" },
  sage: { shell: "#c9d8c5", matte: "#9fb39a", bg: "#e7efe4" },
  lilac: { shell: "#d8cff0", matte: "#b4a6e0", bg: "#ece8f7" },
} as const;

const METAL = "#c7c7cc";

// Sağ kulaklığın parçaları: merkez (magnet) slot 3, patlamada bu eksende dağılırlar.
const RIGHT_PARTS = [
  { key: "shellBottom", slot: 0 },
  { key: "battery", slot: 1, label: "Battery" },
  { key: "driver", slot: 2, label: "Driver 11mm" },
  { key: "magnet", slot: 3 },
  { key: "grille", slot: 4, label: "Mic array" },
  { key: "shellTop", slot: 5 },
  { key: "stem", slot: 6 },
] as const;
const CENTER_SLOT = 3;
const REST_SPACING = 0.022;
const EXPLODE_SPACING = 0.11;

const CASE_W = 1.15;
const CASE_D = 0.62;
const CASE_BODY_H = 0.28;
const LID_H = 0.12;

/** Ebeveyn `position: relative` olmalı; scroll ile kapak açılıp kulaklıklar patlamalı görünüme geçen sahne. */
function EarbudsScene({
  pal,
  explode,
  labels,
  hdriUrl,
  progressRef,
}: {
  pal: (typeof PALETTES)[keyof typeof PALETTES];
  explode: number;
  labels: boolean;
  hdriUrl: string;
  progressRef: React.RefObject<number>;
}) {
  const lidPivotRef = useRef<THREE.Group>(null);
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const rodRef = useRef<THREE.Mesh>(null);
  const shellBottomRef = useRef<THREE.Group>(null);
  const batteryRef = useRef<THREE.Group>(null);
  const driverRef = useRef<THREE.Group>(null);
  const magnetRef = useRef<THREE.Group>(null);
  const grilleRef = useRef<THREE.Group>(null);
  const shellTopRef = useRef<THREE.Group>(null);
  const stemRef = useRef<THREE.Group>(null);
  const batteryLabelRef = useRef<HTMLDivElement>(null);
  const driverLabelRef = useRef<HTMLDivElement>(null);
  const grilleLabelRef = useRef<HTMLDivElement>(null);

  const camStart = useMemo(() => new THREE.Vector3(0, 1.9, 3.8), []);
  const camMid = useMemo(() => new THREE.Vector3(0.12, 1.35, 2.55), []);
  const camEnd = useMemo(() => new THREE.Vector3(0, 1.7, 4.1), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(0, 0.55, 0), []);

  useFrame((state, delta) => {
    const p = progressRef.current;

    // Kapak: arkadaki menteşeden -110°'ye açılır.
    const lidT = THREE.MathUtils.smoothstep(p, 0, 0.25);
    if (lidPivotRef.current) lidPivotRef.current.rotation.x = THREE.MathUtils.lerp(0, THREE.MathUtils.degToRad(-110), lidT);

    // Kulaklıklar: kutudan yükselip kameraya dönerler.
    const riseT = THREE.MathUtils.smoothstep(p, 0.2, 0.45);
    if (leftRef.current) {
      leftRef.current.position.set(THREE.MathUtils.lerp(-0.28, -0.55, riseT), THREE.MathUtils.lerp(0.06, 0.75, riseT), 0);
      leftRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2, -0.25, riseT);
    }
    if (rightRef.current) {
      rightRef.current.position.set(THREE.MathUtils.lerp(0.28, 0.55, riseT), THREE.MathUtils.lerp(0.06, 0.75, riseT), 0);
      rightRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2, -0.25, riseT);
    }

    // Sağ kulaklık: parçalar dikey eksende patlar.
    const openT = THREE.MathUtils.smoothstep(p, 0.45, 0.85);
    const closeT = THREE.MathUtils.smoothstep(p, 0.85, 1);
    const amount = openT * (1 - closeT * 0.5);
    const groups: Record<string, THREE.Group | null> = {
      shellBottom: shellBottomRef.current,
      battery: batteryRef.current,
      driver: driverRef.current,
      magnet: magnetRef.current,
      grille: grilleRef.current,
      shellTop: shellTopRef.current,
      stem: stemRef.current,
    };
    const labelEls: Record<string, HTMLDivElement | null> = {
      battery: batteryLabelRef.current,
      driver: driverLabelRef.current,
      grille: grilleLabelRef.current,
    };
    let minY = Infinity;
    let maxY = -Infinity;
    for (const part of RIGHT_PARTS) {
      const rest = (part.slot - CENTER_SLOT) * REST_SPACING;
      const target = (part.slot - CENTER_SLOT) * EXPLODE_SPACING * explode;
      const y = THREE.MathUtils.lerp(rest, target, amount);
      const group = groups[part.key];
      if (group) group.position.y = y;
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      const label = labelEls[part.key];
      if (label) {
        const fadeIn = THREE.MathUtils.smoothstep(p, 0.45, 0.6);
        const fadeOut = THREE.MathUtils.smoothstep(p, 0.85, 1);
        label.style.opacity = labels ? String(fadeIn * (1 - fadeOut)) : "0";
      }
    }
    if (rodRef.current) {
      rodRef.current.visible = amount > 0.02;
      rodRef.current.position.y = (minY + maxY) / 2;
      rodRef.current.scale.y = Math.max(0.001, maxY - minY);
    }

    // Kamera: açılış → patlamalı görünüm → geri çekilme
    if (p < 0.45) camPos.lerpVectors(camStart, camMid, THREE.MathUtils.smoothstep(p, 0, 0.45));
    else if (p < 0.85) camPos.copy(camMid);
    else camPos.lerpVectors(camMid, camEnd, THREE.MathUtils.smoothstep(p, 0.85, 1));
    state.camera.position.lerp(camPos, 1 - Math.pow(0.001, delta));
    state.camera.lookAt(lookTarget);
  });

  return (
    <>
      <Environment files={hdriUrl} resolution={256} />
      <ambientLight intensity={0.25} />
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.2} far={2} />

      {/* Şarj kutusu */}
      <mesh position={[0, CASE_BODY_H / 2, 0]}>
        <boxGeometry args={[CASE_W, CASE_BODY_H, CASE_D]} />
        <meshPhysicalMaterial color={pal.shell} clearcoat={1} clearcoatRoughness={0.08} roughness={0.25} />
      </mesh>
      <group ref={lidPivotRef} position={[0, CASE_BODY_H, -CASE_D / 2]}>
        <mesh position={[0, LID_H / 2, CASE_D / 2]}>
          <boxGeometry args={[CASE_W, LID_H, CASE_D]} />
          <meshPhysicalMaterial color={pal.shell} clearcoat={1} clearcoatRoughness={0.08} roughness={0.25} />
        </mesh>
      </group>

      {/* Sol kulaklık: sade kapsül */}
      <group ref={leftRef}>
        <mesh>
          <capsuleGeometry args={[0.09, 0.16, 8, 16]} />
          <meshPhysicalMaterial color={pal.shell} clearcoat={1} clearcoatRoughness={0.1} roughness={0.3} />
        </mesh>
      </group>

      {/* Sağ kulaklık: patlamalı görünüm */}
      <group ref={rightRef}>
        <mesh ref={rodRef}>
          <cylinderGeometry args={[0.004, 0.004, 1, 8]} />
          <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.4} />
        </mesh>
        <group ref={shellBottomRef}>
          <mesh>
            <sphereGeometry args={[0.09, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshPhysicalMaterial color={pal.shell} clearcoat={1} clearcoatRoughness={0.08} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
        </group>
        <group ref={batteryRef}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.045, 0.03, 20]} />
            <meshStandardMaterial color={pal.matte} roughness={0.85} />
          </mesh>
          {labels && (
            <Html ref={batteryLabelRef} center distanceFactor={2.2} style={{ opacity: 0, transition: "opacity .15s", pointerEvents: "none" }}>
              <span style={chipStyle}>Battery</span>
            </Html>
          )}
        </group>
        <group ref={driverRef}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 24]} />
            <meshStandardMaterial color={pal.matte} roughness={0.8} />
          </mesh>
          {labels && (
            <Html ref={driverLabelRef} center distanceFactor={2.2} style={{ opacity: 0, transition: "opacity .15s", pointerEvents: "none" }}>
              <span style={chipStyle}>Driver 11mm</span>
            </Html>
          )}
        </group>
        <group ref={magnetRef}>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.06, 0.012, 12, 28]} />
            <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
        <group ref={grilleRef}>
          <mesh>
            <cylinderGeometry args={[0.055, 0.055, 0.015, 24]} />
            <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.45} />
          </mesh>
          {labels && (
            <Html ref={grilleLabelRef} center distanceFactor={2.2} style={{ opacity: 0, transition: "opacity .15s", pointerEvents: "none" }}>
              <span style={chipStyle}>Mic array</span>
            </Html>
          )}
        </group>
        <group ref={shellTopRef}>
          <mesh>
            <sphereGeometry args={[0.09, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial color={pal.shell} clearcoat={1} clearcoatRoughness={0.08} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
        </group>
        <group ref={stemRef}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.02, 0.024, 0.12, 16]} />
            <meshPhysicalMaterial color={pal.shell} clearcoat={1} clearcoatRoughness={0.1} roughness={0.3} />
          </mesh>
        </group>
      </group>
    </>
  );
}

const chipStyle: React.CSSProperties = {
  padding: "4px 9px",
  borderRadius: 999,
  background: "rgba(0,0,0,.72)",
  color: "#fff",
  fontSize: 11,
  whiteSpace: "nowrap",
  fontFamily: "var(--font-mono, monospace)",
};

export function ExplodedEarbuds({
  palette = "white",
  explode = 1,
  labels = true,
  hdri = "studio",
  scroller,
  onProgress,
  className,
}: ExplodedEarbudsProps) {
  const pal = PALETTES[palette] ?? PALETTES.white;
  const hdriUrl = HDRI[hdri] ?? HDRI.studio;
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        scroller: scroller ?? undefined,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          onProgress?.(self.progress);
        },
      });
    }, el);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [scroller, onProgress]);

  return (
    <div ref={rootRef} className={className} style={{ position: "relative", height: "420cqh" }}>
      <div style={{ position: "sticky", top: 0, height: "100cqh", width: "100%", overflow: "hidden", background: pal.bg }}>
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.9, 3.8], fov: 34 }} gl={{ antialias: true }}>
          <EarbudsScene pal={pal} explode={explode} labels={labels} hdriUrl={hdriUrl} progressRef={progressRef} />
        </Canvas>
      </div>
    </div>
  );
}
