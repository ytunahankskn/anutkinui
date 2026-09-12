"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface KeyboardAssemblyProps {
  palette?: keyof typeof PALETTES;
  /** Case altında RGB emissive halka */
  underglow?: boolean;
  /** true: renk taraması, false: sabit accent rengi */
  rgb?: boolean;
  /** Klavyenin yazım açısı (derece) */
  tilt?: number;
  /** Scroll eden eleman. Sayfa scroll'u için boş bırak. */
  scroller?: HTMLElement | null;
  /** Scroll ilerlemesi (0..1) — demo altyazıları için */
  onProgress?: (p: number) => void;
  className?: string;
}

const HDRI = {
  studio: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr",
  night: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonless_golf_1k.hdr",
  sky: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_06_puresky_1k.hdr",
} as const;

export const PALETTES = {
  graphite: { case: "#2a2b30", alphas: "#e8e6e0", mods: "#3a3b40", accent: "#ff6b35", bg: "#0d0d10", hdri: HDRI.studio },
  cream: { case: "#e9e1cf", alphas: "#f7f2e8", mods: "#cbbfa5", accent: "#2f6f5e", bg: "#efe9dc", hdri: HDRI.studio },
  navy: { case: "#1e2a4a", alphas: "#e7ebf5", mods: "#2c3d6b", accent: "#f0b429", bg: "#0b1020", hdri: HDRI.night },
  mint: { case: "#cfeee4", alphas: "#ffffff", mods: "#8ed6c0", accent: "#ff8a80", bg: "#e6f7f1", hdri: HDRI.sky },
} as const;

const PCB_COLOR = "#1c4a3a";
const PLATE_COLOR = "#33343a";
const STEM_COLOR = "#e86a6a";

// --- Seeded PRNG (deterministic, no Math.random during render) ---
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- 65% layout: unit widths per row ---
const ROWS: readonly number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1],
  [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1, 1],
];
const UNIT = 0.19;
const NUM_ROWS = ROWS.length;
const MAX_COLS = Math.max(...ROWS.map((r) => r.length));
const TOTAL_UNITS_W = Math.max(...ROWS.map((r) => r.reduce((a, b) => a + b, 0)));

interface KeyLayout {
  x: number;
  z: number;
  row: number;
  col: number;
  widthU: number;
  isAccent: boolean;
  isMod: boolean;
}

function buildLayout(): KeyLayout[] {
  const keys: KeyLayout[] = [];
  ROWS.forEach((widths, row) => {
    const totalW = widths.reduce((a, b) => a + b, 0);
    let cursor = -(totalW * UNIT) / 2;
    const z = (row - (NUM_ROWS - 1) / 2) * UNIT;
    widths.forEach((w, col) => {
      const x = cursor + (w * UNIT) / 2;
      cursor += w * UNIT;
      const isAccent = (row === 0 && col === 0) || (row === 2 && w === 2.25) || (row === 4 && w === 6.25);
      const isMod = w !== 1 && !isAccent;
      keys.push({ x, z, row, col, widthU: w, isAccent, isMod });
    });
  });
  return keys;
}

const KEYS = buildLayout();
const MAX_RADIUS = Math.max(...KEYS.map((k) => Math.sqrt(k.x * k.x + k.z * k.z)));
const rand = seeded(1337);
const KEY_TILT = KEYS.map(() => ({ x: (rand() - 0.5) * 0.9, y: (rand() - 0.5) * 0.9, z: (rand() - 0.5) * 0.9 }));
const ROW_CAP_RATIO = [1.55, 1.25, 1.0, 1.15, 1.35];

// --- Case / assembly dimensions (derived to fit the layout) ---
const BEZEL_X = 0.32;
const BEZEL_Z = 0.22;
const CASE_W = TOTAL_UNITS_W * UNIT + BEZEL_X * 2;
const CASE_D = NUM_ROWS * UNIT + BEZEL_Z * 2;
const CASE_H = 0.6;
const PCB_W = CASE_W - 0.1;
const PCB_D = CASE_D - 0.1;
const PCB_H = 0.045;
const PLATE_W = CASE_W - 0.16;
const PLATE_D = CASE_D - 0.16;
const PLATE_H = 0.035;
const PCB_Y = CASE_H / 2 - 0.14;
const PLATE_Y = CASE_H / 2 - 0.05;
const SWITCH_H = 0.6 * UNIT;
const SWITCH_Y = PLATE_Y + PLATE_H / 2 + SWITCH_H / 2;
const STEM_DIM = 0.3 * UNIT;
const STEM_H = 0.35 * UNIT;
const STEM_Y = SWITCH_Y + SWITCH_H / 2 + STEM_H / 2;
const BASE_CAP = 0.94 * UNIT;
const KEYCAP_Y = ROW_CAP_RATIO.map((ratio) => STEM_Y + STEM_H * 0.35 + (BASE_CAP * ratio) / 2);

