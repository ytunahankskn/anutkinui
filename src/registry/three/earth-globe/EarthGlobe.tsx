"use client";

import { Component, Suspense, useCallback, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";

export interface EarthGlobeProps {
  palette?: keyof typeof PALETTES;
  /** Güneşin küre etrafındaki açısı (derece) */
  sunAngle?: number;
  clouds?: boolean;
  cityLights?: boolean;
  speed?: number;
  className?: string;
}

export const PALETTES = {
  natural: { atmosphere: "#4f9dff", bg: "#03050c" },
  holo: { atmosphere: "#3fe0ff", bg: "#02080a" },
  dusk: { atmosphere: "#ff9a5c", bg: "#0b0604" },
  mono: { atmosphere: "#dfe6ee", bg: "#050506" },
} as const;

const EARTH_MAP = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg";
const EARTH_NORMAL = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg";
const EARTH_LIGHTS = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png";
const EARTH_CLOUDS = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png";

function computeSunDir(angleDeg: number, out: THREE.Vector3) {
  const rad = THREE.MathUtils.degToRad(angleDeg);
  return out.set(Math.cos(rad), 0.22, Math.sin(rad)).normalize();
}

class GlobeErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
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
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#3f6fae" wireframe />
    </mesh>
  );
}

function Sun({ sunAngle }: { sunAngle: number }) {
  const ref = useRef<THREE.DirectionalLight>(null);
  const dir = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const light = ref.current;
    if (!light) return;
    computeSunDir(sunAngle, dir);
    light.position.copy(dir).multiplyScalar(6);
  });
  return <directionalLight ref={ref} intensity={2.4} color="#fff3df" />;
}

function Atmosphere({ color }: { color: string }) {
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color(color) } }), [color]);
  return (
    <mesh scale={1.08}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        vertexShader={/* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize( normalMatrix * normal );
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          varying vec3 vNormal;
          void main() {
            float intensity = pow( 0.75 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 4.0 );
            gl_FragColor = vec4( uColor, 1.0 ) * intensity;
          }
        `}
      />
    </mesh>
  );
}

function Globe({
  sunAngle,
  clouds,
  cityLights,
  speed,
}: {
  sunAngle: number;
  clouds: boolean;
  cityLights: boolean;
  speed: number;
}) {
  const [map, normalMap, emissiveMap, cloudsMap] = useTexture(
    [EARTH_MAP, EARTH_NORMAL, EARTH_LIGHTS, EARTH_CLOUDS],
    ([loadedMap, , loadedEmissive, loadedClouds]) => {
      loadedMap.colorSpace = THREE.SRGBColorSpace;
      loadedMap.needsUpdate = true;
      loadedEmissive.colorSpace = THREE.SRGBColorSpace;
      loadedEmissive.needsUpdate = true;
      loadedClouds.colorSpace = THREE.SRGBColorSpace;
      loadedClouds.needsUpdate = true;
    },
  );

  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const shaderRef = useRef<{ uniforms: { uSunDirection: { value: THREE.Vector3 } } } | null>(null);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const normalScale = useMemo(() => new THREE.Vector2(0.85, 0.85), []);

  const onBeforeCompile = useCallback((shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uSunDirection = { value: new THREE.Vector3(1, 0, 0) };
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uSunDirection;")
      .replace(
        "#include <emissivemap_fragment>",
        `#ifdef USE_EMISSIVEMAP
          vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
          vec3 sunDirView = normalize( mat3( viewMatrix ) * uSunDirection );
          float nightMix = 1.0 - smoothstep( -0.1, 0.25, dot( normalize( normal ), sunDirView ) );
          totalEmissiveRadiance *= emissiveColor.rgb * nightMix;
        #endif`,
      );
    shaderRef.current = shader as unknown as { uniforms: { uSunDirection: { value: THREE.Vector3 } } };
  }, []);

  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * speed * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * speed * 0.075;

    if (shaderRef.current) {
      computeSunDir(sunAngle, dir);
      shaderRef.current.uniforms.uSunDirection.value.copy(dir);
    }
  });

  return (
    <>
      <group ref={earthRef}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            ref={matRef}
            map={map}
            normalMap={normalMap}
            normalScale={normalScale}
            emissiveMap={emissiveMap}
            emissive={cityLights ? "#ffffff" : "#000000"}
            emissiveIntensity={cityLights ? 1.6 : 0}
            roughness={0.85}
            metalness={0}
            onBeforeCompile={onBeforeCompile}
          />
        </mesh>
      </group>
      {clouds && (
        <mesh ref={cloudsRef} scale={1.01}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial map={cloudsMap} transparent opacity={0.9} depthWrite={false} roughness={1} />
        </mesh>
      )}
    </>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function EarthGlobe({
  palette = "natural",
  sunAngle = 200,
  clouds = true,
  cityLights = true,
  speed = 1,
  className,
}: EarthGlobeProps) {
  const p = PALETTES[palette] ?? PALETTES.natural;

  return (
    <section
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: p.bg }}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.4, 3.2], fov: 42 }} gl={{ antialias: true }}>
        <color attach="background" args={[p.bg]} />
        <ambientLight intensity={0.18} />
        <Sun sunAngle={sunAngle} />
        <Stars radius={90} depth={40} count={4000} factor={3.5} saturation={0} fade speed={0.4} />
        <GlobeErrorBoundary fallback={<Loader />}>
          <Suspense fallback={<Loader />}>
            <Globe sunAngle={sunAngle} clouds={clouds} cityLights={cityLights} speed={speed} />
          </Suspense>
        </GlobeErrorBoundary>
        <Atmosphere color={p.atmosphere} />
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.4}
          minDistance={1.8}
          maxDistance={6}
        />
      </Canvas>
    </section>
  );
}
