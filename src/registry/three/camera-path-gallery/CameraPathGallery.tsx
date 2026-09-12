"use client";

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface CameraPathGalleryProps {
  palette?: keyof typeof PALETTES;
  /** Yol boyunca kaç fotoğraf paneli */
  count?: number;
  /** Panel/eğri aralığı */
  spacing?: number;
  /** Sis yoğunluğu (FogExp2) */
  fog?: number;
  /** Panellerin yola dönük ek eğim açısı (derece) */
  tilt?: number;
  /**
   * Scroll eden eleman. Sayfa scroll'u için boş bırak; bir kutu içinde
   * kullanıyorsan o kutuyu ver (kutu `container-type: size` olmalı).
   */
  scroller?: HTMLElement | null;
  className?: string;
}

export const PALETTES = {
  dusk: { bg: "#241a26", ink: "#ffe3c2" },
  noir: { bg: "#0a0a0c", ink: "#f2f2f2" },
  ocean: { bg: "#071822", ink: "#c8f1ff" },
  mono: { bg: "#101010", ink: "#e6e6e6" },
} as const;

function photoUrl(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=900&h=640&fit=crop&q=70`;
}

const PHOTOS = [
  { id: "1506905925346-21bda4d32df4", title: "Mountain Lake" },
  { id: "1519681393784-d120267933ba", title: "Night Peaks" },
  { id: "1469474968028-56623f02e42e", title: "The Valley" },
  { id: "1500530855697-b586d89ba3ee", title: "Misty Peaks" },
  { id: "1507525428034-b723cf961d3e", title: "Shoreline" },
  { id: "1470071459604-3b5ec3a7fe05", title: "Foggy Forest" },
  { id: "1441974231531-c6227db76b6e", title: "Forest Road" },
  { id: "1472214103451-9374bd1c798e", title: "Open Field" },
  { id: "1447752875215-b2761acb3c5d", title: "Sunlit Woods" },
  { id: "1501785888041-af3ef285b470", title: "Still Lake" },
  { id: "1490750967868-88aa4486c946", title: "Wildflowers" },
  { id: "1433086966358-54859d0ed716", title: "Waterfall" },
] as const;

const PHOTO_URLS: string[] = PHOTOS.map((photo) => photoUrl(photo.id));

const errorStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "rgba(0,0,0,.7)",
  color: "#fff",
  fontSize: 13,
  whiteSpace: "nowrap",
};

class SceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function useGalleryCurve(count: number, spacing: number) {
  return useMemo(() => {
    const segments = Math.max(count, 3);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const z = -i * spacing;
      const x = Math.sin(i * 0.8) * spacing * 0.55;
      const y = Math.sin(i * 0.5) * 0.25;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  }, [count, spacing]);
}

interface PanelSlot {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

function usePanelSlots(curve: THREE.CatmullRomCurve3, count: number, spacing: number, tiltDeg: number): PanelSlot[] {
  return useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const tiltRad = THREE.MathUtils.degToRad(tiltDeg);
    const dummy = new THREE.Object3D();
    const slots: PanelSlot[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const side = i % 2 === 0 ? 1 : -1;
      const perp = new THREE.Vector3().crossVectors(up, tangent).normalize();
      // Paneller yola yakın dursun ki kamera geçerken ekranı doldursunlar
      const position = point.clone().addScaledVector(perp, side * spacing * 0.42);
      position.y += 0.15;
      dummy.position.copy(position);
      // Panelin ön yüzü yola (kameraya) dönük
      dummy.lookAt(point.clone().addScaledVector(tangent, -spacing * 0.6));
      dummy.rotateY(-side * tiltRad);
      slots.push({ position, quaternion: dummy.quaternion.clone() });
    }
    return slots;
  }, [curve, count, spacing, tiltDeg]);
}

function PhotoPanel({
  texture,
  title,
  index,
  position,
  quaternion,
  ink,
}: {
  texture: THREE.Texture;
  title: string;
  index: number;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  ink: string;
}) {
  const captionRef = useRef<HTMLDivElement>(null);
  const captionPos = useMemo<[number, number, number]>(
    () => [position.x, position.y - 1.05, position.z],
    [position],
  );

  useFrame(({ camera }) => {
    const el = captionRef.current;
    if (!el) return;
    const dist = camera.position.distanceTo(position);
    const near = THREE.MathUtils.smoothstep(dist, 0.6, 2.6);
    const far = 1 - THREE.MathUtils.smoothstep(dist, 7, 12);
    el.style.opacity = THREE.MathUtils.clamp(near * far, 0, 1).toFixed(3);
  });

  return (
    <>
      <mesh position={position} quaternion={quaternion}>
        <planeGeometry args={[2.4, 1.7]} />
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
      </mesh>
      <Html position={captionPos} center distanceFactor={6} style={{ pointerEvents: "none" }}>
        <div
          ref={captionRef}
          style={{
            opacity: 0,
            whiteSpace: "nowrap",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: ink,
            textShadow: "0 2px 10px rgba(0,0,0,.6)",
          }}
        >
          {String(index + 1).padStart(2, "0")} — {title}
        </div>
      </Html>
    </>
  );
}

function CameraRig({ curve, progress }: { curve: THREE.CatmullRomCurve3; progress: { current: number } }) {
  useFrame(({ camera }) => {
    const t = THREE.MathUtils.clamp(progress.current, 0, 1);
    const point = curve.getPointAt(t);
    const lookPoint = curve.getPointAt(Math.min(t + 0.02, 1));
    camera.position.copy(point);
    camera.lookAt(lookPoint);
  });
  return null;
}

function Scene({
  count,
  spacing,
  tilt,
  fog,
  ink,
  bg,
  progress,
}: {
  count: number;
  spacing: number;
  tilt: number;
  fog: number;
  ink: string;
  bg: string;
  progress: { current: number };
}) {
  const curve = useGalleryCurve(count, spacing);
  const slots = usePanelSlots(curve, count, spacing, tilt);
  const urls = useMemo(() => PHOTO_URLS.slice(0, count), [count]);
  const textures = useTexture(urls, (loaded) => {
    loaded.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
    });
  });

  return (
    <>
      <fogExp2 attach="fog" args={[bg, fog]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 2]} intensity={1.3} color="#fff5e6" />
      {slots.map((slot, i) => (
        <PhotoPanel
          key={i}
          texture={textures[i]}
          title={PHOTOS[i % PHOTOS.length].title}
          index={i}
          position={slot.position}
          quaternion={slot.quaternion}
          ink={ink}
        />
      ))}
      <CameraRig curve={curve} progress={progress} />
    </>
  );
}

/**
 * Kaydırma miktarını (dolayısıyla eğri boyunca ilerlemeyi) çevreleyen sayfa/konteyner belirler;
 * bileşen kendi yüksekliğini `height:100%` ile ebeveynden alır (bkz. demo: 500cqh'lik section).
 */
export function CameraPathGallery({
  palette = "dusk",
  count = 10,
  spacing = 3.5,
  fog = 0.05,
  tilt = 12,
  scroller,
  className,
}: CameraPathGalleryProps) {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const n = Math.max(6, Math.min(12, Math.round(count)));
  const p = PALETTES[palette] ?? PALETTES.dusk;

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        scroller: scroller ?? undefined,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [scroller]);

  return (
    <div ref={root} className={className} style={{ position: "relative", height: "100%" }}>
      <div style={{ position: "sticky", top: 0, height: "100cqh", overflow: "hidden" }}>
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4], fov: 55 }} gl={{ antialias: true }}>
          <color attach="background" args={[p.bg]} />
          <SceneErrorBoundary
            fallback={
              <Html center>
                <div style={errorStyle}>Fotoğraflar yüklenemedi</div>
              </Html>
            }
          >
            <Suspense fallback={null}>
              <Scene key={n} count={n} spacing={spacing} tilt={tilt} fog={fog} ink={p.ink} bg={p.bg} progress={progress} />
            </Suspense>
          </SceneErrorBoundary>
        </Canvas>
      </div>
    </div>
  );
}