/** Case, PCB, plate, switches ve keycap'leri scroll ilerlemesine göre sahneye yerleştirir. */
function KeyboardScene({
  pal,
  underglow,
  rgb,
  tilt,
  progressRef,
}: {
  pal: (typeof PALETTES)[keyof typeof PALETTES];
  underglow: boolean;
  rgb: boolean;
  tilt: number;
  progressRef: React.RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const caseRef = useRef<THREE.Mesh>(null);
  const pcbRef = useRef<THREE.Mesh>(null);
  const plateRef = useRef<THREE.Mesh>(null);
  const switchRef = useRef<THREE.InstancedMesh>(null);
  const stemRef = useRef<THREE.InstancedMesh>(null);
  const capRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glowMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const glowColor = useMemo(() => new THREE.Color(), []);
  const camTop = useMemo(() => new THREE.Vector3(0, 6, 2), []);
  const camHero = useMemo(() => new THREE.Vector3(2.2, 2.4, 3.2), []);
  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const hueRef = useRef(0);

  const capGeometry = useMemo(() => new RoundedBoxGeometry(BASE_CAP, BASE_CAP, BASE_CAP, 3, 0.02), []);
  useEffect(() => () => capGeometry.dispose(), [capGeometry]);

  // Keycap renklerini sadece palet değiştiğinde ata (her frame değil).
  useEffect(() => {
    const mesh = capRef.current;
    if (!mesh) return;
    const c = new THREE.Color();
    KEYS.forEach((key, i) => {
      const hex = key.isAccent ? pal.accent : key.isMod ? pal.mods : pal.alphas;
      mesh.setColorAt(i, c.set(hex));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [pal]);

  useFrame((state, delta) => {
    const p = progressRef.current;

    // Case: ease-out-back düşüş + hafif dönüş sönümlemesi
    const caseT = THREE.MathUtils.smoothstep(p, 0, 0.14);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    const caseEase = 1 + c3 * Math.pow(caseT - 1, 3) + c1 * Math.pow(caseT - 1, 2);
    if (caseRef.current) {
      caseRef.current.position.y = THREE.MathUtils.lerp(2.5, 0, caseEase);
      caseRef.current.rotation.x = (1 - caseT) * 0.3;
    }
    if (groupRef.current) {
      groupRef.current.rotation.x = -THREE.MathUtils.degToRad(tilt) * caseT;
    }

    // PCB & plate
    const pcbT = THREE.MathUtils.smoothstep(p, 0.1, 0.24);
    if (pcbRef.current) pcbRef.current.position.y = THREE.MathUtils.lerp(2.0, PCB_Y, pcbT);
    const plateT = THREE.MathUtils.smoothstep(p, 0.16, 0.3);
    if (plateRef.current) plateRef.current.position.y = THREE.MathUtils.lerp(1.8, PLATE_Y, plateT);

    // Switches + stems: soldan sağa dalga
    const switchMesh = switchRef.current;
    const stemMesh = stemRef.current;
    if (switchMesh && stemMesh) {
      KEYS.forEach((key, i) => {
        const start = 0.28 + 0.28 * (key.col / MAX_COLS);
        const t = THREE.MathUtils.smoothstep(p, start, start + 0.14);
        const y = THREE.MathUtils.lerp(1.6, SWITCH_Y, t);
        const settle = 1 - t;
        const tk = KEY_TILT[i];
        dummy.position.set(key.x, y, key.z);
        dummy.rotation.set(tk.x * settle, tk.y * settle, tk.z * settle);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        switchMesh.setMatrixAt(i, dummy.matrix);

        dummy.position.set(key.x, y + SWITCH_H / 2 + STEM_H / 2, key.z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        stemMesh.setMatrixAt(i, dummy.matrix);
      });
      switchMesh.instanceMatrix.needsUpdate = true;
      stemMesh.instanceMatrix.needsUpdate = true;
    }

    // Keycaps: merkezden dışa dalga
    const capMesh = capRef.current;
    if (capMesh) {
      KEYS.forEach((key, i) => {
        const dist = Math.sqrt(key.x * key.x + key.z * key.z) / MAX_RADIUS;
        const start = 0.56 + 0.26 * dist;
        const t = THREE.MathUtils.smoothstep(p, start, start + 0.14);
        const y = THREE.MathUtils.lerp(1.2, KEYCAP_Y[key.row], t);
        dummy.position.set(key.x, y, key.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(key.widthU, ROW_CAP_RATIO[key.row], 1);
        dummy.updateMatrix();
        capMesh.setMatrixAt(i, dummy.matrix);
      });
      capMesh.instanceMatrix.needsUpdate = true;
    }

    // Underglow: emissive yoğunluk + renk taraması
    const glowT = THREE.MathUtils.smoothstep(p, 0.84, 1);
    hueRef.current = (hueRef.current + (rgb ? delta * 0.15 : 0)) % 1;
    if (glowRef.current) glowRef.current.visible = underglow;
    if (glowMatRef.current) {
      glowMatRef.current.emissiveIntensity = glowT * 2;
      if (rgb) glowColor.setHSL(hueRef.current, 0.9, 0.55);
      else glowColor.set(pal.accent);
      glowMatRef.current.emissive.copy(glowColor);
    }

    // Kamera: üstten 3/4 hero açısına geçiş
    const camT = THREE.MathUtils.smoothstep(p, 0.84, 1);
    camTarget.lerpVectors(camTop, camHero, camT);
    state.camera.position.lerp(camTarget, 1 - Math.pow(0.001, delta));
    state.camera.lookAt(lookTarget);
  });

  return (
    <>
      <Environment files={pal.hdri} resolution={256} />
      <ambientLight intensity={0.2} />
      <ContactShadows position={[0, -CASE_H / 2 - 0.05, 0]} opacity={0.55} scale={CASE_W * 1.8} blur={2.2} far={2} />
      <group ref={groupRef}>
        <RoundedBox ref={caseRef} args={[CASE_W, CASE_H, CASE_D]} radius={0.04} smoothness={4}>
          <meshPhysicalMaterial color={pal.case} clearcoat={1} clearcoatRoughness={0.08} roughness={0.5} />
        </RoundedBox>
        <mesh ref={pcbRef}>
          <boxGeometry args={[PCB_W, PCB_H, PCB_D]} />
          <meshStandardMaterial color={PCB_COLOR} roughness={0.65} metalness={0.1} />
        </mesh>
        <mesh ref={plateRef}>
          <boxGeometry args={[PLATE_W, PLATE_H, PLATE_D]} />
          <meshStandardMaterial color={PLATE_COLOR} metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh ref={glowRef} rotation-x={-Math.PI / 2} position={[0, -CASE_H / 2 - 0.04, 0]}>
          <planeGeometry args={[CASE_W * 1.12, CASE_D * 1.3]} />
          <meshStandardMaterial ref={glowMatRef} color="#000000" emissive="#000000" emissiveIntensity={0} toneMapped={false} transparent opacity={0.9} />
        </mesh>
        <instancedMesh ref={switchRef} args={[undefined, undefined, KEYS.length]}>
          <boxGeometry args={[0.75 * UNIT, SWITCH_H, 0.75 * UNIT]} />
          <meshPhysicalMaterial color={pal.mods} roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.4} />
        </instancedMesh>
        <instancedMesh ref={stemRef} args={[undefined, undefined, KEYS.length]}>
          <boxGeometry args={[STEM_DIM, STEM_H, STEM_DIM]} />
          <meshStandardMaterial color={STEM_COLOR} roughness={0.4} />
        </instancedMesh>
        <instancedMesh ref={capRef} args={[undefined, undefined, KEYS.length]}>
          <primitive object={capGeometry} attach="geometry" />
          <meshPhysicalMaterial color="#ffffff" clearcoat={0.6} clearcoatRoughness={0.25} roughness={0.35} />
        </instancedMesh>
      </group>
    </>
  );
}

/** Ebeveyn `position: relative` olmalı; scroll ile parça parça birleşen 65% mekanik klavye. */
export function KeyboardAssembly({
  palette = "graphite",
  underglow = true,
  rgb = true,
  tilt = 4,
  scroller,
  onProgress,
  className,
}: KeyboardAssemblyProps) {
  const pal = PALETTES[palette] ?? PALETTES.graphite;
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
    <div ref={rootRef} className={className} style={{ position: "relative", height: "450cqh" }}>
      <div style={{ position: "sticky", top: 0, height: "100cqh", width: "100%", overflow: "hidden", background: pal.bg }}>
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 6, 2], fov: 32 }} gl={{ antialias: true }}>
          <KeyboardScene pal={pal} underglow={underglow} rgb={rgb} tilt={tilt} progressRef={progressRef} />
        </Canvas>
      </div>
    </div>
  );
}
