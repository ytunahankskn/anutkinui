"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

/** Poly Haven CC0 stüdyo HDRI (1k, ~1.6 MB). Kendi projende public/ altına kopyalayabilirsin. */
const HDRI = "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr";

export interface GlassKnotProps {
  shape?: "knot" | "torus" | "icosahedron";
  color?: string;
  /** Kırılma indisi (1 = hava, 1.5 = cam) */
  ior?: number;
  thickness?: number;
  /** Süzülme hızı */
  speed?: number;
  title?: string;
  subtitle?: string;
  /** Bölüm arka planı. Cam bu rengi kırar; metin rengi otomatik seçilir. */
  background?: string;
  className?: string;
}

/** #rrggbb → 0..1 arası algılanan parlaklık */
function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function Shape({
  shape,
  color,
  ior,
  thickness,
  speed,
  background,
}: Required<Pick<GlassKnotProps, "shape" | "color" | "ior" | "thickness" | "speed" | "background">>) {
  const group = useRef<THREE.Group>(null);
  const bg = useMemo(() => new THREE.Color(background), [background]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    // Fareye göre yumuşak parallax
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, state.pointer.y * -0.25, 4, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.35, 4, delta);
  });

  return (
    <group ref={group}>
      <Float speed={speed} rotationIntensity={1.2} floatIntensity={1.2}>
        <mesh key={shape}>
          {shape === "knot" && <torusKnotGeometry args={[1, 0.34, 256, 48]} />}
          {shape === "torus" && <torusGeometry args={[1.1, 0.42, 64, 128]} />}
          {shape === "icosahedron" && <icosahedronGeometry args={[1.45, 0]} />}
          <MeshTransmissionMaterial
            backside
            samples={6}
            resolution={512}
            thickness={thickness}
            ior={ior}
            chromaticAberration={0.12}
            anisotropy={0.3}
            distortion={0.35}
            distortionScale={0.4}
            temporalDistortion={0.08}
            roughness={0.04}
            envMapIntensity={1.6}
            color={color}
            background={bg}
          />
        </mesh>
      </Float>
    </group>
  );
}

export function GlassKnot({
  shape = "knot",
  color = "#ffffff",
  ior = 1.3,
  thickness = 1.2,
  speed = 1.4,
  title = "Build interfaces that move.",
  subtitle = "Three.js scenes, GSAP scroll sequences and shader backgrounds. Copy, paste, ship.",
  background = "#0b0b10",
  className,
}: GlassKnotProps) {
  const dark = luminance(background) < 0.5;
  const ink = dark ? "#f2f2f5" : "#0b0b0d";
  const inkMuted = dark ? "rgba(242,242,245,.62)" : "rgba(11,11,13,.62)";
  const inkFaint = dark ? "rgba(242,242,245,.4)" : "rgba(11,11,13,.4)";

  return (
    <section
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background, color: ink }}
    >
      {/* Arka plan parıltısı */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(60% 60% at 70% 45%, rgba(124, 108, 255, 0.28) 0%, transparent 70%)",
        }}
      />

      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6.5], fov: 38 }} gl={{ alpha: true, antialias: true }}>
        {/* Gerçek stüdyo HDRI'ı (Poly Haven, CC0): cam yansımaları gerçekçi olsun */}
        <Suspense fallback={null}>
          <Environment files={HDRI} environmentIntensity={1.15} />
        </Suspense>
        <group position={[1.6, 0, 0]}>
          <Shape shape={shape} color={color} ior={ior} thickness={thickness} speed={speed} background={background} />
        </group>
        <ContactShadows position={[1.6, -2.6, 0]} opacity={0.35} scale={12} blur={2.6} far={4} />
      </Canvas>

      {/* Hero metni */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(24px, 6vw, 72px)",
          pointerEvents: "none",
          maxWidth: 640,
        }}
      >
        <p style={{ marginBottom: 14, fontFamily: "var(--font-mono, monospace)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: inkFaint }}>
          hero / glass
        </p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", lineHeight: 1.02, letterSpacing: "-0.03em", fontWeight: 600, margin: 0 }}>
          {title}
        </h1>
        <p style={{ marginTop: 18, maxWidth: 440, color: inkMuted, fontSize: 15, lineHeight: 1.55 }}>{subtitle}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 28, pointerEvents: "auto" }}>
          <button
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 10,
              background: ink,
              color: background,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Get started
          </button>
          <button
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 10,
              border: `1px solid ${inkFaint}`,
              color: ink,
              fontSize: 14,
            }}
          >
            Browse components
          </button>
        </div>
      </div>
    </section>
  );
}
